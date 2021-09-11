import React, { useState, useEffect } from 'react';
import DailyView from 'components/Menu/DailyView';
import MonthView from 'components/Menu/MonthView';
import { useUser } from 'hooks/userUser';

const Menu = () => {
	const { user, loading } = useUser({
		protectedPage: true
	});

	const [ view, setView ] = useState<'daily' | 'monthly'>('daily');
	const [ date, setDate ] = useState(new Date().getZeroHours());

	function toggleView() {
		setView((prev) => (prev === 'daily' ? 'monthly' : 'daily'));
	}

	return (
		<div style={{ minHeight: '100vh' }}>
			<h1>Menú</h1>
			<button style={{ textAlign: 'right' }} onClick={toggleView}>
				{view === 'daily' ? 'Cambiar a vista mensual' : 'Cambiar a vista diaria'}
			</button>
			{view === 'daily' ? (
				<DailyView date={date} setDate={setDate} />
			) : (
				<MonthView date={date} setDate={setDate} onSelect={() => toggleView()} />
			)}
		</div>
	);
};

export default Menu;
