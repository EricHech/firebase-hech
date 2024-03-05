import { increment } from "firebase/database";

// Helpers
import { createGetUpdateObjectFunction, sleep } from "../utils";

// Constants
import { PATHS } from "./paths";

// Types
import type {
  Data,
  User,
  DataList,
  RemoveDataKeyParams,
  CreateDataParams,
  UpdateDataParams,
  GetFunction,
  OnDataValueParams,
  GetOwnerDataParams,
  QueryDataParams,
  ModifyConnectionsType,
  TrackingData,
  Connections,
  ChangeDataKey,
  UpdateObject,
} from "./types";
import type {
  AfterCollisionFreeUpdateHandler,
  AppUser,
  SoilDatabase,
  SoilIncrement,
  SoilTransactionWithCbParams,
} from "./types";
import { firebaseStorageDelete } from "./firebase";

/*
 █████╗ ██╗   ██╗████████╗██╗  ██╗
██╔══██╗██║   ██║╚══██╔══╝██║  ██║
███████║██║   ██║   ██║   ███████║
██╔══██║██║   ██║   ██║   ██╔══██║
██║  ██║╚██████╔╝   ██║   ██║  ██║
╚═╝  ╚═╝ ╚═════╝    ╚═╝   ╚═╝  ╚═╝
*/
export const isoCreateUser = ({
  user,
  appUser,
  update,
  updateObject = {},
  skipUpdate,
  now = Date.now(),
  createUnverifiedUser,
}: Pick<CreateDataParams<keyof SoilDatabase>, "update" | "updateObject" | "skipUpdate" | "now"> & {
  user: Mandate<User, "uid">;
  appUser: AppUser;
  createUnverifiedUser: boolean;
}) => {
  if (createUnverifiedUser) {
    updateObject[PATHS.unverifiedUsers(user.uid)] = { user, appUser, createdAt: now, updatedAt: now };

    return skipUpdate ? updateObject : update("/", updateObject, true).then(() => updateObject);
  } else {
    updateObject[PATHS.user(user.uid)] = user;
    if (appUser.username) updateObject[PATHS.username(appUser.username)] = user.uid;

    return isoCreateData({
      update,
      dataType: "appUser",
      dataKey: user.uid,
      data: appUser,
      owners: [user.uid],
      publicAccess: true,
      updateObject,
      skipUpdate,
      now,
    });
  }
};

export const isoGetUnverifiedUser = async (uid: string, get: GetFunction) =>
  get<{ user: Mandate<User, "uid">; appUser: AppUser }>(PATHS.unverifiedUsers(uid));

export const isoUpdateUser = (
  update: <T extends object>(path: string, data: T) => Promise<void>,
  uid: string,
  u: Partial<User>
) => update(PATHS.user(uid), u);

export const isoGetUser = (get: GetFunction, uid: string) => get<User>(PATHS.user(uid));

export const isoGetUidFromUsername = (get: GetFunction, username: string) => get<string>(PATHS.username(username));

/*
 ██████╗ ███╗   ██╗    ██╗ ██████╗ ███████╗███████╗    ██╗   ██╗ █████╗ ██╗     ██╗   ██╗███████╗
██╔═══██╗████╗  ██║   ██╔╝██╔═══██╗██╔════╝██╔════╝    ██║   ██║██╔══██╗██║     ██║   ██║██╔════╝
██║   ██║██╔██╗ ██║  ██╔╝ ██║   ██║█████╗  █████╗      ██║   ██║███████║██║     ██║   ██║█████╗
██║   ██║██║╚██╗██║ ██╔╝  ██║   ██║██╔══╝  ██╔══╝      ╚██╗ ██╔╝██╔══██║██║     ██║   ██║██╔══╝
╚██████╔╝██║ ╚████║██╔╝   ╚██████╔╝██║     ██║          ╚████╔╝ ██║  ██║███████╗╚██████╔╝███████╗
 ╚═════╝ ╚═╝  ╚═══╝╚═╝     ╚═════╝ ╚═╝     ╚═╝           ╚═══╝  ╚═╝  ╚═╝╚══════╝ ╚═════╝ ╚══════╝
*/
export const isoOnUserValue = (
  onValue: (path: string, cb: (val: Nullable<User>) => void) => VoidFunction,
  uid: string,
  cb: (user: Nullable<Mandate<User, "uid">>) => void
) => onValue(PATHS.user(uid), (user) => cb(user ? { ...user, uid } : null));

