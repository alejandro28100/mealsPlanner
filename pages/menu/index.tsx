import React, { useState, Fragment, FC, useEffect, Dispatch, SetStateAction } from "react";
import Head from "next/head";
import { Listbox } from "@headlessui/react";

import {
	MonthlyBody,
	MonthlyCalendar,
	useMonthlyCalendar,
	useMonthlyBody,
} from "@zach.codes/react-calendar";

import EsLocale from "date-fns/locale/es";

import Navbar from "components/Navbar";
import DailyView from "components/Menu/DailyView";

import { useUser } from "hooks/userUser";
import { User } from "@firebase/auth";
import { isSameDay } from "date-fns";

import { IoIosToday } from "react-icons/io";
import { BiCalendar } from "react-icons/bi";
import { AiFillCaretDown } from "react-icons/ai";
import { IoMdArrowDropleft, IoMdArrowDropright } from "react-icons/io";

import { format, startOfMonth, subMonths, addMonths } from "date-fns";

import "utils/date";

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

type CalendarView = "daily" | "monthly";

const Menu = () => {
	const { user, loading } = useUser({
		protectedPage: true,
	});

	const { displayName, photoURL } = (user as User) ?? {
		displayName: "",
		photoURL: "",
	};

	const [view, setView] = useState<CalendarView>("daily");
	const [date, setDate] = useState(new Date());

	const [currentMonth, setCurrentMonth] = useState<Date>(startOfMonth(new Date()));

	useEffect(() => {
		setDate(new Date().getZeroHours());
		setCurrentMonth(startOfMonth(new Date().getZeroHours()));
	}, []);

	function handleSelectDay(date: Date) {
		setDate(date.getZeroHours());
		setView("daily");
	}

	return (
		<Fragment>
			<Head>
				<title>Mi menú</title>
			</Head>
			<Navbar
				end={
					!loading &&
					user && (
						<div className="w-12 h-w-12">
							<img className="w-full h-full rounded-full" src={photoURL!} alt={displayName!} />
						</div>
					)
				}
			/>
			<hr className="h-px text-secondary" />
			<main>
				{view === "daily" ? (
					<Fragment>
						<div className="flex items-center space-x-4 py-4 px-11 md:px-32">
							<DateLabel view={view} date={date} expand />
							<ViewPicker view={view} setView={setView} />
						</div>
						<hr className="w-full h-px bg-secondary" />
						<DailyView date={date} setDate={setDate} />
					</Fragment>
				) : (
					<MonthlyCalendar
						locale={EsLocale}
						currentMonth={currentMonth}
						onCurrentMonthChange={(date) => setCurrentMonth(date)}
					>
						<CalendarNavbar date={date} view={view} setView={setView} />
						<MonthlyBody events={[]}>
							<CustomDay onSelectDay={handleSelectDay} />
						</MonthlyBody>
					</MonthlyCalendar>
				)}
			</main>
		</Fragment>
	);
};

interface CalendarNavbarProps extends ViewPicker {
	date?: Date;
}

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

interface ViewPicker {
	view: CalendarView;
	setView: Dispatch<SetStateAction<CalendarView>>;
}

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
				<Listbox.Options className="absolute right-0 md:left-0 min-w-[200px] py-1 mt-1 overflow-auto bg-white shadow-md max-h-60">
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

const CustomDay: FC<{ onSelectDay: (date: Date) => void }> = ({ onSelectDay }) => {
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

export default Menu;
