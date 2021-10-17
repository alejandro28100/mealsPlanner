import React, { useState, useEffect, Fragment, FC } from "react";
import { limit, where } from "@firebase/firestore";
import {
	addDocument,
	getDocuments,
	updateDocument,
	setDocument,
} from "utils/firebase";
import { useUser } from "hooks/userUser";
import { subDays, addDays } from "date-fns";
import { Meal, MealTime } from "types/index";
import "utils/date.ts";

import MealsSection from "./MealsSection";
import AddReceipesModal from "components/AddReceipesModal";
interface Menu {
	id: string;
	date: Date;
	menuSections: MenuSection[];
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
					let { date, menuSections } = doc.data();
					setMenu({
						id: doc.id,
						date,
						menuSections,
					} as Menu);
				});
				setLoading(false);
				setError(undefined);
			} catch (error) {
				setError(error as string);
				setLoading(false);
			}
		})();
	}, [currentDay, isUserLoading, user]);

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
			// Check wheter the meal already exist on the menu
			const coincidence = menu.menuSections
				.find((section) => section.menuLabel === newMeal.time)
				?.meals.find((meal) => meal.id === newMeal.id);
			if (coincidence) {
				return alert("La comida ya está en en el menú 🤔");
			}

			const updatedSections: MenuSection[] = menu.menuSections.map(
				(section) => {
					if (section.menuLabel === newMeal.time) {
						delete newMeal["time"];
						section.meals.push(newMeal);
					}
					return section;
				}
			);

			const path = `users/${user?.uid}/menus/${menu.id}`;
			try {
				//Merge the updated meals field in firestore
				await setDocument(path, { menuSections: updatedSections });
				//Update the state
				setMenu(
					(prev) =>
						({
							...prev,
							menuSections: updatedSections,
						} as Menu)
				);
				alert("Receta Agregada al Menú 📅");
			} catch (error) {
				alert("Algo salió mal al añadir una nueva comida 😣");
				// console.log("Algo salió mal al añadir una nueva comida", error);
			}
			return;
		}
		try {
			const mealTimes: MealTime[] = ["breakfast", "lunch", "dinner"];
			let menuSections: MenuSection[] = mealTimes.map((mealTime) => ({
				menuLabel: mealTime,
				meals: [],
			}));

			menuSections.map((section) => {
				if (section.menuLabel === newMeal.time) {
					section.meals.push(newMeal);
				}
				return section;
			});
			const doc = await addDocument(`users/${user?.uid}/menus`, {
				date: currentDay.getZeroHours(),
				menuSections,
			});

			setMenu({
				date: currentDay,
				id: doc.id,
				menuSections,
			} as Menu);

			alert("Receta Agregada al Menú 📅");
		} catch (error) {
			alert("Algo salió mal al crear menú");
			// console.log("Algo salió mal al crear menú", error);
		}
	}

	async function handleRemoveMeal(
		id: string,
		mealSection: MealTime,
		index: number
	) {
		const path = `users/${user?.uid}/menus/${menu?.id}`;

		const updatedSections = menu?.menuSections.map((section) => {
			if (section.menuLabel === mealSection) {
				const updatedMeals = section.meals.filter((meal, i) => meal.id !== id);
				return {
					...section,
					meals: updatedMeals,
				};
			}
			return section;
		});
		// console.log(updatedSections);
		await updateDocument(path, {
			menuSections: updatedSections,
		});

		setMenu((prev) => {
			return {
				...prev,
				menuSections: updatedSections,
			} as Menu;
		});
	}

	const days: Day[] = [
		{ type: "prev", date: subDays(currentDay, 1) },
		{ type: "current", date: currentDay },
		{ type: "next", date: addDays(currentDay, 1) },
	];

	const emptyMenu = isMenuEmpty(menu?.menuSections as MenuSection[]);

	function isMenuEmpty(menuSections: MenuSection[]): boolean {
		let isEmpty = true;
		if (!menuSections) return isEmpty;
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
			<div className="p-10 flex flex-col w-full max-h-[100vh] overflow-y-auto relative">
				{!loading ? (
					<Fragment>
						<div
							className={`flex items-center ${
								emptyMenu && "justify-center"
							} flex-col h-full pb-10`}
						>
							{!emptyMenu ? (
								menu?.menuSections.map(({ meals, menuLabel }, index) => (
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
						<div className="fixed bottom-0 right-0 mb-5 mr-11 md:mr-32">
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

export default DailyView;
