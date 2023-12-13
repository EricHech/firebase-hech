import { initializeApp, getApps, FirebaseOptions } from "firebase/app";
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
  let apps = getApps();

  if (apps.length === 0) {
    apps = [initializeApp(firebaseOptions)];
    firebaseUseDeviceLanguage();

    const auth = initializeAuth(
      apps[0],
      isNativePlatform
        ? { persistence: indexedDBLocalPersistence } //
        : {}
    );

    if (anonymousSignIn) signInAnon();

    return auth.onAuthStateChanged(cb);
  }

  return getAuth().onAuthStateChanged(cb);
};
