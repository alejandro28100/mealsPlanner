import React, { useState, useEffect, Fragment, FC } from "react";
import { deleteField, limit, where } from "@firebase/firestore";
import { db, getDocuments, updateDocument } from "utils/firebase";
import { useUser } from "hooks/userUser";
import { subDays, addDays } from "date-fns";
import "utils/date.ts";

import AddReceipesModal from "components/AddReceipesModal";

interface Menu {
	id: string;
	date: Date;
	meals: Meal[];
}

interface Meal {
	id: string;
	name: string;
	subType: string;
	type: string;
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
	const { user } = useUser();

	const [menu, setMenu] = useState<Menu | undefined>(undefined);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | undefined>(undefined);

	const [isAddReceipeModalOpen, setIsAddReceipeModalOpen] = useState(false);

	useEffect(() => {
		(async function () {
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
	}, [currentDay]);

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

	async function handleRemoveMeal(id: string) {
		const path = `/menus/${menu?.id}`;
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
				<div className="p-10 w-full flex items-center justify-center flex-col">
					{!loading ? (
						menu && menu.meals.length >= 1 ? (
							menu.meals.map(({ id, name, type, subType }) => (
								<div key={id}>
									<h3 style={{ display: "inline-block" }}>
										{`${name} | ${type} ${subType && ` | ${subType}`}`}
									</h3>
									<button onClick={() => handleRemoveMeal(id)}>Eliminar</button>
								</div>
							))
						) : (
							<Fragment>
								<h3 className="text-secondary font-semibold text-xl my-12">
									No tienes ninguna comida planeada para este día
								</h3>
								<div className="flex flex-col items-center justify-center">
									<AddReceipesModal
										isOpen={isAddReceipeModalOpen}
										toggleOpen={() => setIsAddReceipeModalOpen((prev) => !prev)}
									/>
								</div>
							</Fragment>
						)
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
