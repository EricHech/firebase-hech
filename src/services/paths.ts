import type { ConnectionDataListDatabase, Data, FirebaseHechDatabase } from "./types";

type DataKey = string;

export const PATHS = {
  STORAGE: "firebaseHechFile",
  storageKey: (userUid: string, dataKey: DataKey) => `${PATHS.STORAGE}/${userUid}/${dataKey}`,

  ADMINS: "admins",
  admin: (uid: string) => `${PATHS.ADMINS}/${uid}`,

  USERS: "users",
  user: (uid: string) => `${PATHS.USERS}/${uid}`,

  UNVERIFIED_USERS: "unverifiedUsers",
  unverifiedUsers: (uid: string) => `${PATHS.UNVERIFIED_USERS}/${uid}`,

  USERNAMES: "usernames",
  username: (username: string) => `${PATHS.USERNAMES}/${username}`,

  TRACKING: "tracking",
  trackingKey: (trackingKey: string) => `${PATHS.TRACKING}/${trackingKey}`,

  DATA: "data",
  dataType: <T2 extends keyof FirebaseHechDatabase>(dataType: T2) => `${PATHS.DATA}/${dataType}`,
  dataKey: <T2 extends keyof FirebaseHechDatabase>(dataType: T2, dataKey: DataKey) =>
    `${PATHS.DATA}/${dataType}/${dataKey}`,
  dataKeyField: <T2 extends keyof FirebaseHechDatabase, T3 extends keyof Data<T2>>(
    dataType: T2,
    dataKey: DataKey,
    dataField: T3
  ) => `${PATHS.DATA}/${dataType}/${dataKey}/${dataField as string}`,

  OWNERS: "owners",
  ownerDataType: <T2 extends keyof FirebaseHechDatabase>(dataType: T2) => `${PATHS.OWNERS}/${dataType}`,
  ownerDataKey: <T2 extends keyof FirebaseHechDatabase>(dataType: T2, dataKey: DataKey) =>
    `${PATHS.OWNERS}/${dataType}/${dataKey}`,
  ownerDataKeyUid: <T2 extends keyof FirebaseHechDatabase>(dataType: T2, dataKey: DataKey, uid: string) =>
    `${PATHS.OWNERS}/${dataType}/${dataKey}/${uid}`,

  USER_DATA_LISTS: "userDataLists",
  userDataList: (uid: string) => `${PATHS.USER_DATA_LISTS}/${uid}`,
  userDataTypeList: <T2 extends keyof FirebaseHechDatabase>(uid: string, dataType: T2) =>
    `${PATHS.USER_DATA_LISTS}/${uid}/${dataType}`,
  userDataKeyList: <T2 extends keyof FirebaseHechDatabase>(uid: string, dataType: T2, dataKey: DataKey) =>
    `${PATHS.USER_DATA_LISTS}/${uid}/${dataType}/${dataKey}`,

  PUBLIC_DATA_LISTS: "publicDataLists",
  publicDataTypeList: <T2 extends keyof FirebaseHechDatabase>(dataType: T2) => `${PATHS.PUBLIC_DATA_LISTS}/${dataType}`,
  publicDataKeyList: <T2 extends keyof FirebaseHechDatabase>(dataType: T2, dataKey: DataKey) =>
    `${PATHS.PUBLIC_DATA_LISTS}/${dataType}/${dataKey}`,

  CONNECTION_DATA_LISTS: "connectionDataLists",
  connectionDataListType: <T2 extends keyof ConnectionDataListDatabase>(dataType: T2) =>
    `${PATHS.CONNECTION_DATA_LISTS}/${dataType}`,
  connectionDataListKey: <T2 extends keyof ConnectionDataListDatabase>(dataType: T2, dataKey: DataKey) =>
    `${PATHS.CONNECTION_DATA_LISTS}/${dataType}/${dataKey}`,
  connectionDataListConnectionType: <
    ParentT extends keyof ConnectionDataListDatabase,
    ParentK extends keyof ConnectionDataListDatabase[ParentT],
    ChildT extends keyof ConnectionDataListDatabase[ParentT][ParentK]
  >(
    dataType: ParentT,
    dataKey: ParentK,
    connectionType: ChildT
  ) => `${PATHS.CONNECTION_DATA_LISTS}/${dataType}/${dataKey as string}/${connectionType as string}`,
  connectionDataListConnectionKey: <
    ParentT extends keyof ConnectionDataListDatabase,
    ParentK extends keyof ConnectionDataListDatabase[ParentT],
    ChildT extends keyof ConnectionDataListDatabase[ParentT][ParentK],
    ChildK extends keyof ConnectionDataListDatabase[ParentT][ParentK][ChildT]
  >(
    dataType: ParentT,
    dataKey: ParentK,
    connectionType: ChildT,
    connectionKey: ChildK
  ) =>
    `${PATHS.CONNECTION_DATA_LISTS}/${dataType}/${dataKey as string}/${connectionType as string}/${
      connectionKey as string
    }`,
};

export const DB_DELIMITER = "||";
export const generateDbKey = (...keys: string[]) => keys.join(DB_DELIMITER);
export const parseDbKey = (dbKey: string) => dbKey.split(DB_DELIMITER);

/**
 * This function standardizes keys that are generated from existing keys but have no inherent order,
 * for example: when creating a key representing a chat message between two people: `{uid}||{uid}`.
 * @param keys The keys meant to be joined, this should not exceed roughly thirty Firebase pushKeys.
 */
export const generateSortedDbKey = (...keys: string[]) =>
  generateDbKey(
    ...keys.sort((a, b) => {
      if (a < b) return -1;
      if (a > b) return 1;
      return 0;
    })
  );
