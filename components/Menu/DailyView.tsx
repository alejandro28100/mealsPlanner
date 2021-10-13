import React, { useState, useEffect, Fragment, FC } from "react";
import { deleteField, limit, where } from "@firebase/firestore";
import {
	addDocument,
	getDocuments,
	toFirestoreMeal,
	updateDocument,
	setDocument,
	FirebaseMeal,
} from "utils/firebase";
import { useUser } from "hooks/userUser";
import { subDays, addDays } from "date-fns";
import { Meal, MealTime } from "types/index";
import "utils/date.ts";

import AddReceipesModal from "components/AddReceipesModal";
interface Menu {
	id: string;
	date: Date;
	meals: Meal[];
}
interface MenuSection {
	menuLabel: MealTime;
	meals: Meal[];
}

type DayOperation = "prev" | "next" | "current";
interface Day {
	type: DayOperation;
	date: Date;
}

function toMenuSections(meals: Meal[]): MenuSection[] {
	const mealTimes: MealTime[] = ["breakfast", "lunch", "dinner"];
	let initialValue: MenuSection[] = mealTimes.map((mealTime) => ({
		menuLabel: mealTime,
		meals: [],
	}));
	if (!meals) return initialValue;
	return meals.reduce((prev, current) => {
		return prev.map((menuSection) => {
			if (menuSection.menuLabel === current.time) {
				menuSection.meals.push(current);
			}
			return menuSection;
		});
	}, initialValue);
}

