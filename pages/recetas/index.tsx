import React, { useEffect, useState } from 'react';
import { NextPage } from 'next';
import Head from 'next/head';
import { SavedReceipe,Receipe } from "types/index";
import ReceipeCard from 'components/Receipe/ReceipeCard';
import { addDocument, getDocuments } from "utils/firebase";
import { DocumentData} from '@firebase/firestore';
import { withRouter } from 'next/router';
import { WithRouterProps } from 'next/dist/client/with-router';

const ReceipesPage: NextPage<WithRouterProps> = ({router,...props}) => {
	const [ receipes, setReceipes ] = useState<DocumentData | undefined>(undefined);

	useEffect(() => {
		async function getReceipes() {
			const snapshot = await getDocuments('receipes');
	
			const docs = snapshot.docs.map((doc) => ({
				id: doc.id,
				...doc.data()
			}));
	
			setReceipes(docs);
		}
		getReceipes();
	}, []);

	async function createReceipe() {
		const newReceipe: Receipe = {
			name: "Sin título",
			ingredients: []
		} 
		const snapshot = await addDocument("receipes", newReceipe);
		const documentID = snapshot.id;
		router.push(`/recetas/${documentID}`);
	}



	return (
		<div>
			<Head>
				<title>Recetas</title>
			</Head>
			<h1>Mis recetas</h1>
			<button onClick={createReceipe}>Añadir nueva receta</button>
			<div >
				{
					receipes?.map((receipe:SavedReceipe)  => (
						<ReceipeCard key={receipe.id}  {...{...receipe, setReceipes}}/>
					))
				}
			</div>
			{/* <pre>{JSON.stringify(receipes, null, 2)}</pre> */}
		</div>
	);
};

export default withRouter(ReceipesPage);
