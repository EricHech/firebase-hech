import { initializeApp, FirebaseOptions, getApp, FirebaseApp } from "firebase/app";
import {
  User as FirebaseUser,
  initializeAuth,
  indexedDBLocalPersistence,
  getAuth,
  Auth,
  connectAuthEmulator,
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
  isNativePlatform?: boolean;
  emulatorOptions?: EmulatorOptions;
};

export const initializeFirebase = (
  firebaseOptions: FirebaseOptions,
  cb: (userData: Nullable<FirebaseUser>) => void,
  { anonymousSignIn, isNativePlatform, emulatorOptions }: TProps = {}
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
  if (isNativePlatform) {
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

  if (anonymousSignIn) signInAnon();

  return auth.onIdTokenChanged(cb);
};
