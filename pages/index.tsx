import { GoogleAuthProvider, signInWithPopup } from '@firebase/auth';
import { NextPage } from 'next';
import Head from 'next/head';
import Link from 'next/link';

import { useUser } from 'hooks/userUser';
import { auth } from 'utils/firebase';

const Home: NextPage = () => {
	const { user } = useUser({
		protectedPage: true,
		authRedirect: '/'
	});

	const provider: GoogleAuthProvider = new GoogleAuthProvider();

	async function handleClick() {
		try {
			const result = await signInWithPopup(auth, provider);
			console.log(result.user);
		} catch (error) {
			console.error(error);
		}
	}

	return (
		<div>
			<Head>
				<title>Food Planner App</title>
				<meta name="description" content="Food Planner App" />
				<link rel="icon" href="/favicon.ico" />
			</Head>

			<header>
				<h1>Food Planner App</h1>
			</header>
			<main className="bg-gray-700">
				<button onClick={handleClick}>Create Account</button>
				<Link href="/menu">
					<a>Recetas </a>
				</Link>
				<pre>{JSON.stringify(user, null, 2)}</pre>
			</main>
		</div>
	);
};

export default Home;
