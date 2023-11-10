import * as database from "firebase/database";
import * as storage from "firebase/storage";
import { UploadTaskSnapshot as FirebaseUploadTaskSnapshot } from "firebase/storage";
export declare const get: <T>(path: string) => Promise<T>;
export type GetChildrenEqualTo = {
    path: string;
    val: string | number | boolean | null;
};
export declare const getChildrenEqualTo: <T, V extends string | number | boolean>(path: string, childPath: string, equalToValue: V) => Promise<T>;
export declare const getWithLimit: <T>(path: string, amount: number, version: "first" | "last") => Promise<T>;
export declare const onChildAdded: <T, K extends string>(path: string, cb: (val: T, key: K) => void) => database.Unsubscribe;
export declare const onChildChanged: <T, K extends string>(path: string, cb: (val: T, key: K) => void) => database.Unsubscribe;
export declare const onChildRemoved: <K extends string>(path: string, cb: (key: K) => void) => database.Unsubscribe;
export declare const push: <T>(path: string, data: T) => database.ThenableReference | {
    key: any;
};
export declare const pushKey: (path: string) => string;
export declare const set: <T>(path: string, data: T) => Promise<void>;
export declare const soilUpdate: <T extends object>(path: string, data: T, allowRootQuery?: boolean, isDelete?: boolean) => Promise<void>;
export declare const update: <T extends object>(path: string, data: T, allowRootQuery?: boolean) => Promise<void>;
export declare const onValue: <T>(path: string, cb: (val: T) => void) => database.Unsubscribe;
export declare const onValueWithLimit: <T>(path: string, amount: number, version: "first" | "last", cb: (val: T) => void) => database.Unsubscribe;
export declare const remove: (path: string) => Promise<void>;
export declare const onDisconnect: <T>(path: string, data: T) => Promise<void>;
export declare const transactionWithCb: <T>(path: string, cb: (val: T) => T) => Promise<database.TransactionResult>;
/** DO NOT USE outside of strongly typed services */
export declare const firebaseStorageRef: (path: string) => storage.StorageReference;
export declare const firebaseStoragePut: (path: string, file: Blob | Uint8Array | ArrayBuffer) => Promise<string>;
export type UploadTaskSnapshot = FirebaseUploadTaskSnapshot;
export declare const firebaseStoragePutResumable: (path: string, file: Blob | Uint8Array | ArrayBuffer) => storage.UploadTask;
export declare const firebaseStorageDelete: (path: string) => Promise<void>;
