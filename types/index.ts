export interface Ingredient {
	id: string;
	name: string;
	amount: string;
	unit: string;
}

export interface Receipe {
	name: string;
	ingredients: Ingredient[];
}

export interface SavedReceipe extends Receipe {
	id: string;
}
