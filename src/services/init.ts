import { initializeApp, getApps, FirebaseOptions } from "firebase/app";
import { User as FirebaseUser, initializeAuth, indexedDBLocalPersistence } from "firebase/auth";
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
  let apps = getApps();

  if (apps.length === 0) {
    apps = [initializeApp(firebaseOptions)];
    firebaseUseDeviceLanguage();

    if (anonymousSignIn) signInAnon();
  }

  return initializeAuth(
    apps[0],
    isNativePlatform
      ? { persistence: indexedDBLocalPersistence } //
      : {}
  ).onAuthStateChanged(cb);
};
