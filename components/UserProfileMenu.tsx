import { FC, Fragment } from "react";

import { Popover } from "@headlessui/react";

import { User } from "firebase/auth";
import { useUser } from "hooks/userUser";

interface UserProfileMenuProps {
	user: User;
}

const UserProfileMenu: FC<UserProfileMenuProps> = ({ user }) => {
	const { logOut} = useUser();
	const { photoURL, displayName, email } = user;
	return (
		<Popover as={Fragment}>
			<Popover.Button className="">
				<UserProfilePicture displayName={displayName!} photoURL={photoURL!} />
			</Popover.Button>
			<Popover.Panel className="flex flex-col justify-center items-center absolute z-10 bg-white -translate-x-full shadow-md rounded border border-gray-200">
				<article className="flex flex-col justify-center items-center space-y-4 p-8">
					<UserProfilePicture
						displayName={displayName!}
						photoURL={photoURL!}
						size="large"
					/>
					<h2 className="font-semibold text-lg">{displayName}</h2>
					<p className="font-light text-gray-500">{email}</p>
				</article>

				<hr className="w-full" />
				
				<div className="w-full p-6 text-center">
					<button onClick={logOut} className="px-4 py-2 rounded border border-gray-500 hover:bg-black hover:text-white hover:border-black">
						Cerrar Sesión
					</button>
				</div>
			</Popover.Panel>
		</Popover>
	);
};

const UserProfilePicture: FC<{
	photoURL: string;
	displayName: string;
	size?: "large" | "small";
}> = ({ photoURL, displayName, size = "small" }) => (
	<img
		className={`${size === "small" ? "w-12 h-12" : "w-24 h-24"} rounded-full`}
		src={photoURL}
		alt={displayName}
	/>
);

export default UserProfileMenu;
