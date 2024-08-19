export interface AppUser {
  /** This exists here if you passed a username to the `signUp` method */
  username?: string;
}

export interface RemoteRequest {
  remoteRequestUid: string;
}

export interface FirebaseHechDatabase {
  /** Firebase Hech reserved name: Must be `publicAccess === true`. */
  appUser: AppUser;
  /** Firebase Hech reserved name. */
  firebaseHechFile: { downloadUrl: string; metadata?: Record<string, string> };
  /** Firebase Hech reserved name. See README. */
  remoteRequest: RemoteRequest;
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
};

export type Connections = {
  type: keyof FirebaseHechDatabase;
  key: string;
}[];

export type CreateDataParams<T2 extends keyof FirebaseHechDatabase> = CudDataParams<T2> & {
  data: FirebaseHechDatabase[T2];
  owners: string[];
  connections?: Connections;
  connectionAccess?: StandardDataFields["connectionAccess"];
  ownershipAccess?: StandardDataFields["ownershipAccess"];
};

export type ChangeDataKey<T2 extends keyof FirebaseHechDatabase, T22 extends keyof FirebaseHechDatabase> = Pick<
  CudDataParams<T2>,
  "update"
> & {
  get: GetFunction;
  existingDataType: T2;
  existingDataKey: string;
  newDataType?: T22;
  newDataKey: string;
};

export type UpdateDataParams<T2 extends keyof FirebaseHechDatabase> = CudDataParams<T2> & {
  get: GetFunction;
  data: Partial<FirebaseHechDatabase[T2]>;
  owners?: string[];
  connections?: Connections;
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
  "publicAccess" | "now"
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

export type AfterCollisionFreeUpdateHandler<T2 extends keyof FirebaseHechDatabase, T3 extends keyof Data<T2>> = Pick<
  UpdateDataParams<T2>,
  "get" | "update" | "dataType" | "dataKey" | "makeGetRequests" | "makeConnectionsRequests" | "makeOwnersRequests"
>;

export type FirebaseHechIncrement<
  T2 extends keyof FirebaseHechDatabase,
  T3 extends keyof Data<T2>
> = AfterCollisionFreeUpdateHandler<T2, T3> & { field: T3; delta: number };

export type FirebaseHechTransactionWithCbParams<
  T2 extends keyof FirebaseHechDatabase,
  T3 extends keyof Data<T2>
> = AfterCollisionFreeUpdateHandler<T2, T3> & {
  field: T3;
  cb: (value: Nullable<Data<T2>[T3]>) => Data<T2>[T3];
  transactionWithCb: <T>(path: string, cb: (val: Nullable<T>) => T) => Promise<unknown>;
};

export type ModifyConnectionsType<T2 extends keyof FirebaseHechDatabase> = Pick<
  CudDataParams<T2>,
  "update" | "updateObject" | "now" | "skipUpdate"
> & {
  connections: {
    dataType: keyof FirebaseHechDatabase;
    dataKey: string;
    connectionType: keyof FirebaseHechDatabase;
    connectionKey: string;
  }[];
};
