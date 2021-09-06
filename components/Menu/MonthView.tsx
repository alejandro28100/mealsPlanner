import React, { FC } from 'react';
import DatePicker from 'components/DatePicker';

const MonthView: FC<{ date: Date; setDate: (date: Date) => void; onSelect: () => void }> = ({
	date,
	setDate,
	onSelect
}) => {
	return (
		<div>
			<h1>Month View</h1>
			<DatePicker onSelect={onSelect} open={true} onChange={(date) => setDate(date)} selected={date} />
		</div>
	);
};

export default MonthView;
