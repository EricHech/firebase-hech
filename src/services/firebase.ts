import * as database from "firebase/database";
import * as storage from "firebase/storage";
import { getDownloadURL, UploadTaskSnapshot as FirebaseUploadTaskSnapshot } from "firebase/storage";
import { cleanPushKey } from "./paths";
import { isoFirebaseHechUpdate } from "./data";
import { ListenerPaginationOptions } from "./types";

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
      | "getChildrenEqualTo"
      | "getOrderByChildWithLimit"
      | "getOrderByWithLimit"
      | "getOrderByExclusiveBetween"
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

export const getWithLimit = <T>(
  path: string,
  amount: number,
  direction: Extract<database.QueryConstraintType, "limitToFirst" | "limitToLast">
) =>
  database
    .get(database.query(getRef(path), database[direction](amount)))
    .then((snap) => snap.val() as Nullable<T>)
    .catch(logAndThrow("getWithLimit", path));

export type GetChildrenEqualTo = { path: string; val: string | number | boolean | null };

export const getChildrenEqualTo = <T, V extends GetChildrenEqualTo["val"]>(
  path: string,
  childPath: string,
  equalToValue: V
) =>
  database
    .get(database.query(getRef(path), database.orderByChild(childPath), database.equalTo(equalToValue)))
    .then((snap) => snap.val() as Nullable<T>)
    .catch(logAndThrow("getChildrenEqualTo", path));

export const getOrderByChildWithLimit = <T>(
  path: string,
  childPath: string,
  limit: { amount: number; direction: Extract<database.QueryConstraintType, "limitToFirst" | "limitToLast"> }
) =>
  database
    .get(database.query(getRef(path), database.orderByChild(childPath), database[limit.direction](limit.amount)))
    .then((snap) => snap.val() as Nullable<T>)
    .catch(logAndThrow("getOrderByChildWithLimit", path));

/**
 * This is intended for pagination:
 *
 * If the direction is `limitToLast`, it is starting at the high end of the list.
 * Therefore, it automatically sets the version to fetch everything leading up to the given key/value.
 *
 * If the direction is `limitToFirst`, it is starting at the low end of the list.
 * Therefore, it automatically sets the version to fetch everything after the given key/value.
 *
 * While `exclusive` would be fine when filtering by key because all keys are unique,
 * `inclusive` is necessary if filtering by value since some values can be identical.
 */
const getTerminationVersion = (
  direction: "low" | "limitToFirst" | "limitToLast" | "high",
  version: "exclusive" | "inclusive"
) => {
  if (direction === "limitToLast" || direction === "high") return version === "exclusive" ? "endBefore" : "endAt";
  return version === "exclusive" ? "startAfter" : "startAt";
};

const INVERT_TERMINATION_VERSION = {
  endBefore: "startAfter",
  endAt: "startAt",
  startAfter: "endBefore",
  startAt: "endAt",
} as const;

export const getOrderByWithLimit = <T>(
  path: string,
  orderBy: Extract<database.QueryConstraintType, "orderByValue" | "orderByKey">,
  { amount, direction, termination }: Mandate<ListenerPaginationOptions, "limit">["limit"]
) => {
  const contraints = [database[orderBy](), database[direction](amount)];

  if (termination !== undefined) {
    const version = getTerminationVersion(direction, termination.version);
    contraints.push(database[version](termination.key));
  }

  return database
    .get(database.query(getRef(path), ...contraints))
    .then((snap) => snap.val() as Nullable<T>)
    .catch(logAndThrow("getOrderByWithLimit", path));
};

export const getOrderByExclusiveBetween = <T>(
  path: string,
  orderBy: Extract<database.QueryConstraintType, "orderByValue" | "orderByKey">,
  start: string | number,
  end: string | number
) =>
  database
    .get(database.query(getRef(path), database[orderBy](), database.startAfter(start), database.endBefore(end)))
    .then((snap) => snap.val() as Nullable<T>)
    .catch(logAndThrow("getOrderByExclusiveBetween", path));