export const isoOnDataKeyValue = <T2 extends keyof SoilDatabase>({
  onValue,
  dataType,
  dataKey,
  cb,
}: OnDataValueParams<T2>) => onValue(PATHS.dataKey(dataType, dataKey), cb);

/*
 ██████╗ ███████╗████████╗
██╔════╝ ██╔════╝╚══██╔══╝
██║  ███╗█████╗     ██║
██║   ██║██╔══╝     ██║
╚██████╔╝███████╗   ██║
 ╚═════╝ ╚══════╝   ╚═╝
*/
/** DO NOT USE outside of strongly typed services */
export const isoGetAdminValue = (get: (path: string) => Promise<boolean | null>, uid: string) => get(PATHS.admin(uid));

export const isoGetDataKeyValue = <T2 extends keyof SoilDatabase>(get: GetFunction, dataType: T2, dataKey: string) =>
  get<Data<T2>>(PATHS.dataKey(dataType, dataKey));

export const isoGetDataTypeValue = <T2 extends keyof SoilDatabase>(get: GetFunction, dataType: T2) =>
  get<Record<string, Data<T2>>>(PATHS.dataType(dataType));

export const isoGetAllConnectionTypesKeys = <T2 extends keyof SoilDatabase>(
  get: GetFunction,
  parentType: T2,
  parentKey: string
) => get<DataList>(PATHS.connectionDataListKey(parentType, parentKey));

export const isoGetAllConnectionTypes = <T2 extends keyof SoilDatabase>(get: GetFunction, parentType: T2) =>
  get<Record<string, DataList>>(PATHS.connectionDataListType(parentType));

export const isoGetConnectionTypeKeys = <T2 extends keyof SoilDatabase, T22 extends keyof SoilDatabase>({
  get,
  parentType,
  parentKey,
  dataType,
}: {
  get: GetFunction;
  parentType: T2;
  parentKey: string;
  dataType: T22;
}) => get<DataList[T22]>(PATHS.connectionDataListConnectionType(parentType, parentKey, dataType));

export const isoGetConnectionTypeData = <T2 extends keyof SoilDatabase, T22 extends keyof SoilDatabase>({
  get,
  parentType,
  parentKey,
  dataType,
}: {
  get: GetFunction;
  parentType: T2;
  parentKey: string;
  dataType: T22;
}) =>
  isoGetConnectionTypeKeys({ get, parentType, parentKey, dataType }).then((dataList) =>
    Promise.all(
      Object.keys(dataList || {}).map((key) =>
        get<Data<T22> & { key: string }>(PATHS.dataKey(dataType, key)).then((d) => (d ? { ...d, key } : null))
      )
    )
  );

export const isoGetConnectionTypeConnectionsKeys = <T2 extends keyof SoilDatabase, T22 extends keyof SoilDatabase>({
  get,
  parentType,
  parentKey,
  dataType,
}: {
  get: GetFunction;
  parentType: T2;
  parentKey: string;
  dataType: T22;
}) =>
  isoGetConnectionTypeKeys({ get, parentType, parentKey, dataType }).then((dataList) =>
    Promise.all(Object.keys(dataList || {}).map((key) => isoGetAllConnectionTypesKeys(get, dataType, key)))
  );

