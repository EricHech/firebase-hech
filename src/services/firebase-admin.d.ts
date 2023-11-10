import { CreateRequest, UpdateRequest } from "firebase-admin/auth";
import type { ServiceAccount } from "firebase-admin/app";
import type { QueryByKeyLimitParams, QueryOrderByChildParams } from "./types";
export declare const createAuthUser: (createRequest: CreateRequest) => Promise<import("firebase-admin/auth").UserRecord>;
export declare const get: <T>(path: string) => Promise<T>;
export declare const onChildAdded: <T>(path: string, cb: (val: T, key: string) => void) => (a: import("@firebase/database-types").DataSnapshot, b?: string) => any;
export declare const push: <T>(path: string, data: T) => import("@firebase/database-types").ThenableReference;
export declare const pushKey: (path: string) => string;
export declare const set: <T>(path: string, data: T) => Promise<void>;
export declare const update: <T extends object>(path: string, data: T, allowRootQuery?: boolean) => Promise<void>;
export declare const onValue: <T>(path: string, cb: (val: T) => void) => (a: import("@firebase/database-types").DataSnapshot, b?: string) => any;
export declare const queryOrderByChildEqualTo: <T>({ path, childKey, queryValue, limit }: QueryOrderByChildParams) => Promise<T>;
export declare const queryByKeyLimit: <T>({ path, limit }: QueryByKeyLimitParams) => Promise<T>;
export declare const initializeAdminApp: (appOptions?: ServiceAccount, databaseURL?: string, { isDev }?: {
    isDev?: boolean;
}) => void;
export declare const remove: (path: string) => Promise<void>;
export declare const transactionWithCb: <T>(path: string, cb: (val: T) => T) => Promise<import("@firebase/database-types").TransactionResult>;
export declare const updateAuthUser: (uid: string, updateRequest: UpdateRequest) => Promise<import("firebase-admin/auth").UserRecord>;
export declare const generatePasswordResetLink: (uid: string) => Promise<string>;