const getContraints = (paginate: Maybe<ListenerPaginationOptions>) => {
  const contraints: database.QueryConstraint[] = [];

  if (paginate) {
    const { orderBy } = paginate;

    if (orderBy) {
      let order: database.QueryConstraint;
      if (typeof orderBy === "string") order = database[orderBy]();
      else order = database.orderByChild(orderBy.path);
      contraints.push(order);
    }

    if (paginate.edge) {
      const { side, termination } = paginate.edge;
      // When listening to the edge, you want to grab the opposite side of the termination point compared to when paginating
      const version = getTerminationVersion(side, termination.version);
      const inverted = INVERT_TERMINATION_VERSION[version];
      contraints.push(database[inverted](termination.key));
    } else if (paginate.between) {
      const { start, end, version } = paginate.between;
      const startFunc = version === "exclusive" ? "startAfter" : "startAt";
      const endFunc = version === "exclusive" ? "endBefore" : "endAt";
      contraints.push(database[startFunc](start), database[endFunc](end));
    } else if (paginate.limit) {
      const { direction, amount, termination } = paginate.limit;
      contraints.push(database[direction](amount));

      if (termination !== undefined) {
        const version = getTerminationVersion(direction, termination.version);
        contraints.push(database[version](termination.key));
      }
    }
  }

  return contraints;
};

export const onChildAdded = <T, K extends string>(
  path: string,
  cb: (val: T, key: K, previousOrderingKey?: Nullable<string>) => void,
  /**
   * `edge` returns the high or low end of a list
   * `between` returns the values between two where `start` always represents the low end while `end` represents the high end
   * `limit` returns an exact amount either from the end of a list or from a termination point
   */
  paginate?: ListenerPaginationOptions
) => {
  const contraints = getContraints(paginate);

  return database.onChildAdded(
    contraints.length ? database.query(getRef(path), ...contraints) : getRef(path),
    (snap, previousOrderingKey) => cb(snap.val(), snap.key! as K, previousOrderingKey),
    logAndThrow("onChildAdded", path, paginate ? { data: { paginate } } : undefined)
  );
};

export const onChildChanged = <T, K extends string>(
  path: string,
  cb: (val: T, key: K, previousOrderingKey?: Nullable<string>) => void,
  /**
   * `edge` returns the high or low end of a list
   * `between` returns the values between two where `start` always represents the low end while `end` represents the high end
   * `limit` returns an exact amount either from the end of a list or from a termination point
   */
  paginate?: ListenerPaginationOptions
) => {
  const contraints = getContraints(paginate);

  return database.onChildChanged(
    contraints.length ? database.query(getRef(path), ...contraints) : getRef(path),
    (snap, previousOrderingKey) => cb(snap.val(), snap.key! as K, previousOrderingKey),
    logAndThrow("onChildChanged", path, paginate ? { data: { paginate } } : undefined)
  );
};

export const onChildRemoved = <K extends string>(
  path: string,
  cb: (key: K) => void,
  /**
   * `edge` returns the high or low end of a list
   * `between` returns the values between two where `start` always represents the low end while `end` represents the high end
   * `limit` returns an exact amount either from the end of a list or from a termination point
   */
  paginate?: ListenerPaginationOptions
) => {
  const contraints = getContraints(paginate);

  return database.onChildRemoved(
    contraints.length ? database.query(getRef(path), ...contraints) : getRef(path),
    (snap) => cb(snap.key! as K),
    logAndThrow("onChildRemoved", path, paginate ? { data: { paginate } } : undefined)
  );
};

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

export const firebaseHechUpdate = async (
  path: string,
  data: object,
  allowRootQuery: boolean = false,
  isDelete: boolean = false
) => isoFirebaseHechUpdate({ update, set }, path, data, allowRootQuery, isDelete);

export const update = async <T extends object>(path: string, data: T, allowRootQuery: boolean = false) => {
  if (path === "/" && allowRootQuery) {
    await Promise.all(
      Object.entries(data).map(([key, val]) =>
        database[typeof val === "object" && val !== null ? "update" : "set"](getRef(key, allowRootQuery), val)
      )
    );
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
