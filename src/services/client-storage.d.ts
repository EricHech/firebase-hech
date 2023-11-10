import type { SoilDatabase } from "..";
import type { CreateDataParams } from "./types";
export declare const uploadFile: ({ owners, publicAccess, connections, connectionAccess, file, dataKey, }: Pick<CreateDataParams<SoilDatabase, "soilFile">, "connectionAccess" | "publicAccess" | "owners" | "connections"> & {
    dataKey?: string;
    file: Blob | Uint8Array | ArrayBuffer;
}) => Promise<{
    dataKey: string;
    downloadUrl: string;
}>;
export declare const uploadFileResumable: ({ owners, publicAccess, connections, connectionAccess, file, dataKey, }: Pick<CreateDataParams<SoilDatabase, "soilFile">, "connectionAccess" | "publicAccess" | "owners" | "connections"> & {
    dataKey?: string;
    file: Blob | Uint8Array | ArrayBuffer;
}) => {
    task: import("@firebase/storage").UploadTask;
    dataKey: string;
    triggerUpsertData: () => Promise<string>;
};
