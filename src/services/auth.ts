import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  signOut,
  updateEmail,
  updatePassword,
  signInAnonymously,
  linkWithCredential,
  EmailAuthProvider,
  OAuthProvider,
  signInWithPopup,
} from "firebase/auth";
import { createUser, getUsername, updateUser } from "./client-data";
import { AppUser, User } from "./types";

const getFriendlyAuthError = (errorMessage: string) => {
  if (errorMessage.includes("auth/user-not-found")) return "No user found that matches that email.";
  if (errorMessage.includes("auth/wrong-password")) return "Incorrect password. Please try again.";
  if (errorMessage.includes("weak-password")) return "Password should be at least 6 characters.";

  return errorMessage;
};

/*
 █████╗ ██╗   ██╗████████╗██╗  ██╗
██╔══██╗██║   ██║╚══██╔══╝██║  ██║
███████║██║   ██║   ██║   ███████║
██╔══██║██║   ██║   ██║   ██╔══██║
██║  ██║╚██████╔╝   ██║   ██║  ██║
╚═╝  ╚═╝ ╚═════╝    ╚═╝   ╚═╝  ╚═╝
*/
export const getCurrentUser = () => getAuth().currentUser;

export const createEmailUser = (email: string, password: string) =>
  createUserWithEmailAndPassword(getAuth(), email, password);

export const firebaseUseDeviceLanguage = () => getAuth().useDeviceLanguage();

export const signUp = async (
  appUser: AppUser,
  email: string,
  password: string,
  confirmPassword: string,
  setError: (error: string) => void
) => {
  if (password !== confirmPassword) {
    throw new Error("Password does not match the confirmation password");
  }

  if (appUser.username) {
    const existingUserUid = await getUsername(appUser.username);
    if (existingUserUid) throw new Error("This username is already in use.");
  }

  const now = Date.now();

  const auth = getAuth();
  return (
    auth.currentUser?.isAnonymous
      ? linkWithCredential(auth.currentUser, EmailAuthProvider.credential(email, password))
      : createEmailUser(email, password)
  )
    .then(async ({ user: { uid } }) => {
      const user = {
        uid: uid,
        email,
        createdAt: now,
        updatedAt: now,
        emailVerified: false,
      };

      await createUser({ user, appUser });

      return user;
    })
    .catch((e) => setError(getFriendlyAuthError(e.message)));
};

export const signUpWithProvider = async (
  appUser: AppUser,
  providerId: string,
  setError: (error: string) => void,
  customParameters?: Record<string, string>
) => {
  const provider = new OAuthProvider(providerId);

  if (customParameters) provider.setCustomParameters(customParameters);

  return signInWithPopup(getAuth(), provider)
    .then(async ({ user }) => {
      const now = Date.now();

      const userUpdate: Mutable<User> = {
        uid: user.uid,
        createdAt: now,
        updatedAt: now,
        emailVerified: false,
      };

      if (user.email) userUpdate.email = user.email;

      await createUser({ user: userUpdate, appUser });

      return user;
    })
    .catch((e) => setError(getFriendlyAuthError(e.message)));
};

export const signIn = (email: string, password: string, setError: (error: string) => void) => {
  const auth = getAuth();

  return (
    auth.currentUser?.isAnonymous
      ? linkWithCredential(auth.currentUser, EmailAuthProvider.credential(email, password))
      : signInWithEmailAndPassword(auth, email, password)
  ).catch((e) => setError(getFriendlyAuthError(e.message)));
};

export const signInAnon = () => {
  const now = Date.now();

  return signInAnonymously(getAuth()).then(({ user }) =>
    updateUser({
      uid: user.uid,
      createdAt: now,
      updatedAt: now,
    })
  );
};

export const forgotPassword = (email: string) => sendPasswordResetEmail(getAuth(), email);

export const signUserOut = () => signOut(getAuth());

export const updateUserEmail = (email: string) => {
  const cu = getCurrentUser();
  if (cu) updateEmail(cu, email);
  else throw new Error("You must be signed in to update your email.");
};

export const updateUserPassword = (newPassword: string) => {
  const cu = getCurrentUser();
  if (cu) return updatePassword(cu, newPassword);
  throw new Error("You must be signed in to update your password.");
};