export const isoGetUserTypeKeys = <T2 extends keyof SoilDatabase>({
  get,
  dataType,
  uid,
}: {
  get: GetFunction;
  dataType: T2;
  uid: string;
}) => get<DataList[T2]>(PATHS.userDataTypeList(uid, dataType));

export const isoGetUserTypeData = <T2 extends keyof SoilDatabase>({
  get,
  dataType,
  uid,
}: {
  get: GetFunction;
  dataType: T2;
  uid: string;
}) =>
  get<DataList[T2]>(PATHS.userDataTypeList(uid, dataType)).then((dataList) =>
    Promise.all(
      Object.keys(dataList || {}).map((key) =>
        get<Data<T2> & { key: string }>(PATHS.dataKey(dataType, key)).then((d) => (d ? { ...d, key } : null))
      )
    )
  );

export const isoGetPublicTypeData = <T2 extends keyof SoilDatabase>({
  get,
  dataType,
}: {
  get: GetFunction;
  dataType: T2;
}) =>
  get<DataList[T2]>(PATHS.publicDataTypeList(dataType)).then((dataList) =>
    Promise.all(
      Object.keys(dataList || {}).map((key) =>
        get<Data<T2> & { key: string }>(PATHS.dataKey(dataType, key)).then((d) => (d ? { ...d, key } : null))
      )
    )
  );

export const isoGetDataKeyFieldValue = <T2 extends keyof SoilDatabase, T3 extends keyof Data<T2>>({
  get,
  dataType,
  dataKey,
  field,
}: {
  get: GetFunction;
  dataType: T2;
  dataKey: string;
  field: T3;
}) => get<Data<T2>[T3]>(PATHS.dataKeyField(dataType, dataKey, field));

export const isoQueryData = <T2 extends keyof SoilDatabase, T3 extends keyof Data<T2>>({
  queryOrderByChildEqualTo,
  dataType,
  childKey,
  queryValue,
  limit,
}: QueryDataParams<T2, T3>) =>
  queryOrderByChildEqualTo<Data<T2>>({
    path: PATHS.dataType(dataType),
    childKey,
    limit,
    queryValue: String(queryValue),
  });

/*
 ██████╗ ██╗    ██╗███╗   ██╗███████╗██████╗ ███████╗
██╔═══██╗██║    ██║████╗  ██║██╔════╝██╔══██╗██╔════╝
██║   ██║██║ █╗ ██║██╔██╗ ██║█████╗  ██████╔╝███████╗
██║   ██║██║███╗██║██║╚██╗██║██╔══╝  ██╔══██╗╚════██║
╚██████╔╝╚███╔███╔╝██║ ╚████║███████╗██║  ██║███████║
 ╚═════╝  ╚══╝╚══╝ ╚═╝  ╚═══╝╚══════╝╚═╝  ╚═╝╚══════╝
*/
export const isoGetOwner = <T2 extends keyof SoilDatabase>({ get, dataType, dataKey, uid }: GetOwnerDataParams<T2>) =>
  get<boolean>(PATHS.ownerDataKeyUid(dataType, dataKey, uid));

export const isoGetOwners = (get: GetFunction, dataType: keyof SoilDatabase, dataKey: string) =>
  get<Record<string, number>>(PATHS.ownerDataKey(dataType, dataKey));

export const isoGetOwnersByType = (get: GetFunction, dataType: keyof SoilDatabase) =>
  get<Record<string, Record<string, number>>>(PATHS.ownerDataType(dataType));

export const isoAddOwners = <T2 extends keyof SoilDatabase>({
  update,
  updateObject = {},
  skipUpdate,
  dataType,
  dataKey,
  now = Date.now(),
  owners,
}: Pick<
  CreateDataParams<T2>,
  "dataType" | "dataKey" | "owners" | "update" | "updateObject" | "skipUpdate" | "now"
>) => {
  owners.forEach((uid) => {
    /* eslint-disable no-param-reassign */
    updateObject[PATHS.ownerDataKeyUid(dataType, dataKey, uid)] = now;
    updateObject[PATHS.userDataKeyList(uid, dataType, dataKey)] = now;
    /* eslint-enable no-param-reassign */
  });

  return skipUpdate ? updateObject : update("/", updateObject, true).then(() => updateObject);
};

