import type { SoilDatabase } from "..";
import type { Data, User, DataList, RemoveDataKeyParams, CreateDataParams, UpdateDataParams, GetFunction, OnConnectionTypeChildAddedParams, OnDataValueParams, OnUserDataTypeListChildAddedParams, GetOwnerDataParams, QueryDataParams, ModifyConnectionsType, TrackingData, Connections, ChangeDataKey, UpdateObject } from "./types";
export declare const isoCreateUser: ({ user, update, updateObject, skipUpdate, now, }: Pick<CreateDataParams<SoilDatabase, keyof SoilDatabase>, "update" | "updateObject" | "skipUpdate" | "now"> & {
    user: Mandate<User, "uid">;
}) => Promise<UpdateObject<SoilDatabase, keyof SoilDatabase>>;
export declare const isoUpdateUser: (update: <T extends object>(path: string, data: T) => Promise<void>, u: Mandate<User, "uid">) => Promise<void>;
export declare const isoGetUser: (get: GetFunction, uid: string) => Promise<User>;
export declare const isoOnUserValue: (onValue: (path: string, cb: (val: Nullable<User>) => void) => VoidFunction, uid: string, cb: (user: Nullable<Mandate<User, "uid">>) => void) => VoidFunction;
export declare const isoOnUserDataListValue: (onValue: (path: string, cb: (val: Nullable<DataList>) => void) => VoidFunction, uid: string, cb: (userData: Nullable<DataList>) => void) => VoidFunction;
export declare const isoOnUserDataTypeListChildAdded: <T2 extends keyof SoilDatabase>({ onChildAdded, uid, dataType, cb, }: OnUserDataTypeListChildAddedParams<T2>) => VoidFunction;
export declare const isoOnDataKeyValue: <T2 extends keyof SoilDatabase>({ onValue, dataType, dataKey, cb, }: OnDataValueParams<T2>) => VoidFunction;
export declare const isoOnToGetTypeChildAdded: <T extends SoilDatabase, T2 extends keyof SoilDatabase>({ onChildAdded, dataType, dataKey, connectionType, cb, }: OnConnectionTypeChildAddedParams<T, T2>) => VoidFunction;
/** DO NOT USE outside of strongly typed services */
export declare const isoGetAdminValue: (get: (path: string) => Promise<boolean | null>, uid: string) => Promise<boolean>;
export declare const isoGetDataKeyValue: <T2 extends keyof SoilDatabase>(get: GetFunction, dataType: T2, dataKey: string) => Promise<Data<T2>>;
export declare const isoGetDataTypeValue: <T2 extends keyof SoilDatabase>(get: GetFunction, dataType: T2) => Promise<Record<string, Data<T2>>>;
export declare const isoGetAllConnections: <T2 extends keyof SoilDatabase>(get: GetFunction, dataType: T2, dataKey: string) => Promise<DataList>;
export declare const isoGetAllConnectionsByType: <T2 extends keyof SoilDatabase>(get: GetFunction, dataType: T2) => Promise<Record<string, DataList>>;
export declare const isoGetConnectionType: <T2 extends keyof SoilDatabase, T22 extends keyof SoilDatabase>({ get, dataType, dataKey, connectionType, }: {
    get: GetFunction;
    dataType: T2;
    dataKey: string;
    connectionType: T22;
}) => Promise<DataList[T22]>;
export declare const isoGetConnectionTypeData: <T2 extends keyof SoilDatabase, T22 extends keyof SoilDatabase>({ get, dataType, dataKey, connectionType, }: {
    get: GetFunction;
    dataType: T2;
    dataKey: string;
    connectionType: T22;
}) => Promise<Awaited<import("./types").StandardDataFields & {
    key?: string;
    publicAccess: boolean;
} & SoilDatabase[T22] & {
    key: string;
}>[]>;
export declare const isoGetConnectionTypeConnections: <T2 extends keyof SoilDatabase, T22 extends keyof SoilDatabase>({ get, dataType, dataKey, connectionType, }: {
    get: GetFunction;
    dataType: T2;
    dataKey: string;
    connectionType: T22;
}) => Promise<DataList[]>;
export declare const isoGetDataKeyFieldValue: <T2 extends keyof SoilDatabase, T3 extends "publicAccess" | "key" | keyof import("./types").StandardDataFields | keyof SoilDatabase[T2]>({ get, dataType, dataKey, field, }: {
    get: GetFunction;
    dataType: T2;
    dataKey: string;
    field: T3;
}) => Promise<Data<T2>[T3]>;
export declare const isoQueryData: <T extends SoilDatabase, T2 extends keyof SoilDatabase, T3 extends keyof T[T2]>({ queryOrderByChildEqualTo, dataType, childKey, queryValue, limit, }: QueryDataParams<T, T2, T3>) => Promise<T[T2]>;
export declare const isoGetOwner: <T2 extends keyof SoilDatabase>({ get, dataType, dataKey, uid }: GetOwnerDataParams<T2>) => Promise<boolean>;
export declare const isoGetOwners: (get: GetFunction, dataType: keyof SoilDatabase, dataKey: string) => Promise<Record<string, number>>;
export declare const isoGetOwnersByType: (get: GetFunction, dataType: keyof SoilDatabase) => Promise<Record<string, Record<string, number>>>;
export declare const isoCreateData: <T extends SoilDatabase, T2 extends keyof SoilDatabase>({ update, updateObject, skipUpdate, dataType, dataKey, data, owners, publicAccess, connections, connectionAccess, now, }: CreateDataParams<T, T2>) => Promise<UpdateObject<T, T2>>;
export declare const isoUpdateData: <T extends SoilDatabase, T2 extends keyof SoilDatabase>({ update, get, updateObject, skipUpdate, dataType, dataKey, data, owners, connections, publicAccess, connectionAccess, now, includeUpdatedAt, makeGetRequests, makeConnectionsRequests, makeOwnersRequests, }: UpdateDataParams<T, T2>) => Promise<UpdateObject<T, T2>>;
export declare const isoUpsertData: <T extends SoilDatabase, T2 extends keyof SoilDatabase>({ update, get, updateObject, skipUpdate, dataType, dataKey, data, owners, publicAccess, connections, connectionAccess, includeUpdatedAt, makeGetRequests, }: import("./types").CudDataParams<T, T2> & {
    data: T[T2];
    owners: string[];
    connections?: Connections;
    connectionAccess?: {
        connectionType: keyof SoilDatabase;
        connectionKey: string;
        uidDataType: keyof SoilDatabase;
        read: boolean;
        write: boolean;
    };
} & {
    get: GetFunction;
    data: Partial<T[T2]>;
    owners?: string[];
    connections?: Connections;
    connectionAccess?: {
        connectionType: keyof SoilDatabase;
        connectionKey: string;
        uidDataType: keyof SoilDatabase;
        read: boolean;
        write: boolean;
    };
    makeGetRequests: boolean;
    makeConnectionsRequests?: boolean;
    makeOwnersRequests?: boolean;
    includeUpdatedAt?: boolean;
}) => Promise<UpdateObject<T, T2>>;
export declare const isoCreateConnections: <T extends SoilDatabase, T2 extends keyof SoilDatabase>({ update, updateObject, skipUpdate, now, connections, }: ModifyConnectionsType<T, T2>) => UpdateObject<T, T2> | Promise<UpdateObject<T, T2>>;
export declare const isoRemoveData: <T extends SoilDatabase, T2 extends keyof SoilDatabase>({ update, get, updateObject, skipUpdate, dataType, dataKey, existingOwners, existingConnections, }: Omit<RemoveDataKeyParams<T, T2>, "publicAccess" | "now">) => Promise<UpdateObject<T, T2>>;
/** ! CAREFUL */
export declare const isoRemoveDataType: <T extends SoilDatabase, T2 extends keyof SoilDatabase>({ update, get, dataType, }: Omit<RemoveDataKeyParams<T, T2>, "updateObject" | "skipUpdate" | "dataKey" | "publicAccess" | "now">) => Promise<void>;
export declare const isoRemoveConnections: <T extends SoilDatabase, T2 extends keyof SoilDatabase>({ update, updateObject, skipUpdate, connections, }: ModifyConnectionsType<T, T2>) => UpdateObject<T, T2> | Promise<UpdateObject<T, T2>>;
export declare const isoTrackEvent: (push: (path: string, data: TrackingData) => {
    key: Nullable<string>;
}, trackingKey: string, uid: string, metadata?: object) => {
    key: Nullable<string>;
};
export declare const isoChangeDataKey: <T2 extends keyof SoilDatabase, T22 extends keyof SoilDatabase>({ update, get, existingDataType, existingDataKey, newDataType, newDataKey, }: ChangeDataKey<T2, T22>) => Promise<{
    connections: Connections;
    owners: string[];
}>;
