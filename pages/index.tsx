import {
	GoogleAuthProvider,
	signInWithPopup,
	signInWithRedirect,
} from "@firebase/auth";
import { NextPage } from "next";
import Head from "next/head";
import Link from "next/link";
import Navbar from "components/Navbar";

import { FcGoogle } from "react-icons/fc";
import { BiBookContent } from "react-icons/bi";
import { BsCalendar } from "react-icons/bs";

import { useUser } from "hooks/userUser";
import { auth } from "utils/firebase";
import UserProfileMenu from "components/UserProfileMenu";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";

const Home: NextPage = () => {
	const [isLoading, setIsLoading] = useState(false);
	const router = useRouter();
	const { user, loading: isUserLoading } = useUser({
		protectedPage: true,
	});

	const provider = new GoogleAuthProvider();
	useEffect(() => {
		if (window.location.hash === "#redirecting") {
			setIsLoading(true);
			window.location.hash = "";
			router.push("/recetas");
		}
	}, []);
	async function handleSignUp() {
		try {
			window.location.hash = "redirecting";
			await signInWithRedirect(auth, provider);
		} catch (error) {
			alert(
				"No se pudo iniciar sesión. Verifica tu conexión a internet e inténtalo más tarde."
			);
		}
	}

	return (
		<div>
			<Head>
				<title>Meals Planner App</title>
				<meta name="description" content="Food Planner App" />
				<link rel="icon" href="/favicon.ico" />
			</Head>

			<Navbar
				end={
					user ? (
						<UserProfileMenu user={user} />
					) : (
						!isLoading && (
							<button
								onClick={handleSignUp}
								className="btn flex items-center justify-center"
							>
								Iniciar sesión con Google <FcGoogle className="mx-2" />
							</button>
						)
					)
				}
			/>
			{isLoading && (
				<hr className="h-2 bg-black animate-pulse-fast duration-200 " />
			)}
			<main className="h-screen flex flex-col px-11 md:px-32">
				<section className="flex-1 lg:my-10 space-y-10 md:space-y-0 flex flex-col lg:flex-row items-center justify-center">
					<div className="flex flex-col justify-center space-y-7 h-full md:mr-5">
						<h1 className="text-4xl md:text-7xl font-black">
							Tu recetario <br /> digital de confianza
						</h1>
						<p className="text-xl md:text-3xl text-secondary">
							Mantén un registro de tus recetas favoritas y crea menús semanales
							, mensuales personalizados.
						</p>
						{!isUserLoading && user ? (
							<div className="flex items-center md:items-start md:flex-row space-x-4">
								<Link href="/recetas">
									<a className="btn flex items-center md:text-lg px-6 py-2">
										Ver mis recetas
										<span className="ml-2 h-6">
											<BiBookContent className="w-full h-full" />
										</span>
									</a>
								</Link>
								<Link href="/menu">
									<a className="btn flex items-center md:text-lg px-6 py-2 ">
										Ver mi menu
										<span className="ml-2 h-6">
											<BsCalendar className="w-full h-full" />
										</span>
									</a>
								</Link>
							</div>
						) : (
							!isLoading && (
								<button
									onClick={handleSignUp}
									className="btn self-start text-lg px-6 py-2"
								>
									¡Pruébalo Hoy!
								</button>
							)
						)}
					</div>
					<img className="h-96 object-scale-down" src="/imgs/food.png" alt="" />
				</section>

				<section className="text-center my-4">
					<h1 className="my-10 text-3xl md:text-5xl font-black">
						Conoce la app{" "}
					</h1>
					<div className="my-5 space-y-5">
						<h2 className="my-2 text-xl md:text-3xl font-black">
							Añade tus recetas favoritas
						</h2>
						<div className="flex flex-col lg:flex-row lg:justify-evenly">
							<img
								className="h-[700px] object-scale-down"
								src="/imgs/mobile1.png"
								alt=""
							/>
							<img
								className="h-[700px] object-scale-down"
								src="/imgs/mobile2.png"
								alt=""
							/>
						</div>
					</div>

					<div className="my-20 space-y-5">
						<h2 className="my-2 text-xl md:text-3xl font-black">
							Añade tus recetas a tu menú
						</h2>
						<div className="flex flex-col lg:flex-row lg:justify-evenly">
							<img
								className="h-[700px] object-scale-down"
								src="/imgs/mobile4.png"
								alt=""
							/>
							<img
								className="h-[700px] object-scale-down"
								src="/imgs/mobile3.png"
								alt=""
							/>
						</div>
					</div>

					<div className="my-20 space-y-5">
						<h2 className="my-2 text-xl md:text-3xl font-black">
							Consulta tus recetas desde tu menú
						</h2>
						<div className="flex justify-center">
							<img
								className="h-[700px] object-scale-down"
								src="/imgs/mobile5.png"
								alt=""
							/>
						</div>
					</div>
				</section>
			</main>
		</div>
	);
};

export default Home;
