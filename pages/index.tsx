import { GoogleAuthProvider, signInWithPopup } from "@firebase/auth";
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

const Home: NextPage = () => {
	const { user, loading: isUserLoading } = useUser({
		protectedPage: true,
		authRedirect: "/",
	});

	const provider = new GoogleAuthProvider();

	async function handleSignUp() {
		try {
			const result = await signInWithPopup(auth, provider);
		} catch (error) {
			alert(
				"No se pudo iniciar sesión. Verifica tu conexión a internet e inténtalo más tarde."
			);
		}
	}

	return (
		<div>
			<Head>
				<title>Food Planner App</title>
				<meta name="description" content="Food Planner App" />
				<link rel="icon" href="/favicon.ico" />
			</Head>
			<Navbar
				end={
					user ? (
						<UserProfileMenu user={user} />
					) : (
						<button
							onClick={handleSignUp}
							className="btn flex items-center justify-center"
						>
							Iniciar sesión con Google <FcGoogle className="mx-2" />
						</button>
					)
				}
			/>
			<main className="h-screen flex flex-col px-11 md:px-32">
				<section className="flex-1 space-y-10 md:space-y-0 flex flex-col lg:flex-row items-center justify-center">
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
							<button
								onClick={handleSignUp}
								className="btn self-start text-lg px-6 py-2"
							>
								¡Pruébalo Hoy!
							</button>
						)}
					</div>
					<img
						className=""
						width="400px"
						height="400px"
						src="/imgs/food.png"
						alt=""
					/>
				</section>
				{/* 
				<section className="text-center">
					<h1 className="text-2xl md:text-5xl font-black">Conoce la app </h1>
				</section> */}
			</main>
		</div>
	);
};

export default Home;
