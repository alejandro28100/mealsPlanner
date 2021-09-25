import React, { Dispatch, FC, SetStateAction } from "react";

import { AiFillCaretDown } from "react-icons/ai";

import { Listbox } from "@headlessui/react";

import { MealTime } from "types/index";

const MEAL_TIME_OPTIONS: MealTime[] = ["breakfast", "lunch","dinner" ];

const MEAL_TIME_LABELS = {
	breakfast: "Desayuno",
	dinner: "Cena",
	lunch: "Comida",
};

interface MealTimeSelect {
	selectedMealTime: MealTime;
	setSelectedMealTime: Dispatch<SetStateAction<MealTime>>;
}

const MealTimeSelect: FC<MealTimeSelect> = ({ selectedMealTime, setSelectedMealTime }) => {
	return (
		<Listbox value={selectedMealTime} onChange={setSelectedMealTime}>
			<div className="relative mt-1 ">
				<div className="flex space-x-2 items-center">
					<Listbox.Label className="font-semibold">Tipo de comida:</Listbox.Label>
					<Listbox.Button className="rounded border border-black py-1 px-4 text-sm flex flex-row items-center justify-between md:text-base flex-1">
						{MEAL_TIME_LABELS[selectedMealTime]}
						<span className="h-4">
							<AiFillCaretDown className="w-full h-full" />
						</span>
					</Listbox.Button>
				</div>

				<Listbox.Options className="absolute right-0 w-[153px] py-1 mt-1 overflow-auto bg-white shadow-md max-h-60 rounded">
					{MEAL_TIME_OPTIONS.map((mealTime) => (
						<Listbox.Option
							className={({ active, selected }) =>
								`${
									selected ? "font-black" : "hover:font-semibold"
								} cursor-pointer select-none py-2 px-4 `
							}
							key={mealTime}
							value={mealTime}
						>
							{MEAL_TIME_LABELS[mealTime]}
						</Listbox.Option>
					))}
				</Listbox.Options>
			</div>
		</Listbox>
	);
};

export default MealTimeSelect;
