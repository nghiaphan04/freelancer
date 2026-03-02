export const handleDownload = async (url: string, filename?: string) => {
  if (!url || url === "#") return;
  
  try {
    // Fetch file data
    const response = await fetch(url);
    const blob = await response.blob();
    
    // Create local URL for the blob
    const blobUrl = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = blobUrl;
    link.download = filename || "document.pdf";
    
    // Trigger download
    document.body.appendChild(link);
    link.click();
    
    // Cleanup
    document.body.removeChild(link);
    window.URL.revokeObjectURL(blobUrl);
  } catch (error) {
    console.error("Download error:", error);
    // Fallback: open in new tab if fetch fails (e.g. CORS)
    window.open(url, "_blank");
  }
};
