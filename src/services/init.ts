import { initializeApp, FirebaseOptions, getApp, FirebaseApp } from "firebase/app";
import {
  User as FirebaseUser,
  initializeAuth,
  indexedDBLocalPersistence,
  getAuth,
  Auth,
  connectAuthEmulator,
  Persistence,
} from "firebase/auth";
import { signInAnon } from "./auth";
import { connectDatabaseEmulator, getDatabase } from "firebase/database";
import { connectStorageEmulator, getStorage } from "firebase/storage";
import { EmulatorOptions } from "./types";

/*
██╗███╗   ██╗██╗████████╗██╗ █████╗ ██╗     ██╗███████╗███████╗
██║████╗  ██║██║╚══██╔══╝██║██╔══██╗██║     ██║╚══███╔╝██╔════╝
██║██╔██╗ ██║██║   ██║   ██║███████║██║     ██║  ███╔╝ █████╗
██║██║╚██╗██║██║   ██║   ██║██╔══██║██║     ██║ ███╔╝  ██╔══╝
██║██║ ╚████║██║   ██║   ██║██║  ██║███████╗██║███████╗███████╗
╚═╝╚═╝  ╚═══╝╚═╝   ╚═╝   ╚═╝╚═╝  ╚═╝╚══════╝╚═╝╚══════╝╚══════╝
*/

type TProps = {
  anonymousSignIn?: boolean;
  emulatorOptions?: EmulatorOptions;
} & (
  | {
      isNativePlatform?: true;
      webPersistance?: undefined;
    }
  | {
      isNativePlatform?: undefined;
      webPersistance?: Persistence;
    }
);

export const initializeFirebase = (
  firebaseOptions: FirebaseOptions,
  cb: (userData: Nullable<FirebaseUser>) => void,
  { anonymousSignIn, emulatorOptions, ...props }: TProps = {}
) => {
  let app: FirebaseApp;
  try {
    app = getApp();
  } catch (e) {
    app = initializeApp(firebaseOptions);
  }

  if (emulatorOptions?.database) {
    const { host, port } = emulatorOptions.database;

    connectDatabaseEmulator(getDatabase(), host, port);
  }

  if (emulatorOptions?.storage) {
    const { host, port } = emulatorOptions.storage;

    connectStorageEmulator(getStorage(), host, port);
  }

  let auth: Auth;
  if (props.isNativePlatform) {
    try {
      auth = initializeAuth(app, { persistence: indexedDBLocalPersistence });
    } catch (e) {
      auth = getAuth();
    }
  } else {
    auth = getAuth();
  }

  if (emulatorOptions?.auth) {
    connectAuthEmulator(auth, emulatorOptions.auth.url);
  }

  auth.useDeviceLanguage();
  if (props.webPersistance) auth.setPersistence(props.webPersistance);

  if (anonymousSignIn) signInAnon();

  return auth.onIdTokenChanged(cb);
};
