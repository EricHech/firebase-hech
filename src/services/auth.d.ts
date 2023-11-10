export declare const getCurrentUser: () => import("@firebase/auth").User;
export declare const createEmailUser: (email: string, password: string) => Promise<import("@firebase/auth").UserCredential>;
export declare const firebaseUseDeviceLanguage: () => void;
export declare const signUp: (email: string, password: string, confirmPassword: string, setError: (error: string) => void) => Promise<void | {
    uid: string;
    email: string;
    createdAt: number;
    updatedAt: number;
    emailVerified: boolean;
}>;
export declare const signUpWithProvider: (providerId: string, setError: (error: string) => void, customParameters?: Record<string, string>) => Promise<void | import("@firebase/auth").User>;
export declare const signIn: (email: string, password: string, setError: (error: string) => void) => Promise<void | import("@firebase/auth").UserCredential>;
export declare const signInAnon: () => Promise<void>;
export declare const forgotPassword: (email: string) => Promise<void>;
export declare const signUserOut: () => Promise<void>;
export declare const updateUserEmail: (email: string) => void;
export declare const updateUserPassword: (newPassword: string) => Promise<void>;
