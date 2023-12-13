import { initializeApp, FirebaseOptions, getApp, FirebaseApp } from "firebase/app";
import { User as FirebaseUser, initializeAuth, indexedDBLocalPersistence, getAuth, Auth } from "firebase/auth";
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
  let app: FirebaseApp;
  try {
    app = getApp();
  } catch (e) {
    app = initializeApp(firebaseOptions);
  }

  let auth: Auth;
  try {
    auth = initializeAuth(app, isNativePlatform ? { persistence: indexedDBLocalPersistence } : {});
  } catch (e) {
    auth = getAuth();
  }

  firebaseUseDeviceLanguage();

  if (anonymousSignIn) signInAnon();

  return auth.onAuthStateChanged(cb);
};
