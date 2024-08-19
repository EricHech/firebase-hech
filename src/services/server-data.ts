import type {
  AppUser,
  GetOwnerDataParams,
  FirebaseWrapperDatabase,
  FirebaseWrapperIncrement,
  FirebaseWrapperTransactionWithCbParams,
} from "../services/types";
import {
  isoCreateData,
  isoUpdateData,
  isoUpsertData,
  isoRemoveData,
  isoGetOwners,
  isoGetDataKeyValue,
  isoGetDataKeyFieldValue,
  isoQueryData,
  isoGetAllConnectionTypesKeys,
  isoRemoveConnections,
  isoGetDataTypeValue,
  isoGetConnectionTypeData,
  isoGetConnectionTypeKeys,
  isoCreateConnections,
  isoRemoveDataType,
  isoUpdateUser,
  isoChangeDataKey,
  isoCreateUser,
  isoTrackEvent,
  isoGetUser,
  isoAddOwners,
  isoRemoveOwners,
  isoGetUserTypeKeys,
  isoGetUidFromUsername,
  isoFirebaseWrapperTransactionWithCb,
  isoFirebaseWrapperIncrement,
  isoGetUnverifiedUser,
  isoGetUserTypeData,
  isoGetPublicTypeData,
  isoGetOwner,
} from "./data";
import { get, push, queryOrderByChildEqualTo, firebaseWrapperUpdate, update, transactionWithCb } from "./admin";
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
  appUser,
  updateObject = {},
  skipUpdate,
  now,
  createUnverifiedUser,
}: Pick<CreateDataParams<keyof FirebaseWrapperDatabase>, "updateObject" | "skipUpdate" | "now"> & {
  user: Mandate<User, "uid">;
  appUser: AppUser;
  createUnverifiedUser: boolean;
}) => isoCreateUser({ update, user, appUser, updateObject, skipUpdate, now, createUnverifiedUser });

export const getUnverifiedUser = (uid: string) => isoGetUnverifiedUser(uid, get);

export const updateUser = (uid: string, u: Partial<User>) => isoUpdateUser(update, uid, u);

export const getUser = (uid: string) => isoGetUser(get, uid);

export const getUidFromUsername = (username: string) => isoGetUidFromUsername(get, username);

export const getDataKeyValue = <T2 extends keyof FirebaseWrapperDatabase>({
  dataType,
  dataKey,
}: {
  dataType: T2;
  dataKey: string;
}) => isoGetDataKeyValue<T2>(get, dataType, dataKey);

export const getDataTypeValue = <T2 extends keyof FirebaseWrapperDatabase>({ dataType }: { dataType: T2 }) =>
  isoGetDataTypeValue<T2>(get, dataType);

export const getAllConnectionTypesKeys = <T2 extends keyof FirebaseWrapperDatabase>({
  dataType,
  dataKey,
}: {
  dataType: T2;
  dataKey: string;
}) => isoGetAllConnectionTypesKeys(get, dataType, dataKey);

export const getConnectionTypeKeys = <
  T2 extends keyof FirebaseWrapperDatabase,
  T22 extends keyof FirebaseWrapperDatabase
>({
  parentType,
  parentKey,
  dataType,
}: {
  parentType: T2;
  parentKey: string;
  dataType: T22;
}) => isoGetConnectionTypeKeys({ get, parentType, parentKey, dataType });

export const getConnectionTypeData = <
  T2 extends keyof FirebaseWrapperDatabase,
  T22 extends keyof FirebaseWrapperDatabase
>({
  parentType,
  parentKey,
  dataType,
}: {
  parentType: T2;
  parentKey: string;
  dataType: T22;
}) =>
  isoGetConnectionTypeData({
    get,
    parentType,
    parentKey,
    dataType,
  });

export const getUserTypeKeys = <T2 extends keyof FirebaseWrapperDatabase>({
  dataType,
  uid,
}: {
  dataType: T2;
  uid: string;
}) => isoGetUserTypeKeys({ get, dataType, uid });

export const getUserTypeData = <T2 extends keyof FirebaseWrapperDatabase>({
  dataType,
  uid,
}: {
  dataType: T2;
  uid: string;
}) => isoGetUserTypeData({ get, dataType, uid });

export const getPublicTypeData = <T2 extends keyof FirebaseWrapperDatabase>({ dataType }: { dataType: T2 }) =>
  isoGetPublicTypeData({ get, dataType });

export const getDataKeyFieldValue = <T2 extends keyof FirebaseWrapperDatabase, T3 extends keyof Data<T2>>({
  dataType,
  dataKey,
  field,
}: Omit<GetDataKeyValueParams<T2>, "get"> & { field: T3 }) =>
  isoGetDataKeyFieldValue<T2, T3>({ get, dataType, dataKey, field });

