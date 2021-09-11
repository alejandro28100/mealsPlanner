import React, { ReactNode, FC, Children } from "react";

import { AiOutlineBook } from "react-icons/ai";

interface NavbarProps {
  /** Element at the end of the navbar */
  end?: ReactNode;
  /** List of links  */
  links?: ReactNode[] | false | null;
}

const Navbar: FC<NavbarProps> = ({ end, links }) => {
  const linksCount = Children.count(links);
  return (
    <header className="flex py-10 px-11 md:px-32">
      <div className="flex-1">
        <AiOutlineBook className="w-10 h-10" />
      </div>
      {linksCount > 0 && (
        <nav className="flex items-center justify-end mx-5">
          <ul className="flex space-x-4">
            {Children.map(links, (link, idx) => (
              <NavbarLink key={idx} children={link} />
            ))}
          </ul>
        </nav>
      )}

      <div className="space-x-4">{end}</div>
    </header>
  );
};

const NavbarLink: FC = ({ children }) => {
  return <li className="font-medium hover:text-black/80">{children}</li>;
};

export default Navbar;