export const isoRemoveOwners = <T2 extends keyof SoilDatabase>({
  update,
  updateObject = {},
  skipUpdate,
  dataType,
  dataKey,
  owners,
}: Pick<CreateDataParams<T2>, "dataType" | "dataKey" | "owners" | "update" | "updateObject" | "skipUpdate">) => {
  owners.forEach((uid) => {
    /* eslint-disable no-param-reassign */
    updateObject[PATHS.ownerDataKeyUid(dataType, dataKey, uid)] = null;
    updateObject[PATHS.userDataKeyList(uid, dataType, dataKey)] = null;
    /* eslint-enable no-param-reassign */
  });

  return skipUpdate ? updateObject : update("/", updateObject, true).then(() => updateObject);
};

/*
██████╗  █████╗ ████████╗ █████╗
██╔══██╗██╔══██╗╚══██╔══╝██╔══██╗
██║  ██║███████║   ██║   ███████║
██║  ██║██╔══██║   ██║   ██╔══██║
██████╔╝██║  ██║   ██║   ██║  ██║
╚═════╝ ╚═╝  ╚═╝   ╚═╝   ╚═╝  ╚═╝
*/
const ownersPrefix = `${PATHS.OWNERS}/`;
const publicDataListPrefix = `${PATHS.PUBLIC_DATA_LISTS}/`;
const dataPrefix = `${PATHS.DATA}/`;
export const isoSoilUpdate = async (
  soil: {
    update: (path: string, d: object, allowRootQuery?: boolean, isDelete?: boolean) => Promise<void>;
    set: <T>(path: string, data: T) => Promise<void>;
  },
  path: string,
  data: object,
  allowRootQuery: boolean = false,
  isDelete: boolean = false
) => {
  if (path === "/" && allowRootQuery) {
    const ownersUpdates = {} as Record<string, unknown>;
    const publicDataListUpdates = {} as Record<string, unknown>;
    const dataUpdates = {} as Record<string, unknown>;
    const allOtherUpdates = {} as Record<string, unknown>;
    Object.entries(data).forEach(([p, d]) => {
      if (p.startsWith(ownersPrefix)) ownersUpdates[p] = d;
      else if (p.startsWith(publicDataListPrefix)) publicDataListUpdates[p] = d;
      else if (p.startsWith(dataPrefix)) dataUpdates[p] = d;
      else allOtherUpdates[p] = d;
    });
    if (isDelete) {
      await Promise.all(Object.entries(allOtherUpdates).map(([key, val]) => soil.set(key, val)));
      await Promise.all(Object.entries(dataUpdates).map(([key, val]) => soil.set(key, val)));
      await Promise.all(Object.entries(publicDataListUpdates).map(([key, val]) => soil.set(key, val)));
      await Promise.all(Object.entries(ownersUpdates).map(([key, val]) => soil.set(key, val)));
    } else {
      await Promise.all(Object.entries(ownersUpdates).map(([key, val]) => soil.set(key, val)));
      await Promise.all(Object.entries(publicDataListUpdates).map(([key, val]) => soil.set(key, val)));
      await Promise.all(Object.entries(dataUpdates).map(([key, val]) => soil.set(key, val)));
      await Promise.all(Object.entries(allOtherUpdates).map(([key, val]) => soil.set(key, val)));
    }
  } else {
    await soil.update(path, data, allowRootQuery);
  }
};

