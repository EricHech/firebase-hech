import type { SoilDatabase } from "../services/types";
import {
  isoCreateData,
  isoUpdateData,
  isoUpsertData,
  isoRemoveData,
  isoGetOwners,
  isoGetDataKeyValue,
  isoGetDataKeyFieldValue,
  isoQueryData,
  isoGetAllConnections,
  isoRemoveConnections,
  isoGetDataTypeValue,
  isoGetConnectionTypeData,
  isoGetConnectionType,
  isoCreateConnections,
  isoRemoveDataType,
  isoUpdateUser,
  isoChangeDataKey,
  isoCreateUser,
  isoTrackEvent,
  isoGetUser,
  isoAddOwners,
  isoRemoveOwners,
  isoGetUserDataType,
  isoGetUsername,
} from "./data";
import { get, push, queryOrderByChildEqualTo, soilUpdate, update } from "./admin";
import type {
  CreateDataParams,
  GetDataKeyValueParams,
  UpdateDataParams,
  RemoveDataKeyParams,
  Data,
  QueryDataParams,
  ModifyConnectionsType,
  User,
  ChangeDataKey,
} from "./types";

export const createUser = ({
  user,
  username,
  updateObject = {},
  skipUpdate,
  now,
}: Pick<CreateDataParams<SoilDatabase, keyof SoilDatabase>, "updateObject" | "skipUpdate" | "now"> & {
  user: Mandate<User, "uid">;
  username: Nullable<string>;
}) => isoCreateUser({ update, user, username, updateObject, skipUpdate, now });

export const updateUser = (u: Mandate<User, "uid">) => isoUpdateUser(update, u);

export const getUser = (uid: string) => isoGetUser(get, uid);

export const getUsername = (username: string) => isoGetUsername(get, username);

export const getDataKeyValue = <T2 extends keyof SoilDatabase>(dataType: T2, dataKey: string) =>
  isoGetDataKeyValue<T2>(get, dataType, dataKey);

export const getDataTypeValue = <T2 extends keyof SoilDatabase>(dataType: T2) => isoGetDataTypeValue<T2>(get, dataType);

export const getAllConnections = <T2 extends keyof SoilDatabase>(dataType: T2, dataKey: string) =>
  isoGetAllConnections(get, dataType, dataKey);

export const getConnectionType = <T2 extends keyof SoilDatabase, T22 extends keyof SoilDatabase>({
  dataType,
  dataKey,
  connectionType,
}: {
  dataType: T2;
  dataKey: string;
  connectionType: T22;
}) => isoGetConnectionType({ get, dataType, dataKey, connectionType });

export const getConnectionTypeData = <T2 extends keyof SoilDatabase, T22 extends keyof SoilDatabase>({
  dataType,
  dataKey,
  connectionType,
}: {
  dataType: T2;
  dataKey: string;
  connectionType: T22;
}) =>
  isoGetConnectionTypeData({
    get,
    dataType,
    dataKey,
    connectionType,
  });

export const getUserDataType = <T2 extends keyof SoilDatabase, T22 extends keyof SoilDatabase>({
  dataType,
  uid,
}: {
  dataType: T2;
  uid: string;
}) => isoGetUserDataType({ get, dataType, uid });

export const getDataKeyFieldValue = <T2 extends keyof SoilDatabase, T3 extends keyof Data<T2>>({
  dataType,
  dataKey,
  field,
}: Omit<GetDataKeyValueParams<T2>, "get"> & { field: T3 }) =>
  isoGetDataKeyFieldValue<T2, T3>({ get, dataType, dataKey, field });

export const createData = <T extends SoilDatabase, T2 extends keyof SoilDatabase>({
  updateObject,
  skipUpdate,
  dataType,
  dataKey,
  data,
  owners,
  publicAccess,
  connections,
  connectionAccess,
  now = Date.now(),
  imitateClientUpdate,
}: Omit<CreateDataParams<T, T2>, "update"> & {
  dataType: string;
  dataKey: string;
  imitateClientUpdate?: boolean;
}) =>
  isoCreateData({
    update: imitateClientUpdate ? soilUpdate : update,
    updateObject,
    skipUpdate,
    dataType,
    dataKey,
    data,
    owners,
    publicAccess,
    connections,
    connectionAccess,
    now,
  });

export const updateData = <T extends SoilDatabase, T2 extends keyof SoilDatabase>({
  updateObject,
  skipUpdate,
  dataType,
  dataKey,
  data,
  owners,
  connections,
  publicAccess,
  includeUpdatedAt,
  makeGetRequests,
  connectionAccess,
  now,
  imitateClientUpdate,
}: Omit<UpdateDataParams<T, T2>, "update" | "get"> & { imitateClientUpdate?: boolean }) =>
  isoUpdateData({
    update: imitateClientUpdate ? soilUpdate : update,
    get,
    updateObject,
    skipUpdate,
    dataType,
    dataKey,
    data,
    owners,
    connections,
    publicAccess,
    includeUpdatedAt,
    makeGetRequests,
    connectionAccess,
    now,
  });

