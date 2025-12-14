import admin from "firebase-admin";
import { getDatabase } from "firebase-admin/database";
import { CreateRequest, getAuth, UpdateRequest } from "firebase-admin/auth";

// Helpers
import { isoFirebaseHechUpdate } from "./data";
import { getDataKeyValue } from "./server-data";

// Types
import type { ServiceAccount } from "firebase-admin/app";
import type { QueryByKeyLimitParams, QueryOrderByChildParams, StatefulData } from "./types";
import type { Query } from "@firebase/database-types";

const getRef = (path: string, allowRootQuery: boolean = false) => {
  if (!path || (!allowRootQuery && path === "/")) throw new Error("We don't like root queries");

  return getDatabase().ref(path);
};

export const createAuthUser = (createRequest: CreateRequest) => getAuth().createUser(createRequest);

export const get = <T>(path: string) =>
  getRef(path)
    .get()
    .then((snap) => snap.val() as Nullable<T>);

export const onChildAdded = <T>(
  path: string,
  cb: (val: Nullable<T>, key: string, previousOrderingKey?: Nullable<string>) => void,
  limit?: { amount: number; direction: keyof Pick<Query, "limitToFirst" | "limitToLast"> }
) => {
  const query = limit ? getRef(path)[limit.direction](limit.amount) : getRef(path);

  return query.on("child_added", (snap, previousOrderingKey) => cb(snap.val(), snap.key!, previousOrderingKey));
};

export const push = <T>(path: string, data: T) => getRef(path).push(data);

export const pushKey = (path: string) => getRef(path).push().key!;

export const set = <T>(path: string, data: T) => getRef(path).set(data);

export const update = async <T extends object>(path: string, data: T, allowRootQuery: boolean = false) => {
  if (path === "/" && allowRootQuery) {
    await Promise.all(
      Object.entries(data).map(([key, val]) =>
        getRef(key, allowRootQuery)[typeof val === "object" && val !== null ? "update" : "set"](val)
      )
    );
  } else {
    await getRef(path, allowRootQuery).update(data);
  }
};

/** This is for mimicking the front end if using `initializeAdminRemoteRequestApp` on the server */
export const firebaseHechUpdate = async (
  path: string,
  data: object,
  allowRootQuery: boolean = false,
  isDelete: boolean = false
) => isoFirebaseHechUpdate({ update, set }, path, data, allowRootQuery, isDelete);

export const onValue = <T>(path: string, cb: (val: Nullable<T>) => void) =>
  getRef(path).on("value", (snap) => cb(snap.val()));

export const queryOrderByChildEqualTo = <T>({ path, childKey, queryValue, limit = 1000 }: QueryOrderByChildParams) =>
  getRef(path)
    .orderByChild(String(childKey))
    .equalTo(queryValue)
    .limitToFirst(limit)
    .once("value")
    .then((snap) => snap.val() as Nullable<T>);

export const queryByKeyLimit = <T>({ path, limit }: QueryByKeyLimitParams) =>
  getRef(path)
    .orderByKey()
    .limitToFirst(limit)
    .once("value")
    .then((snap) => snap.val() as Nullable<T>);

export const initializeAdminApp = async (
  appOptions: ServiceAccount,
  databaseURL: string,
  {
    isDev,
    emulatorOptions,
    databaseAuthVariableOverride,
  }: {
    isDev?: boolean;
    emulatorOptions?: { host: string; authPort: string; dbPort?: string; firestorePort?: string; projectId: string };
    databaseAuthVariableOverride?: { uid: string };
  } = {
    isDev: false,
    emulatorOptions: undefined,
    databaseAuthVariableOverride: undefined,
  }
) => {
  const init = async () => {
    // To account for hot-module-reloading potentially having the wrong app initialized due to `initializeAdminRemoteRequestApp`
    if (isDev && admin.apps.length) await Promise.all(admin.apps.map((a) => a?.delete()));

    if (!admin.apps.length) {
      if (isDev && emulatorOptions) {
        process.env.GCLOUD_PROJECT = emulatorOptions.projectId;
        process.env.GOOGLE_CLOUD_PROJECT = emulatorOptions.projectId;

        process.env.FIREBASE_AUTH_EMULATOR_HOST = `${emulatorOptions.host}:${emulatorOptions.authPort}`;

        if (emulatorOptions.dbPort) process.env.FIREBASE_DATABASE_EMULATOR_HOST = `${emulatorOptions.host}:${emulatorOptions.dbPort}`;
        if (emulatorOptions.firestorePort) process.env.FIRESTORE_EMULATOR_HOST = `${emulatorOptions.host}:${emulatorOptions.firestorePort}`;

        // In development with emulators, use the application default credentials and explicitly set the `projectId` to match the one used by the client token
        admin.initializeApp({
          projectId: emulatorOptions.projectId,
          credential: appOptions ? admin.credential.cert(appOptions) : admin.credential.applicationDefault(),
          databaseURL: emulatorOptions.dbPort
            ? `http://${emulatorOptions.host}:${emulatorOptions.dbPort}?ns=${emulatorOptions.projectId}`
            : databaseURL,
          databaseAuthVariableOverride,
        });
      } else {
        admin.initializeApp({
          credential: admin.credential.cert(appOptions),
          databaseURL,
          databaseAuthVariableOverride,
        });
      }
    }
  };

  if (isDev) {
    try {
      await init();
    } catch (e) {
      if (emulatorOptions) console.error("Error initializing Firebase Admin app with emulators:", e);
    }
  } else {
    await init();
  }

  return admin.app();
};

export const initializeAuthMimickApp = (
  uid: string,
  appOptions: ServiceAccount,
  databaseURL: string,
  { isDev }: { isDev?: boolean } = { isDev: false }
) =>
  initializeAdminApp(appOptions, databaseURL, {
    isDev,
    databaseAuthVariableOverride: { uid },
  });

/** If fetching the `remoteRequest` is successful, the admin app will be re-initialized, otherwise it will remain with full permissions. */
export const initializeAdminRemoteRequestApp = async <T extends StatefulData<"remoteRequest">>(
  remoteRequestKey: string,
  appOptions: ServiceAccount,
  databaseURL: string,
  { isDev }: { isDev?: boolean } = { isDev: false }
) => {
  const app = await initializeAdminApp(appOptions, databaseURL, {
    isDev,
    databaseAuthVariableOverride: undefined,
  });

  const remoteRequest = await getDataKeyValue({ dataType: "remoteRequest", dataKey: remoteRequestKey });
  if (!remoteRequest?.remoteRequestUid) return null;

  await app.delete();

  return {
    app: initializeAuthMimickApp(remoteRequest.remoteRequestUid, appOptions, databaseURL, { isDev }),
    remoteRequest: remoteRequest as T,
  };
};

export const remove = (path: string) => getRef(path).remove();

export const transactionWithCb = <T>(path: string, cb: (val: Nullable<T>) => T) => getRef(path).transaction(cb);

export const updateAuthUser = (uid: string, updateRequest: UpdateRequest) => getAuth().updateUser(uid, updateRequest);

export const generatePasswordResetLink = (uid: string) => getAuth().generatePasswordResetLink(uid);
