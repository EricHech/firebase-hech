export interface AppUser {
  /** This exists here if you passed a username to the `signUp` method */
  username?: string;
}

export interface RemoteRequest {
  remoteRequestUid: string;
}

export interface SoilDatabase {
  /** Soil reserved name: Must be `publicAccess === true`. */
  appUser: AppUser;
  /** Soil reserved name. */
  soilFile: { downloadUrl: string; metadata?: Record<string, string> };
  /** Soil reserved name. See README. */
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
    connectionType: keyof SoilDatabase;
    connectionKey: string;
    uidDataType: keyof SoilDatabase;
    read: boolean;
    write: boolean;
  };
  ownershipAccess?: {
    dataType: keyof SoilDatabase;
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

export type Data<T2 extends keyof SoilDatabase> = StandardDataFields & {
  key?: string;
  publicAccess: Nullable<boolean>;
} & SoilDatabase[T2];

export type StatefulData<T2 extends keyof SoilDatabase> = Maybe<Nullable<Data<T2>>>;

export type DataList = Record<keyof SoilDatabase, Record<string, number>>;

export type UpdateObject<T2 extends keyof SoilDatabase = keyof SoilDatabase> = Record<
  string,
  SoilDatabase[T2] | null | boolean | number | string | object
>;

export type StatefulDataType<T2 extends keyof SoilDatabase> = Record<string, Nullable<StatefulData<T2>>>;

export type TrackingData = {
  createdAt: number;
  uid: string;
  metadata: Nullable<object>;
};

export type TriggerFunctionRequest = {
  error?: { message: string };
};

export type GetFunction = <GT>(path: string) => Promise<GT | null>;

export type GetDataKeyValueParams<T2 extends keyof SoilDatabase> = {
  get: GetFunction;
  dataType: T2;
  dataKey: string;
};

export type GetDataTypeValueParams<T2 extends keyof SoilDatabase> = {
  get: GetFunction;
  dataType: T2;
};

export type CudDataParams<T2 extends keyof SoilDatabase> = {
  update: (path: string, d: UpdateObject<T2>, allowRootQuery?: boolean, isDelete?: boolean) => Promise<void>;
  updateObject?: UpdateObject<T2>;
  skipUpdate?: boolean;
  dataType: T2;
  dataKey: string;
  publicAccess?: boolean;
  now?: number;
};

export type Connections = {
  type: keyof SoilDatabase;
  key: string;
}[];

export type CreateDataParams<T2 extends keyof SoilDatabase> = CudDataParams<T2> & {
  data: SoilDatabase[T2];
  owners: string[];
  connections?: Connections;
  connectionAccess?: StandardDataFields["connectionAccess"];
  ownershipAccess?: StandardDataFields["ownershipAccess"];
};

export type ChangeDataKey<T2 extends keyof SoilDatabase, T22 extends keyof SoilDatabase> = Pick<
  CudDataParams<T2>,
  "update"
> & {
  get: GetFunction;
  existingDataType: T2;
  existingDataKey: string;
  newDataType?: T22;
  newDataKey: string;
};

export type UpdateDataParams<T2 extends keyof SoilDatabase> = CudDataParams<T2> & {
  get: GetFunction;
  data: Partial<SoilDatabase[T2]>;
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

export type RemoveDataKeyParams<T2 extends keyof SoilDatabase> = Omit<CudDataParams<T2>, "publicAccess" | "now"> & {
  get: GetFunction;
  existingOwners?: Nullable<string[]>;
  existingConnections?: DataList;
};

export type GetOwnerDataParams<T2 extends keyof SoilDatabase> = {
  get: GetFunction;
  dataType: T2;
  dataKey: string;
  uid: string;
};

export type GetOwnersDataParams<T2 extends keyof SoilDatabase> = {
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

export type OnUserDataTypeListChildAddedParams<T2 extends keyof SoilDatabase> = {
  onChildAdded: (
    path: string,
    cb: (val: Nullable<DataList>, key: string, previousOrderingKey?: Nullable<string>) => void
  ) => VoidFunction;
  uid: string;
  dataType: T2;
  cb: (userData: Nullable<DataList>, key: string, previousOrderingKey?: Nullable<string>) => void;
};

export type OnDataValueParams<T2 extends keyof SoilDatabase> = {
  onValue: (path: string, cb: (val: Nullable<Data<T2>>) => void) => VoidFunction;
  dataType: T2;
  dataKey: string;
  cb: (data: Nullable<Data<T2>>) => void;
};

export type OnConnectionTypeChildAddedParams<T2 extends keyof SoilDatabase> = {
  onChildAdded: (
    path: string,
    cb: (val: Nullable<SoilDatabase[T2]>, key: string, previousOrderingKey?: Nullable<string>) => void
  ) => VoidFunction;
  dataType: T2;
  dataKey: string;
  connectionType: keyof SoilDatabase;
  cb: (data: Nullable<SoilDatabase[T2]>) => void;
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

export type QueryDataParams<T2 extends keyof SoilDatabase, T3 extends keyof Data<T2>> = {
  queryOrderByChildEqualTo: <QT>(params: QueryOrderByChildParams) => Promise<Nullable<QT>>;
  dataType: T2;
  childKey: T3;
  queryValue: Data<T2>[T3];
  limit?: number;
};

export type AfterCollisionFreeUpdateHandler<T2 extends keyof SoilDatabase, T3 extends keyof Data<T2>> = Pick<
  UpdateDataParams<T2>,
  "get" | "update" | "dataType" | "dataKey" | "makeGetRequests" | "makeConnectionsRequests" | "makeOwnersRequests"
>;

export type SoilIncrement<T2 extends keyof SoilDatabase, T3 extends keyof Data<T2>> = AfterCollisionFreeUpdateHandler<
  T2,
  T3
> & { field: T3; delta: number };

export type SoilTransactionWithCbParams<
  T2 extends keyof SoilDatabase,
  T3 extends keyof Data<T2>
> = AfterCollisionFreeUpdateHandler<T2, T3> & {
  field: T3;
  cb: (value: Nullable<Data<T2>[T3]>) => Data<T2>[T3];
  transactionWithCb: <T>(path: string, cb: (val: Nullable<T>) => T) => Promise<unknown>;
};

export type ModifyConnectionsType<T2 extends keyof SoilDatabase> = Pick<
  CudDataParams<T2>,
  "update" | "updateObject" | "now" | "skipUpdate"
> & {
  connections: {
    dataType: keyof SoilDatabase;
    dataKey: string;
    connectionType: keyof SoilDatabase;
    connectionKey: string;
  }[];
};
