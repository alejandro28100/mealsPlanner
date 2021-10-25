import React, { Fragment, useEffect, useState } from "react";
import { NextPage } from "next";
import Head from "next/head";
import Link from "next/link";
import { SavedReceipe, Receipe } from "types/index";
import ReceipeCard from "components/Receipe/ReceipeCard";
import { addDocument, getDocuments } from "utils/firebase";

import { withRouter } from "next/router";
import { WithRouterProps } from "next/dist/client/with-router";
import { useUser } from "hooks/userUser";
import { orderBy, serverTimestamp, where } from "@firebase/firestore";
import Navbar from "components/Navbar";

const ReceipesPage: NextPage<WithRouterProps> = ({ router }) => {
	const { user, loading } = useUser({
		protectedPage: true,
	});

	const [loadingReceipes, setLoadingReceipes] = useState(true);
	const [receipes, setReceipes] = useState<SavedReceipe[]>([]);

	useEffect(() => {
		if (!loading) {
			getReceipes();
		}

		async function getReceipes() {
			const snapshot = await getDocuments(
				`/receipes`,
				where("author.uid", "==", user?.uid),
				orderBy("createdAt", "desc")
			);

			const docs = snapshot.docs.map(
				(doc) =>
					({
						id: doc.id,
						...doc.data(),
					} as SavedReceipe)
			);

			setReceipes(docs);
			setLoadingReceipes(false);
		}
	}, [loading, user]);

	async function createReceipe() {
		const newReceipe: Receipe = {
			name: "Sin título",
			ingredients: [],
			author: {
				displayName: user?.displayName as string,
				photoURL: user?.photoURL as string,
				uid: user?.uid as string,
			},
			createdAt: serverTimestamp(),
		};
		const snapshot = await addDocument("receipes", newReceipe);
		const documentID = snapshot.id;
		router.push(`/recetas/${documentID}`);
	}
	function renderReceipes() {
		if (loadingReceipes) {
			return <p className="text-center">Cargando Recetas... </p>;
		}
		if (receipes?.length > 0) {
			return receipes.map((receipe) => (
				<ReceipeCard key={receipe.id} {...{ ...receipe, setReceipes }} />
			));
		}

		return <p className="text-center">No tienes ninguna receta 😣</p>;
	}
	return (
		<div>
			<Head>
				<title>Recetas</title>
			</Head>
			<Navbar
				start={<h1 className="text-lg font-semibold">Mis recetas</h1>}
				links={[
					<Link key="link" href="/menu">
						<a className="btn outlined">Ver menú 📅</a>
					</Link>,
				]}
			/>
			<main className="px-11 md:px-32 relative h-[85vh] overflow-y-auto">
				<section className="my-4">
					<div className="space-y-8">{renderReceipes()}</div>
					<div className="absolute bottom-0 right-0 mx-11">
						<button className="btn" onClick={createReceipe}>
							Añadir nueva receta 🍽
						</button>
					</div>
				</section>
			</main>
			{/* <pre>{JSON.stringify(receipes, null, 2)}</pre> */}
		</div>
	);
};

export default withRouter(ReceipesPage);
