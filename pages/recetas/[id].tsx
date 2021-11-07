import React, {
	FC,
	Fragment,
	useEffect,
	useState,
	Dispatch,
	SetStateAction,
	useRef,
	ChangeEvent,
} from "react";

import Navbar from "components/Navbar";
import Link from "next/link";

import { nanoid } from "nanoid";
import { WithRouterProps } from "next/dist/client/with-router";
import { withRouter } from "next/router";
import { NextPage } from "next/types";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";

import { useUser } from "hooks/userUser";

import { Ingredient, Receipe, SavedReceipe } from "types/index";
import { getDocument, updateDocument, storage } from "utils/firebase";
import { getUnit } from "utils/unit";

interface ReceipeUpdate {
	name?: string;
	ingredients?: Ingredient[];
	picture?: string;
}

const units = [
	"pieza",
	"paquete",
	"cucharada",
	"litro",
	"mililitro",
	"gramo",
	"kilogramo",
	"pizca",
];

const Receta: NextPage<WithRouterProps> = ({ router }) => {
	const { id } = router.query;

	const { user, loading: isUserLoading } = useUser({ protectedPage: true });
	const receipePictureInputRef = useRef<HTMLInputElement | null>(null);
	const [receipe, setReceipe] = useState<SavedReceipe>({
		picture: "",
		ingredients: [],
		name: "",
		author: {
			displayName: "",
			photoURL: "",
			uid: "",
		},
		createdAt: new Date(),
		id: "",
	});
	const [isLoading, setIsLoading] = useState(true);

	const [saving, setSaving] = useState(false);

	const [ingredientEdited, setIngredientEdited] = useState<Ingredient>({
		id: "",
		unit: "pieza",
		amount: "",
		name: "",
	});

	const [newIngredient, setNewIngredient] = useState<Ingredient>({
		id: "",
		unit: "pieza",
		amount: "",
		name: "",
	});

	useEffect(() => {
		async function fetchReceipe() {
			try {
				const snapshot = await getDocument(`receipes/${id}`);
				const data = {
					...snapshot.data(),
					id: snapshot.id,
				} as SavedReceipe;
				console.log("Data received: ", data);
				setReceipe(data);
				setIsLoading(false);
			} catch (error) {
				alert(
					"No se pudo obtener la receta. Verifique su conexión a internet."
				);
				console.error(error);
			}
		}
		if (!isUserLoading) {
			fetchReceipe();
		}
	}, [id, isUserLoading, user]);

	function handleTriggerFileInput() {
		receipePictureInputRef.current?.click();
	}

	async function handleOnPictureInputChange(
		event: ChangeEvent<HTMLInputElement>
	) {
		const files = event?.target?.files as FileList;
		const file = files[0];

		if (!file) return;

		const imageName: string =
			(receipe.name.length !== 0 &&
				`${receipe.name}.${file.type.split("/")[1]}`) ||
			file.name;

		const imageRef = ref(storage, `images/receipes/${receipe.id}/${imageName}`);

		await uploadBytes(imageRef, file);

		const imageURL = await getDownloadURL(imageRef);

		await updateReceipe({
			picture: imageURL,
		});
	}

	async function updateReceipe(data: ReceipeUpdate) {
		setSaving(true);
		try {
			await updateDocument(`receipes/${id}`, data);
			setReceipe((prevReceipe) => {
				return {
					...prevReceipe,
					...data,
				} as SavedReceipe;
			});
		} catch (error) {
			alert(
				"Error al guardar la receta. Verifique su conexión e inténtelo nuevamente"
			);
		} finally {
			setSaving(false);
		}
	}

	async function handleRemoveIngredient(id: string) {
		const updatedIngredients = [...receipe.ingredients].filter(
			(ingredient) => ingredient.id !== id
		);
		await updateReceipe({
			ingredients: updatedIngredients,
		});
	}

	function handleEditIngredient(ingredient: Ingredient) {
		setIngredientEdited(ingredient);
	}

	async function handleUpdateIngredient() {
		const updatedIngredients = [...receipe.ingredients].map((ingredient) => {
			if (ingredient.id === ingredientEdited.id) {
				let ingredientUnit = getUnit(
					ingredientEdited.unit,
					ingredientEdited.amount
				);
				return {
					...ingredientEdited,
					unit: ingredientUnit,
				};
			}
			return ingredient;
		});
		await updateReceipe({
			ingredients: updatedIngredients,
		});

		setIngredientEdited({
			id: "",
			unit: "pieza",
			amount: "",
			name: "",
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
					unit: ingredientUnit,
				},
			],
		});

		setNewIngredient({
			id: "",
			unit: "pieza",
			amount: "",
			name: "",
		});
	}

	return (
		<Fragment>
			<Navbar
				start={
					<input
						className="hidden lg:inline-block text-2xl font-semibold"
						type="text"
						value={receipe?.name || ""}
						onBlur={(e) => updateReceipe({ name: e.target.value })}
						onChange={(e) =>
							setReceipe(
								(prev) => ({ ...prev, name: e.target.value } as SavedReceipe)
							)
						}
					/>
				}
				links={[
					<Link key="link-1" href="/menu">
						<a className="hidden md:inline-block">Ver Menú 📅</a>
					</Link>,
					<Link key="link-2" href="/menu">
						<a className="hidden md:inline-block">Ver Recetas 🍽</a>
					</Link>,
				]}
			/>
			<main className="px-11 md:px-32">
				<nav className="flex md:hidden justify-end items-center space-x-4">
					<Link href="/menu">
						<a>Ver Menú 📅</a>
					</Link>

					<Link href="/recetas">
						<a>Ver Recetas 🍽</a>
					</Link>
				</nav>
				<section className="space-y-5 flex flex-col lg:flex-row">
					<div className="lg:w-5/12 lg:pr-5 py-8 text-center">
						{isLoading ? (
							<svg
								xmlns="http://www.w3.org/2000/svg"
								className="h-full w-full object-cover"
								fill="none"
								viewBox="0 0 24 24"
								stroke="currentColor"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
									d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
								/>
							</svg>
						) : receipe?.picture && receipe.picture.length !== 0 ? (
							<Fragment>
								<img
									onClick={handleTriggerFileInput}
									className="rounded object-cover w-full h-full"
									src={receipe.picture}
								/>
								<input
									className="mt-5 text-center lg:hidden text-2xl font-semibold w-full"
									type="text"
									value={receipe?.name || ""}
									onBlur={(e) => updateReceipe({ name: e.target.value })}
									onChange={(e) =>
										setReceipe(
											(prev) =>
												({ ...prev, name: e.target.value } as SavedReceipe)
										)
									}
								/>
							</Fragment>
						) : (
							<svg
								onClick={handleTriggerFileInput}
								xmlns="http://www.w3.org/2000/svg"
								className="h-full w-full"
								fill="none"
								viewBox="0 0 24 24"
								stroke="currentColor"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
									d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
								/>
							</svg>
						)}
						<input
							className="hidden"
							ref={receipePictureInputRef}
							onChange={handleOnPictureInputChange}
							type="file"
							multiple={false}
							accept=".jpeg,.jpg,.png"
						/>
					</div>
					<div className="w-auto">
						{isLoading ? (
							<h1 className="text-secondary">Cargando Receta...</h1>
						) : (
							<Fragment>
								<h2 className="font-semibold text-lg my-4">Ingredientes</h2>

								<table className="flex space-y-5 flex-col overflow-x-auto my-5">
									<thead>
										<tr className="flex justify-between text-secondary md:border-b md:border-secondary">
											<th className="w-1/4 font-semibold text-left min-w-[100px]">
												Nombre
											</th>
											<th className="w-1/4 mx-4 font-semibold text-left min-w-[100px]">
												Cantidad
											</th>
											<th className="w-1/4 font-semibold text-left min-w-[100px]">
												Unidad
											</th>
											<th className="w-1/4 min-w-[100px]"></th>
										</tr>
									</thead>
									<tr className="flex items-center justify-between">
										<td className="w-1/4 min-w-[100px]">
											<input
												className="w-full border border-secondary rounded-sm"
												type="text"
												disabled={saving}
												value={newIngredient.name}
												onChange={(e) =>
													setNewIngredient({
														...newIngredient,
														name: e.target.value,
													})
												}
											/>
										</td>
										<td className="w-1/4 mx-4 min-w-[100px]">
											<input
												className="w-full border border-secondary rounded-sm"
												disabled={saving}
												type="number"
												value={newIngredient.amount}
												onChange={(e) =>
													setNewIngredient({
														...newIngredient,
														amount: e.target.value,
													})
												}
											/>
										</td>
										<td className="w-1/4 min-w-[100px]">
											<select
												className="w-2/3 border border-secondary rounded-sm"
												disabled={saving}
												value={newIngredient.unit}
												onChange={(e) => {
													setNewIngredient({
														...newIngredient,
														unit: e.target.value,
													});
												}}
											>
												{units.map((unit) => (
													<option key={`unit-option-${unit}`} value={unit}>
														{unit}
													</option>
												))}
											</select>
										</td>
										<td className="w-1/4 min-w-[100px]">
											<button
												className="text-sm px-2 py-1 border border-secondary rounded"
												disabled={saving}
												onClick={handleAddIngredient}
											>
												Agregar Ingrediente
											</button>
										</td>
									</tr>
									{receipe?.ingredients.map((ingredient: Ingredient) => (
										<ReceipeIngredientRow
											key={ingredient.id}
											{...{
												...ingredient,
												ingredientEdited,
												handleEditIngredient,
												handleRemoveIngredient,
												handleUpdateIngredient,
												setIngredientEdited,
											}}
										/>
									))}
								</table>
							</Fragment>
						)}
					</div>
				</section>
			</main>
		</Fragment>
	);
};

