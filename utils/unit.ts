import numericQuantity from "numeric-quantity";
/** Adds an "s" in the unit if the amount demands it. 1/4 will return the same unit string while 2 will return the unit plurilized */

export function getUnit(unit: string, amount: string): string {
    let numericAmout = numericQuantity(amount);
    let lastUnitLetter = unit[unit.length - 1];

    if (numericAmout <= 1 && lastUnitLetter === 's') {
        unit = unit.substring(0, unit.length - 1);
    }
    if (numericAmout > 1 && lastUnitLetter !== 's') {
        unit += 's';
    }
    return unit;
}
