import {
  isoCreateData,
  isoUpdateData,
  isoUpsertData,
  isoRemoveData,
  isoGetOwner,
  isoGetOwners,
  isoGetDataKeyValue,
  isoOnDataKeyValue,
  isoGetAdminValue,
  isoOnUserValue,
  isoOnUserDataTypeListChildAdded,
  isoCreateConnections,
  isoUpdateUser,
  isoGetDataTypeValue,
  isoGetConnectionTypeData,
  isoGetAllConnections,
  isoGetDataKeyFieldValue,
  isoGetConnectionTypeConnections,
  isoRemoveConnections,
  isoChangeDataKey,
  isoGetConnectionType,
  isoCreateUser,
  isoTrackEvent,
  isoGetUser,
  isoAddOwners,
  isoRemoveOwners,
  isoGetUsername,
  isoSoilTransactionWithCb,
  isoSoilIncrement,
  isoGetUserDataType,
} from "./data";
import { get, update, soilUpdate, onChildAdded, onValue, push, transactionWithCb } from "./firebase";

// Types
import type {
  User,
  CreateDataParams,
  GetDataKeyValueParams,
  UpdateDataParams,
  RemoveDataKeyParams,
  OnUserDataTypeListChildAddedParams,
  OnDataValueParams,
  GetOwnerDataParams,
  ModifyConnectionsType,
  ChangeDataKey,
  AppUser,
  SoilTransactionWithCbParams,
  Data,
  SoilIncrement,
} from "./types";
import type { SoilDatabase } from "..";

export const createUser = ({
  user,
  appUser,
  updateObject = {},
  skipUpdate,
  now,
}: Pick<CreateDataParams<keyof SoilDatabase>, "updateObject" | "skipUpdate" | "now"> & {
  user: Mandate<User, "uid">;
  appUser: AppUser;
}) => isoCreateUser({ update, user, appUser, updateObject, skipUpdate, now });

export const updateUser = (u: Mandate<User, "uid">) => isoUpdateUser(update, u);

export const getUser = (uid: string) => isoGetUser(get, uid);

export const getUsername = (username: string) => isoGetUsername(get, username);

export const onUserDataTypeListChildAdded = <T2 extends keyof SoilDatabase>({
  dataType,
  uid,
  cb,
}: Omit<OnUserDataTypeListChildAddedParams<T2>, "onChildAdded">) =>
  isoOnUserDataTypeListChildAdded({ onChildAdded, dataType, uid, cb });

export const getDataKeyValue = <T2 extends keyof SoilDatabase>({
  dataType,
  dataKey,
}: Omit<GetDataKeyValueParams<T2>, "get">) => isoGetDataKeyValue(get, dataType, dataKey);

export const getDataKeyFieldValue = <T2 extends keyof SoilDatabase, T3 extends keyof SoilDatabase[T2]>({
  dataType,
  dataKey,
  field,
}: {
  dataType: T2;
  dataKey: string;
  field: T3;
}) => isoGetDataKeyFieldValue({ get, dataType, dataKey, field });

export const getDataTypeValue = <T2 extends keyof SoilDatabase>({
  dataType,
}: Omit<GetDataKeyValueParams<T2>, "get" | "dataKey">) => isoGetDataTypeValue(get, dataType);

export const onDataKeyValue = <T2 extends keyof SoilDatabase>({
  dataType,
  dataKey,
  cb,
}: Omit<OnDataValueParams<T2>, "onValue">) => isoOnDataKeyValue({ onValue, dataType, dataKey, cb });

export const getUserDataType = <T2 extends keyof SoilDatabase, T22 extends keyof SoilDatabase>({
  dataType,
  uid,
}: {
  dataType: T2;
  uid: string;
}) => isoGetUserDataType({ get, dataType, uid });

export const createData = async <T2 extends keyof SoilDatabase>({
  updateObject,
  skipUpdate,
  dataType,
  dataKey,
  data,
  owners,
  publicAccess,
  connections,
  connectionAccess,
  ownershipAccess,
  now,
}: Omit<CreateDataParams<T2>, "update">) =>
  isoCreateData({
    update: soilUpdate,
    updateObject,
    skipUpdate,
    dataType,
    dataKey,
    data,
    owners,
    publicAccess,
    connections,
    connectionAccess,
    ownershipAccess,
    now,
  });

export const updateData = async <T2 extends keyof SoilDatabase>({
  updateObject,
  skipUpdate,
  dataType,
  dataKey,
  data,
  owners,
  connections,
  publicAccess,
  includeUpdatedAt,
  connectionAccess,
  ownershipAccess,
  makeGetRequests,
  makeConnectionsRequests,
  makeOwnersRequests,
  now,
}: Omit<UpdateDataParams<T2>, "update" | "get" | "updateDataHandler" | "updateListHandler">) =>
  isoUpdateData({
    update: soilUpdate,
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
    connectionAccess,
    ownershipAccess,
    makeGetRequests,
    makeConnectionsRequests,
    makeOwnersRequests,
    now,
  });

