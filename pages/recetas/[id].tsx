import React, { Fragment, useEffect, useState } from 'react';
import { nanoid } from 'nanoid';
import { getDocument, updateDocument } from 'utils/firebase';
import { getUnit } from 'utils/unit';
import { WithRouterProps } from 'next/dist/client/with-router';
import { withRouter } from 'next/router';
import { NextPage } from 'next/types';
import { Ingredient, Receipe } from 'types/index';

interface ReceipeUpdate {
	name?: string;
	ingredients?: Ingredient[];
}

const units = [ 'pieza', 'paquete', 'cucharada', 'litro', 'mililitro', 'gramo', 'kilogramo', 'pizca' ];

const Receta: NextPage<WithRouterProps> = ({ router }) => {
	const { id } = router.query;

	const [ receipe, setReceipe ] = useState<Receipe>({
		ingredients: [],
		name: ''
	});
	const [ isLoading, setIsLoading ] = useState(true);

	const [ saving, setSaving ] = useState(false);

	const [ ingredientEdited, setIngredientEdited ] = useState<Ingredient>({
		id: '',
		unit: 'pieza',
		amount: '',
		name: ''
	});

	const [ newIngredient, setNewIngredient ] = useState<Ingredient>({
		id: '',
		unit: 'pieza',
		amount: '',
		name: ''
	});

	useEffect(
		() => {
			async function fetchReceipe() {
				try {
					const snapshot = await getDocument(`receipes/${id}`);
					const data = snapshot.data() as Receipe;
					console.log('Data received: ', data);
					setReceipe(data);
					setIsLoading(false);
				} catch (error) {
					alert('No se pudo obtener la receta. Verifique su conexión a internet.');
					console.error(error);
				}
			}

			fetchReceipe();
		},
		[ id ]
	);

	async function updateReceipe(data: ReceipeUpdate) {
		setSaving(true);
		try {
			await updateDocument(`receipes/${id}`, data);
			setReceipe((prevReceipe) => {
				return {
					...prevReceipe,
					...data
				} as Receipe;
			});
		} catch (error) {
			alert('Error al guardar la receta. Verifique su conexión e inténtelo nuevamente');
			console.log('Error');
		} finally {
			setSaving(false);
		}
	}

	async function handleRemoveIngredient(id: string) {
		const updatedIngredients = [ ...receipe.ingredients ].filter((ingredient) => ingredient.id !== id);
		await updateReceipe({
			ingredients: updatedIngredients
		});
	}

	function handleEditIngredient(ingredient: Ingredient) {
		setIngredientEdited(ingredient);
	}

	async function handleUpdateIngredient() {
		const updatedIngredients = [ ...receipe.ingredients ].map((ingredient) => {
			if (ingredient.id === ingredientEdited.id) {
				let ingredientUnit = getUnit(ingredientEdited.unit, ingredientEdited.amount);
				return {
					...ingredientEdited,
					unit: ingredientUnit
				};
			}
			return ingredient;
		});
		await updateReceipe({
			ingredients: updatedIngredients
		});

		setIngredientEdited({
			id: '',
			unit: 'pieza',
			amount: '',
			name: ''
		});
	}

	async function handleAddIngredient() {
		let ingredientUnit = getUnit(newIngredient.unit, newIngredient.amount);

		await updateReceipe({
			ingredients: [
				...receipe.ingredients,
				{
					...newIngredient,
					id: nanoid(),
					unit: ingredientUnit
				}
			]
		});

		setNewIngredient({
			id: '',
			unit: 'pieza',
			amount: '',
			name: ''
		});
	}

	return (
		<div>
			{isLoading ? (
				<h1>Cargando Receta</h1>
			) : (
				<Fragment>
					<input
						type="text"
						value={(receipe && receipe.name) || ''}
						onBlur={(e) => updateReceipe({ name: e.target.value })}
						onChange={(e) => setReceipe((prev) => ({ ...prev, name: e.target.value } as Receipe))}
					/>
					<h2>Ingredientes</h2>
					<table>
						<thead>
							<tr>
								<th>Nombre</th>
								<th>Cantidad</th>
								<th>Unidad</th>
							</tr>
						</thead>
						<tbody>
							<tr>
								<td>
									<input
										type="text"
										disabled={saving}
										value={newIngredient.name}
										onChange={(e) => setNewIngredient({ ...newIngredient, name: e.target.value })}
									/>
								</td>
								<td>
									<input
										disabled={saving}
										type="text"
										value={newIngredient.amount}
										onChange={(e) => setNewIngredient({ ...newIngredient, amount: e.target.value })}
									/>
								</td>
								<td>
									<select
										disabled={saving}
										value={newIngredient.unit}
										onChange={(e) => {
											setNewIngredient({ ...newIngredient, unit: e.target.value });
										}}
									>
										{units.map((unit) => (
											<option key={`unit-option-${unit}`} value={unit}>
												{unit}
											</option>
										))}
									</select>
								</td>
							</tr>
							<tr>
								<td>
									<button disabled={saving} onClick={handleAddIngredient}>
										Agregar Ingrediente
									</button>
								</td>
							</tr>

							{receipe &&
								receipe.ingredients.map(({ name, amount, unit, id }: Ingredient) => (
									<tr key={id}>
										<td>
											{ingredientEdited.id === id ? (
												<input
													type="text"
													value={ingredientEdited.name}
													onChange={(e) =>
														setIngredientEdited((prev) => ({
															...prev,
															name: e.target.value
														}))}
												/>
											) : (
												name
											)}
										</td>
										<td colSpan={ingredientEdited.id === id ? 1 : 2}>
											{ingredientEdited.id === id ? (
												<input
													type="text"
													value={ingredientEdited.amount}
													onChange={(e) =>
														setIngredientEdited((prev) => ({
															...prev,
															amount: e.target.value
														}))}
												/>
											) : (
												`${amount} ${unit}`
											)}
										</td>

										{ingredientEdited.id === id && (
											<td>
												<select
													disabled={saving}
													value={ingredientEdited.unit}
													onChange={(e) =>
														setIngredientEdited((prev) => ({
															...prev,
															unit: e.target.value
														}))}
												>
													{units.map((unit) => (
														<option
															key={`editede-ingredient-unit-option-${unit}`}
															value={unit}
														>
															{unit}
														</option>
													))}
												</select>
											</td>
										)}

										<td>
											<button
												disabled={!!ingredientEdited.id && ingredientEdited.id !== id}
												onClick={() => {
													if (ingredientEdited.id !== id) {
														return handleEditIngredient({ name, amount, unit, id });
													}
													handleUpdateIngredient();
												}}
											>
												{ingredientEdited.id !== id ? 'Editar Ingrediente' : 'Guardar Cambios'}
											</button>
										</td>

										<td>
											<button onClick={() => handleRemoveIngredient(id)}>
												Eliminar Ingrediente
											</button>
										</td>
									</tr>
								))}
						</tbody>
					</table>
					{/* <pre>{JSON.stringify(receipe, null, 2)}</pre> */}
				</Fragment>
			)}
		</div>
	);
};

export default withRouter(Receta);
