"use server"

import { Operator } from "opendal"

interface ConnectionConfig {
  endpoint: string;
  accessKey: string;
  secretKey: string;
  bucket: string;
  region: string;
}

export async function listStorageFiles(config: ConnectionConfig, path: string) {
  try {
    const op = new Operator("s3", {
      endpoint: config.endpoint,
      access_key_id: config.accessKey,
      secret_access_key: config.secretKey,
      bucket: config.bucket,
      region: config.region,
    });

    const entries = await op.list(path);

    const formattedFiles = entries.map((entry) => {

      const pathString = entry.path()
      const metadata = entry.metadata()
      const sizeFile = metadata.contentLength ? Math.round(Number(metadata.contentLength) / 1024) : "--"      
      return {
        id: pathString,
        name: pathString || pathString.split('/').filter(Boolean).pop() || "unknown",
        type: metadata.isDirectory() ? "folder" : "file", // We can refine file types later
        size: sizeFile, // Requires a separate op.stat() call to get real size
        lastModified: metadata.lastModified, // Requires a separate op.stat() call
      };
    });

    return formattedFiles;
  } catch (error) {
    console.error("OpenDAL Error:", error);
    throw new Error("Failed to connect or list files.");
  }
}

export async function getDownloadUrl(config: ConnectionConfig, path: string) {
  try {
    const op = new Operator("s3", {
      endpoint: config.endpoint,
      access_key_id: config.accessKey,
      secret_access_key: config.secretKey,
      bucket: config.bucket,
      region: config.region,
    });

    // Generate a secure, temporary URL valid for 1 hour (3600 seconds)
    const req = await op.presignRead(path, 3600);
    
    return req.url;
  } catch (error) {
    console.error("Presign URL Error:", error);
    throw new Error("Failed to generate download link.");
  }
}