export const isoCreateData = async <T2 extends keyof SoilDatabase>({
  update,
  updateObject = {},
  skipUpdate,
  dataType,
  dataKey,
  data,
  owners,
  publicAccess = false,
  connections,
  connectionAccess,
  ownershipAccess,
  now = Date.now(),
}: CreateDataParams<T2>) => {
  /* eslint-disable no-param-reassign */
  owners.forEach((uid) => {
    updateObject[PATHS.ownerDataKeyUid(dataType, dataKey, uid)] = now;
    updateObject[PATHS.userDataKeyList(uid, dataType, dataKey)] = now;
  });

  updateObject[PATHS.dataKey(dataType, dataKey)] = {
    ...data,
    createdAt: now,
    updatedAt: now,
    publicAccess,
    connectionAccess: connectionAccess || null,
    ownershipAccess: ownershipAccess || null,
  };

  connections?.forEach(({ type, key }) => {
    updateObject[PATHS.connectionDataListConnectionKey(dataType, dataKey, type, key)] = now;
    updateObject[PATHS.connectionDataListConnectionKey(type, key, dataType, dataKey)] = now;
  });

  if (publicAccess) updateObject[PATHS.publicDataKeyList(dataType, dataKey)] = now;
  /* eslint-enable no-param-reassign */

  return skipUpdate ? updateObject : update("/", updateObject, true).then(() => updateObject);
};

export const isoUpdateData = async <T2 extends keyof SoilDatabase>({
  update,
  get,
  updateObject = {},
  skipUpdate,
  dataType,
  dataKey,
  data,
  owners = [],
  connections,
  publicAccess,
  connectionAccess,
  ownershipAccess,
  now = Date.now(),
  includeUpdatedAt = true,
  makeGetRequests = true,
  makeConnectionsRequests = true,
  makeOwnersRequests = true,
}: UpdateDataParams<T2>) => {
  type NewData = typeof data & { updatedAt?: number };

  const newData = { ...data } as NewData;
  if (includeUpdatedAt) newData.updatedAt = now;

  /* eslint-disable no-param-reassign */
  if (connectionAccess) updateObject[PATHS.dataKeyField(dataType, dataKey, "connectionAccess")] = connectionAccess;
  if (ownershipAccess) updateObject[PATHS.dataKeyField(dataType, dataKey, "ownershipAccess")] = ownershipAccess;
  if (publicAccess !== undefined) updateObject[PATHS.dataKeyField(dataType, dataKey, "publicAccess")] = publicAccess;

  (Object.entries(newData) as [keyof NewData, ValueOf<NewData>][]).forEach(([childKey, childVal]) => {
    if (childVal !== undefined) updateObject[PATHS.dataKeyField(dataType, dataKey, childKey)] = childVal;
  });

  if (makeGetRequests && makeOwnersRequests) {
    const existingOwners = await isoGetOwners(get, dataType, dataKey);
    Object.keys(existingOwners || {}).forEach((uid) => {
      updateObject[PATHS.userDataKeyList(uid, dataType, dataKey)] = now;
    });
  }
  owners.forEach((uid) => {
    updateObject[PATHS.ownerDataKeyUid(dataType, dataKey, uid)] = now;
    updateObject[PATHS.userDataKeyList(uid, dataType, dataKey)] = now;
  });

  if (publicAccess) updateObject[PATHS.publicDataKeyList(dataType, dataKey)] = now;

  if (makeGetRequests && makeConnectionsRequests) {
    const existingConnections = await isoGetAllConnectionTypesKeys(get, dataType, dataKey);
    if (existingConnections) {
      const existingConnectionEntries = Object.entries(existingConnections) as [
        keyof typeof existingConnections,
        ValueOf<typeof existingConnections>
      ][];

      existingConnectionEntries.forEach(([dType, dObject]) =>
        Object.keys(dObject).forEach((dKey) => {
          updateObject[PATHS.connectionDataListConnectionKey(dType, dKey, dataType, dataKey)] = now;
        })
      );
    }
  }
  connections?.forEach(({ type, key }) => {
    updateObject[PATHS.connectionDataListConnectionKey(dataType, dataKey, type, key)] = now;
    updateObject[PATHS.connectionDataListConnectionKey(type, key, dataType, dataKey)] = now;
  });
  /* eslint-enable no-param-reassign */

  return skipUpdate ? updateObject : update("/", updateObject, true).then(() => updateObject);
};

