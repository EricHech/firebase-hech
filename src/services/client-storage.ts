// Services
import { upsertData } from "./client-data";
import { firebaseStoragePut, firebaseStoragePutResumable, pushKey } from "./firebase";

// Helpers
import { getDownloadURL } from "firebase/storage";

// Constants
import { PATHS } from "./paths";

// Types
import type { CreateDataParams } from "./types";

type UploadFileParams = Pick<
  CreateDataParams<"firebaseWrapperFile">,
  "owners" | "publicAccess" | "connections" | "connectionAccess" | "ownershipAccess"
> & {
  dataKey?: string;
  file: Blob | Uint8Array | ArrayBuffer;
};

export const uploadFile = async ({
  owners,
  publicAccess,
  connections,
  connectionAccess,
  ownershipAccess,
  file,
  dataKey = pushKey(PATHS.dataType("firebaseWrapperFile")),
}: UploadFileParams) => {
  const downloadUrl = await firebaseStoragePut(PATHS.dataKey("firebaseWrapperFile", dataKey), file);

  await upsertData({
    dataType: "firebaseWrapperFile",
    dataKey,
    data: { downloadUrl },
    owners,
    publicAccess,
    connections,
    connectionAccess,
    ownershipAccess,
    makeGetRequests: true,
  });

  return { dataKey, downloadUrl };
};

export const uploadFileResumable = ({
  owners,
  publicAccess,
  connections,
  connectionAccess,
  ownershipAccess,
  file,
  dataKey = pushKey(PATHS.dataType("firebaseWrapperFile")),
}: UploadFileParams) => {
  const task = firebaseStoragePutResumable(PATHS.dataKey("firebaseWrapperFile", dataKey), file);

  const triggerUpsertData = async () => {
    const downloadUrl = await getDownloadURL((await task).ref);

    await upsertData({
      dataType: "firebaseWrapperFile",
      dataKey,
      data: { downloadUrl },
      owners,
      publicAccess,
      connections,
      connectionAccess,
      ownershipAccess,
      makeGetRequests: true,
    });

    return downloadUrl;
  };

  return { task, dataKey, triggerUpsertData };
};