export const upsertData = async <T2 extends keyof SoilDatabase>({
  updateObject,
  skipUpdate,
  dataType,
  dataKey,
  data,
  owners,
  publicAccess,
  connections,
  includeUpdatedAt,
  connectionAccess,
  ownershipAccess,
  makeGetRequests,
  makeConnectionsRequests,
  makeOwnersRequests,
  now,
}: Omit<CreateDataParams<T2> & UpdateDataParams<T2>, "update" | "get">) =>
  isoUpsertData({
    update: soilUpdate,
    get,
    updateObject,
    skipUpdate,
    dataType,
    dataKey,
    data,
    owners,
    publicAccess,
    connections,
    includeUpdatedAt,
    connectionAccess,
    ownershipAccess,
    makeGetRequests,
    makeConnectionsRequests,
    makeOwnersRequests,
    now,
  });

export const addOwners = async <T2 extends keyof SoilDatabase>({
  dataType,
  dataKey,
  updateObject,
  skipUpdate,
  now = Date.now(),
  owners,
}: Pick<CreateDataParams<T2>, "dataType" | "dataKey" | "owners" | "updateObject" | "skipUpdate" | "now">) =>
  isoAddOwners({ update: soilUpdate, dataType, dataKey, updateObject, skipUpdate, owners, now });

export const removeOwners = async <T2 extends keyof SoilDatabase>({
  dataType,
  dataKey,
  updateObject,
  skipUpdate,
  owners,
}: Pick<CreateDataParams<T2>, "dataType" | "dataKey" | "owners" | "updateObject" | "skipUpdate">) =>
  isoRemoveOwners({ update: soilUpdate, dataType, dataKey, updateObject, skipUpdate, owners });

export const createConnection = async <T2 extends keyof SoilDatabase>({
  updateObject,
  skipUpdate,
  now = Date.now(),
  connections,
}: Omit<ModifyConnectionsType<T2>, "update">) =>
  isoCreateConnections({ update: soilUpdate, updateObject, skipUpdate, connections, now });

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
}) =>
  isoGetConnectionType({
    get,
    dataType,
    dataKey,
    connectionType,
  });

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

export const getConnectionTypeConnections = <T2 extends keyof SoilDatabase, T22 extends keyof SoilDatabase>({
  dataType,
  dataKey,
  connectionType,
}: {
  dataType: T2;
  dataKey: string;
  connectionType: T22;
}) =>
  isoGetConnectionTypeConnections({
    get,
    dataType,
    dataKey,
    connectionType,
  });

export const soilIncrement = <T2 extends keyof SoilDatabase, T3 extends keyof Data<T2>>({
  dataType,
  dataKey,
  field,
  delta,
  makeGetRequests,
  makeConnectionsRequests,
  makeOwnersRequests,
}: Omit<SoilIncrement<T2, T3>, "get" | "update">) =>
  isoSoilIncrement({
    get,
    update,
    dataType,
    dataKey,
    field,
    delta,
    makeGetRequests,
    makeConnectionsRequests,
    makeOwnersRequests,
  });

export const soilTransactionWithCb = <T2 extends keyof SoilDatabase, T3 extends keyof Data<T2>>({
  cb,
  dataType,
  dataKey,
  field,
  makeGetRequests,
  makeConnectionsRequests,
  makeOwnersRequests,
}: Omit<SoilTransactionWithCbParams<T2, T3>, "get" | "update" | "transactionWithCb">) =>
  isoSoilTransactionWithCb({
    get,
    update,
    transactionWithCb,
    cb,
    dataType,
    dataKey,
    field,
    makeGetRequests,
    makeConnectionsRequests,
    makeOwnersRequests,
  });

export const removeData = async <T2 extends keyof SoilDatabase>({
  updateObject,
  skipUpdate,
  dataType,
  dataKey,
}: Omit<RemoveDataKeyParams<T2>, "update" | "get" | "now" | "publicAccess">) =>
  isoRemoveData({ update: soilUpdate, get, updateObject, skipUpdate, dataType, dataKey });

export const getOwners = <T2 extends keyof SoilDatabase>(dataType: T2, dataKey: string) =>
  isoGetOwners(get, dataType, dataKey);

export const getOwner = <T2 extends keyof SoilDatabase>({
  dataType,
  dataKey,
  uid,
}: Omit<GetOwnerDataParams<T2>, "get">) => isoGetOwner({ get, dataType, dataKey, uid });

export const getAdminValue = (uid: string) => isoGetAdminValue(get, uid);

export const onUserValue = (uid: string, cb: (user: Nullable<Mandate<User, "uid">>) => void) =>
  isoOnUserValue(onValue, uid, cb);

export const removeConnection = <T2 extends keyof SoilDatabase>({
  connections,
  skipUpdate,
  updateObject,
}: Pick<ModifyConnectionsType<T2>, "skipUpdate" | "updateObject" | "connections">) =>
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