export const isoUpsertData = async <T2 extends keyof SoilDatabase>({
  update,
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
  includeUpdatedAt = true,
  makeGetRequests = true,
}: CreateDataParams<T2> & UpdateDataParams<T2>) => {
  const dataCreatedAt = await isoGetDataKeyFieldValue({
    get,
    dataType,
    dataKey,
    field: "createdAt",
  }).catch(() => {});

  if (dataCreatedAt) {
    return isoUpdateData({
      update,
      get,
      updateObject,
      skipUpdate,
      data: { ...data },
      dataType,
      dataKey,
      publicAccess,
      owners,
      connections,
      connectionAccess,
      ownershipAccess,
      includeUpdatedAt,
      makeGetRequests,
    });
  }

  return isoCreateData({
    update,
    updateObject,
    skipUpdate,
    data,
    dataType,
    dataKey,
    owners,
    publicAccess,
    connections,
    connectionAccess,
    ownershipAccess,
  });
};

const isoAfterCollisionFreeUpdateHandler = async <T2 extends keyof SoilDatabase, T3 extends keyof Data<T2>>({
  get,
  update,
  dataType,
  dataKey,
  makeGetRequests = true,
  makeConnectionsRequests = true,
  makeOwnersRequests = true,
}: AfterCollisionFreeUpdateHandler<T2, T3>) => {
  /* eslint-disable no-param-reassign */
  const now = Date.now();
  const updateObject: UpdateObject<T2> = {};

  if (makeGetRequests && makeOwnersRequests) {
    const existingOwners = await isoGetOwners(get, dataType, dataKey);
    Object.keys(existingOwners || {}).forEach((uid) => {
      updateObject[PATHS.userDataKeyList(uid, dataType, dataKey)] = now;
    });
  }

  if (makeGetRequests && makeConnectionsRequests) {
    const existingConnections = await isoGetAllConnectionTypesKeys(get, dataType, dataKey);
    if (existingConnections) {
      const existingConnectionEntries = Object.entries(existingConnections) as [
        keyof typeof existingConnections,
        ValueOf<typeof existingConnections>
      ][];

      existingConnectionEntries.forEach(([dType, dObject]) =>
        Object.keys(dObject).forEach((dKey) => {
          updateObject[PATHS.connectionDataListConnectionKey(dType, dKey, dataType, dataKey)] = now;
        })
      );
    }
  }
  /* eslint-enable no-param-reassign */

  return update("/", updateObject, true);
};

export const isoSoilIncrement = async <T2 extends keyof SoilDatabase, T3 extends keyof Data<T2>>({
  get,
  update,
  delta,
  dataType,
  dataKey,
  field,
  makeGetRequests = true,
  makeConnectionsRequests = true,
  makeOwnersRequests = true,
}: SoilIncrement<T2, T3>) => {
  await update(PATHS.dataKey(dataType, dataKey), { [field]: increment(delta) });

  await isoAfterCollisionFreeUpdateHandler({
    get,
    update,
    dataType,
    dataKey,
    makeGetRequests,
    makeConnectionsRequests,
    makeOwnersRequests,
  });
};

export const isoSoilTransactionWithCb = async <T2 extends keyof SoilDatabase, T3 extends keyof Data<T2>>({
  get,
  update,
  transactionWithCb,
  cb,
  dataType,
  dataKey,
  field,
  makeGetRequests = true,
  makeConnectionsRequests = true,
  makeOwnersRequests = true,
}: SoilTransactionWithCbParams<T2, T3>) => {
  await transactionWithCb(PATHS.dataKeyField(dataType, dataKey, field), cb);

  await isoAfterCollisionFreeUpdateHandler({
    get,
    update,
    dataType,
    dataKey,
    makeGetRequests,
    makeConnectionsRequests,
    makeOwnersRequests,
  });
};

