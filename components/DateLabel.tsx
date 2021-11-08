import { FC } from "react";

import { format } from "date-fns";
import EsLocale from "date-fns/locale/es";

import { CalendarView } from "types/index";

interface DateLabelProps {
	date: Date;
	view: CalendarView;
	expand?: boolean;
}

const DateLabel: FC<DateLabelProps> = ({ view, date, expand }) => {
	const calendarLabelFormat = view === "daily" ? "EEEE d MMMM" : "MMMM y";
	const calendarLabel = format(date, calendarLabelFormat, { locale: EsLocale });
	return (
		<h1
			className={`${
				expand && "flex-1"
			} w-full first-letter:uppercase md:w-72 text-2xl md:text-4xl font-medium`}
		>
			{calendarLabel}
		</h1>
	);
};

export default DateLabel;
