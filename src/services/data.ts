import type { SoilDatabase } from "./types";

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
  OnConnectionTypeChildAddedParams,
  OnDataValueParams,
  OnUserDataTypeListChildAddedParams,
  GetOwnerDataParams,
  QueryDataParams,
  ModifyConnectionsType,
  TrackingData,
  Connections,
  ChangeDataKey,
  UpdateObject,
} from "./types";

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
  update,
  updateObject = {},
  skipUpdate,
  now = Date.now(),
}: Pick<CreateDataParams<SoilDatabase, keyof SoilDatabase>, "update" | "updateObject" | "skipUpdate" | "now"> & {
  user: Mandate<User, "uid">;
}) => {
  updateObject[PATHS.user(user.uid)] = user;

  return isoCreateData({
    update,
    dataType: "appUser",
    dataKey: user.uid,
    data: {},
    owners: [user.uid],
    publicAccess: true,
    updateObject,
    skipUpdate,
    now,
  });
};

export const isoUpdateUser = (
  update: <T extends object>(path: string, data: T) => Promise<void>,
  u: Mandate<User, "uid">
) => update(PATHS.user(u.uid), u);

export const isoGetUser = (get: GetFunction, uid: string) => get<User>(PATHS.user(uid));

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

export const isoOnUserDataListValue = (
  onValue: (path: string, cb: (val: Nullable<DataList>) => void) => VoidFunction,
  uid: string,
  cb: (userData: Nullable<DataList>) => void
) => onValue(PATHS.userDataList(uid), cb);

export const isoOnUserDataTypeListChildAdded = <T2 extends keyof SoilDatabase>({
  onChildAdded,
  uid,
  dataType,
  cb,
}: OnUserDataTypeListChildAddedParams<T2>) => onChildAdded(PATHS.userDataTypeList(uid, dataType), cb);

export const isoOnDataKeyValue = <T2 extends keyof SoilDatabase>({
  onValue,
  dataType,
  dataKey,
  cb,
}: OnDataValueParams<T2>) => onValue(PATHS.dataKey(dataType, dataKey), cb);

export const isoOnToGetTypeChildAdded = <T extends SoilDatabase, T2 extends keyof SoilDatabase>({
  onChildAdded,
  dataType,
  dataKey,
  connectionType,
  cb,
}: OnConnectionTypeChildAddedParams<T, T2>) =>
  onChildAdded(PATHS.connectionDataListConnectionType(dataType, dataKey, connectionType), cb);

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

export const isoGetAllConnections = <T2 extends keyof SoilDatabase>(get: GetFunction, dataType: T2, dataKey: string) =>
  get<DataList>(PATHS.connectionDataListKey(dataType, dataKey));

export const isoGetAllConnectionsByType = <T2 extends keyof SoilDatabase>(get: GetFunction, dataType: T2) =>
  get<Record<string, DataList>>(PATHS.connectionDataListType(dataType));

export const isoGetConnectionType = <T2 extends keyof SoilDatabase, T22 extends keyof SoilDatabase>({
  get,
  dataType,
  dataKey,
  connectionType,
}: {
  get: GetFunction;
  dataType: T2;
  dataKey: string;
  connectionType: T22;
}) => get<DataList[T22]>(PATHS.connectionDataListConnectionType(dataType, dataKey, connectionType));

export const isoGetConnectionTypeData = <T2 extends keyof SoilDatabase, T22 extends keyof SoilDatabase>({
  get,
  dataType,
  dataKey,
  connectionType,
}: {
  get: GetFunction;
  dataType: T2;
  dataKey: string;
  connectionType: T22;
}) =>
  isoGetConnectionType({ get, dataType, dataKey, connectionType }).then((dataList) =>
    Promise.all(
      Object.keys(dataList || {}).map((key) =>
        get<Data<T22> & { key: string }>(PATHS.dataKey(connectionType, key)).then((d) => (d ? { ...d, key } : null))
      )
    )
  );

