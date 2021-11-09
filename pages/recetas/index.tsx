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
import {
	orderBy,
	serverTimestamp,
	where,
	limit,
	startAfter,
} from "@firebase/firestore";
import Navbar from "components/Navbar";
import UserProfileMenu from "components/UserProfileMenu";

const PAGE_SIZE = 10;

const ReceipesPage: NextPage<WithRouterProps> = ({ router }) => {
	const { user, loading } = useUser({
		protectedPage: true,
	});

	const [loadingReceipes, setLoadingReceipes] = useState(true);
	const [receipes, setReceipes] = useState<SavedReceipe[]>([]);
	const [isLastReceipesPage, setIsLastReceipesPage] = useState(false);

	async function getNextReceipes() {
		setLoadingReceipes(true);
		// @ts-ignore
		const { createdAt } = receipes[receipes?.length - 1];

		const snapshot = await getDocuments(
			"receipes",
			where("author.uid", "==", user?.uid),
			orderBy("createdAt", "desc"),
			startAfter(createdAt),
			limit(PAGE_SIZE)
		);

		if (snapshot.empty) {
			// No more receipes
			setIsLastReceipesPage(true);
			setLoadingReceipes(false);
			return;
		}

		let commingReceipes: SavedReceipe[] = [];
		snapshot.forEach((doc) => {
			commingReceipes.push({
				...doc.data(),
				id: doc.id,
			} as SavedReceipe);
		});
		setReceipes((prev) => [...(prev as SavedReceipe[]), ...commingReceipes]);
		setLoadingReceipes(false);
	}

	useEffect(() => {
		if (!loading) {
			getReceipes();
		}

		async function getReceipes() {
			const snapshot = await getDocuments(
				`/receipes`,
				where("author.uid", "==", user?.uid),
				orderBy("createdAt", "desc"),
				limit(PAGE_SIZE)
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
			steps: "",
			picture: "",
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
						<a>Ver menú 📅</a>
					</Link>,
				]}
				end={!loading && user && <UserProfileMenu user={user} />}
			/>
			<main className="px-11 md:px-32 relative h-[85vh] overflow-y-auto">
				<section className="my-4">
					<div className="space-y-8">{renderReceipes()}</div>
					{!isLastReceipesPage && (
						<div className="text-center my-5">
							<button
								disabled={loadingReceipes}
								onClick={getNextReceipes}
								className="btn"
							>
								Cargar Más Recetas
							</button>
						</div>
					)}

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
