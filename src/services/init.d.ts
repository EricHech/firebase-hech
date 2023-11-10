import { FirebaseOptions } from "firebase/app";
import { User as FirebaseUser } from "firebase/auth";
export declare const initializeFirebase: (firebaseOptions: FirebaseOptions, cb: (userData: Nullable<FirebaseUser>) => void, anonymousSignIn: boolean) => import("@firebase/util").Unsubscribe;
