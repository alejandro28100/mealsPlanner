import { useState, useEffect } from "react";
import { SavedReceipe } from "types/index";
import { getDocument } from "utils/firebase";

export default function useGetReceipe(receipeID: string) {
	const [loading, setLoading] = useState(true);
	const [receipe, setReceipe] = useState<SavedReceipe | undefined>(undefined);
	const [error, setError] = useState<string | undefined>(undefined);

	useEffect(() => {
		(async function () {
			setLoading(true);
			try {
				const snapshot = await getDocument(`receipes/${receipeID}`);
				const data = snapshot.data() as SavedReceipe;
				data.id = snapshot.id;
				setReceipe(data);
				setError(undefined);
				setLoading(false);
			} catch (error) {
				setReceipe(undefined);
				setLoading(false);
				setError(
					"No se pudo obtener la receta. Verifique su conexión a internet."
				);
				console.error(error);
			}
		})();
	}, [receipeID]);

	return { receipe, isLoading: loading, error };
}
