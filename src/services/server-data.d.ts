import type { SoilDatabase } from "..";
import type { CreateDataParams, GetDataKeyValueParams, UpdateDataParams, RemoveDataKeyParams, Data, QueryDataParams, ModifyConnectionsType, User, ChangeDataKey } from "./types";
export declare const createUser: ({ user, updateObject, skipUpdate, now, }: Pick<CreateDataParams<SoilDatabase, keyof SoilDatabase>, "updateObject" | "skipUpdate" | "now"> & {
    user: Mandate<User, "uid">;
}) => Promise<import("./types").UpdateObject<SoilDatabase, keyof SoilDatabase>>;
export declare const updateUser: (u: Mandate<User, "uid">) => Promise<void>;
export declare const getUser: (uid: string) => Promise<User>;
export declare const getDataKeyValue: <T2 extends keyof SoilDatabase>(dataType: T2, dataKey: string) => Promise<Data<T2>>;
export declare const getDataTypeValue: <T2 extends keyof SoilDatabase>(dataType: T2) => Promise<Record<string, Data<T2>>>;
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
export declare const getDataKeyFieldValue: <T2 extends keyof SoilDatabase, T3 extends "publicAccess" | "key" | keyof import("./types").StandardDataFields | keyof SoilDatabase[T2]>({ dataType, dataKey, field, }: Omit<GetDataKeyValueParams<T2>, "get"> & {
    field: T3;
}) => Promise<Data<T2>[T3]>;
export declare const createData: <T extends SoilDatabase, T2 extends keyof SoilDatabase>({ updateObject, skipUpdate, dataType, dataKey, data, owners, publicAccess, connections, connectionAccess, now, }: Omit<CreateDataParams<T, T2>, "update"> & {
    dataType: string;
    dataKey: string;
}) => Promise<import("./types").UpdateObject<T, T2 & string>>;
export declare const updateData: <T extends SoilDatabase, T2 extends keyof SoilDatabase>({ updateObject, skipUpdate, dataType, dataKey, data, owners, connections, publicAccess, includeUpdatedAt, makeGetRequests, connectionAccess, now, }: Omit<UpdateDataParams<T, T2>, "update" | "get">) => Promise<import("./types").UpdateObject<T, T2>>;
export declare const upsertData: <T extends SoilDatabase, T2 extends keyof SoilDatabase>({ updateObject, skipUpdate, dataType, dataKey, data, owners, publicAccess, connections, connectionAccess, includeUpdatedAt, makeGetRequests, }: Omit<CreateDataParams<T, T2>, "update"> & Omit<UpdateDataParams<T, T2>, "update" | "get">) => Promise<import("./types").UpdateObject<T, T2>>;
export declare const queryData: <T extends SoilDatabase, T2 extends keyof SoilDatabase, T3 extends keyof T[T2]>({ dataType, childKey, queryValue, limit, }: Omit<QueryDataParams<T, T2, T3>, "queryOrderByChildEqualTo">) => Promise<T[T2]>;
export declare const removeData: <T extends SoilDatabase, T2 extends keyof SoilDatabase>({ updateObject, skipUpdate, dataType, dataKey, }: Omit<RemoveDataKeyParams<T, T2>, "update" | "publicAccess" | "now" | "get">) => Promise<import("./types").UpdateObject<T, T2>>;
/** ! CAREFUL */
export declare const removeDataType: <T2 extends keyof SoilDatabase>(dataType: T2) => Promise<void>;
export declare const getOwners: <T2 extends keyof SoilDatabase>(dataType: T2, dataKey: string) => Promise<Record<string, number>>;
export declare const createConnection: <T extends SoilDatabase, T2 extends keyof SoilDatabase>({ updateObject, skipUpdate, now, connections, }: Omit<ModifyConnectionsType<T, T2>, "update">) => Promise<import("./types").UpdateObject<T, T2>>;
export declare const removeConnection: <T extends SoilDatabase, T2 extends keyof SoilDatabase>({ connections, skipUpdate, updateObject, }: Pick<ModifyConnectionsType<T, T2>, "updateObject" | "skipUpdate" | "connections">) => import("./types").UpdateObject<T, T2> | Promise<import("./types").UpdateObject<T, T2>>;
export declare const trackEvent: (eventName: string, metadata?: object) => {
    key: string;
};
export declare const changeDataKey: <T2 extends keyof SoilDatabase, T22 extends keyof SoilDatabase>({ existingDataType, existingDataKey, newDataType, newDataKey, }: Omit<ChangeDataKey<T2, T22>, "update" | "get">) => Promise<{
    connections: import("./types").Connections;
    owners: string[];
}>;
