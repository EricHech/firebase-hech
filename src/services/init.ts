import { initializeApp, FirebaseOptions, getApp, FirebaseApp } from "firebase/app";
import { User as FirebaseUser, initializeAuth, indexedDBLocalPersistence, getAuth, Auth } from "firebase/auth";
import { signInAnon } from "./auth";

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
  if (isNativePlatform) {
    try {
      auth = initializeAuth(app, { persistence: indexedDBLocalPersistence });
    } catch (e) {
      auth = getAuth();
    }
  } else {
    auth = getAuth();
  }

  auth.useDeviceLanguage();

  if (anonymousSignIn) signInAnon();

  return auth.onAuthStateChanged(cb);
};
