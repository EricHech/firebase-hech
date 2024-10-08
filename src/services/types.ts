export interface AppUser {
  /** This exists here if you passed a username to the `signUp` method */
  username?: string;
}

export interface FirebaseHechFile {
  downloadUrl: string;
  uploadedByUid: string;
  finished?: true;
  metadata?: Record<string, unknown>;
}

export interface RemoteRequest {
  remoteRequestUid: string;
}

export interface FirebaseHechDatabase {
  /** Firebase Hech reserved name: Must be `publicAccess === true`. */
  appUser: AppUser;
  /** Firebase Hech reserved name. */
  firebaseHechFile: FirebaseHechFile;
  /** Firebase Hech reserved name. See README. */
  remoteRequest: RemoteRequest;
}

/**
 * This should look like the CDL, for example:
 * ```
 * {
 *   appUser: {
 *     [ParentK in string]: {
 *       appUser: {
 *         [ChildK in string]: {
 *           updatedAt: number;
 *         };
 *       };
 *     };
 *   };
 * }
 * ```
 *
 * All terminal nodes should be numbers, and `updatedAt` is defaulted to every connection.
 *
 * A default is required for the types to work, so `appUser` to `appUser` with the default `updatedAt` was given.
 */
export interface ConnectionDataListDatabase {
  appUser: {
    [ParentK in string]: {
      appUser: {
        [ChildK in string]: {
          updatedAt: number;
        };
      };
    };
  };
}

export type EmulatorOptions = {
  database?: {
    host: string;
    port: number;
  };
  auth?: {
    url: string;
  };
  storage?: {
    host: string;
    port: number;
  };
};

export type StandardDataFields = {
  createdAt: number;
  updatedAt: number;
  deletedAt?: number;
  connectionAccess?: {
    connectionType: keyof FirebaseHechDatabase;
    connectionKey: string;
    uidDataType: keyof FirebaseHechDatabase;
    read: boolean;
    write: boolean;
  };
  ownershipAccess?: {
    dataType: keyof FirebaseHechDatabase;
    dataKey: string;
    read: boolean;
    write: boolean;
  };
};

export type User = StandardDataFields &
  Readonly<{
    uid: string;
    email?: string;
    phoneNumber?: string;
    emailVerified?: boolean;
    photoURL?: string;
    displayName?: string;
  }>;

export type FirebaseProfile = Partial<{ displayName: Nullable<string>; photoURL: Nullable<string> }>;

export type Data<T2 extends keyof FirebaseHechDatabase> = StandardDataFields & {
  key?: string;
  publicAccess: Nullable<boolean>;
} & FirebaseHechDatabase[T2];

export type KeyedData<T extends keyof FirebaseHechDatabase> = Mandate<Data<T>, "key">;

export type StatefulData<T2 extends keyof FirebaseHechDatabase> = Maybe<Nullable<Data<T2>>>;

export type DataList = Record<keyof FirebaseHechDatabase, Record<string, number>>;

export type UpdateObject<T2 extends keyof FirebaseHechDatabase = keyof FirebaseHechDatabase> = Record<
  string,
  FirebaseHechDatabase[T2] | null | boolean | number | string | object
>;

export type StatefulDataType<T2 extends keyof FirebaseHechDatabase> = Record<string, Nullable<StatefulData<T2>>>;

export type TrackingData = {
  createdAt: number;
  uid: string;
  metadata: Nullable<object>;
};

export type TriggerFunctionRequest = {
  error?: { message: string };
};

export type GetFunction = <GT>(path: string) => Promise<GT | null>;

export type GetDataKeyValueParams<T2 extends keyof FirebaseHechDatabase> = {
  get: GetFunction;
  dataType: T2;
  dataKey: string;
};

export type GetDataTypeValueParams<T2 extends keyof FirebaseHechDatabase> = {
  get: GetFunction;
  dataType: T2;
};

export type CudDataParams<T2 extends keyof FirebaseHechDatabase> = {
  update: (path: string, d: UpdateObject<T2>, allowRootQuery?: boolean, isDelete?: boolean) => Promise<void>;
  updateObject?: UpdateObject<T2>;
  skipUpdate?: boolean;
  dataType: T2;
  dataKey: string;
  publicAccess?: boolean;
  now?: number;
  publicNow?: number;
  ownershipNow?: number;
  connectionNow?: number;
};

