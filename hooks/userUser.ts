import { useState, useEffect } from "react"
import { useRouter } from "next/router";

import { User } from "firebase/auth";

import { auth } from "utils/firebase";

interface useUserConfig {
    protectedPage?: boolean;
    /** Url where the user will be redirected is not authenticated*/
    authRedirect?: string;
    /** Url where the user will be redirected when user signs out */
    signOutRedirect?: string;
}

const useUser = (config?: useUserConfig) => {
    let { protectedPage = false,authRedirect = "/", signOutRedirect="/" } = config || {};
    
    const router = useRouter()
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState<User | null>(null);

    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged(async (firebaseUser) => {
            if (!firebaseUser && protectedPage)  {
                router.push(authRedirect);
            }
            
            setUser(firebaseUser);
            setLoading(false);
        })
        return unsubscribe;
    }, [])

    async function logOut() {
        try {
            await auth.signOut();
            router.push(signOutRedirect);
        } catch (error) {
            console.error(error);
        }
    };

    return { user, loading, logOut }
}

export { useUser };