interface ReceipeIngredientRowProps extends Ingredient {
	ingredientEdited: Ingredient;
	setIngredientEdited: Dispatch<SetStateAction<Ingredient>>;
	handleRemoveIngredient: (id: string) => Promise<void>;
	handleEditIngredient: (ingredient: Ingredient) => void;
	handleUpdateIngredient: () => Promise<void>;
}

const ReceipeIngredientRow: FC<ReceipeIngredientRowProps> = ({
	id,
	amount,
	unit,
	name,
	ingredientEdited,
	setIngredientEdited,
	handleRemoveIngredient,
	handleEditIngredient,
	handleUpdateIngredient,
}) => {
	return (
		<tr className="flex justify-between " key={id}>
			<td className="w-1/4 min-w-[100px]">
				{ingredientEdited.id === id ? (
					<input
						className="w-full border border-secondary rounded-sm"
						type="text"
						value={ingredientEdited.name}
						onChange={(e) =>
							setIngredientEdited((prev) => ({
								...prev,
								name: e.target.value,
							}))
						}
					/>
				) : (
					name
				)}
			</td>
			<td
				className="w-1/4 mx-4 min-w-[100px]"
				colSpan={ingredientEdited.id === id ? 1 : 2}
			>
				{ingredientEdited.id === id ? (
					<input
						className="w-full border border-secondary rounded-sm"
						type="text"
						value={ingredientEdited.amount}
						onChange={(e) =>
							setIngredientEdited((prev) => ({
								...prev,
								amount: e.target.value,
							}))
						}
					/>
				) : (
					`${amount} ${unit}`
				)}
			</td>

			{ingredientEdited.id === id ? (
				<td className="w-1/4 min-w-[100px]">
					<select
						className="border border-secondary rounded-sm"
						value={ingredientEdited.unit}
						onChange={(e) =>
							setIngredientEdited((prev) => ({
								...prev,
								unit: e.target.value,
							}))
						}
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
			) : (
				<td className="w-1/4 min-w-[100px]"></td>
			)}

			<td className="space-x-5 w-1/4 min-w-[100px] text-right">
				<button
					disabled={!!ingredientEdited.id && ingredientEdited.id !== id}
					onClick={() => {
						if (ingredientEdited.id !== id) {
							return handleEditIngredient({
								name,
								amount,
								unit,
								id,
							});
						}
						handleUpdateIngredient();
					}}
				>
					{ingredientEdited.id !== id ? (
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
								d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
							/>
						</svg>
					) : (
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
								d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4"
							/>
						</svg>
					)}
				</button>
				<button onClick={() => handleRemoveIngredient(id)}>
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
							d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
						/>
					</svg>
				</button>
			</td>
		</tr>
	);
};

export default withRouter(Receta);
