import * as database from "firebase/database";
import * as storage from "firebase/storage";
import { getDownloadURL, UploadTaskSnapshot as FirebaseUploadTaskSnapshot } from "firebase/storage";
import { cleanPushKey } from "./paths";
import { isoSoilUpdate } from "./data";

const getRef = (path: string, allowRootQuery: boolean = false) => {
  if (!path || (!allowRootQuery && path === "/")) throw new Error("We don't like root queries");

  return database.ref(database.getDatabase(), path);
};

const logAndThrow =
  (
    method:
      | "get"
      | "onValue"
      | "onValueWithLimit"
      | "onChildAdded"
      | "onChildChanged"
      | "onChildRemoved"
      | "onChildEqualTo"
      | "getWithLimit"
      | "push"
      | "update"
      | "set"
      | "remove"
      | "runTransaction",
    path: string,
    value?: { data: unknown }
  ) =>
  (e: unknown) => {
    if (!path.startsWith("admins/")) {
      let baseMessage = `Firebase error.\nMethod: \`${method}\`\nPath: ${path}`;
      if (value) {
        const stringified = JSON.stringify(value.data, null, 2);
        baseMessage = `${baseMessage}\nData length: ${stringified.length.toLocaleString()}\nValue: ${stringified.slice(
          0,
          100
        )}`;
      }
      console.error(baseMessage); // eslint-disable-line no-console
    }

    throw e;
  };

export const get = <T>(path: string) =>
  database
    .get(getRef(path))
    .then((snap) => snap.val() as T)
    .catch(logAndThrow("get", path));

// TODO: Maybe make the val typesafe, but it isn't possible if the path is double nested (e.g. thing/thang)
export type GetChildrenEqualTo = { path: string; val: string | number | boolean | null };

export const getChildrenEqualTo = <T, V extends GetChildrenEqualTo["val"]>(
  path: string,
  childPath: string,
  equalToValue: V
) =>
  database
    .get(database.query(getRef(path), database.orderByChild(childPath), database.equalTo(equalToValue)))
    .then((snap) => snap.val() as Nullable<T>)
    .catch(logAndThrow("onChildEqualTo", path));

export const getWithLimit = <T>(path: string, amount: number, version: "first" | "last") =>
  database
    .get(
      database.query(getRef(path), version === "first" ? database.limitToFirst(amount) : database.limitToLast(amount))
    )
    .then((snap) => snap.val() as Nullable<T>)
    .catch(logAndThrow("getWithLimit", path));

export const onChildAdded = <T, K extends string>(
  path: string,
  cb: (val: T, key: K) => void,
  limit?: { amount: number; direction: Extract<database.QueryConstraintType, "limitToFirst" | "limitToLast"> }
) =>
  database.onChildAdded(
    limit ? database.query(getRef(path), database[limit.direction](limit.amount)) : getRef(path),
    (snap) => cb(snap.val(), snap.key! as K),
    logAndThrow("onChildAdded", path, limit ? { data: { limit } } : undefined)
  );

export const onChildChanged = <T, K extends string>(path: string, cb: (val: T, key: K) => void) =>
  database.onChildChanged(getRef(path), (snap) => cb(snap.val(), snap.key! as K), logAndThrow("onChildChanged", path));

export const onChildRemoved = <K extends string>(path: string, cb: (key: K) => void) =>
  database.onChildRemoved(getRef(path), (snap) => cb(snap.key! as K), logAndThrow("onChildRemoved", path));

export const push = <T>(path: string, data: T) => {
  try {
    return database.push(getRef(path), data);
  } catch (e) {
    logAndThrow("push", path, { data });
    return { key: null };
  }
};

export const pushKey = (path: string) => cleanPushKey(database.push(getRef(path)).key!);

export const set = <T>(path: string, data: T) =>
  database.set(getRef(path), data).catch(logAndThrow("set", path, { data }));

export const soilUpdate = async (
  path: string,
  data: object,
  allowRootQuery: boolean = false,
  isDelete: boolean = false
) => isoSoilUpdate({ update, set }, path, data, allowRootQuery, isDelete);

export const update = async <T extends object>(path: string, data: T, allowRootQuery: boolean = false) => {
  if (path === "/" && allowRootQuery) {
    await Promise.all(Object.entries(data).map(([key, val]) => set(key, val)));
  } else {
    await database.update(getRef(path, allowRootQuery), data).catch(logAndThrow("update", path, { data }));
  }
};

export const onValue = <T>(path: string, cb: (val: T) => void) =>
  database.onValue(getRef(path), (snap) => cb(snap.val()), logAndThrow("onValue", path));

export const onValueWithLimit = <T>(path: string, amount: number, version: "first" | "last", cb: (val: T) => void) =>
  database.onValue(
    database.query(getRef(path), version === "first" ? database.limitToFirst(amount) : database.limitToLast(amount)),
    (snap) => cb(snap.val()),
    logAndThrow("onValueWithLimit", path)
  );

export const remove = (path: string) => database.remove(getRef(path)).catch(logAndThrow("remove", path));

export const onDisconnect = <T>(path: string, data: T) => database.onDisconnect(getRef(path)).set(data);

export const transactionWithCb = <T>(path: string, cb: (val: Nullable<T>) => T) =>
  database.runTransaction(getRef(path), cb).catch(logAndThrow("runTransaction", path));

/*
███████╗████████╗ ██████╗ ██████╗  █████╗  ██████╗ ███████╗
██╔════╝╚══██╔══╝██╔═══██╗██╔══██╗██╔══██╗██╔════╝ ██╔════╝
███████╗   ██║   ██║   ██║██████╔╝███████║██║  ███╗█████╗
╚════██║   ██║   ██║   ██║██╔══██╗██╔══██║██║   ██║██╔══╝
███████║   ██║   ╚██████╔╝██║  ██║██║  ██║╚██████╔╝███████╗
╚══════╝   ╚═╝    ╚═════╝ ╚═╝  ╚═╝╚═╝  ╚═╝ ╚═════╝ ╚══════╝
*/
/** DO NOT USE outside of strongly typed services */
export const firebaseStorageRef = (path: string) => storage.ref(storage.getStorage(), path);

export const firebaseStoragePut = (path: string, file: Blob | Uint8Array | ArrayBuffer) =>
  storage.uploadBytes(firebaseStorageRef(path), file).then(({ ref }) => getDownloadURL(ref));

export type UploadTaskSnapshot = FirebaseUploadTaskSnapshot;
export const firebaseStoragePutResumable = (path: string, file: Blob | Uint8Array | ArrayBuffer) =>
  storage.uploadBytesResumable(firebaseStorageRef(path), file);

export const firebaseStorageDelete = (path: string) => storage.deleteObject(firebaseStorageRef(path));
