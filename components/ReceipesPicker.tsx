import { FC } from "react";
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
					<div className="space-y-2 py-4">
						{receipes?.map((receipe) => {
							const { name, id } = receipe;
							return (
								<RadioGroup.Option
									key={id}
									value={receipe}
									className={({ active, checked }) => `
										${active ? "ring-black/80 ring-1" : ""} 
										${checked ? "bg-black text-white" : "bg-white"} 
										 bg-white border-black border rounded px-4 py-2 cursor-pointer select-none 
							}		`}
								>
									<div className="flex items-center justify-btween w-full">
										<RadioGroup.Label as="p" className="font-medium text-sm">
											{name}
										</RadioGroup.Label>
									</div>
								</RadioGroup.Option>
							);
						})}
					</div>
				)}
			</RadioGroup>
			{!lastPage && (
				<div className="">
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
