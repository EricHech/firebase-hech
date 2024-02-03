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
  updateProfile,
  User as FirebaseUser,
  GoogleAuthProvider,
} from "firebase/auth";
import { createUser, getUsername, updateUser } from "./client-data";
import { AppUser, User, FirebaseProfile } from "./types";

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

const handleCreateUser = async (fbUser: FirebaseUser, profile: Maybe<FirebaseProfile>, appUser: AppUser) => {
  if (profile) await updateProfile(fbUser, profile);

  const now = Date.now();

  const user: Mutable<User> = {
    uid: fbUser.uid,
    createdAt: now,
    updatedAt: now,
    emailVerified: fbUser.emailVerified,
  };

  if (fbUser.email) user.email = fbUser.email;
  if (profile?.displayName) user.displayName = profile.displayName;
  if (profile?.photoURL) user.photoURL = profile.photoURL;

  await createUser({ user, appUser });

  return user;
};

export const signUp = async (
  appUser: AppUser,
  email: string,
  password: string,
  confirmPassword: string,
  setError: (error: string) => void,
  profile?: FirebaseProfile
) => {
  if (password !== confirmPassword) {
    throw new Error("Password does not match the confirmation password");
  }

  if (appUser.username) {
    const existingUserUid = await getUsername(appUser.username);
    if (existingUserUid) throw new Error("This username is already in use.");
  }

  const auth = getAuth();
  return (
    auth.currentUser?.isAnonymous
      ? linkWithCredential(auth.currentUser, EmailAuthProvider.credential(email, password))
      : createEmailUser(email, password)
  )
    .then(async ({ user }) =>
      // await sendEmailVerification(user);
      // await signUserOut();
      // ...
      // await applyActionCode(getAuth(), code);
      handleCreateUser(user, profile, appUser)
    )
    .catch((e) => setError(getFriendlyAuthError(e.message)));
};

/**
 * If using Google:
 * 1. Pass in `new GoogleAuthProvider().providerId;`
 * 2. Pass in `scopes: ["profile", "email"]`
 */
export const signUpWithProvider = async (
  appUser: AppUser,
  providerId: string,
  setError: (error: string) => void,
  scopes?: string[],
  customParameters?: Record<string, string>
) => {
  const provider = new OAuthProvider(providerId);

  scopes?.forEach((scope) => provider.addScope(scope));
  if (customParameters) provider.setCustomParameters(customParameters);

  return signInWithPopup(getAuth(), provider)
    .then(async ({ user }) => {
      const displayName = user.providerData.find(({ displayName }) => displayName)?.displayName;
      const photoURL = user.providerData.find(({ photoURL }) => photoURL)?.photoURL;

      return handleCreateUser(user, { displayName, photoURL }, appUser);
    })
    .catch((e) => setError(getFriendlyAuthError(e.message)));
};

export const signUpWithGoogle = async (
  appUser: AppUser,
  setError: (error: string) => void,
  customParameters?: Record<string, string>
) => signUpWithProvider(appUser, new GoogleAuthProvider().providerId, setError, ["profile", "email"], customParameters);

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
    updateUser(user.uid, {
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
