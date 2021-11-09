import React, { useState, Fragment, useEffect } from "react";
import Head from "next/head";
import Link from "next/link";

import { MonthlyBody, MonthlyCalendar } from "@zach.codes/react-calendar";

import EsLocale from "date-fns/locale/es";

import Navbar from "components/Navbar";
import DailyView from "components/Menu/DailyView";
import DateLabel from "components/DateLabel";
import CalendarNavbar from "components/CalendarNavbar";
import ViewPicker from "components/ViewPicker";
import CustomDay from "components/CustomDay";
import UserProfileMenu from "components/UserProfileMenu";

import { useUser } from "hooks/userUser";
import { User } from "@firebase/auth";

import { startOfMonth } from "date-fns";

import { CalendarView } from "types/index";

import "utils/date";

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

	const [currentMonth, setCurrentMonth] = useState<Date>(
		startOfMonth(new Date())
	);

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
				<title>Mi menú 🍽</title>
			</Head>
			<Navbar
				links={[
					<Link key="link" href="/recetas">
						<a className="btn outlined">Ver mis recetas 📕</a>
					</Link>,
				]}
				end={!loading && user && <UserProfileMenu user={user} />}
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

export default Menu;
