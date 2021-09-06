import { NextPage } from 'next';
import Head from 'next/head';

const Home: NextPage = () => {
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
		</div>
	);
};

export default Home;
