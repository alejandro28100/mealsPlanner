export interface Ingredient {
	id: string;
	name: string;
	amount: string;
	unit: string;
}

export interface Receipe {
	name: string;
	ingredients: Ingredient[];
	author: Author;
	createdAt: any;
}

export interface Author {
	displayName: string;
	photoURL: string;
	uid: string;
}

export interface SavedReceipe extends Receipe {
	id: string;
}

export type MealTime = "breakfast" | "lunch" | "dinner";
export interface Meal {
	picture?: string;
	id: string;
	name: string;
	time: MealTime;
}
