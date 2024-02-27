import type { AppUser, SoilDatabase, SoilIncrement, SoilTransactionWithCbParams } from "../services/types";
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
  isoGetUsername,
  isoSoilTransactionWithCb,
  isoSoilIncrement,
  isoGetUnverifiedUser,
  isoGetUserTypeData,
} from "./data";
import { get, push, queryOrderByChildEqualTo, soilUpdate, update, transactionWithCb } from "./admin";
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
}: Pick<CreateDataParams<keyof SoilDatabase>, "updateObject" | "skipUpdate" | "now"> & {
  user: Mandate<User, "uid">;
  appUser: AppUser;
  createUnverifiedUser: boolean;
}) => isoCreateUser({ update, user, appUser, updateObject, skipUpdate, now, createUnverifiedUser });

export const getUnverifiedUser = (uid: string) => isoGetUnverifiedUser(uid, get);

export const updateUser = (uid: string, u: Partial<User>) => isoUpdateUser(update, uid, u);

export const getUser = (uid: string) => isoGetUser(get, uid);

export const getUsername = (username: string) => isoGetUsername(get, username);

export const getDataKeyValue = <T2 extends keyof SoilDatabase>(dataType: T2, dataKey: string) =>
  isoGetDataKeyValue<T2>(get, dataType, dataKey);

export const getDataTypeValue = <T2 extends keyof SoilDatabase>(dataType: T2) => isoGetDataTypeValue<T2>(get, dataType);

export const getAllConnectionTypesKeys = <T2 extends keyof SoilDatabase>(dataType: T2, dataKey: string) =>
  isoGetAllConnectionTypesKeys(get, dataType, dataKey);

export const getConnectionTypeKeys = <T2 extends keyof SoilDatabase, T22 extends keyof SoilDatabase>({
  parentType,
  parentKey,
  dataType,
}: {
  parentType: T2;
  parentKey: string;
  dataType: T22;
}) => isoGetConnectionTypeKeys({ get, parentType, parentKey, dataType });

export const getConnectionTypeData = <T2 extends keyof SoilDatabase, T22 extends keyof SoilDatabase>({
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

export const getUserTypeKeys = <T2 extends keyof SoilDatabase, T22 extends keyof SoilDatabase>({
  dataType,
  uid,
}: {
  dataType: T2;
  uid: string;
}) => isoGetUserTypeKeys({ get, dataType, uid });

export const getUserTypeData = <T2 extends keyof SoilDatabase, T22 extends keyof SoilDatabase>({
  dataType,
  uid,
}: {
  dataType: T2;
  uid: string;
}) => isoGetUserTypeData({ get, dataType, uid });

export const getDataKeyFieldValue = <T2 extends keyof SoilDatabase, T3 extends keyof Data<T2>>({
  dataType,
  dataKey,
  field,
}: Omit<GetDataKeyValueParams<T2>, "get"> & { field: T3 }) =>
  isoGetDataKeyFieldValue<T2, T3>({ get, dataType, dataKey, field });

export const createData = <T2 extends keyof SoilDatabase>({
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
    ownershipAccess,
    now,
  });

export const updateData = <T2 extends keyof SoilDatabase>({
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
    ownershipAccess,
    now,
  });

export const upsertData = <T2 extends keyof SoilDatabase>({
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
    ownershipAccess,
    includeUpdatedAt,
    makeGetRequests,
  });

export const queryData = <T2 extends keyof SoilDatabase, T3 extends keyof Data<T2>>({
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

export const removeData = <T2 extends keyof SoilDatabase>({
  updateObject,
  skipUpdate,
  dataType,
  dataKey,
  imitateClientUpdate,
}: Omit<RemoveDataKeyParams<T2>, "update" | "get"> & {
  imitateClientUpdate?: boolean;
}) =>
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

export const addOwners = async <T2 extends keyof SoilDatabase>({
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
    update: imitateClientUpdate ? soilUpdate : update,
    dataType,
    dataKey,
    updateObject,
    skipUpdate,
    owners,
    now,
  });

export const removeOwners = async <T2 extends keyof SoilDatabase>({
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

export const createConnection = async <T2 extends keyof SoilDatabase>({
  updateObject,
  skipUpdate,
  now = Date.now(),
  connections,
  imitateClientUpdate,
}: Omit<ModifyConnectionsType<T2>, "update"> & {
  imitateClientUpdate?: boolean;
}) =>
  isoCreateConnections({
    update: imitateClientUpdate ? soilUpdate : update,
    updateObject,
    skipUpdate,
    connections,
    now,
  });

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
