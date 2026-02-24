/**
 * Utility functions for handling Google Drive URLs
 */

/**
 * Extracts the file ID from a Google Drive URL
 */
function extractFileId(url: string): string | null {
  const patterns = [
    /drive\.google\.com\/file\/d\/([^\/\?]+)/,
    /drive\.google\.com\/open\?id=([^&]+)/,
    /drive\.google\.com\/uc\?.*id=([^&]+)/,
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }

  return null;
}

/**
 * Converts Google Drive URL to embeddable video format
 * Returns the original URL if it's not a Google Drive URL
 */
export function convertGoogleDriveVideoUrl(url: string): {
  isGoogleDrive: boolean;
  embedUrl: string;
} {
  const fileId = extractFileId(url);

  if (fileId) {
    return {
      isGoogleDrive: true,
      embedUrl: `https://drive.google.com/file/d/${fileId}/preview`,
    };
  }

  return { isGoogleDrive: false, embedUrl: url };
}

/**
 * Converts Google Drive URL to direct image view format
 * Returns the original URL if it's not a Google Drive URL
 */
export function convertGoogleDriveImageUrl(url: string): string {
  const fileId = extractFileId(url);

  if (fileId) {
    return `https://drive.google.com/uc?export=view&id=${fileId}`;
  }

  return url;
}

/**
 * Checks if a URL is from Google Drive
 */
export function isGoogleDriveUrl(url: string): boolean {
  return /drive\.google\.com/.test(url);
}
