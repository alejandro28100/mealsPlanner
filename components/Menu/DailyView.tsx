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
import "utils/date.ts";
import { Meal } from "types/index";

import AddReceipesModal from "components/AddReceipesModal";
interface Menu {
	id: string;
	date: Date;
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
					let meals: Meal[] = [];
					let { date, meals: mealsMap } = doc.data();

					Object.keys(mealsMap).forEach((mealID) => {
						let meal: Meal = {
							id: mealID,
							...mealsMap[mealID],
						};
						meals.push(meal);
					});

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
			const formatedMeals: FirebaseMeal = toFirestoreMeal([...menu.meals, newMeal]);
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

	return (
		<section style={{ display: "flex" }}>
			<Fragment>
				<div className="w-1/4 flex flex-col justify-evenly items-center space-y-[40px] py-7 border-r border-secondary/60">
					{days.map(({ date, type }: Day, index) => (
						<div
							key={index}
							onClick={() => handleShowDay(type)}
							className="cursor-pointer flex items-center justify-center p-10 text-4xl font-black first-of-type:text-secondary/50 last-of-type:text-secondary/50"
						>
							{date.getDate()}
						</div>
					))}
				</div>
				<div className="p-10 flex flex-col w-full">
					{!loading ? (
						<Fragment>
							<div className="self-end">
								<AddReceipesModal
									handleAddMeal={handleAddMeal}
									isOpen={isAddReceipeModalOpen}
									toggleOpen={() => setIsAddReceipeModalOpen((prev) => !prev)}
								/>
							</div>
							<div className="flex items-center justify-center flex-col h-full">
								{menu && menu.meals.length >= 1 ? (
									menu.meals.map(({ id, name, time }) => (
										<div key={id}>
											<h3 style={{ display: "inline-block" }}>{`${name} | ${time} `}</h3>
											<button onClick={() => handleRemoveMeal(id)}>Eliminar</button>
										</div>
									))
								) : (
									<Fragment>
										<h3 className="text-secondary font-semibold text-xl my-12">
											No tienes ninguna comida planeada para este día
										</h3>
									</Fragment>
								)}
							</div>
						</Fragment>
					) : (
						"Cargando"
					)}
					{!loading && error && <h2>Algo salió mal, inténtalo más tarde :(</h2>}
				</div>
			</Fragment>
		</section>
	);
};

export default DailyView;