export type Connections<
  ParentT extends keyof ConnectionDataListDatabase,
  ParentK extends keyof ConnectionDataListDatabase[ParentT],
  ChildT extends keyof ConnectionDataListDatabase[ParentT][ParentK],
  ChildK extends keyof ConnectionDataListDatabase[ParentT][ParentK][ChildT]
> = {
  type: keyof FirebaseHechDatabase;
  key: string;
  connectionQueryData?: {
    data: Partial<ConnectionDataListDatabase[ParentT][ParentK][ChildT][ChildK]>;
    direction: "source" | "target" | "bi-directional";
  };
}[];

export type CreateDataParams<
  T2 extends keyof FirebaseHechDatabase,
  ParentT extends keyof ConnectionDataListDatabase,
  ParentK extends keyof ConnectionDataListDatabase[ParentT],
  ChildT extends keyof ConnectionDataListDatabase[ParentT][ParentK],
  ChildK extends keyof ConnectionDataListDatabase[ParentT][ParentK][ChildT]
> = CudDataParams<T2> & {
  data: FirebaseHechDatabase[T2];
  owners: string[];
  connections?: Connections<ParentT, ParentK, ChildT, ChildK>;
  connectionAccess?: StandardDataFields["connectionAccess"];
  ownershipAccess?: StandardDataFields["ownershipAccess"];
};

export type UpdateDataParams<
  T2 extends keyof FirebaseHechDatabase,
  ParentT extends keyof ConnectionDataListDatabase,
  ParentK extends keyof ConnectionDataListDatabase[ParentT],
  ChildT extends keyof ConnectionDataListDatabase[ParentT][ParentK],
  ChildK extends keyof ConnectionDataListDatabase[ParentT][ParentK][ChildT]
> = CudDataParams<T2> & {
  get: GetFunction;
  data: Partial<FirebaseHechDatabase[T2]>;
  owners?: string[];
  connections?: Connections<ParentT, ParentK, ChildT, ChildK>;
  connectionAccess?: StandardDataFields["connectionAccess"];
  ownershipAccess?: StandardDataFields["ownershipAccess"];
  /** Pass `false` if all `connections` and `owners` are being provided to avoid unnecessary requests */
  makeGetRequests: boolean;
  makeConnectionsRequests?: boolean;
  makeOwnersRequests?: boolean;
  /** Pass `false` if you do not want to update this field (such as in the case of unnecessarily triggering a firebase update function) */
  includeUpdatedAt?: boolean;
};

export type RemoveDataKeyParams<T2 extends keyof FirebaseHechDatabase> = Omit<
  CudDataParams<T2>,
  "publicAccess" | "now" | "publicNow" | "ownershipNow" | "connectionNow" | "connectionQueryData"
> & {
  get: GetFunction;
  existingOwners?: Nullable<string[]>;
  existingConnections?: DataList;
};

export type GetOwnerDataParams<T2 extends keyof FirebaseHechDatabase> = {
  get: GetFunction;
  dataType: T2;
  dataKey: string;
  uid: string;
};

export type GetOwnersDataParams<T2 extends keyof FirebaseHechDatabase> = {
  get: GetFunction;
  dataType: T2;
  dataKey: string;
};

/**
 * `edge` returns the high or low end of a list
 * `between` returns the values between two where `start` always represents the low end while `end` represents the high end
 * `limit` returns an exact amount either from the end of a list or from a termination point
 */
export type ListenerPaginationOptions = { orderBy?: "orderByKey" | "orderByValue" | { path: string } } & (
  | {
      edge?: { side: "high" | "low"; termination: { key: string | number; version: "exclusive" | "inclusive" } };
      between?: undefined;
      limit?: undefined;
    }
  | {
      between?: { start: string | number; end: string | number; version: "exclusive" | "inclusive" };
      edge?: undefined;
      limit?: undefined;
    }
  | {
      limit?: {
        amount: number;
        direction: "limitToFirst" | "limitToLast";
        termination?: { key: string | number; version: "exclusive" | "inclusive" };
      };
      edge?: undefined;
      between?: undefined;
    }
);

export type OnDataValueParams<T2 extends keyof FirebaseHechDatabase> = {
  onValue: (path: string, cb: (val: Nullable<Data<T2>>) => void) => VoidFunction;
  dataType: T2;
  dataKey: string;
  cb: (data: Nullable<Data<T2>>) => void;
};

export type QueryOrderByChildParams = {
  path: string;
  childKey: string | number | symbol;
  queryValue: string | number | boolean;
  limit?: number;
};

