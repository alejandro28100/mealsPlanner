export { }
declare global { // to access the global type Date
	interface Date {
		/**
		 *  Return a new date adding or substracting the days given.
		 */
		calculateNewDay(days: number): Date;
		/**
		 * 	Return a readable string with the current date value.
		 * 
		 * sábado, 11 de septiembre de 2021
		 */
		toSpanishDate(): string;
		/**
		 * Return a date at the 00:00 hours
		 */
		getZeroHours(): Date;
		/**
		 * Return a string with the day and number of day 
		 * 
		 * sábado 11
		 */
		getDayAndNumber(): string;
		/**
		 * Return a string with the month and year of the current date
		 * 
		 * septiembre 2021
		 */
		getMonthAndYear(): string;
	}
}

//extend the methods of Date


Date.prototype.calculateNewDay = function(days: number) {
	const toHours = days * 24;
	const toMinutes = toHours * 60;
	const toSeconds = toMinutes * 60;
	const toMiliseconds = toSeconds * 1000;
	return new Date(this.getTime() + toMiliseconds);
};

Date.prototype.toSpanishDate = function (): string {
	if (!this) return "";
	return this.toLocaleString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
}

Date.prototype.getDayAndNumber = function (): string{
	const [day, number] = this.toSpanishDate().replaceAll(",", "").split(" ");
	return `${day} ${number}`
}

Date.prototype.getMonthAndYear = function ():string {
	const [,,,month,,year] = this.toSpanishDate().split(" ");
	return `${month} ${year}`;
}

Date.prototype.getZeroHours = function ():Date {
	return new Date(this.toDateString());
}