export const isoCreateConnections = <T2 extends keyof SoilDatabase>({
  update,
  updateObject = {},
  skipUpdate,
  now = Date.now(),
  connections,
}: ModifyConnectionsType<T2>) => {
  connections.forEach(({ dataType, dataKey, connectionType, connectionKey }) => {
    /* eslint-disable no-param-reassign */
    updateObject[PATHS.connectionDataListConnectionKey(dataType, dataKey, connectionType, connectionKey)] = now;
    updateObject[PATHS.connectionDataListConnectionKey(connectionType, connectionKey, dataType, dataKey)] = now;
    /* eslint-enable no-param-reassign */
  });

  return skipUpdate ? updateObject : update("/", updateObject, true).then(() => updateObject);
};

/*
██████╗ ███████╗███╗   ███╗ ██████╗ ██╗   ██╗███████╗
██╔══██╗██╔════╝████╗ ████║██╔═══██╗██║   ██║██╔════╝
██████╔╝█████╗  ██╔████╔██║██║   ██║██║   ██║█████╗
██╔══██╗██╔══╝  ██║╚██╔╝██║██║   ██║╚██╗ ██╔╝██╔══╝
██║  ██║███████╗██║ ╚═╝ ██║╚██████╔╝ ╚████╔╝ ███████╗
╚═╝  ╚═╝╚══════╝╚═╝     ╚═╝ ╚═════╝   ╚═══╝  ╚══════╝
*/
export const isoRemoveData = async <T2 extends keyof SoilDatabase>({
  update,
  get,
  updateObject = {},
  skipUpdate,
  dataType,
  dataKey,
  existingOwners,
  existingConnections,
}: RemoveDataKeyParams<T2>) => {
  /* eslint-disable no-param-reassign */
  (
    Object.entries(existingConnections || (await isoGetAllConnectionTypesKeys(get, dataType, dataKey)) || {}) as [
      keyof typeof existingConnections,
      ValueOf<DataList>
    ][]
  ).forEach(([dType, dKeys]) =>
    Object.keys(dKeys).forEach((dKey) => {
      updateObject[PATHS.connectionDataListConnectionKey(dType, dKey, dataType, dataKey)] = null;
    })
  );
  updateObject[PATHS.connectionDataListKey(dataType, dataKey)] = null;

  updateObject[PATHS.dataKey(dataType, dataKey)] = null;

  updateObject[PATHS.publicDataKeyList(dataType, dataKey)] = null;

  (existingOwners || Object.keys((await isoGetOwners(get, dataType, dataKey)) || {})).forEach((uid) => {
    updateObject[PATHS.userDataKeyList(uid, dataType, dataKey)] = null;
    updateObject[PATHS.ownerDataKeyUid(dataType, dataKey, uid)] = null;
  });
  /* eslint-enable no-param-reassign */

  if (dataType === "soilFile") await firebaseStorageDelete(PATHS.dataKey("soilFile", dataKey));

  return skipUpdate ? updateObject : update("/", updateObject, true, true).then(() => updateObject);
};

