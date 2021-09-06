import React, { FC } from 'react';

export interface ShoppingItem {
	name: string;
	unit: string;
	amount: number;
}

const ShoppingItem: FC<ShoppingItem> = (props) => {
	return (
		<div>
			{props.name} | {props.amount} {props.unit}
		</div>
	);
};

export default ShoppingItem;