export const createData = <T2 extends keyof FirebaseWrapperDatabase>({
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
  now = Date.now(),
  imitateClientUpdate,
}: Omit<CreateDataParams<T2>, "update"> & {
  dataType: string;
  dataKey: string;
  imitateClientUpdate?: boolean;
}) =>
  isoCreateData({
    update: imitateClientUpdate ? firebaseWrapperUpdate : update,
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

export const updateData = <T2 extends keyof FirebaseWrapperDatabase>({
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
  ownershipAccess,
  now,
  imitateClientUpdate,
}: Omit<UpdateDataParams<T2>, "update" | "get"> & {
  imitateClientUpdate?: boolean;
}) =>
  isoUpdateData({
    update: imitateClientUpdate ? firebaseWrapperUpdate : update,
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
    ownershipAccess,
    now,
  });

export const upsertData = <T2 extends keyof FirebaseWrapperDatabase>({
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
  includeUpdatedAt,
  makeGetRequests,
  imitateClientUpdate,
}: Omit<CreateDataParams<T2>, "update"> &
  Omit<UpdateDataParams<T2>, "update" | "get"> & {
    imitateClientUpdate?: boolean;
  }) =>
  isoUpsertData({
    update: imitateClientUpdate ? firebaseWrapperUpdate : update,
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
    ownershipAccess,
    includeUpdatedAt,
    makeGetRequests,
  });

export const queryData = <T2 extends keyof FirebaseWrapperDatabase, T3 extends keyof Data<T2>>({
  dataType,
  childKey,
  queryValue,
  limit,
}: Omit<QueryDataParams<T2, T3>, "queryOrderByChildEqualTo">) =>
  isoQueryData({
    queryOrderByChildEqualTo,
    dataType,
    childKey,
    queryValue,
    limit,
  });

export const firebaseWrapperIncrement = <T2 extends keyof FirebaseWrapperDatabase, T3 extends keyof Data<T2>>({
  dataType,
  dataKey,
  field,
  delta,
  makeGetRequests,
  makeConnectionsRequests,
  makeOwnersRequests,
}: Omit<FirebaseWrapperIncrement<T2, T3>, "get" | "update">) =>
  isoFirebaseWrapperIncrement({
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

export const firebaseWrapperTransactionWithCb = <T2 extends keyof FirebaseWrapperDatabase, T3 extends keyof Data<T2>>({
  cb,
  dataType,
  dataKey,
  field,
  makeGetRequests,
  makeConnectionsRequests,
  makeOwnersRequests,
}: Omit<FirebaseWrapperTransactionWithCbParams<T2, T3>, "get" | "update" | "transactionWithCb">) =>
  isoFirebaseWrapperTransactionWithCb({
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

export const removeData = <T2 extends keyof FirebaseWrapperDatabase>({
  updateObject,
  skipUpdate,
  dataType,
  dataKey,
  imitateClientUpdate,
}: Omit<RemoveDataKeyParams<T2>, "update" | "get"> & {
  imitateClientUpdate?: boolean;
}) =>
  isoRemoveData({
    update: imitateClientUpdate ? firebaseWrapperUpdate : update,
    get,
    updateObject,
    skipUpdate,
    dataType,
    dataKey,
  });

/** ! CAREFUL */
export const removeDataType = <T2 extends keyof FirebaseWrapperDatabase>(dataType: T2) =>
  isoRemoveDataType({
    update,
    get,
    dataType,
  });

export const getOwners = <T2 extends keyof FirebaseWrapperDatabase>(dataType: T2, dataKey: string) =>
  isoGetOwners(get, dataType, dataKey);

export const getOwner = <T2 extends keyof FirebaseWrapperDatabase>({
  dataType,
  dataKey,
  uid,
}: Omit<GetOwnerDataParams<T2>, "get">) => isoGetOwner({ get, dataType, dataKey, uid });

export const addOwners = async <T2 extends keyof FirebaseWrapperDatabase>({
  dataType,
  dataKey,
  updateObject,
  skipUpdate,
  now = Date.now(),
  owners,
  imitateClientUpdate,
}: Pick<CreateDataParams<T2>, "dataType" | "dataKey" | "owners" | "updateObject" | "skipUpdate" | "now"> & {
  imitateClientUpdate?: boolean;
}) =>
  isoAddOwners({
    update: imitateClientUpdate ? firebaseWrapperUpdate : update,
    dataType,
    dataKey,
    updateObject,
    skipUpdate,
    owners,
    now,
  });

export const removeOwners = async <T2 extends keyof FirebaseWrapperDatabase>({
  dataType,
  dataKey,
  updateObject,
  skipUpdate,
  owners,
}: Pick<CreateDataParams<T2>, "dataType" | "dataKey" | "owners" | "updateObject" | "skipUpdate">) =>
  isoRemoveOwners({
    update,
    dataType,
    dataKey,
    updateObject,
    skipUpdate,
    owners,
  });

export const createConnection = async <T2 extends keyof FirebaseWrapperDatabase>({
  updateObject,
  skipUpdate,
  now = Date.now(),
  connections,
  imitateClientUpdate,
}: Omit<ModifyConnectionsType<T2>, "update"> & {
  imitateClientUpdate?: boolean;
}) =>
  isoCreateConnections({
    update: imitateClientUpdate ? firebaseWrapperUpdate : update,
    updateObject,
    skipUpdate,
    connections,
    now,
  });

export const removeConnection = <T2 extends keyof FirebaseWrapperDatabase>({
  connections,
  skipUpdate,
  updateObject,
}: Pick<ModifyConnectionsType<T2>, "skipUpdate" | "updateObject" | "connections">) =>
  isoRemoveConnections({ update, connections, skipUpdate, updateObject });

export const trackEvent = (eventName: string, metadata?: object) =>
  isoTrackEvent(push, eventName, "firebase-admin", metadata);

export const changeDataKey = async <
  T2 extends keyof FirebaseWrapperDatabase,
  T22 extends keyof FirebaseWrapperDatabase
>({
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
