"use client"

import { useState, useEffect } from "react"
import { StorageBrowser, FileItem } from "@/components/app-browser"
import { AppSidebar, ConnectionConfig } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { getDownloadUrl, listStorageFiles } from "./action"

export default function Page() {
  const [config, setConfig] = useState<ConnectionConfig | null>(null);
  const [currentPath, setCurrentPath] = useState<string>("/");
  const [files, setFiles] = useState<FileItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch files whenever the config or path changes
  useEffect(() => {
    if (!config) return; // Don't fetch if not connected

    async function fetchFiles() {
      setIsLoading(true);
      setError(null);
      try {
        const data = await listStorageFiles(config!, currentPath);
        const safeData: FileItem[] = data.map((item) => ({
          id: item.id,
          name: item.name,
          // Cast the type to satisfy TypeScript, defaulting to "unknown"
          type: (item.type === "folder" ? "folder" : "unknown") as FileItem["type"],
          // Force numbers (like byte sizes) into strings
          size: item.size !== null && item.size !== undefined ? String(item.size) : "--",
          // Force dates or nulls into strings
          lastModified: item.lastModified ? String(item.lastModified) : "--",
        }));
        setFiles(safeData);
      } catch (err) {
        setError(`Failed to load files. Check your connection settings. ${err}`);
        setFiles([]);
      } finally {
        setIsLoading(false);
      }
    }

    fetchFiles();
  }, [config, currentPath]);

  // Handler for when the user clicks "Connect" in the sidebar
  const handleConnect = (newConfig: ConnectionConfig) => {
    setConfig(newConfig);
    setCurrentPath("/"); // Reset to root path on new connection
  };

  // Handler for clicking a folder in the StorageBrowser
  const handleNavigate = (folderName: string) => {
    // Ensure clean path building
    console.log(folderName)
    // const cleanPath = currentPath.endsWith('/') ? currentPath : `${currentPath}/`;
    setCurrentPath(`${folderName}/`);
  };
  // Handler for clicking the download button
  const handleDownload = async (fileId: string, fileName: string) => {
    if (!config) return;
    
    try {
      // 1. Fetch the pre-signed URL from OpenDAL
      const downloadUrl = await getDownloadUrl(config, fileId);

      // 2. Create an invisible anchor tag to trigger the browser's native download
      const link = document.createElement("a");
      link.href = downloadUrl;
      
      // The download attribute suggests a filename to the browser
      link.download = fileName; 
      link.target = "_blank"; // Safe fallback 
      
      // Append, click, and clean up
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
    } catch (error) {
      console.error("Failed to download file:", error);
      // Optional: You could add a toast notification here to alert the user
      alert("Failed to download file. Please check your connection."); 
    }
  };

  return (
    <SidebarProvider
      style={{
        "--sidebar-width": "calc(var(--spacing) * 78)",
        "--header-height": "calc(var(--spacing) * 12)",
      } as React.CSSProperties}
    >
      {/* Pass the handleConnect function to the Sidebar */}
      <AppSidebar variant="inset" onConnect={handleConnect} />
      
      <SidebarInset>
        <SiteHeader currentPath={currentPath} onNavigate={handleNavigate} />
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
              <div className="px-4 lg:px-6">
                
                {/* Basic UI Feedback */}
                {!config && (
                  <div className="p-8 text-center text-muted-foreground border rounded-xl border-dashed">
                    Please configure your connection settings in the sidebar to view files.
                  </div>
                )}
                
                {config && isLoading && (
                  <div className="p-8 text-center text-muted-foreground">
                    Loading directory contents...
                  </div>
                )}
                
                {config && error && (
                  <div className="p-4 mb-4 text-red-500 bg-red-50 dark:bg-red-950/20 rounded-xl border border-red-200 dark:border-red-900">
                    {error}
                  </div>
                )}

                {/* Render the browser when we have a config and aren't loading */}
                {config && !isLoading && !error && (
                  <StorageBrowser 
                    files={files} 
                    onNavigate={handleNavigate}
                    onDownload={handleDownload}
                  />
                )}

              </div>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}