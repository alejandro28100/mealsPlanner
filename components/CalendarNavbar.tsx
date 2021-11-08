import { FC } from "react";

import { subMonths, addMonths } from "date-fns";
import { useMonthlyCalendar } from "@zach.codes/react-calendar";

import DateLabel from "./DateLabel";
import ViewPicker from "./ViewPicker";

import { IoMdArrowDropleft, IoMdArrowDropright } from "react-icons/io";

import { ViewPicker as ViewPickerProps } from "types/index";

interface CalendarNavbarProps extends ViewPickerProps {
	date?: Date;
}

const CalendarNavbar: FC<CalendarNavbarProps> = ({ view, setView }) => {
	const { currentMonth, onCurrentMonthChange } = useMonthlyCalendar();

	return (
		<div className="flex items-center space-x-2 md:space-x-4 py-4 px-11 md:px-32">
			<div className="flex items-center flex-1 w-full">
				<DateLabel view={view} date={currentMonth} />
				<div className="flex items-center">
					<button
						onClick={() => onCurrentMonthChange(subMonths(currentMonth, 1))}
						className="cursor-pointer"
					>
						<IoMdArrowDropleft className="w-full h-10" />
					</button>
					<button
						onClick={() => onCurrentMonthChange(addMonths(currentMonth, 1))}
						className="cursor-pointer"
					>
						<IoMdArrowDropright className="w-full h-10" />
					</button>
				</div>
			</div>

			<ViewPicker view={view} setView={setView} />
		</div>
	);
};

export default CalendarNavbar;
