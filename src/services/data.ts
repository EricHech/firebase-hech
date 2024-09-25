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
  CreateConnectionsType,
  RemoveConnectionsType,
  TrackingData,
  UpdateObject,
  ConnectionDataListDatabase,
} from "./types";
import type {
  AfterCollisionFreeUpdateHandler,
  AppUser,
  FirebaseHechDatabase,
  FirebaseHechIncrement,
  FirebaseHechTransactionWithCbParams,
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
export const isoCreateUser = <
  ParentT extends keyof ConnectionDataListDatabase,
  ParentK extends keyof ConnectionDataListDatabase[ParentT],
  ChildT extends keyof ConnectionDataListDatabase[ParentT][ParentK],
  ChildK extends keyof ConnectionDataListDatabase[ParentT][ParentK][ChildT]
>({
  user,
  appUser,
  update,
  updateObject = {},
  skipUpdate,
  now = Date.now(),
  createUnverifiedUser,
}: Pick<
  CreateDataParams<"appUser", ParentT, ParentK, ChildT, ChildK>,
  "update" | "updateObject" | "skipUpdate" | "now"
> & {
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

export const isoOnDataKeyValue = <T2 extends keyof FirebaseHechDatabase>({
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

export const isoGetDataKeyValue = <T2 extends keyof FirebaseHechDatabase>(
  get: GetFunction,
  dataType: T2,
  dataKey: string
) => get<Data<T2>>(PATHS.dataKey(dataType, dataKey));

export const isoGetDataTypeValue = <T2 extends keyof FirebaseHechDatabase>(get: GetFunction, dataType: T2) =>
  get<Record<string, Data<T2>>>(PATHS.dataType(dataType));

export const isoGetAllConnectionTypesKeys = <T2 extends keyof ConnectionDataListDatabase>(
  get: GetFunction,
  parentType: T2,
  parentKey: string
) => get<ConnectionDataListDatabase[T2][string]>(PATHS.connectionDataListKey(parentType, parentKey));

export const isoGetAllConnectionTypes = <ParentT extends keyof ConnectionDataListDatabase>(
  get: GetFunction,
  parentType: ParentT
) => get<ConnectionDataListDatabase[ParentT]>(PATHS.connectionDataListType(parentType));

export const isoGetConnectionTypeKeys = <
  ParentT extends keyof ConnectionDataListDatabase,
  ParentK extends keyof ConnectionDataListDatabase[ParentT],
  ChildT extends keyof ConnectionDataListDatabase[ParentT][ParentK]
>({
  get,
  parentType,
  parentKey,
  dataType,
}: {
  get: GetFunction;
  parentType: ParentT;
  parentKey: ParentK;
  dataType: ChildT;
}) =>
  get<ConnectionDataListDatabase[ParentT][ParentK][ChildT]>(
    PATHS.connectionDataListConnectionType(parentType, parentKey, dataType)
  );

export const isoGetConnectionTypeData = <
  ParentT extends keyof ConnectionDataListDatabase,
  ParentK extends keyof ConnectionDataListDatabase[ParentT],
  ChildT extends keyof ConnectionDataListDatabase[ParentT][ParentK] & keyof FirebaseHechDatabase
>({
  get,
  parentType,
  parentKey,
  dataType,
}: {
  get: GetFunction;
  parentType: ParentT;
  parentKey: ParentK;
  dataType: ChildT;
}) =>
  isoGetConnectionTypeKeys({
    get,
    parentType,
    parentKey,
    dataType: dataType as keyof ConnectionDataListDatabase[ParentT][ParentK],
  }).then((dataList) =>
    Promise.all(
      Object.keys(dataList || {}).map((key) =>
        get<Data<ChildT> & { key: string }>(PATHS.dataKey(dataType, key)).then((d) => (d ? { ...d, key } : null))
      )
    )
  );

export const isoGetUserTypeKeys = <T2 extends keyof FirebaseHechDatabase>({
  get,
  dataType,
  uid,
}: {
  get: GetFunction;
  dataType: T2;
  uid: string;
}) => get<DataList[T2]>(PATHS.userDataTypeList(uid, dataType));

export const isoGetUserTypeData = <T2 extends keyof FirebaseHechDatabase>({
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

export const isoGetPublicTypeData = <T2 extends keyof FirebaseHechDatabase>({
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

export const isoGetDataKeyFieldValue = <T2 extends keyof FirebaseHechDatabase, T3 extends keyof Data<T2>>({
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

export const isoQueryData = <T2 extends keyof FirebaseHechDatabase, T3 extends keyof Data<T2>>({
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
export const isoGetOwner = <T2 extends keyof FirebaseHechDatabase>({
  get,
  dataType,
  dataKey,
  uid,
}: GetOwnerDataParams<T2>) => get<number>(PATHS.ownerDataKeyUid(dataType, dataKey, uid));

export const isoGetOwners = (get: GetFunction, dataType: keyof FirebaseHechDatabase, dataKey: string) =>
  get<Record<string, number>>(PATHS.ownerDataKey(dataType, dataKey));

export const isoGetOwnersByType = (get: GetFunction, dataType: keyof FirebaseHechDatabase) =>
  get<Record<string, Record<string, number>>>(PATHS.ownerDataType(dataType));

export const isoAddOwners = <
  T2 extends keyof FirebaseHechDatabase,
  ParentT extends keyof ConnectionDataListDatabase,
  ParentK extends keyof ConnectionDataListDatabase[ParentT],
  ChildT extends keyof ConnectionDataListDatabase[ParentT][ParentK],
  ChildK extends keyof ConnectionDataListDatabase[ParentT][ParentK][ChildT]
>({
  update,
  updateObject = {},
  skipUpdate,
  dataType,
  dataKey,
  now = Date.now(),
  owners,
}: Pick<
  CreateDataParams<T2, ParentT, ParentK, ChildT, ChildK>,
  "dataType" | "dataKey" | "owners" | "update" | "updateObject" | "skipUpdate" | "now"
>) => {
  owners.forEach((uid) => {
    updateObject[PATHS.ownerDataKeyUid(dataType, dataKey, uid)] = now;
    updateObject[PATHS.userDataKeyList(uid, dataType, dataKey)] = now;
  });

  return skipUpdate ? updateObject : update("/", updateObject, true).then(() => updateObject);
};

export const isoRemoveOwners = <
  T2 extends keyof FirebaseHechDatabase,
  ParentT extends keyof ConnectionDataListDatabase,
  ParentK extends keyof ConnectionDataListDatabase[ParentT],
  ChildT extends keyof ConnectionDataListDatabase[ParentT][ParentK],
  ChildK extends keyof ConnectionDataListDatabase[ParentT][ParentK][ChildT]
>({
  update,
  updateObject = {},
  skipUpdate,
  dataType,
  dataKey,
  owners,
}: Pick<
  CreateDataParams<T2, ParentT, ParentK, ChildT, ChildK>,
  "dataType" | "dataKey" | "owners" | "update" | "updateObject" | "skipUpdate"
>) => {
  owners.forEach((uid) => {
    updateObject[PATHS.ownerDataKeyUid(dataType, dataKey, uid)] = null;
    updateObject[PATHS.userDataKeyList(uid, dataType, dataKey)] = null;
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
const cdlPrefix = `${PATHS.CONNECTION_DATA_LISTS}/`;
export const isoFirebaseHechUpdate = async (
  firebaseHech: {
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
    const dataUpdates = {} as Record<string, Nullable<object>>;
    const cdlUpdates = {} as Record<string, Nullable<Record<string, number>>>;
    const allOtherUpdates = {} as Record<string, unknown>;

    Object.entries(data).forEach(([p, d]) => {
      if (p.startsWith(ownersPrefix)) ownersUpdates[p] = d;
      else if (p.startsWith(publicDataListPrefix)) publicDataListUpdates[p] = d;
      else if (p.startsWith(dataPrefix)) dataUpdates[p] = d;
      else if (p.startsWith(cdlPrefix)) cdlUpdates[p] = d;
      else allOtherUpdates[p] = d;
    });

    if (isDelete) {
      await Promise.all(Object.entries(allOtherUpdates).map(([key, val]) => firebaseHech.set(key, val)));
      await Promise.all(Object.entries(cdlUpdates).map(([key, val]) => firebaseHech.set(key, val)));
      await Promise.all(Object.entries(dataUpdates).map(([key, val]) => firebaseHech.set(key, val)));
      await Promise.all(Object.entries(publicDataListUpdates).map(([key, val]) => firebaseHech.set(key, val)));
      await Promise.all(Object.entries(ownersUpdates).map(([key, val]) => firebaseHech.set(key, val)));
    } else {
      await Promise.all(Object.entries(ownersUpdates).map(([key, val]) => firebaseHech.set(key, val)));
      await Promise.all(Object.entries(publicDataListUpdates).map(([key, val]) => firebaseHech.set(key, val)));
      await Promise.all(Object.entries(dataUpdates).map(([key, val]) => firebaseHech.update(key, val as object)));
      await Promise.all(Object.entries(cdlUpdates).map(([key, val]) => firebaseHech.update(key, val as object)));
      await Promise.all(Object.entries(allOtherUpdates).map(([key, val]) => firebaseHech.set(key, val)));
    }
  } else {
    await firebaseHech.update(path, data, allowRootQuery);
  }
};

export const isoCreateData = async <
  T2 extends keyof FirebaseHechDatabase,
  ParentT extends keyof ConnectionDataListDatabase,
  ParentK extends keyof ConnectionDataListDatabase[ParentT],
  ChildT extends keyof ConnectionDataListDatabase[ParentT][ParentK],
  ChildK extends keyof ConnectionDataListDatabase[ParentT][ParentK][ChildT]
>({
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
  publicNow = now,
  ownershipNow = now,
  connectionNow = now,
}: CreateDataParams<T2, ParentT, ParentK, ChildT, ChildK>) => {
  owners.forEach((uid) => {
    updateObject[PATHS.ownerDataKeyUid(dataType, dataKey, uid)] = ownershipNow;
    updateObject[PATHS.userDataKeyList(uid, dataType, dataKey)] = ownershipNow;
  });

  updateObject[PATHS.dataKey(dataType, dataKey)] = {
    ...data,
    createdAt: now,
    updatedAt: now,
    publicAccess,
    connectionAccess: connectionAccess || null,
    ownershipAccess: ownershipAccess || null,
  };

  connections?.forEach(({ type, key, connectionQueryData }) => {
    const connectionDataTarget =
      connectionQueryData?.direction === "target" || connectionQueryData?.direction === "bi-directional"
        ? { updatedAt: connectionNow, ...connectionQueryData?.data }
        : { updatedAt: connectionNow };
    const connectionDataSource =
      connectionQueryData?.direction === "source" || connectionQueryData?.direction === "bi-directional"
        ? { updatedAt: connectionNow, ...connectionQueryData?.data }
        : { updatedAt: connectionNow };

    updateObject[
      PATHS.connectionDataListConnectionKey(
        dataType as keyof ConnectionDataListDatabase,
        dataKey,
        type as keyof ConnectionDataListDatabase[keyof ConnectionDataListDatabase][string],
        key
      )
    ] = connectionDataTarget;
    updateObject[
      PATHS.connectionDataListConnectionKey(
        type as keyof ConnectionDataListDatabase,
        key,
        dataType as keyof ConnectionDataListDatabase[keyof ConnectionDataListDatabase][string],
        dataKey
      )
    ] = connectionDataSource;
  });

  if (publicAccess) updateObject[PATHS.publicDataKeyList(dataType, dataKey)] = publicNow;

  return skipUpdate ? updateObject : update("/", updateObject, true).then(() => updateObject);
};

export const isoUpdateData = async <
  T2 extends keyof FirebaseHechDatabase,
  ParentT extends keyof ConnectionDataListDatabase,
  ParentK extends keyof ConnectionDataListDatabase[ParentT],
  ChildT extends keyof ConnectionDataListDatabase[ParentT][ParentK],
  ChildK extends keyof ConnectionDataListDatabase[ParentT][ParentK][ChildT]
>({
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
  publicNow = now,
  ownershipNow = now,
  connectionNow = now,
  includeUpdatedAt = true,
  makeGetRequests = true,
  makeConnectionsRequests = true,
  makeOwnersRequests = true,
}: UpdateDataParams<T2, ParentT, ParentK, ChildT, ChildK>) => {
  const updatedData = { ...data } as Data<T2>;
  if (includeUpdatedAt) updatedData.updatedAt = now;
  if (connectionAccess) updatedData.connectionAccess = connectionAccess;
  if (ownershipAccess) updatedData.ownershipAccess = ownershipAccess;
  if (publicAccess !== undefined) updatedData.publicAccess = publicAccess;

  updateObject[PATHS.dataKey(dataType, dataKey)] = {
    ...(updateObject[PATHS.dataKey(dataType, dataKey)] as object),
    ...updatedData,
  };

  if (makeGetRequests && makeOwnersRequests) {
    const existingOwners = await isoGetOwners(get, dataType, dataKey);
    Object.keys(existingOwners || {}).forEach((uid) => {
      updateObject[PATHS.userDataKeyList(uid, dataType, dataKey)] = ownershipNow;
    });
  }
  owners.forEach((uid) => {
    updateObject[PATHS.ownerDataKeyUid(dataType, dataKey, uid)] = ownershipNow;
    updateObject[PATHS.userDataKeyList(uid, dataType, dataKey)] = ownershipNow;
  });

  if (publicAccess !== undefined) {
    updateObject[PATHS.publicDataKeyList(dataType, dataKey)] = publicAccess ? publicNow : null;
  }

  if (makeGetRequests && makeConnectionsRequests) {
    const existingConnections = await isoGetAllConnectionTypesKeys(
      get,
      dataType as keyof ConnectionDataListDatabase,
      dataKey
    );
    if (existingConnections) {
      const existingConnectionEntries = Object.entries(existingConnections);

      existingConnectionEntries.forEach(([dType, dObject]) =>
        Object.keys(dObject).forEach((dKey) => {
          updateObject[
            PATHS.connectionDataListConnectionKey(
              dType as unknown as ParentT,
              dKey as unknown as ParentK,
              dataType as unknown as ChildT,
              dataKey as unknown as ChildK
            )
          ] = { updatedAt: connectionNow };
        })
      );
    }
  }
  connections?.forEach(({ type, key, connectionQueryData }) => {
    const connectionDataTarget =
      connectionQueryData?.direction === "target" || connectionQueryData?.direction === "bi-directional"
        ? { updatedAt: connectionNow, ...connectionQueryData?.data }
        : { updatedAt: connectionNow };
    const connectionDataSource =
      connectionQueryData?.direction === "source" || connectionQueryData?.direction === "bi-directional"
        ? { updatedAt: connectionNow, ...connectionQueryData?.data }
        : { updatedAt: connectionNow };

    updateObject[
      PATHS.connectionDataListConnectionKey(
        dataType as keyof ConnectionDataListDatabase,
        dataKey,
        type as keyof ConnectionDataListDatabase[keyof ConnectionDataListDatabase][string],
        key
      )
    ] = connectionDataTarget;
    updateObject[
      PATHS.connectionDataListConnectionKey(
        type as keyof ConnectionDataListDatabase,
        key,
        dataType as keyof ConnectionDataListDatabase[keyof ConnectionDataListDatabase][string],
        dataKey
      )
    ] = connectionDataSource;
  });

  return skipUpdate ? updateObject : update("/", updateObject, true).then(() => updateObject);
};

export const isoUpsertData = async <
  T2 extends keyof FirebaseHechDatabase,
  ParentT extends keyof ConnectionDataListDatabase,
  ParentK extends keyof ConnectionDataListDatabase[ParentT],
  ChildT extends keyof ConnectionDataListDatabase[ParentT][ParentK],
  ChildK extends keyof ConnectionDataListDatabase[ParentT][ParentK][ChildT]
>({
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
  now = Date.now(),
  publicNow = now,
  ownershipNow = now,
  connectionNow = now,
  includeUpdatedAt = true,
  makeGetRequests = true,
  makeConnectionsRequests = true,
  makeOwnersRequests = true,
}: CreateDataParams<T2, ParentT, ParentK, ChildT, ChildK> & UpdateDataParams<T2, ParentT, ParentK, ChildT, ChildK>) => {
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
      now,
      publicNow,
      ownershipNow,
      connectionNow,
      includeUpdatedAt,
      makeGetRequests,
      makeConnectionsRequests,
      makeOwnersRequests,
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
    now,
    publicNow,
    ownershipNow,
    connectionNow,
  });
};

const isoAfterCollisionFreeUpdateHandler = async <
  T2 extends keyof FirebaseHechDatabase,
  ParentT extends keyof ConnectionDataListDatabase,
  ParentK extends keyof ConnectionDataListDatabase[ParentT],
  ChildT extends keyof ConnectionDataListDatabase[ParentT][ParentK],
  ChildK extends keyof ConnectionDataListDatabase[ParentT][ParentK][ChildT]
>({
  get,
  update,
  dataType,
  dataKey,
  makeGetRequests = true,
  makeConnectionsRequests = true,
  makeOwnersRequests = true,
}: AfterCollisionFreeUpdateHandler<T2, ParentT, ParentK, ChildT, ChildK>) => {
  const now = Date.now();
  const updateObject: UpdateObject<T2> = {};

  if (makeGetRequests && makeOwnersRequests) {
    const existingOwners = await isoGetOwners(get, dataType, dataKey);
    Object.keys(existingOwners || {}).forEach((uid) => {
      updateObject[PATHS.userDataKeyList(uid, dataType, dataKey)] = now;
    });
  }

  if (makeGetRequests && makeConnectionsRequests) {
    const existingConnections = await isoGetAllConnectionTypesKeys(
      get,
      dataType as keyof ConnectionDataListDatabase,
      dataKey
    );
    if (existingConnections) {
      const existingConnectionEntries = Object.entries(existingConnections) as [
        keyof typeof existingConnections,
        ValueOf<typeof existingConnections>
      ][];

      existingConnectionEntries.forEach(([dType, dObject]) =>
        Object.keys(dObject).forEach((dKey) => {
          updateObject[
            PATHS.connectionDataListConnectionKey(dType, dKey, dataType as keyof ConnectionDataListDatabase, dataKey)
          ] = { updatedAt: now };
        })
      );
    }
  }

  return update("/", updateObject, true);
};

export const isoFirebaseHechIncrement = async <
  T2 extends keyof FirebaseHechDatabase,
  T3 extends keyof Data<T2>,
  ParentT extends keyof ConnectionDataListDatabase,
  ParentK extends keyof ConnectionDataListDatabase[ParentT],
  ChildT extends keyof ConnectionDataListDatabase[ParentT][ParentK],
  ChildK extends keyof ConnectionDataListDatabase[ParentT][ParentK][ChildT]
>({
  get,
  update,
  delta,
  dataType,
  dataKey,
  field,
  makeGetRequests = true,
  makeConnectionsRequests = true,
  makeOwnersRequests = true,
}: FirebaseHechIncrement<T2, T3, ParentT, ParentK, ChildT, ChildK>) => {
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

export const isoFirebaseHechTransactionWithCb = async <
  T2 extends keyof FirebaseHechDatabase,
  T3 extends keyof Data<T2>,
  ParentT extends keyof ConnectionDataListDatabase,
  ParentK extends keyof ConnectionDataListDatabase[ParentT],
  ChildT extends keyof ConnectionDataListDatabase[ParentT][ParentK],
  ChildK extends keyof ConnectionDataListDatabase[ParentT][ParentK][ChildT]
>({
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
}: FirebaseHechTransactionWithCbParams<T2, T3, ParentT, ParentK, ChildT, ChildK>) => {
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

export const isoCreateConnections = <
  ParentT extends keyof ConnectionDataListDatabase & keyof FirebaseHechDatabase,
  ParentK extends keyof ConnectionDataListDatabase[ParentT],
  ChildT extends keyof ConnectionDataListDatabase[ParentT][ParentK],
  ChildK extends keyof ConnectionDataListDatabase[ParentT][ParentK][ChildT]
>({
  update,
  updateObject = {},
  skipUpdate,
  now = Date.now(),
  connections,
}: CreateConnectionsType<ParentT, ParentK, ChildT, ChildK>) => {
  connections.forEach(({ dataType, dataKey, connectionType, connectionKey, connectionQueryData }) => {
    const connectionDataTarget =
      connectionQueryData?.direction === "target" || connectionQueryData?.direction === "bi-directional"
        ? { updatedAt: now, ...connectionQueryData?.data }
        : { updatedAt: now };
    const connectionDataSource =
      connectionQueryData?.direction === "source" || connectionQueryData?.direction === "bi-directional"
        ? { updatedAt: now, ...connectionQueryData?.data }
        : { updatedAt: now };

    updateObject[
      PATHS.connectionDataListConnectionKey(
        dataType, //
        dataKey,
        connectionType,
        connectionKey
      )
    ] = connectionDataTarget;
    updateObject[
      PATHS.connectionDataListConnectionKey(
        connectionType as unknown as ParentT,
        connectionKey as unknown as ParentK,
        dataType as unknown as ChildT,
        dataKey as unknown as ChildK
      )
    ] = connectionDataSource;
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
export const isoRemoveData = async <
  T2 extends keyof FirebaseHechDatabase,
  ParentT extends keyof ConnectionDataListDatabase,
  ParentK extends keyof ConnectionDataListDatabase[ParentT],
  ChildT extends keyof ConnectionDataListDatabase[ParentT][ParentK],
  ChildK extends keyof ConnectionDataListDatabase[ParentT][ParentK][ChildT]
>({
  update,
  get,
  updateObject = {},
  skipUpdate,
  dataType,
  dataKey,
  existingOwners,
  existingConnections,
}: RemoveDataKeyParams<T2, ParentT, ParentK, ChildT, ChildK>) => {
  (
    Object.entries(
      existingConnections ||
        (await isoGetAllConnectionTypesKeys(get, dataType as keyof ConnectionDataListDatabase, dataKey)) ||
        {}
    ) as [keyof typeof existingConnections, ValueOf<DataList>][]
  ).forEach(([dType, dKeys]) =>
    Object.keys(dKeys).forEach((dKey) => {
      updateObject[PATHS.connectionDataListConnectionKey(dType, dKey, dataType, dataKey)] = null;
    })
  );

  updateObject[PATHS.connectionDataListKey(dataType as keyof ConnectionDataListDatabase, dataKey)] = null;

  updateObject[PATHS.dataKey(dataType, dataKey)] = null;

  updateObject[PATHS.publicDataKeyList(dataType, dataKey)] = null;

  (existingOwners || Object.keys((await isoGetOwners(get, dataType, dataKey)) || {})).forEach((uid) => {
    updateObject[PATHS.userDataKeyList(uid, dataType, dataKey)] = null;
    updateObject[PATHS.ownerDataKeyUid(dataType, dataKey, uid)] = null;
  });

  if (dataType === "firebaseHechFile") await firebaseStorageDelete(PATHS.dataKey("firebaseHechFile", dataKey));

  return skipUpdate ? updateObject : update("/", updateObject, true, true).then(() => updateObject);
};

/** ! CAREFUL */
export const isoRemoveDataType = async <
  T2 extends keyof FirebaseHechDatabase,
  ParentT extends keyof ConnectionDataListDatabase,
  ParentK extends keyof ConnectionDataListDatabase[ParentT],
  ChildT extends keyof ConnectionDataListDatabase[ParentT][ParentK],
  ChildK extends keyof ConnectionDataListDatabase[ParentT][ParentK][ChildT]
>({
  update,
  get,
  dataType,
}: Omit<RemoveDataKeyParams<T2, ParentT, ParentK, ChildT, ChildK>, "dataKey" | "skipUpdate" | "updateObject">) => {
  const { updateObjects, getUpdateObject } = createGetUpdateObjectFunction<T2>();

  const connections = await isoGetAllConnectionTypes(get, dataType as keyof ConnectionDataListDatabase);
  if (connections) {
    Object.entries(connections).forEach(([dKey, dataList]) =>
      Object.entries(dataList).forEach(([dType, dKeys]) =>
        Object.keys(dKeys).forEach((dk) => {
          if (dType !== dataType) {
            getUpdateObject()[
              PATHS.connectionDataListConnectionKey(
                dType as keyof ConnectionDataListDatabase,
                dk,
                dataType as keyof ConnectionDataListDatabase[keyof ConnectionDataListDatabase][string],
                dKey
              )
            ] = null;
          }
        })
      )
    );
  }

  const updateObject = getUpdateObject();
  updateObject[PATHS.connectionDataListType(dataType as keyof ConnectionDataListDatabase)] = null;

  updateObject[PATHS.dataType(dataType)] = null;

  updateObject[PATHS.publicDataTypeList(dataType)] = null;

  updateObject[PATHS.ownerDataType(dataType)] = null;

  Object.values((await isoGetOwnersByType(get, dataType)) || {}).forEach((dataOwners) => {
    Object.keys(dataOwners).forEach((uid) => {
      getUpdateObject()[PATHS.userDataTypeList(uid, dataType)] = null;
    });
  });

  for (let i = 0; i < updateObjects.length; i += 1) {
    const updateObj = updateObjects[i];

    if (i !== 0) await sleep(1100);
    await update("/", updateObj, true);
  }
};

export const isoRemoveConnections = <
  ParentT extends keyof ConnectionDataListDatabase & keyof FirebaseHechDatabase,
  ParentK extends keyof ConnectionDataListDatabase[ParentT],
  ChildT extends keyof ConnectionDataListDatabase[ParentT][ParentK],
  ChildK extends keyof ConnectionDataListDatabase[ParentT][ParentK][ChildT]
>({
  update,
  updateObject = {},
  skipUpdate,
  connections,
}: RemoveConnectionsType<ParentT, ParentK, ChildT, ChildK>) => {
  connections.forEach(({ dataType, dataKey, connectionType, connectionKey }) => {
    updateObject[
      PATHS.connectionDataListConnectionKey(
        dataType, //
        dataKey,
        connectionType,
        connectionKey
      )
    ] = null;
    updateObject[
      PATHS.connectionDataListConnectionKey(
        connectionType as unknown as ParentT,
        connectionKey as unknown as ParentK,
        dataType as unknown as ChildT,
        dataKey as unknown as ChildK
      )
    ] = null;
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