export type QueryByKeyLimitParams = {
  path: string;
  limit: number;
};

export type QueryDataParams<T2 extends keyof FirebaseHechDatabase, T3 extends keyof Data<T2>> = {
  queryOrderByChildEqualTo: <QT>(params: QueryOrderByChildParams) => Promise<Nullable<QT>>;
  dataType: T2;
  childKey: T3;
  queryValue: Data<T2>[T3];
  limit?: number;
};

export type AfterCollisionFreeUpdateHandler<
  T2 extends keyof FirebaseHechDatabase,
  ParentT extends keyof ConnectionDataListDatabase,
  ParentK extends keyof ConnectionDataListDatabase[ParentT],
  ChildT extends keyof ConnectionDataListDatabase[ParentT][ParentK],
  ChildK extends keyof ConnectionDataListDatabase[ParentT][ParentK][ChildT]
> = Pick<
  UpdateDataParams<T2, ParentT, ParentK, ChildT, ChildK>,
  "get" | "update" | "dataType" | "dataKey" | "makeGetRequests" | "makeConnectionsRequests" | "makeOwnersRequests"
>;

export type FirebaseHechIncrement<
  T2 extends keyof FirebaseHechDatabase,
  T3 extends keyof Data<T2>,
  ParentT extends keyof ConnectionDataListDatabase,
  ParentK extends keyof ConnectionDataListDatabase[ParentT],
  ChildT extends keyof ConnectionDataListDatabase[ParentT][ParentK],
  ChildK extends keyof ConnectionDataListDatabase[ParentT][ParentK][ChildT]
> = AfterCollisionFreeUpdateHandler<T2, ParentT, ParentK, ChildT, ChildK> & { field: T3; delta: number };

export type FirebaseHechTransactionWithCbParams<
  T2 extends keyof FirebaseHechDatabase,
  T3 extends keyof Data<T2>,
  ParentT extends keyof ConnectionDataListDatabase,
  ParentK extends keyof ConnectionDataListDatabase[ParentT],
  ChildT extends keyof ConnectionDataListDatabase[ParentT][ParentK],
  ChildK extends keyof ConnectionDataListDatabase[ParentT][ParentK][ChildT]
> = AfterCollisionFreeUpdateHandler<T2, ParentT, ParentK, ChildT, ChildK> & {
  field: T3;
  cb: (value: Nullable<Data<T2>[T3]>) => Data<T2>[T3];
  transactionWithCb: <T>(path: string, cb: (val: Nullable<T>) => T) => Promise<unknown>;
};

export type ConnectionsBaseType<
  ParentT extends keyof ConnectionDataListDatabase & keyof FirebaseHechDatabase,
  ParentK extends keyof ConnectionDataListDatabase[ParentT],
  ChildT extends keyof ConnectionDataListDatabase[ParentT][ParentK],
  ChildK extends keyof ConnectionDataListDatabase[ParentT][ParentK][ChildT]
> = {
  dataType: ParentT;
  dataKey: ParentK;
  connectionType: ChildT;
  connectionKey: ChildK;
};

export type CreateConnectionsType<
  ParentT extends keyof ConnectionDataListDatabase & keyof FirebaseHechDatabase,
  ParentK extends keyof ConnectionDataListDatabase[ParentT],
  ChildT extends keyof ConnectionDataListDatabase[ParentT][ParentK],
  ChildK extends keyof ConnectionDataListDatabase[ParentT][ParentK][ChildT]
> = Pick<CudDataParams<ParentT>, "update" | "updateObject" | "now" | "skipUpdate"> & {
  connections: (ConnectionsBaseType<ParentT, ParentK, ChildT, ChildK> & {
    connectionQueryData?: Connections<ParentT, ParentK, ChildT, ChildK>[number]["connectionQueryData"];
  })[];
};

export type RemoveConnectionsType<
  ParentT extends keyof ConnectionDataListDatabase & keyof FirebaseHechDatabase,
  ParentK extends keyof ConnectionDataListDatabase[ParentT],
  ChildT extends keyof ConnectionDataListDatabase[ParentT][ParentK],
  ChildK extends keyof ConnectionDataListDatabase[ParentT][ParentK][ChildT]
> = Pick<CudDataParams<ParentT>, "update" | "updateObject" | "now" | "skipUpdate"> & {
  connections: ConnectionsBaseType<ParentT, ParentK, ChildT, ChildK>[];
};
