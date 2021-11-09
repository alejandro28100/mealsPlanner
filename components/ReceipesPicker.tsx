import { FC, Fragment } from "react";
import { RadioGroup } from "@headlessui/react";
import { SavedReceipe } from "types/index";

interface ReceipesPicker {
	selectedReceipe: SavedReceipe;
	receipes: SavedReceipe[];
	handleSelectReceipe: (receipe: SavedReceipe) => void;
	handleFetchNextReceipes: () => Promise<void>;
	loading: boolean;
	loadingNextReceipes: boolean;
	lastPage: boolean;
}

const ReceipesPicker: FC<ReceipesPicker> = ({
	handleSelectReceipe,
	handleFetchNextReceipes,
	receipes,
	selectedReceipe,
	loading,
	loadingNextReceipes,
	lastPage,
}) => {
	return (
		<>
			<RadioGroup value={selectedReceipe} onChange={handleSelectReceipe}>
				<RadioGroup.Label className="sr-only">Receipes</RadioGroup.Label>
				{loading ? (
					"Cargando recetas..."
				) : (
					<div className="flex flex-col items-stretch justify-start space-y-3 h-[45vh] px-2 py-5 overflow-y-auto">
						{receipes?.map((receipe) => {
							const { name, id } = receipe;
							return (
								<RadioGroup.Option as={Fragment} key={id} value={receipe}>
									{({ active, checked }) => (
										<button
											className={`
											${checked ? "bg-black text-white" : ""}
											${active ? "ring-2 ring-black" : ""}
											ring-1 ring-black font-medium text-sm select-none px-4 py-2 rounded cursor-pointer text-left`}
										>
											{name}
										</button>
									)}
								</RadioGroup.Option>
							);
						})}
					</div>
				)}
			</RadioGroup>
			{!lastPage && (
				<div className="text-center">
					<button
						disabled={loadingNextReceipes}
						onClick={handleFetchNextReceipes}
					>
						Ver más recetas
					</button>
				</div>
			)}
		</>
	);
};
export default ReceipesPicker;
