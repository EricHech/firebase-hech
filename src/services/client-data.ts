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
  isoCreateConnections,
  isoUpdateUser,
  isoGetDataTypeValue,
  isoGetConnectionTypeData,
  isoGetAllConnectionTypesKeys,
  isoGetDataKeyFieldValue,
  isoRemoveConnections,
  isoGetConnectionTypeKeys,
  isoCreateUser,
  isoTrackEvent,
  isoGetUser,
  isoAddOwners,
  isoRemoveOwners,
  isoGetUidFromUsername,
  isoFirebaseHechTransactionWithCb,
  isoFirebaseHechIncrement,
  isoGetUserTypeKeys,
  isoGetUnverifiedUser,
  isoGetUserTypeData,
  isoGetPublicTypeData,
} from "./data";
import { get, update, firebaseHechUpdate, onValue, push, transactionWithCb } from "./firebase";

// Types
import type {
  User,
  CreateDataParams,
  GetDataKeyValueParams,
  UpdateDataParams,
  RemoveDataKeyParams,
  OnDataValueParams,
  GetOwnerDataParams,
  CreateConnectionsType,
  RemoveConnectionsType,
  AppUser,
  FirebaseHechTransactionWithCbParams,
  Data,
  FirebaseHechIncrement,
  ConnectionDataListDatabase,
  FirebaseHechDatabase,
} from "./types";

export const createUser = <
  ParentT extends keyof ConnectionDataListDatabase,
  ParentK extends keyof ConnectionDataListDatabase[ParentT],
  ChildT extends keyof ConnectionDataListDatabase[ParentT][ParentK],
  ChildK extends keyof ConnectionDataListDatabase[ParentT][ParentK][ChildT]
>({
  user,
  appUser,
  updateObject = {},
  skipUpdate,
  now,
  createUnverifiedUser,
}: Pick<CreateDataParams<"appUser", ParentT, ParentK, ChildT, ChildK>, "updateObject" | "skipUpdate" | "now"> & {
  user: Mandate<User, "uid">;
  appUser: AppUser;
  createUnverifiedUser: boolean;
}) => isoCreateUser({ update, user, appUser, updateObject, skipUpdate, now, createUnverifiedUser });

export const getUnverifiedUser = (uid: string) => isoGetUnverifiedUser(uid, get);

export const updateUser = (uid: string, u: Partial<User>) => isoUpdateUser(update, uid, u);

export const getUser = (uid: string) => isoGetUser(get, uid);

export const getUidFromUsername = (username: string) => isoGetUidFromUsername(get, username);

export const getDataKeyValue = <T2 extends keyof FirebaseHechDatabase>({
  dataType,
  dataKey,
}: Omit<GetDataKeyValueParams<T2>, "get">) => isoGetDataKeyValue(get, dataType, dataKey);

export const getDataKeyFieldValue = <T2 extends keyof FirebaseHechDatabase, T3 extends keyof FirebaseHechDatabase[T2]>({
  dataType,
  dataKey,
  field,
}: {
  dataType: T2;
  dataKey: string;
  field: T3;
}) => isoGetDataKeyFieldValue({ get, dataType, dataKey, field });

export const getDataTypeValue = <T2 extends keyof FirebaseHechDatabase>({
  dataType,
}: Omit<GetDataKeyValueParams<T2>, "get" | "dataKey">) => isoGetDataTypeValue(get, dataType);

export const onDataKeyValue = <T2 extends keyof FirebaseHechDatabase>({
  dataType,
  dataKey,
  cb,
}: Omit<OnDataValueParams<T2>, "onValue">) => isoOnDataKeyValue({ onValue, dataType, dataKey, cb });

export const getUserTypeKeys = <T2 extends keyof FirebaseHechDatabase>({
  dataType,
  uid,
}: {
  dataType: T2;
  uid: string;
}) => isoGetUserTypeKeys({ get, dataType, uid });

export const getUserTypeData = <T2 extends keyof FirebaseHechDatabase>({
  dataType,
  uid,
}: {
  dataType: T2;
  uid: string;
}) => isoGetUserTypeData({ get, dataType, uid });

export const getPublicTypeData = <T2 extends keyof FirebaseHechDatabase>({ dataType }: { dataType: T2 }) =>
  isoGetPublicTypeData({ get, dataType });

export const createData = async <
  T2 extends keyof FirebaseHechDatabase,
  ParentT extends keyof ConnectionDataListDatabase,
  ParentK extends keyof ConnectionDataListDatabase[ParentT],
  ChildT extends keyof ConnectionDataListDatabase[ParentT][ParentK],
  ChildK extends keyof ConnectionDataListDatabase[ParentT][ParentK][ChildT]
>({
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
  publicNow,
  ownershipNow,
  connectionNow,
}: Omit<CreateDataParams<T2, ParentT, ParentK, ChildT, ChildK>, "update">) =>
  isoCreateData({
    update: firebaseHechUpdate,
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
    publicNow,
    ownershipNow,
    connectionNow,
  });

