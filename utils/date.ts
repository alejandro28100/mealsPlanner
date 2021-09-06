export { }
declare global { // to access the global type Date
	interface Date {
		/**
		 *  Return a new date adding or substracting the days given.
		 */
		calculateNewDay(days: number): Date;
		/**
		 * 	Return a readable string with the current date value.
		 */
		toSpanishDate(): string
		/**
		 * Return a date at the 00:00 hours
		 */
		getZeroHours(): Date;
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

Date.prototype.toSpanishDate = function ():string {
	return this.toLocaleString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
}

Date.prototype.getZeroHours = function ():Date {
	return new Date(this.toDateString());
}