/** ! CAREFUL */
export const isoRemoveDataType = async <T2 extends keyof SoilDatabase>({
  update,
  get,
  dataType,
}: Omit<RemoveDataKeyParams<T2>, "dataKey" | "skipUpdate" | "updateObject">) => {
  const { updateObjects, getUpdateObject } = createGetUpdateObjectFunction<T2>();
  /* eslint-disable no-param-reassign */
  const connections = await isoGetAllConnectionTypes(get, dataType);
  if (connections) {
    Object.entries(connections).forEach(([dKey, dataList]) =>
      Object.entries(dataList).forEach(([dType, dKeys]) =>
        Object.keys(dKeys).forEach((dk) => {
          if (dType !== dataType) {
            getUpdateObject()[PATHS.connectionDataListConnectionKey(dType as keyof SoilDatabase, dk, dataType, dKey)] =
              null;
          }
        })
      )
    );
  }

  const updateObject = getUpdateObject();
  updateObject[PATHS.connectionDataListType(dataType)] = null;

  updateObject[PATHS.dataType(dataType)] = null;

  updateObject[PATHS.publicDataTypeList(dataType)] = null;

  updateObject[PATHS.ownerDataType(dataType)] = null;

  Object.values((await isoGetOwnersByType(get, dataType)) || {}).forEach((dataOwners) => {
    Object.keys(dataOwners).forEach((uid) => {
      getUpdateObject()[PATHS.userDataTypeList(uid, dataType)] = null;
    });
  });
  /* eslint-enable no-param-reassign */

  for (let i = 0; i < updateObjects.length; i += 1) {
    const updateObj = updateObjects[i];
    /* eslint-disable no-await-in-loop */
    if (i !== 0) await sleep(1100);
    await update("/", updateObj, true);
    /* eslint-enable no-await-in-loop */
  }
};

export const isoRemoveConnections = <T2 extends keyof SoilDatabase>({
  update,
  updateObject = {},
  skipUpdate,
  connections,
}: ModifyConnectionsType<T2>) => {
  connections.forEach(({ dataType, dataKey, connectionType, connectionKey }) => {
    /* eslint-disable no-param-reassign */
    updateObject[PATHS.connectionDataListConnectionKey(dataType, dataKey, connectionType, connectionKey)] = null;
    updateObject[PATHS.connectionDataListConnectionKey(connectionType, connectionKey, dataType, dataKey)] = null;
    /* eslint-enable no-param-reassign */
  });

  return skipUpdate ? updateObject : update("/", updateObject, true).then(() => updateObject);
};

export const isoTrackEvent = (
  push: (path: string, data: TrackingData) => { key: Nullable<string> },
  trackingKey: string,
  uid: string,
  metadata?: object
) =>
  push(PATHS.trackingKey(trackingKey), {
    uid,
    createdAt: Date.now(),
    metadata: metadata || null,
  });

export const isoChangeDataKey = async <T2 extends keyof SoilDatabase, T22 extends keyof SoilDatabase>({
  update,
  get,
  existingDataType,
  existingDataKey,
  newDataType,
  newDataKey,
}: ChangeDataKey<T2, T22>) => {
  const existingData = await isoGetDataKeyValue(get, existingDataType, existingDataKey);
  if (!existingData) throw new Error(`No data found`);

  const { connectionAccess, ownershipAccess, publicAccess, ...data } = existingData;

  const existingOwners = Object.keys((await isoGetOwners(get, existingDataType, existingDataKey)) || []);

  const existingConnections =
    (await isoGetAllConnectionTypesKeys(get, existingDataType, existingDataKey)) || ({} as DataList);

  const connections = (Object.entries(existingConnections) as [keyof SoilDatabase, Record<string, number>][]).reduce(
    (prev, [type, dataList]) => {
      prev.push(...Object.keys(dataList).map((key) => ({ type, key })));

      return prev;
    },
    [] as Connections
  );

  const updateObject: UpdateObject<T2> = {};

  await isoCreateData<T2>({
    update,
    updateObject,
    skipUpdate: true,
    data: data as unknown as SoilDatabase[T2],
    dataType: (newDataType || existingDataType) as unknown as typeof existingDataType,
    dataKey: newDataKey,
    owners: existingOwners,
    publicAccess: publicAccess || undefined,
    connections,
    connectionAccess,
    ownershipAccess,
  });

  await isoRemoveData({
    update,
    get,
    updateObject,
    dataType: existingDataType,
    dataKey: existingDataKey,
    existingConnections,
    existingOwners,
  });

  return {
    connections,
    owners: existingOwners,
  };
};
