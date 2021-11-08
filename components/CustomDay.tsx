import { FC } from "react";

import { useMonthlyBody, useMonthlyCalendar } from "@zach.codes/react-calendar";

import { format, isSameDay } from "date-fns";

const CustomDay: FC<{ onSelectDay: (date: Date) => void }> = ({
	onSelectDay,
}) => {
	let { locale } = useMonthlyCalendar();
	let { day } = useMonthlyBody();
	let dayNumber = format(day, "d", { locale });

	function handleOnSelectDay() {
		onSelectDay(day);
	}

	const isToday = isSameDay(day, new Date());
	return (
		<div
			onClick={handleOnSelectDay}
			aria-label={`Día ${dayNumber}`}
			className={`${
				isToday ? "bg-black text-white" : "hover:bg-secondary/10"
			} h-20 p-2 border-b-2 border-r-2`}
		>
			<div className="flex justify-between">
				<div className="font-bold">{dayNumber}</div>
				<div className="lg:hidden block">{format(day, "EEEE", { locale })}</div>
			</div>
		</div>
	);
};

export default CustomDay;
