import { getStorage, ref, listAll, deleteObject } from "firebase/storage";
import type { FirebaseApp } from "firebase/app";

export const clearStorage = async (app?: FirebaseApp, path?: string) => {
  const storage = getStorage(app);

  const listResult = await listAll(ref(storage, path));

  await Promise.all(listResult.items.map(deleteObject));
};