export const upsertData = <T extends SoilDatabase, T2 extends keyof SoilDatabase>({
  updateObject,
  skipUpdate,
  dataType,
  dataKey,
  data,
  owners,
  publicAccess,
  connections,
  connectionAccess,
  includeUpdatedAt,
  makeGetRequests,
  imitateClientUpdate,
}: Omit<CreateDataParams<T, T2>, "update"> &
  Omit<UpdateDataParams<T, T2>, "update" | "get"> & { imitateClientUpdate?: boolean }) =>
  isoUpsertData({
    update: imitateClientUpdate ? soilUpdate : update,
    get,
    updateObject,
    skipUpdate,
    dataType,
    dataKey,
    data,
    owners,
    publicAccess,
    connections,
    connectionAccess,
    includeUpdatedAt,
    makeGetRequests,
  });

export const queryData = <T extends SoilDatabase, T2 extends keyof SoilDatabase, T3 extends keyof T[T2]>({
  dataType,
  childKey,
  queryValue,
  limit,
}: Omit<QueryDataParams<T, T2, T3>, "queryOrderByChildEqualTo">) =>
  isoQueryData({
    queryOrderByChildEqualTo,
    dataType,
    childKey,
    queryValue,
    limit,
  });

export const removeData = <T extends SoilDatabase, T2 extends keyof SoilDatabase>({
  updateObject,
  skipUpdate,
  dataType,
  dataKey,
  imitateClientUpdate,
}: Omit<RemoveDataKeyParams<T, T2>, "update" | "get" | "publicAccess" | "now"> & { imitateClientUpdate?: boolean }) =>
  isoRemoveData({
    update: imitateClientUpdate ? soilUpdate : update,
    get,
    updateObject,
    skipUpdate,
    dataType,
    dataKey,
  });

/** ! CAREFUL */
export const removeDataType = <T2 extends keyof SoilDatabase>(dataType: T2) =>
  isoRemoveDataType({
    update,
    get,
    dataType,
  });

export const getOwners = <T2 extends keyof SoilDatabase>(dataType: T2, dataKey: string) =>
  isoGetOwners(get, dataType, dataKey);

export const addOwners = async <T extends SoilDatabase, T2 extends keyof SoilDatabase>({
  dataType,
  dataKey,
  updateObject,
  skipUpdate,
  now = Date.now(),
  owners,
  imitateClientUpdate,
}: Pick<CreateDataParams<T, T2>, "dataType" | "dataKey" | "owners" | "updateObject" | "skipUpdate" | "now"> & {
  imitateClientUpdate?: boolean;
}) =>
  isoAddOwners({
    update: imitateClientUpdate ? soilUpdate : update,
    dataType,
    dataKey,
    updateObject,
    skipUpdate,
    owners,
    now,
  });

export const removeOwners = async <T extends SoilDatabase, T2 extends keyof SoilDatabase>({
  dataType,
  dataKey,
  updateObject,
  skipUpdate,
  owners,
}: Pick<CreateDataParams<T, T2>, "dataType" | "dataKey" | "owners" | "updateObject" | "skipUpdate">) =>
  isoRemoveOwners({ update, dataType, dataKey, updateObject, skipUpdate, owners });

export const createConnection = async <T extends SoilDatabase, T2 extends keyof SoilDatabase>({
  updateObject,
  skipUpdate,
  now = Date.now(),
  connections,
  imitateClientUpdate,
}: Omit<ModifyConnectionsType<T, T2>, "update"> & { imitateClientUpdate?: boolean }) =>
  isoCreateConnections({
    update: imitateClientUpdate ? soilUpdate : update,
    updateObject,
    skipUpdate,
    connections,
    now,
  });

export const removeConnection = <T extends SoilDatabase, T2 extends keyof SoilDatabase>({
  connections,
  skipUpdate,
  updateObject,
}: Pick<ModifyConnectionsType<T, T2>, "skipUpdate" | "updateObject" | "connections">) =>
  isoRemoveConnections({ update, connections, skipUpdate, updateObject });

export const trackEvent = (eventName: string, metadata?: object) =>
  isoTrackEvent(push, eventName, "firebase-admin", metadata);

export const changeDataKey = async <T2 extends keyof SoilDatabase, T22 extends keyof SoilDatabase>({
  existingDataType,
  existingDataKey,
  newDataType,
  newDataKey,
}: Omit<ChangeDataKey<T2, T22>, "update" | "get">) =>
  isoChangeDataKey({
    update,
    get,
    existingDataType,
    existingDataKey,
    newDataType,
    newDataKey,
  });