export const isoGetConnectionTypeConnections = <T2 extends keyof SoilDatabase, T22 extends keyof SoilDatabase>({
  get,
  dataType,
  dataKey,
  connectionType,
}: {
  get: GetFunction;
  dataType: T2;
  dataKey: string;
  connectionType: T22;
}) =>
  isoGetConnectionType({ get, dataType, dataKey, connectionType }).then((dataList) =>
    Promise.all(
      Object.keys(dataList || {}).map((key) => get<DataList>(PATHS.connectionDataListKey(connectionType, key)))
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

export const isoQueryData = <T extends SoilDatabase, T2 extends keyof SoilDatabase, T3 extends keyof T[T2]>({
  queryOrderByChildEqualTo,
  dataType,
  childKey,
  queryValue,
  limit,
}: QueryDataParams<T, T2, T3>) =>
  queryOrderByChildEqualTo<T[T2]>({ path: PATHS.dataType(dataType), childKey, limit, queryValue: String(queryValue) });

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

/*
██████╗  █████╗ ████████╗ █████╗
██╔══██╗██╔══██╗╚══██╔══╝██╔══██╗
██║  ██║███████║   ██║   ███████║
██║  ██║██╔══██║   ██║   ██╔══██║
██████╔╝██║  ██║   ██║   ██║  ██║
╚═════╝ ╚═╝  ╚═╝   ╚═╝   ╚═╝  ╚═╝
*/
export const isoCreateData = async <T extends SoilDatabase, T2 extends keyof SoilDatabase>({
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
  now = Date.now(),
}: CreateDataParams<T, T2>) => {
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
  };

  connections?.forEach(({ type, key }) => {
    updateObject[PATHS.connectionDataListConnectionKey(dataType, dataKey, type, key)] = now;
    updateObject[PATHS.connectionDataListConnectionKey(type, key, dataType, dataKey)] = now;
  });

  if (publicAccess) updateObject[PATHS.publicDataKeyList(dataType, dataKey)] = now;
  /* eslint-enable no-param-reassign */

  return skipUpdate ? updateObject : update("/", updateObject, true).then(() => updateObject);
};

export const isoUpdateData = async <T extends SoilDatabase, T2 extends keyof SoilDatabase>({
  update,
  get,
  updateObject = {},
  skipUpdate,
  dataType,
  dataKey,
  data,
  owners = [],
  connections,
  publicAccess = false,
  connectionAccess,
  now = Date.now(),
  includeUpdatedAt = true,
  makeGetRequests = true,
  makeConnectionsRequests = true,
  makeOwnersRequests = true,
}: UpdateDataParams<T, T2>) => {
  type NewData = typeof data & { publicAccess: boolean; updatedAt?: number };

  const newData = { ...data, publicAccess } as NewData;
  if (includeUpdatedAt) newData.updatedAt = now;

  /* eslint-disable no-param-reassign */
  if (connectionAccess) updateObject[PATHS.dataKeyField(dataType, dataKey, "connectionAccess")] = connectionAccess;

  Object.entries(newData).forEach(([childKey, childVal]) => {
    updateObject[PATHS.dataKeyField(dataType, dataKey, childKey)] = childVal;
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
    const existingConnections = await isoGetAllConnections(get, dataType, dataKey);
    if (existingConnections) {
      const existingConnectionEntries = Object.entries(existingConnections) as [
        keyof typeof existingConnections,
        ValueOf<typeof existingConnections>
      ][];

      existingConnectionEntries.forEach(([dType, dObject]) =>
        Object.keys(dObject).forEach((dKey) => {
          updateObject[PATHS.connectionDataListConnectionKey(dataType, dataKey, dType, dKey)] = now;
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

export const isoUpsertData = async <T extends SoilDatabase, T2 extends keyof SoilDatabase>({
  update,
  get,
  updateObject,
  skipUpdate,
  dataType,
  dataKey,
  data,
  owners,
  publicAccess = false,
  connections,
  connectionAccess,
  includeUpdatedAt = true,
  makeGetRequests = true,
}: CreateDataParams<T, T2> & UpdateDataParams<T, T2>) => {
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
  });
};

export const isoCreateConnections = <T extends SoilDatabase, T2 extends keyof SoilDatabase>({
  update,
  updateObject = {},
  skipUpdate,
  now = Date.now(),
  connections,
}: ModifyConnectionsType<T, T2>) => {
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
export const isoRemoveData = async <T extends SoilDatabase, T2 extends keyof SoilDatabase>({
  update,
  get,
  updateObject = {},
  skipUpdate,
  dataType,
  dataKey,
  existingOwners,
  existingConnections,
}: Omit<RemoveDataKeyParams<T, T2>, "publicAccess" | "now">) => {
  /* eslint-disable no-param-reassign */
  (
    Object.entries(existingConnections || (await isoGetAllConnections(get, dataType, dataKey)) || {}) as [
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

  return skipUpdate ? updateObject : update("/", updateObject, true, true).then(() => updateObject);
};

/** ! CAREFUL */
export const isoRemoveDataType = async <T extends SoilDatabase, T2 extends keyof SoilDatabase>({
  update,
  get,
  dataType,
}: Omit<RemoveDataKeyParams<T, T2>, "publicAccess" | "now" | "dataKey" | "skipUpdate" | "updateObject">) => {
  const { updateObjects, getUpdateObject } = createGetUpdateObjectFunction<T, T2>();
  /* eslint-disable no-param-reassign */
  const connections = await isoGetAllConnectionsByType(get, dataType);
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

export const isoRemoveConnections = <T extends SoilDatabase, T2 extends keyof SoilDatabase>({
  update,
  updateObject = {},
  skipUpdate,
  connections,
}: ModifyConnectionsType<T, T2>) => {
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

  const { connectionAccess, publicAccess, ...data } = existingData;

  const existingOwners = Object.keys((await isoGetOwners(get, existingDataType, existingDataKey)) || []);

  const existingConnections = (await isoGetAllConnections(get, existingDataType, existingDataKey)) || ({} as DataList);

  const connections = (Object.entries(existingConnections) as [keyof SoilDatabase, Record<string, number>][]).reduce(
    (prev, [type, dataList]) => {
      prev.push(...Object.keys(dataList).map((key) => ({ type, key })));

      return prev;
    },
    [] as Connections
  );

  const updateObject: UpdateObject<SoilDatabase, T2> = {};

  await isoCreateData<SoilDatabase, T2>({
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
