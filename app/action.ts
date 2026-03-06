"use server"

import { FileType } from "@/components/app-browser";
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
      let fileType: FileType = "unknown";
      const metadata = entry.metadata()
      const isFolder = metadata.isDirectory()
      if (isFolder) {
        fileType = "folder";
      } else {
        // 3. Safely extract the extension
        const pathArray = pathString.split('.');
        
        // Check if it actually has an extension (e.g., length > 1 prevents files like "Makefile" from breaking)
        if (pathArray.length > 1) {
          // Get the last item and convert to lowercase for safe matching
          const extension = pathArray[pathArray.length - 1].toLowerCase();

          switch (extension) {
            // Image types
            case "png":
            case "jpg":
            case "jpeg":
            case "gif":
            case "svg":
            case "webp":
              fileType = "image";
              break;
            
            // Document types
            case "pdf":
              fileType = "pdf";
              break;
            
            // Data types
            case "json":
              fileType = "json";
              break;
            
            // Video types
            case "mp4":
            case "mkv":
            case "avi":
            case "mov":
            case "webm":
              fileType = "video";
              break;
            
            // Anything else stays "unknown"
            default:
              fileType = "unknown";
          }
        }
      }
      const sizeFile = metadata.contentLength ? Math.round(Number(metadata.contentLength) / 1024) + "KB" : "--"      
      return {
        id: pathString,
        name: pathString || pathString.split('/').filter(Boolean).pop() || "unknown",
        type: fileType, // We can refine file types later
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