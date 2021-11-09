import React, { ReactNode, FC, Children } from "react";

import { AiOutlineBook } from "react-icons/ai";

interface NavbarProps {
	/** Element at the start of the navbar */
	start?: ReactNode;
	/** Element at the end of the navbar */
	end?: ReactNode;
	/** An array of links  */
	links?: ReactNode[] | false | null;
}

const Navbar: FC<NavbarProps> = ({ start, end, links }) => {
	const linksCount = Children.count(links);
	return (
		<header className="flex items-center py-5 px-11 md:px-32 space-x-5">
			<div className={`${start ? "" : "flex-1"}`}>
				<AiOutlineBook className="w-10 h-10" />
			</div>
			{start && <div className="mx-4 flex-1">{start}</div>}

			{linksCount > 0 && (
				<nav className="flex items-center justify-end ml-5">
					<ul className="flex space-x-4">
						{Children.map(links, (link, idx) => (
							<NavbarLink key={idx}>{link}</NavbarLink>
						))}
					</ul>
				</nav>
			)}

			<div className="space-x-4">{end}</div>
		</header>
	);
};

const NavbarLink: FC = ({ children }) => {
	return (
		<li className="font-medium hover:text-black/80 btn outlined">{children}</li>
	);
};

export default Navbar;
