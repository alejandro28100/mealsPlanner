import { NextPage } from 'next';
import Link from 'next/link';
import { withRouter } from 'next/router';
import { WithRouterProps } from 'next/dist/client/with-router';
import React, { Fragment, useState } from 'react';
import DatePicker from 'components/DatePicker';
import { addDocument, getDocuments, setDocument } from 'utils/firebase';
import { SavedReceipe } from 'types/index';
import { limit, where } from '@firebase/firestore';
import 'utils/date';

interface MealRecord {
	date: Date;
	mealType: string;
	mealSubType: string;
	receipeName: string;
	receipeID: string;
}

const MEAL_OPTIONS = [ 'Desayuno', 'Brunch', 'Comida', 'Cena', 'Snack', 'Postre' ];

const MEAL_SUB_OPTIONS: any = {
	Comida: [ 'Entrada', 'Plato Fuerte', 'Guiso', 'Bebida' ],
	Cena: [ 'Bebida' ],
	Desayuno: [ 'Bebida' ]
};

const AddToMenu: NextPage<WithRouterProps> = (props) => {
	const { id: receipeID, name: receipeName } = props.router.query;

	const [ mealRecord, setMealRecord ] = useState<MealRecord>({
		date: new Date(new Date().toDateString()),
		mealType: '',
		mealSubType: '',
		receipeName: receipeName as string,
		receipeID: receipeID as string
	});

	const { date, mealSubType, mealType } = mealRecord;

	const mealSubOptions = MEAL_SUB_OPTIONS[mealType];

	function updateMealRecord(prop: 'date' | 'mealType' | 'mealSubType', value: Date | string | SavedReceipe) {
		setMealRecord((prev) => ({
			...prev,
			[prop]: value
		}));
	}

	async function createMealRecord() {
		if (!!date && !!mealType) {
			if (mealType === 'Comida' && !!!mealSubType) {
				return console.info('Meal Subtype missing');
			}

			let date = new Date(mealRecord.date.toDateString());

			/*
			*	Search for a menu record of the date given and update the document in firestore 
			*/
			const snapshot = await getDocuments('menus', where('date', '==', date), limit(1));

			if (snapshot.size >= 1) {
				snapshot.forEach((doc) => {
					let menuID = doc.id;
					let data = doc.data();
					let meals = {
						...data['meals'],
						[mealRecord.receipeID]: {
							name: mealRecord.receipeName,
							type: mealRecord.mealType,
							subType: mealRecord.mealSubType
						}
					};

					setDocument(`/menus/${menuID}`, { meals });
				});
				console.log('Document updated');
				return;
			}

			/**
			 * In case there's no  a menu record of the given date, create a new one 
			 */
			await addDocument('/menus', {
				date: mealRecord.date,
				meals: {
					[mealRecord.receipeID]: {
						name: mealRecord.receipeName,
						type: mealRecord.mealType,
						subType: mealRecord.mealSubType
					}
				}
			});

			console.log('Document created');
			return;
		}
		console.info('Fields missing');
	}
	return (
		<div>
			<h1>Añadir {receipeName} al menú</h1>

			<div style={{ display: 'flex' }}>
				<div style={{ margin: '1em' }}>
					<DatePicker selected={date} onChange={(newDate) => updateMealRecord('date', newDate as Date)} />
				</div>
				<div>
					<h2>Tipo de comida</h2>
					<select value={mealType} onChange={(e) => updateMealRecord('mealType', e.target.value)}>
						<option value="" />
						{MEAL_OPTIONS.map((option) => (
							<option key={`meal-option-${option}`} value={option}>
								{option}
							</option>
						))}
					</select>
					{mealSubOptions && (
						<Fragment>
							<h2>Subtipo de comida</h2>
							<select
								value={mealSubType}
								onChange={(e) => updateMealRecord('mealSubType', e.target.value)}
							>
								<option value="" />
								{mealSubOptions.map((subOption: string) => (
									<option key={`meal-subOption-${subOption}`} value={subOption}>
										{subOption}
									</option>
								))}
							</select>
						</Fragment>
					)}
					<button style={{ display: 'block', margin: '1em 0em' }} onClick={createMealRecord}>
						Añadir al calendario
					</button>
				</div>
			</div>

			<Link href="/menu">
				<a>
					<button>Ir al menú</button>
				</a>
			</Link>
			<Link href="/recetas">
				<a>
					<button>Agregar más recetas</button>
				</a>
			</Link>
			{/* <pre>{JSON.stringify(mealRecord, null, 2)}</pre> */}
		</div>
	);
};

export default withRouter(AddToMenu);
