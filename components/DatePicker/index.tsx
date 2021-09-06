import React, { FC } from 'react';
import DatePicker, { ReactDatePickerProps } from 'react-datepicker';

import 'react-datepicker/dist/react-datepicker.css';

interface DatePickerProps extends ReactDatePickerProps<{}> {
	selected: Date;
	onChange: (date: Date) => void;
	onSelect?: (date: Date) => void;
}

const DatePickerFC: FC<DatePickerProps> = ({ onChange, selected, onSelect }) => {
	return (
		<DatePicker
			onSelect={onSelect}
			inline
			showYearPicker={false}
			selected={selected}
			onChange={(date) => onChange(date as Date)}
		/>
	);
};

export default DatePickerFC;
