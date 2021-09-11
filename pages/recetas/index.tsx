import React, { useEffect, useState } from 'react';
import { NextPage } from 'next';
import Head from 'next/head';
import { SavedReceipe, Receipe } from 'types/index';
import ReceipeCard from 'components/Receipe/ReceipeCard';
import { addDocument, getDocuments } from 'utils/firebase';

import { withRouter } from 'next/router';
import { WithRouterProps } from 'next/dist/client/with-router';
import { useUser } from 'hooks/userUser';
import { where } from '@firebase/firestore';

const ReceipesPage: NextPage<WithRouterProps> = ({ router }) => {
	const { user, loading } = useUser({
		protectedPage: true
	});

	const [ loadingReceipes, setLoadingReceipes ] = useState(true);
	const [ receipes, setReceipes ] = useState<SavedReceipe[]>([]);

	useEffect(
		() => {
			if (!loading) {
				getReceipes();
			}

			async function getReceipes() {
				const snapshot = await getDocuments(`/receipes`, where("author.uid", "==", user?.uid));

				const docs = snapshot.docs.map(
					(doc) =>
						({
							id: doc.id,
							...doc.data()
						} as SavedReceipe)
				);

				setReceipes(docs);
				setLoadingReceipes(false);
			}
		},
		[ loading, user ]
	);

	async function createReceipe() {
		const newReceipe: Receipe = {
			name: 'Sin título',
			ingredients: [],
			author: {
				displayName: user?.displayName as string,
				photoURL: user?.photoURL as string,
				uid: user?.uid as string
			}
		};
		const snapshot = await addDocument('receipes', newReceipe);
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
			<div>
				{!loadingReceipes && receipes?.length > 0 ? (
					receipes.map((receipe) => <ReceipeCard key={receipe.id} {...{ ...receipe, setReceipes }} />)
				) : (
					'Parece que no tienes recetas'
				)}
			</div>
			{/* <pre>{JSON.stringify(receipes, null, 2)}</pre> */}
		</div>
	);
};

export default withRouter(ReceipesPage);
