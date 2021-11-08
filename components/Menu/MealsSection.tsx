import { FC, Fragment, useState } from "react";
import { Dialog } from "@headlessui/react";
import { Meal, MealTime } from "types/index";
import useGetReceipe from "hooks/useGetReceipe";

const MEAL_SECTION_LABELS = {
	breakfast: "Desayuno",
	lunch: "Comida",
	dinner: "Cena",
};

interface MealsSectionProps {
	meals: Meal[];
	label: MealTime;
	handleRemoveMeal: (
		id: string,
		mealSection: MealTime,
		index: number
	) => Promise<void>;
}
interface SelectedReceipe {
	id: string;
	name: string;
}
const MealsSection: FC<MealsSectionProps> = ({
	label,
	meals,
	handleRemoveMeal,
}) => {
	const sectionLabel = MEAL_SECTION_LABELS[label];
	const isEmpty = meals.length === 0;

	const [isOpen, setIsOpen] = useState(false);
	const [selectedReceipe, setSelectedReceipe] = useState<
		SelectedReceipe | undefined
	>(undefined);

	const { receipe, isLoading, error } = useGetReceipe(
		selectedReceipe?.id as string
	);

	if (isEmpty) return null;

	function handleSeeReceipe(id: string, name: string) {
		setSelectedReceipe({ id, name });
		toggleOpen();
	}
	function handleCloseReceipeModal() {
		setSelectedReceipe(undefined);
		toggleOpen();
	}
	function toggleOpen() {
		setIsOpen((prev) => !prev);
	}

	return (
		<div className="my-5 self-start justify-self-star w-full">
			<h3 className="my-4 py-1 border-b border-secondary/60 font-semibold select-none">
				{sectionLabel}
			</h3>
			<div className="flex flex-wrap">
				{meals.map(({ id, name }, index) => (
					<div
						className="flex border border-secondary/60 m-4"
						key={`${sectionLabel}-${id}-${index}`}
					>
						<button
							title="Ver receta"
							className="px-2 py-1 hover:bg-secondary/20 cursor-pointer select-none"
							onClick={(e) => handleSeeReceipe(id, name)}
						>
							{name}
						</button>
						<hr className="border-r border-secondary/60 h-full" />
						<button
							className="p-1 text-sm text-secondary hover:text-red-500"
							title="Eliminar receta"
							onClick={() => handleRemoveMeal(id, label, index)}
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
			<Dialog
				className="fixed z-10 inset-0 overflow-y-auto"
				open={isOpen}
				onClose={handleCloseReceipeModal}
			>
				<div className="flex items-center justify-center min-h-screen">
					<Dialog.Overlay className="fixed inset-0 bg-black opacity-30" />

					<div className="relative flex flex-col bg-white rounded w-[90vw] sm:w-[60vw] md:w-[50vw] lg:w-[35vw] h-[90vh] mx-auto p-12 space-y-5 overflow-y-auto">
						<Dialog.Title className="text-xl font-bold">
							{isLoading
								? "Cargando Receta..."
								: error
								? error
								: selectedReceipe?.name}
						</Dialog.Title>
						{selectedReceipe && receipe && (
							<Fragment>
								{receipe?.picture && (
									<img
										className="my-5 rounded w-full h-auto object-cover"
										src={receipe.picture}
										alt={receipe?.name}
									/>
								)}
								<Dialog.Description
									aria-hidden
									className="font-semibold hidden"
								>
									{selectedReceipe?.name}
								</Dialog.Description>

								<h3 className="text-lg font-semibold my-2">Ingredientes</h3>
								<div className="flex-1 space-y-2">
									{receipe?.ingredients.map((ingredient) => (
										<p
											key={`${label}-${ingredient.id}`}
											className="w-full flex space-x-2"
										>
											<span className="flex-1">{ingredient.name}</span>
											<span>{ingredient.amount}</span>
											<span>{ingredient.unit}</span>
										</p>
									))}
								</div>

								<div className="flex-1 space-y-2 whitespace-pre-wrap">
									<h3 className="text-lg font-semibold my-2">Pasos</h3>
									{receipe?.steps}
								</div>

								<div className="flex items-center justify-end space-x-4">
									<button onClick={handleCloseReceipeModal} className="btn">
										Cerrar
									</button>
								</div>
							</Fragment>
						)}
					</div>
				</div>
			</Dialog>
		</div>
	);
};

export default MealsSection;
