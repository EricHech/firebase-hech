import { initializeApp, getApps, FirebaseOptions, getApp } from "firebase/app";
import { User as FirebaseUser, initializeAuth, indexedDBLocalPersistence, getAuth } from "firebase/auth";
import { signInAnon, firebaseUseDeviceLanguage } from "./auth";

/*
██╗███╗   ██╗██╗████████╗██╗ █████╗ ██╗     ██╗███████╗███████╗
██║████╗  ██║██║╚══██╔══╝██║██╔══██╗██║     ██║╚══███╔╝██╔════╝
██║██╔██╗ ██║██║   ██║   ██║███████║██║     ██║  ███╔╝ █████╗
██║██║╚██╗██║██║   ██║   ██║██╔══██║██║     ██║ ███╔╝  ██╔══╝
██║██║ ╚████║██║   ██║   ██║██║  ██║███████╗██║███████╗███████╗
╚═╝╚═╝  ╚═══╝╚═╝   ╚═╝   ╚═╝╚═╝  ╚═╝╚══════╝╚═╝╚══════╝╚══════╝
*/
export const initializeFirebase = (
  firebaseOptions: FirebaseOptions,
  cb: (userData: Nullable<FirebaseUser>) => void,
  { anonymousSignIn, isNativePlatform }: { anonymousSignIn?: boolean; isNativePlatform?: boolean } = {}
) => {
  try {
    return getAuth(getApp()).onAuthStateChanged(cb);
  } catch (e) {
    const app = initializeApp(firebaseOptions);

    firebaseUseDeviceLanguage();

    const auth = initializeAuth(
      app,
      isNativePlatform
        ? { persistence: indexedDBLocalPersistence } //
        : {}
    );

    if (anonymousSignIn) signInAnon();

    return auth.onAuthStateChanged(cb);
  }
};
