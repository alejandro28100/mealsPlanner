import { Fragment, useState, useEffect, FC } from "react";

import { Dialog } from "@headlessui/react";
import ReceipesPicker from "./ReceipesPicker";
import MealTimeSelect from "./MealTimeSelect";

import { where, orderBy, startAfter, limit } from "@firebase/firestore";

import { SavedReceipe, Meal, MealTime } from "types/index";
import { useUser } from "hooks/userUser";
import { getDocuments, toMeal } from "utils/firebase";

interface AddReceipesModalProps {
	isOpen: boolean;
	toggleOpen: () => void;
	handleAddMeal: (newMeal: Meal) => Promise<void>;
}

const AddReceipesModal: FC<AddReceipesModalProps> = ({
	isOpen,
	toggleOpen,
	handleAddMeal,
}) => {
	const { user, loading: isUserLoading } = useUser();

	const [loadingReceipes, setLoadingReceipes] = useState(true);
	const [lastReceipesPage, setLastReceipesPage] = useState(false);
	const [receipes, setReceipes] = useState<SavedReceipe[] | undefined>(
		undefined
	);
	const [selectedReceipe, setSelectedReceipe] = useState<
		SavedReceipe | undefined
	>(undefined);
	const [selectedMealTime, setSelectedMealTime] =
		useState<MealTime>("breakfast");

	const handleSelectReceipe = (receipe: SavedReceipe) =>
		setSelectedReceipe(receipe);

	const handleFetchNextReceipes = () => getNextReceipes();

	const handleAddReceipeToCalendar = async () => {
		if (selectedReceipe) {
			let newMeal = toMeal(selectedReceipe, selectedMealTime);
			// console.log(newMeal);
			await handleAddMeal(newMeal);
		}
	};

	const PAGE_SIZE = 5;

	async function getNextReceipes() {
		// @ts-ignore
		const { createdAt } = receipes[receipes?.length - 1];

		setLoadingReceipes(true);
		const snapshot = await getDocuments(
			"receipes",
			where("author.uid", "==", user?.uid),
			orderBy("createdAt", "desc"),
			startAfter(createdAt),
			limit(PAGE_SIZE)
		);

		if (snapshot.empty) {
			// No more receipes
			setLastReceipesPage(true);
			setLoadingReceipes(false);
			return;
		}

		let commingReceipes: SavedReceipe[] = [];
		snapshot.forEach((doc) => {
			commingReceipes.push({
				...doc.data(),
				id: doc.id,
			} as SavedReceipe);
		});
		setReceipes((prev) => [...(prev as SavedReceipe[]), ...commingReceipes]);
		setLoadingReceipes(false);
	}

	async function getReceipes() {
		const snapshot = await getDocuments(
			"receipes",
			where("author.uid", "==", user?.uid),
			orderBy("createdAt", "desc"),
			limit(PAGE_SIZE)
		);

		let receipes: SavedReceipe[] = [];
		snapshot.forEach((doc) => {
			receipes.push({
				...doc.data(),
				id: doc.id,
			} as SavedReceipe);
		});
		setReceipes(receipes);
		setLoadingReceipes(false);
	}

	useEffect(() => {
		if (isUserLoading && !isOpen) return;
		getReceipes();
	}, [isUserLoading, isOpen, getReceipes]);

	return (
		<Fragment>
			<button onClick={toggleOpen} className="btn">
				Agregar comida 📅
			</button>
			<Dialog
				className="fixed z-10 inset-0 overflow-y-auto"
				open={isOpen}
				onClose={toggleOpen}
			>
				<div className="flex items-center justify-center min-h-screen">
					<Dialog.Overlay className="fixed inset-0 bg-black opacity-30" />

					<div className="relative bg-white rounded max-w-sm mx-auto p-8 space-y-5">
						<Dialog.Title className="text-xl font-bold ">
							Agregar comida al calendario 📅
						</Dialog.Title>
						<div>
							<Dialog.Description className="font-semibold">
								Elige que receta agregar al calendario
							</Dialog.Description>
							<ReceipesPicker
								{...{
									selectedReceipe: selectedReceipe as SavedReceipe,
									receipes: receipes as SavedReceipe[],
									handleSelectReceipe,
									handleFetchNextReceipes,
									loading: loadingReceipes && !receipes,
									loadingNextReceipes:
										loadingReceipes && (receipes?.length as number) > 0,
									lastPage: lastReceipesPage,
								}}
							/>
						</div>

						<MealTimeSelect
							selectedMealTime={selectedMealTime}
							setSelectedMealTime={setSelectedMealTime}
						/>

						<div className="flex items-center justify-end space-x-4">
							<button onClick={toggleOpen} className="btn outlined">
								Cerrar
							</button>

							<button onClick={handleAddReceipeToCalendar} className="btn">
								Agregar comida
							</button>
						</div>
					</div>
				</div>
			</Dialog>
		</Fragment>
	);
};

export default AddReceipesModal;
