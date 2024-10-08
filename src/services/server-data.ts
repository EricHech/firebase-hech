import type {
  AppUser,
  GetOwnerDataParams,
  FirebaseHechDatabase,
  FirebaseHechIncrement,
  FirebaseHechTransactionWithCbParams,
  ConnectionDataListDatabase,
  CreateConnectionsType,
  RemoveConnectionsType,
  CreateDataParams,
  GetDataKeyValueParams,
  UpdateDataParams,
  RemoveDataKeyParams,
  Data,
  QueryDataParams,
  User,
} from "./types";
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
  isoCreateUser,
  isoTrackEvent,
  isoGetUser,
  isoAddOwners,
  isoRemoveOwners,
  isoGetUserTypeKeys,
  isoGetUidFromUsername,
  isoFirebaseHechTransactionWithCb,
  isoFirebaseHechIncrement,
  isoGetUnverifiedUser,
  isoGetUserTypeData,
  isoGetPublicTypeData,
  isoGetOwner,
} from "./data";
import { get, push, queryOrderByChildEqualTo, firebaseHechUpdate, update, transactionWithCb } from "./admin";

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
}: {
  dataType: T2;
  dataKey: string;
}) => isoGetDataKeyValue<T2>(get, dataType, dataKey);

export const getDataTypeValue = <T2 extends keyof FirebaseHechDatabase>({ dataType }: { dataType: T2 }) =>
  isoGetDataTypeValue<T2>(get, dataType);

export const getAllConnectionTypesKeys = <T2 extends keyof ConnectionDataListDatabase>({
  dataType,
  dataKey,
}: {
  dataType: T2;
  dataKey: string;
}) => isoGetAllConnectionTypesKeys(get, dataType, dataKey);

export const getConnectionTypeKeys = <
  T2 extends keyof ConnectionDataListDatabase,
  T22 extends keyof ConnectionDataListDatabase[T2][string]
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
  T2 extends keyof ConnectionDataListDatabase,
  T22 extends keyof ConnectionDataListDatabase[T2][string] & keyof FirebaseHechDatabase
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

export const getDataKeyFieldValue = <T2 extends keyof FirebaseHechDatabase, T3 extends keyof Data<T2>>({
  dataType,
  dataKey,
  field,
}: Omit<GetDataKeyValueParams<T2>, "get"> & { field: T3 }) =>
  isoGetDataKeyFieldValue<T2, T3>({ get, dataType, dataKey, field });

export const createData = <
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
  imitateClientUpdate,
}: Omit<CreateDataParams<T2, ParentT, ParentK, ChildT, ChildK>, "update"> & {
  dataType: string;
  dataKey: string;
  imitateClientUpdate?: boolean;
}) =>
  isoCreateData({
    update: imitateClientUpdate ? firebaseHechUpdate : update,
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

export const updateData = <
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
  imitateClientUpdate,
}: Omit<UpdateDataParams<T2, ParentT, ParentK, ChildT, ChildK>, "update" | "get"> & {
  imitateClientUpdate?: boolean;
}) =>
  isoUpdateData({
    update: imitateClientUpdate ? firebaseHechUpdate : update,
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

export const upsertData = <
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
  imitateClientUpdate,
}: Omit<CreateDataParams<T2, ParentT, ParentK, ChildT, ChildK>, "update"> &
  Omit<UpdateDataParams<T2, ParentT, ParentK, ChildT, ChildK>, "update" | "get"> & {
    imitateClientUpdate?: boolean;
  }) =>
  isoUpsertData({
    update: imitateClientUpdate ? firebaseHechUpdate : update,
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

export const queryData = <T2 extends keyof FirebaseHechDatabase, T3 extends keyof Data<T2>>({
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

export const removeData = <T2 extends keyof FirebaseHechDatabase>({
  updateObject,
  skipUpdate,
  dataType,
  dataKey,
  imitateClientUpdate,
}: Omit<RemoveDataKeyParams<T2>, "update" | "get"> & {
  imitateClientUpdate?: boolean;
}) =>
  isoRemoveData({
    update: imitateClientUpdate ? firebaseHechUpdate : update,
    get,
    updateObject,
    skipUpdate,
    dataType,
    dataKey,
  });

/** ! CAREFUL */
export const removeDataType = <T2 extends keyof FirebaseHechDatabase>(dataType: T2) =>
  isoRemoveDataType({
    update,
    get,
    dataType,
  });

export const getOwners = <T2 extends keyof FirebaseHechDatabase>(dataType: T2, dataKey: string) =>
  isoGetOwners(get, dataType, dataKey);

export const getOwner = <T2 extends keyof FirebaseHechDatabase>({
  dataType,
  dataKey,
  uid,
}: Omit<GetOwnerDataParams<T2>, "get">) => isoGetOwner({ get, dataType, dataKey, uid });

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
  imitateClientUpdate,
}: Pick<
  CreateDataParams<T2, ParentT, ParentK, ChildT, ChildK>,
  "dataType" | "dataKey" | "owners" | "updateObject" | "skipUpdate" | "now"
> & {
  imitateClientUpdate?: boolean;
}) =>
  isoAddOwners({
    update: imitateClientUpdate ? firebaseHechUpdate : update,
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
    update,
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
  imitateClientUpdate,
}: Omit<CreateConnectionsType<ParentT, ParentK, ChildT, ChildK>, "update"> & {
  imitateClientUpdate?: boolean;
}) =>
  isoCreateConnections({
    update: imitateClientUpdate ? firebaseHechUpdate : update,
    updateObject,
    skipUpdate,
    connections,
    now,
  });

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

export const trackEvent = (eventName: string, metadata?: object) =>
  isoTrackEvent(push, eventName, "firebase-admin", metadata);
