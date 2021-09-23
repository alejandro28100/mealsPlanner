import React, { FC } from "react";
import DatePicker, {
  ReactDatePickerProps,
  registerLocale,
} from "react-datepicker";
import es from "date-fns/locale/es";

// import "react-datepicker/dist/react-datepicker.css";

registerLocale("es", es);
interface DatePickerProps extends ReactDatePickerProps<{}> {
  selected: Date;
  onChange: (date: Date) => void;
  onSelect?: (date: Date) => void;
}

const DatePickerFC: FC<DatePickerProps> = ({
  onChange,
  selected,
  onSelect,
}) => {
  return (
    <DatePicker
      onSelect={onSelect}
      locale="es"
      inline
      showYearPicker={false}
      selected={selected}
      onChange={(date) => onChange(date as Date)}
    />
  );
};

export default DatePickerFC;