export const updateData = async <
  T2 extends keyof FirebaseHechDatabase,
  ParentT extends keyof ConnectionDataListDatabase,
  ParentK extends keyof ConnectionDataListDatabase[ParentT],
  ChildT extends keyof ConnectionDataListDatabase[ParentT][ParentK],
  ChildK extends keyof ConnectionDataListDatabase[ParentT][ParentK][ChildT]
>({
  updateObject,
  skipUpdate,
  dataType,
  dataKey,
  data,
  owners,
  connections,
  publicAccess,
  connectionAccess,
  ownershipAccess,
  now,
  publicNow,
  ownershipNow,
  connectionNow,
  includeUpdatedAt,
  makeGetRequests,
  makeConnectionsRequests,
  makeOwnersRequests,
}: Omit<
  UpdateDataParams<T2, ParentT, ParentK, ChildT, ChildK>,
  "update" | "get" | "updateDataHandler" | "updateListHandler"
>) =>
  isoUpdateData({
    update: firebaseHechUpdate,
    get,
    updateObject,
    skipUpdate,
    dataType,
    dataKey,
    data,
    owners,
    connections,
    publicAccess,
    connectionAccess,
    ownershipAccess,
    now,
    publicNow,
    ownershipNow,
    connectionNow,
    includeUpdatedAt,
    makeGetRequests,
    makeConnectionsRequests,
    makeOwnersRequests,
  });

export const upsertData = async <
  T2 extends keyof FirebaseHechDatabase,
  ParentT extends keyof ConnectionDataListDatabase,
  ParentK extends keyof ConnectionDataListDatabase[ParentT],
  ChildT extends keyof ConnectionDataListDatabase[ParentT][ParentK],
  ChildK extends keyof ConnectionDataListDatabase[ParentT][ParentK][ChildT]
>({
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
  publicNow,
  ownershipNow,
  connectionNow,
  includeUpdatedAt,
  makeGetRequests,
  makeConnectionsRequests,
  makeOwnersRequests,
}: Omit<
  CreateDataParams<T2, ParentT, ParentK, ChildT, ChildK> & UpdateDataParams<T2, ParentT, ParentK, ChildT, ChildK>,
  "update" | "get"
>) =>
  isoUpsertData({
    update: firebaseHechUpdate,
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
    now,
    publicNow,
    ownershipNow,
    connectionNow,
    includeUpdatedAt,
    makeGetRequests,
    makeConnectionsRequests,
    makeOwnersRequests,
  });

export const addOwners = async <
  T2 extends keyof FirebaseHechDatabase,
  ParentT extends keyof ConnectionDataListDatabase,
  ParentK extends keyof ConnectionDataListDatabase[ParentT],
  ChildT extends keyof ConnectionDataListDatabase[ParentT][ParentK],
  ChildK extends keyof ConnectionDataListDatabase[ParentT][ParentK][ChildT]
>({
  dataType,
  dataKey,
  updateObject,
  skipUpdate,
  now = Date.now(),
  owners,
}: Pick<
  CreateDataParams<T2, ParentT, ParentK, ChildT, ChildK>,
  "dataType" | "dataKey" | "owners" | "updateObject" | "skipUpdate" | "now"
>) =>
  isoAddOwners({
    update: firebaseHechUpdate,
    dataType,
    dataKey,
    updateObject,
    skipUpdate,
    owners,
    now,
  });

export const removeOwners = async <
  T2 extends keyof FirebaseHechDatabase,
  ParentT extends keyof ConnectionDataListDatabase,
  ParentK extends keyof ConnectionDataListDatabase[ParentT],
  ChildT extends keyof ConnectionDataListDatabase[ParentT][ParentK],
  ChildK extends keyof ConnectionDataListDatabase[ParentT][ParentK][ChildT]
>({
  dataType,
  dataKey,
  updateObject,
  skipUpdate,
  owners,
}: Pick<
  CreateDataParams<T2, ParentT, ParentK, ChildT, ChildK>,
  "dataType" | "dataKey" | "owners" | "updateObject" | "skipUpdate"
>) =>
  isoRemoveOwners({
    update: firebaseHechUpdate,
    dataType,
    dataKey,
    updateObject,
    skipUpdate,
    owners,
  });

export const createConnection = async <
  ParentT extends keyof ConnectionDataListDatabase & keyof FirebaseHechDatabase,
  ParentK extends keyof ConnectionDataListDatabase[ParentT],
  ChildT extends keyof ConnectionDataListDatabase[ParentT][ParentK],
  ChildK extends keyof ConnectionDataListDatabase[ParentT][ParentK][ChildT]
>({
  updateObject,
  skipUpdate,
  now = Date.now(),
  connections,
}: Omit<CreateConnectionsType<ParentT, ParentK, ChildT, ChildK>, "update">) =>
  isoCreateConnections({
    update: firebaseHechUpdate,
    updateObject,
    skipUpdate,
    connections,
    now,
  });