const DailyView: FC<{ date: Date; setDate: (date: Date) => void }> = ({
	date: currentDay,
	setDate,
}) => {
	const { user, loading: isUserLoading } = useUser();

	const [menu, setMenu] = useState<Menu | undefined>(undefined);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | undefined>(undefined);

	const [isAddReceipeModalOpen, setIsAddReceipeModalOpen] = useState(false);

	useEffect(() => {
		(async function () {
			if (isUserLoading && !user) return;
			function getStartingDate() {
				return currentDay.getZeroHours();
			}

			setMenu(undefined);
			setError(undefined);
			setLoading(true);

			try {
				const snapshot = await getDocuments(
					`users/${user?.uid}/menus`,
					where("date", "==", getStartingDate()),
					limit(1)
				);
				snapshot.forEach((doc) => {
					let meals: Meal[] = [];
					let { date, meals: mealsMap } = doc.data();

					Object.keys(mealsMap).forEach((mealID) => {
						let meal: Meal = {
							id: mealID,
							...mealsMap[mealID],
						};
						meals.push(meal);
					});
					// console.log(toMenuSections(meals));
					setMenu({
						id: doc.id,
						date,
						meals,
					} as Menu);
				});
				setLoading(false);
				setError(undefined);
			} catch (error) {
				setError(error as string);
				setLoading(false);
			}
		})();
	}, [currentDay, isUserLoading]);

	function handleShowDay(dayType: DayOperation) {
		switch (dayType) {
			case "next": {
				const updatedDay = addDays(currentDay, 1);
				setDate(updatedDay);
				break;
			}

			case "prev": {
				const updatedDay = subDays(currentDay, 1);
				setDate(updatedDay);
				break;
			}

			default:
				break;
		}
	}

	async function handleAddMeal(newMeal: Meal) {
		if (menu) {
			const formatedMeals: FirebaseMeal = toFirestoreMeal([
				...menu.meals,
				newMeal,
			]);
			const path = `users/${user?.uid}/menus/${menu.id}`;
			try {
				//Merge the updated meals field in firestore
				await setDocument(path, formatedMeals);
				//Update the state
				setMenu(
					(prev) =>
						({
							...prev,
							meals: [...(prev?.meals as Meal[]), newMeal],
						} as Menu)
				);
			} catch (error) {
				alert("Algo salió mal al añadir una nueva comida");
				console.log("Algo salió mal al añadir una nueva comida", error);
			}
			return;
		}
		try {
			const doc = await addDocument(`users/${user?.uid}/menus`, {
				date: currentDay.getZeroHours(),
				...toFirestoreMeal([newMeal]),
			});

			setMenu({
				date: currentDay,
				id: doc.id,
				meals: [newMeal],
			} as Menu);
		} catch (error) {
			alert("Algo salió mal al crear menú");
			console.log("Algo salió mal al crear menú", error);
		}
	}

	async function handleRemoveMeal(id: string) {
		const path = `users/${user?.uid}/menus/${menu?.id}`;
		const mealPath = `meals.${id}`;

		await updateDocument(path, {
			[mealPath]: deleteField(),
		});

		setMenu((prev) => {
			return {
				...prev,
				meals: prev && prev.meals.filter((meal) => meal.id !== id),
			} as Menu;
		});
	}

	const days: Day[] = [
		{ type: "prev", date: subDays(currentDay, 1) },
		{ type: "current", date: currentDay },
		{ type: "next", date: addDays(currentDay, 1) },
	];

	const menuSections = toMenuSections(menu?.meals as Meal[]);
	const emptyMenu = isMenuEmpty(menuSections);
	function isMenuEmpty(menuSections: MenuSection[]): boolean {
		let isEmpty = true;
		for (let i = 0; i < menuSections.length; i++) {
			const menuSection = menuSections[i];
			if (menuSection.meals.length > 0) {
				isEmpty = false;
				break;
			}
		}
		return isEmpty;
	}
	return (
		<section className="flex">
			<div className="w-1/4 flex flex-col justify-evenly items-center space-y-[40px] py-7 border-r border-secondary/60">
				{days.map(({ date, type }: Day, index) => (
					<div
						key={index}
						onClick={() => handleShowDay(type)}
						className="cursor-pointer flex items-center justify-center p-10 text-4xl font-black first-of-type:text-secondary/60 last-of-type:text-secondary/60"
					>
						{date.getDate()}
					</div>
				))}
			</div>
			<div className="p-10 flex flex-col w-full">
				{!loading ? (
					<Fragment>
						<div
							className={`flex items-center ${
								emptyMenu && "justify-center"
							} flex-col h-full`}
						>
							{!emptyMenu ? (
								menuSections.map(({ meals, menuLabel }, index) => (
									<MealsSection
										key={`${menuLabel}-${index}`}
										label={menuLabel}
										handleRemoveMeal={handleRemoveMeal}
										meals={meals}
									/>
								))
							) : (
								<Fragment>
									<h3 className="text-secondary font-semibold text-xl my-12">
										No tienes ninguna comida planeada para este día
									</h3>
								</Fragment>
							)}
						</div>
						<div className="self-end">
							<AddReceipesModal
								handleAddMeal={handleAddMeal}
								isOpen={isAddReceipeModalOpen}
								toggleOpen={() => setIsAddReceipeModalOpen((prev) => !prev)}
							/>
						</div>
					</Fragment>
				) : (
					<div className="grid place-items-center h-full w-full">
						Cargando Recetas...
					</div>
				)}
				{!loading && error && <h2>Algo salió mal, inténtalo más tarde :(</h2>}
			</div>
		</section>
	);
};

const MEAL_SECTION_LABELS = {
	breakfast: "Desayuno",
	lunch: "Comida",
	dinner: "Cena",
};

interface MealsSectionProps {
	meals: Meal[];
	label: MealTime;
	handleRemoveMeal: (id: string) => Promise<void>;
}

const MealsSection: FC<MealsSectionProps> = ({
	label,
	meals,
	handleRemoveMeal,
}) => {
	const sectionLabel = MEAL_SECTION_LABELS[label];
	const isEmpty = meals.length === 0;

	if (isEmpty) return null;

	return (
		<div className="my-5 self-start justify-self-star w-full">
			<h3 className="my-4 py-1 border-b border-secondary/60 font-semibold">
				{sectionLabel}
			</h3>
			<div className="flex flex-wrap">
				{meals.map(({ id, name }, index) => (
					<div
						className="flex border border-secondary/60 m-4"
						key={`${sectionLabel}-${id}-${index}`}
					>
						<h4
							title="Ver receta"
							className="px-2 py-1 hover:bg-secondary/30 cursor-pointer"
						>
							{name}
						</h4>
						<hr className="border-r border-secondary/60 h-full" />
						<button
							className="p-1 text-sm text-secondary hover:text-red-500"
							title="Eliminar receta"
							onClick={() => handleRemoveMeal(id)}
						>
							<svg
								xmlns="http://www.w3.org/2000/svg"
								className="h-4 w-4"
								fill="none"
								viewBox="0 0 24 24"
								stroke="currentColor"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
									d="M6 18L18 6M6 6l12 12"
								/>
							</svg>
						</button>
					</div>
				))}
			</div>
		</div>
	);
};

export default DailyView;
