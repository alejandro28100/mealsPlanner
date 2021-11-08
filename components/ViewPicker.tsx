import { FC, Dispatch, SetStateAction } from "react";

import { Listbox } from "@headlessui/react";

import { AiFillCaretDown } from "react-icons/ai";
import { IoIosToday } from "react-icons/io";
import { BiCalendar } from "react-icons/bi";

import { CalendarView } from "types/index";

interface ViewPicker {
	view: CalendarView;
	setView: Dispatch<SetStateAction<CalendarView>>;
}

const views = [
	{
		label: "Día",
		value: "daily",
		icon: (
			<span className="h-6 mr-4">
				<IoIosToday className="w-full h-full" />
			</span>
		),
	},
	{
		label: "Mes",
		value: "montly",
		icon: (
			<span className="h-6 mr-4">
				<BiCalendar className="w-full h-full" />
			</span>
		),
	},
];

const ViewPicker: FC<ViewPicker> = ({ view, setView }) => {
	const viewPickerLabel = view === "daily" ? views[0].label : views[1].label;
	return (
		<Listbox value={view} onChange={setView}>
			<div className="relative mt-1 ">
				<Listbox.Button className="btn outlined text-sm flex flex-row items-center justify-between md:text-base w-24">
					{viewPickerLabel}
					<span className="h-4">
						<AiFillCaretDown className="w-full h-full" />
					</span>
				</Listbox.Button>
				<Listbox.Options className="absolute z-10 right-0 md:left-0 min-w-[200px] py-1 mt-1 overflow-auto bg-white shadow-md max-h-60">
					{views.map(({ value, label, icon }) => (
						<Listbox.Option
							className={({ active, selected }) =>
								`${selected && "font-semibold"} ${
									active && "bg-secondary/10"
								} cursor-default select-none relative py-2 px-4 flex items-center`
							}
							key={value}
							value={value}
						>
							{icon} Vista por {label}
						</Listbox.Option>
					))}
				</Listbox.Options>
			</div>
		</Listbox>
	);
};

export default ViewPicker;
