import { initializeApp, FirebaseOptions, getApps, getApp, FirebaseApp } from "firebase/app";

import { getAuth } from "firebase/auth";
import {
	getFirestore,
	addDoc,
	collection,
	query,
	doc,
	setDoc,
	deleteDoc,
	getDoc,
	getDocs,
	updateDoc,
	DocumentReference,
	DocumentSnapshot,
	DocumentData,
	QueryConstraint,
	QuerySnapshot,
} from "firebase/firestore";

const firebaseConfig: FirebaseOptions = {
	apiKey: process.env.NEXT_PUBLIC_API_KEY,
	authDomain: process.env.NEXT_PUBLIC_AUTH_DOMAIN,
	projectId: process.env.NEXT_PUBLIC_PROYECT_ID,
	storageBucket: process.env.NEXT_PUBLIC_STORAGE_BUCKET,
	messagingSenderId: process.env.NEXT_PUBLIC_MESSAGING_SENDER_ID,
	appId: process.env.NEXT_PUBLIC_APP_ID,
};
export const firebaseApp: FirebaseApp = !getApps().length
	? initializeApp(firebaseConfig)
	: getApp();

export const db = getFirestore(firebaseApp);
export const auth = getAuth();
auth.useDeviceLanguage();

// Firestore functions

/**
 * Updates a firestore document with a given id, if the document does not exists , it is created.
 */
export const setDocument = async (
	path: string,
	data: { [x: string]: any },
	merge: boolean = true
): Promise<void> => {
	const documentReference = doc(db, path);
	return await setDoc(documentReference, data, { merge: merge });
};

/**
 * Add a firestore document with an random document id.
 */
export const addDocument = async (
	path: string,
	data: { [x: string]: any }
): Promise<DocumentReference> => {
	const collectionReference = collection(db, path);
	return await addDoc(collectionReference, data);
};

/** Update a firestore document refered by its path */

export const updateDocument = async (path: string, data: { [x: string]: any }): Promise<void> => {
	const documentReference = doc(db, path);
	return await updateDoc(documentReference, data);
};

/** Delete a firestore document refered by its path */

export const deleteDocument = async (path: string): Promise<void> => {
	const documentReference = doc(db, path);
	return await deleteDoc(documentReference);
};

/**
 * Read a firestore document referred by its path and return its data
 */
export const getDocument = async (path: string): Promise<DocumentSnapshot> => {
	const documentReference = doc(db, path);
	return await getDoc(documentReference);
};

export const getDocuments = async (
	collectionPath: string,
	...queryConstrains: QueryConstraint[]
): Promise<QuerySnapshot<DocumentData>> => {
	const q = query(collection(db, collectionPath), ...queryConstrains);
	return await getDocs(q);
};

// export const auth = getAuth(firebaseApp);
