import React, { Dispatch, FC, SetStateAction } from 'react';
import { SavedReceipe, Ingredient } from '../../types';
import { deleteDocument } from '../../utils/firebase';
import Link from 'next/link';
import { withRouter } from 'next/router';
import { WithRouterProps } from 'next/dist/client/with-router';

interface ReceipeCardProps extends SavedReceipe, WithRouterProps {
	setReceipes: Dispatch<SetStateAction<SavedReceipe[]>>;
}

const ReceipeCard: FC<ReceipeCardProps> = ({ name, id, ingredients, setReceipes, router }) => {
	async function deleteReceipe(id: string) {
		try {
			await deleteDocument(`receipes/${id}`);
			setReceipes((prevReceipes: SavedReceipe[]) => {
				return prevReceipes.filter((receipe) => receipe.id !== id);
			});
			console.log('Receipe deleted');
		} catch (error) {
			console.log(error);
		}
	}

	return (
		<div>
			<h2>{name}</h2>
			<h3>Ingredientes</h3>
			<table>
				<thead>
					<tr>
						<th>Nombre</th>
						<th>Cantidad</th>
					</tr>
				</thead>
				<tbody>
					{ingredients.map(({ name, unit, amount, id }: Ingredient) => (
						<tr key={id}>
							<td>{name}</td>
							<td>
								{amount} {unit}
							</td>
						</tr>
					))}
				</tbody>
			</table>
			<Link href={`/menu/anadir/${id}?name=${name}`}>
				<button>Añadir Receta Al Menú</button>
			</Link>
			<button onClick={() => deleteReceipe(id)}>Eliminar Receta</button>
			<Link href={`/recetas/${id}`}>
				<button>Editar Receta</button>
			</Link>
		</div>
	);
};

export default withRouter(ReceipeCard);
