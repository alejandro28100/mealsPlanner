import React, { useState, useEffect, Fragment, FC } from 'react';
import Link from 'next/link';
import { deleteField, limit, where } from '@firebase/firestore';
import { getDocuments, getDocument, setDocument, updateDocument } from 'utils/firebase';
import 'utils/date.ts';

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

const DailyView: FC<{ date: Date; setDate: (date: Date) => void }> = ({ date, setDate }) => {
	const [ days, setDays ] = useState<Date[]>(() => {
		let current = date;
		let previous = current.calculateNewDay(-1);
		let next = current.calculateNewDay(1);
		return [ previous, current, next ];
	});

	const [ menu, setMenu ] = useState<Menu>();
	const [ loading, setLoading ] = useState(true);
	const [ error, setError ] = useState<string>();

	useEffect(
		() => {
			(async function() {
				function getStartingDate() {
					return days.length ? days[1].getZeroHours() : new Date().getZeroHours();
				}

				setMenu(undefined);
				setError(undefined);
				setLoading(true);

				try {
					const snapshot = await getDocuments('menus', where('date', '==', getStartingDate()), limit(1));
					if (snapshot.docs.length !== 1) {
						setLoading(false);
						return;
					}
					snapshot.forEach((doc) => {
						let meals: Meal[] = [];
						let { date, meals: mealsMap } = doc.data();

						Object.keys(mealsMap).forEach((mealID) => {
							let meal: Meal = {
								id: mealID,
								...mealsMap[mealID]
							};
							meals.push(meal);
						});

						setMenu({
							id: doc.id,
							date,
							meals
						} as Menu);
					});
					setLoading(false);
				} catch (error) {
					setError(error as string);
				}
			})();
		},
		[ days ]
	);

	function handleClick(index: number) {
		let newCurrentDate: unknown;
		if (index === 0) {
			// Go to yesterday
			setDays(([ previous, current ]) => {
				newCurrentDate = previous;
				return [ previous.calculateNewDay(-1), previous, current ];
			});
		} else if (index === 2) {
			// Go to tomorrow
			setDays(([ _, current, next ]) => {
				newCurrentDate = next;
				return [ current, next, next.calculateNewDay(1) ];
			});
		}
		//Update global date
		setDate(newCurrentDate as Date);
		return;
	}

	async function handleRemoveMeal(id: string) {
		const path = `/menus/${menu && menu.id}`;
		const mealPath = `meals.${id}`;

		await updateDocument(path, {
			[mealPath]: deleteField()
		});

		setMenu((prev) => {
			return {
				...prev,
				meals: prev && prev.meals.filter((meal) => meal.id !== id)
			} as Menu;
		});

		console.log('Document Updated');
	}

	return (
		<section style={{ display: 'flex' }}>
			{days.length && (
				<Fragment>
					<div style={{ width: '25%', background: 'lightblue', textAlign: 'center' }}>
						<h2>Días</h2>
						{error && <h2>Algo salió mal, inténtalo más tarde :(</h2>}

						{days.map((day, index) => (
							<div
								key={day.toDateString()}
								onClick={() => handleClick(index)}
								style={{ display: 'block', textAlign: 'center', padding: '1em', cursor: 'pointer' }}
							>
								{day.getDate()}
							</div>
						))}
					</div>
					<div>
						<h2>{days[1].toSpanishDate()}</h2>
						{menu ? (
							<div>
								{menu.meals.length >= 1 ? (
									menu.meals.map(({ id, name, type, subType }) => (
										<div key={id}>
											<h3 style={{ display: 'inline-block' }}>
												{`${name} | ${type} ${subType && ` | ${subType}`}`}
											</h3>
											<button onClick={() => handleRemoveMeal(id)}>Eliminar</button>
										</div>
									))
								) : (
									<Fragment>
										<h3>No tienes ninguna comida planeada</h3>
										<Link href="/recetas">
											<a>
												<button>Agrega comidas ahora</button>
											</a>
										</Link>
									</Fragment>
								)}
							</div>
						) : (
							!error &&
							!loading && (
								<Fragment>
									<h3>No tienes ninguna comida planeada</h3>
									<Link href="/recetas">
										<a>
											<button>Agrega comidas ahora</button>
										</a>
									</Link>
								</Fragment>
							)
						)}
					</div>
				</Fragment>
			)}
		</section>
	);
};

export default DailyView;
