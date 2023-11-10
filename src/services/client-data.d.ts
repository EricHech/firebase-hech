import type { User, CreateDataParams, GetDataKeyValueParams, UpdateDataParams, RemoveDataKeyParams, OnUserDataTypeListChildAddedParams, OnDataValueParams, GetOwnerDataParams, ModifyConnectionsType, ChangeDataKey } from "./types";
import type { SoilDatabase } from "..";
export declare const createUser: ({ user, updateObject, skipUpdate, now, }: Pick<CreateDataParams<SoilDatabase, keyof SoilDatabase>, "updateObject" | "skipUpdate" | "now"> & {
    user: Mandate<User, "uid">;
}) => Promise<import("./types").UpdateObject<SoilDatabase, keyof SoilDatabase>>;
export declare const updateUser: (u: Mandate<User, "uid">) => Promise<void>;
export declare const getUser: (uid: string) => Promise<User>;
export declare const onUserDataTypeListChildAdded: <T2 extends keyof SoilDatabase>({ dataType, uid, cb, }: Omit<OnUserDataTypeListChildAddedParams<T2>, "onChildAdded">) => VoidFunction;
export declare const getDataKeyValue: <T2 extends keyof SoilDatabase>({ dataType, dataKey, }: Omit<GetDataKeyValueParams<T2>, "get">) => Promise<import("./types").Data<T2>>;
export declare const getDataKeyFieldValue: <T2 extends keyof SoilDatabase, T3 extends keyof SoilDatabase[T2]>({ dataType, dataKey, field, }: {
    dataType: T2;
    dataKey: string;
    field: T3;
}) => Promise<import("./types").Data<T2>[T3]>;
export declare const getDataTypeValue: <T2 extends keyof SoilDatabase>({ dataType, }: Omit<GetDataKeyValueParams<T2>, "dataKey" | "get">) => Promise<Record<string, import("./types").Data<T2>>>;
export declare const onDataKeyValue: <T2 extends keyof SoilDatabase>({ dataType, dataKey, cb, }: Omit<OnDataValueParams<T2>, "onValue">) => VoidFunction;
export declare const createData: <T extends SoilDatabase, T2 extends keyof SoilDatabase>({ updateObject, skipUpdate, dataType, dataKey, data, owners, publicAccess, connections, connectionAccess, now, }: Omit<CreateDataParams<T, T2>, "update">) => Promise<import("./types").UpdateObject<T, T2>>;
export declare const updateData: <T extends SoilDatabase, T2 extends keyof SoilDatabase>({ updateObject, skipUpdate, dataType, dataKey, data, owners, connections, publicAccess, includeUpdatedAt, connectionAccess, makeGetRequests, makeConnectionsRequests, makeOwnersRequests, now, }: Omit<UpdateDataParams<T, T2>, "update" | "get" | "updateDataHandler" | "updateListHandler">) => Promise<import("./types").UpdateObject<T, T2>>;
export declare const upsertData: <T extends SoilDatabase, T2 extends keyof SoilDatabase>({ updateObject, skipUpdate, dataType, dataKey, data, owners, publicAccess, connections, includeUpdatedAt, connectionAccess, makeGetRequests, makeConnectionsRequests, makeOwnersRequests, now, }: Omit<import("./types").CudDataParams<T, T2> & {
    data: T[T2];
    owners: string[];
    connections?: import("./types").Connections;
    connectionAccess?: {
        connectionType: keyof SoilDatabase;
        connectionKey: string;
        uidDataType: keyof SoilDatabase;
        read: boolean;
        write: boolean;
    };
} & {
    get: import("./types").GetFunction;
    data: Partial<T[T2]>;
    owners?: string[];
    connections?: import("./types").Connections;
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
}, "update" | "get">) => Promise<import("./types").UpdateObject<T, T2>>;
export declare const createConnection: <T extends SoilDatabase, T2 extends keyof SoilDatabase>({ updateObject, skipUpdate, now, connections, }: Omit<ModifyConnectionsType<T, T2>, "update">) => Promise<import("./types").UpdateObject<T, T2>>;
export declare const getAllConnections: <T2 extends keyof SoilDatabase>(dataType: T2, dataKey: string) => Promise<import("./types").DataList>;
export declare const getConnectionType: <T2 extends keyof SoilDatabase, T22 extends keyof SoilDatabase>({ dataType, dataKey, connectionType, }: {
    dataType: T2;
    dataKey: string;
    connectionType: T22;
}) => Promise<import("./types").DataList[T22]>;
export declare const getConnectionTypeData: <T2 extends keyof SoilDatabase, T22 extends keyof SoilDatabase>({ dataType, dataKey, connectionType, }: {
    dataType: T2;
    dataKey: string;
    connectionType: T22;
}) => Promise<Awaited<import("./types").StandardDataFields & {
    key?: string;
    publicAccess: boolean;
} & SoilDatabase[T22] & {
    key: string;
}>[]>;
export declare const getConnectionTypeConnections: <T2 extends keyof SoilDatabase, T22 extends keyof SoilDatabase>({ dataType, dataKey, connectionType, }: {
    dataType: T2;
    dataKey: string;
    connectionType: T22;
}) => Promise<import("./types").DataList[]>;
export declare const removeData: <T extends SoilDatabase, T2 extends keyof SoilDatabase>({ updateObject, skipUpdate, dataType, dataKey, }: Omit<RemoveDataKeyParams<T, T2>, "update" | "publicAccess" | "now" | "get">) => Promise<import("./types").UpdateObject<T, T2>>;
export declare const getOwners: <T2 extends keyof SoilDatabase>(dataType: T2, dataKey: string) => Promise<Record<string, number>>;
export declare const getOwner: <T2 extends keyof SoilDatabase>({ dataType, dataKey, uid, }: Omit<GetOwnerDataParams<T2>, "get">) => Promise<boolean>;
export declare const getAdminValue: (uid: string) => Promise<boolean>;
export declare const onUserValue: (uid: string, cb: (user: Nullable<Mandate<User, "uid">>) => void) => VoidFunction;
export declare const removeConnection: <T extends SoilDatabase, T2 extends keyof SoilDatabase>({ connections, skipUpdate, updateObject, }: Pick<ModifyConnectionsType<T, T2>, "updateObject" | "skipUpdate" | "connections">) => import("./types").UpdateObject<T, T2> | Promise<import("./types").UpdateObject<T, T2>>;
export declare const trackEvent: (eventName: string, metadata?: object) => {
    key: string;
};
export declare const changeDataKey: <T2 extends keyof SoilDatabase, T22 extends keyof SoilDatabase>({ existingDataType, existingDataKey, newDataType, newDataKey, }: Omit<ChangeDataKey<T2, T22>, "update" | "get">) => Promise<{
    connections: import("./types").Connections;
    owners: string[];
}>;
