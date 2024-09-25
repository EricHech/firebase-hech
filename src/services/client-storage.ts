// Services
import { updateData, upsertData } from "./client-data";
import { firebaseStoragePut, firebaseStoragePutResumable, pushKey, UploadMetadata } from "./firebase";

// Helpers
import { getDownloadURL } from "firebase/storage";

// Constants
import { PATHS } from "./paths";

// Types
import type { ConnectionDataListDatabase, CreateDataParams, FirebaseHechDatabase, FirebaseHechFile } from "./types";

type UploadFileParams<
  ParentT extends keyof ConnectionDataListDatabase,
  ParentK extends keyof ConnectionDataListDatabase[ParentT],
  ChildT extends keyof ConnectionDataListDatabase[ParentT][ParentK],
  ChildK extends keyof ConnectionDataListDatabase[ParentT][ParentK][ChildT]
> = Pick<
  CreateDataParams<"firebaseHechFile", ParentT, ParentK, ChildT, ChildK>,
  "publicAccess" | "connections" | "connectionAccess" | "ownershipAccess"
> & {
  owner: string;
  dataKey?: string;
  file: Blob | Uint8Array | ArrayBuffer;
  metadata?: UploadMetadata;
  firebaseHechFileMetadata?: FirebaseHechFile["metadata"];
};

export const uploadFile = async <
  ParentT extends keyof ConnectionDataListDatabase,
  ParentK extends keyof ConnectionDataListDatabase[ParentT],
  ChildT extends keyof ConnectionDataListDatabase[ParentT][ParentK],
  ChildK extends keyof ConnectionDataListDatabase[ParentT][ParentK][ChildT]
>({
  owner,
  publicAccess,
  connections,
  connectionAccess,
  ownershipAccess,
  file,
  dataKey = pushKey(PATHS.dataType("firebaseHechFile")),
  metadata,
  firebaseHechFileMetadata,
}: UploadFileParams<ParentT, ParentK, ChildT, ChildK>) => {
  const downloadUrl = await firebaseStoragePut(PATHS.storageKey(owner, dataKey), file, metadata);

  await upsertData({
    dataType: "firebaseHechFile",
    dataKey,
    data: { downloadUrl, uploadedByUid: owner },
    owners: [owner],
    publicAccess,
    connections,
    connectionAccess,
    ownershipAccess,
    makeGetRequests: true,
  });

  // Paired Comment #1 - firebaseHechFile.finished
  // Once the data has been saved and connections created, indicate that it is done
  // Reasoning: as an example, this would allow cloud functions to know when it is safe to operate
  const data: Partial<FirebaseHechDatabase["firebaseHechFile"]> = { finished: true };
  if (firebaseHechFileMetadata) data.metadata = firebaseHechFileMetadata;

  await updateData({
    dataType: "firebaseHechFile",
    dataKey,
    data,
    makeGetRequests: true,
  });

  return { dataKey, downloadUrl };
};

export const uploadFileResumable = <
  ParentT extends keyof ConnectionDataListDatabase,
  ParentK extends keyof ConnectionDataListDatabase[ParentT],
  ChildT extends keyof ConnectionDataListDatabase[ParentT][ParentK],
  ChildK extends keyof ConnectionDataListDatabase[ParentT][ParentK][ChildT]
>({
  owner,
  publicAccess,
  connections,
  connectionAccess,
  ownershipAccess,
  file,
  dataKey = pushKey(PATHS.dataType("firebaseHechFile")),
  metadata,
  firebaseHechFileMetadata,
}: UploadFileParams<ParentT, ParentK, ChildT, ChildK>) => {
  const task = firebaseStoragePutResumable(PATHS.storageKey(owner, dataKey), file, metadata);

  const triggerUpsertData = async () => {
    const downloadUrl = await getDownloadURL((await task).ref);

    await upsertData({
      dataType: "firebaseHechFile",
      dataKey,
      data: { downloadUrl, uploadedByUid: owner },
      owners: [owner],
      publicAccess,
      connections,
      connectionAccess,
      ownershipAccess,
      makeGetRequests: true,
    });

    // Paired Comment #2 - firebaseHechFile.finished
    // Once the data has been saved and connections created, indicate that it is done
    // Reasoning: as an example, this would allow cloud functions to know when it is safe to operate
    const data: Partial<FirebaseHechDatabase["firebaseHechFile"]> = { finished: true };
    if (firebaseHechFileMetadata) data.metadata = firebaseHechFileMetadata;

    await updateData({
      dataType: "firebaseHechFile",
      dataKey,
      data,
      makeGetRequests: true,
    });

    return downloadUrl;
  };

  return { task, dataKey, triggerUpsertData };
};
