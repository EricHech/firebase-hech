import { initializeApp, getApps, FirebaseOptions } from "firebase/app";
import { getAuth, User as FirebaseUser } from "firebase/auth";
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
  anonymousSignIn: boolean
) => {
  if (getApps().length === 0) {
    initializeApp(firebaseOptions);
    firebaseUseDeviceLanguage();

    if (anonymousSignIn) {
      signInAnon();
    }
  }

  return getAuth().onAuthStateChanged(cb);
};