export const getAllConnectionTypesKeys = <T2 extends keyof ConnectionDataListDatabase>(dataType: T2, dataKey: string) =>
  isoGetAllConnectionTypesKeys(get, dataType, dataKey);

export const getConnectionTypeKeys = <
  ParentT extends keyof ConnectionDataListDatabase,
  ParentK extends keyof ConnectionDataListDatabase[ParentT],
  ChildT extends keyof ConnectionDataListDatabase[ParentT][ParentK]
>({
  parentType,
  parentKey,
  dataType,
}: {
  parentType: ParentT;
  parentKey: ParentK;
  dataType: ChildT;
}) =>
  isoGetConnectionTypeKeys({
    get,
    parentType,
    parentKey,
    dataType,
  });

export const getConnectionTypeData = <
  ParentT extends keyof ConnectionDataListDatabase,
  ParentK extends keyof ConnectionDataListDatabase[ParentT],
  ChildT extends keyof ConnectionDataListDatabase[ParentT][ParentK] & keyof FirebaseHechDatabase
>({
  parentType,
  parentKey,
  dataType,
}: {
  parentType: ParentT;
  parentKey: ParentK;
  dataType: ChildT;
}) =>
  isoGetConnectionTypeData({
    get,
    parentType,
    parentKey,
    dataType,
  });

export const firebaseHechIncrement = <
  T2 extends keyof FirebaseHechDatabase,
  T3 extends keyof Data<T2>,
  ParentT extends keyof ConnectionDataListDatabase,
  ParentK extends keyof ConnectionDataListDatabase[ParentT],
  ChildT extends keyof ConnectionDataListDatabase[ParentT][ParentK],
  ChildK extends keyof ConnectionDataListDatabase[ParentT][ParentK][ChildT]
>({
  dataType,
  dataKey,
  field,
  delta,
  makeGetRequests,
  makeConnectionsRequests,
  makeOwnersRequests,
}: Omit<FirebaseHechIncrement<T2, T3, ParentT, ParentK, ChildT, ChildK>, "get" | "update">) =>
  isoFirebaseHechIncrement({
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

export const firebaseHechTransactionWithCb = <
  T2 extends keyof FirebaseHechDatabase,
  T3 extends keyof Data<T2>,
  ParentT extends keyof ConnectionDataListDatabase,
  ParentK extends keyof ConnectionDataListDatabase[ParentT],
  ChildT extends keyof ConnectionDataListDatabase[ParentT][ParentK],
  ChildK extends keyof ConnectionDataListDatabase[ParentT][ParentK][ChildT]
>({
  cb,
  dataType,
  dataKey,
  field,
  makeGetRequests,
  makeConnectionsRequests,
  makeOwnersRequests,
}: Omit<
  FirebaseHechTransactionWithCbParams<T2, T3, ParentT, ParentK, ChildT, ChildK>,
  "get" | "update" | "transactionWithCb"
>) =>
  isoFirebaseHechTransactionWithCb({
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

export const removeData = async <T2 extends keyof FirebaseHechDatabase>({
  updateObject,
  skipUpdate,
  dataType,
  dataKey,
}: Omit<RemoveDataKeyParams<T2>, "update" | "get">) =>
  isoRemoveData({
    update: firebaseHechUpdate,
    get,
    updateObject,
    skipUpdate,
    dataType,
    dataKey,
  });

export const getOwners = <T2 extends keyof FirebaseHechDatabase>(dataType: T2, dataKey: string) =>
  isoGetOwners(get, dataType, dataKey);

export const getOwner = <T2 extends keyof FirebaseHechDatabase>({
  dataType,
  dataKey,
  uid,
}: Omit<GetOwnerDataParams<T2>, "get">) => isoGetOwner({ get, dataType, dataKey, uid });

export const getAdminValue = (uid: string) => isoGetAdminValue(get, uid);

export const onUserValue = (uid: string, cb: (user: Nullable<Mandate<User, "uid">>) => void) =>
  isoOnUserValue(onValue, uid, cb);

export const removeConnection = <
  ParentT extends keyof ConnectionDataListDatabase & keyof FirebaseHechDatabase,
  ParentK extends keyof ConnectionDataListDatabase[ParentT],
  ChildT extends keyof ConnectionDataListDatabase[ParentT][ParentK],
  ChildK extends keyof ConnectionDataListDatabase[ParentT][ParentK][ChildT]
>({
  connections,
  skipUpdate,
  updateObject,
}: Pick<RemoveConnectionsType<ParentT, ParentK, ChildT, ChildK>, "skipUpdate" | "updateObject" | "connections">) =>
  isoRemoveConnections({ update, connections, skipUpdate, updateObject });

export const trackEvent = (eventName: string, nonAdminUid: Maybe<string>, metadata?: object) =>
  isoTrackEvent(push, eventName, nonAdminUid || "firebase-admin", metadata);
