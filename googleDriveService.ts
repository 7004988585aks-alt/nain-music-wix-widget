import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getAuth, 
  signInWithPopup, 
  GoogleAuthProvider, 
  onAuthStateChanged, 
  signOut,
  User 
} from 'firebase/auth';
import firebaseConfig from '../../firebase-applet-config.json';

export const SCOPES = [
  'https://www.googleapis.com/auth/drive.file',
  'https://www.googleapis.com/auth/drive.readonly'
];

// Initialize Firebase App
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
export const auth = getAuth(app);

const provider = new GoogleAuthProvider();
SCOPES.forEach(scope => provider.addScope(scope));
provider.setCustomParameters({
  prompt: 'consent'
});

let cachedAccessToken: string | null = null;
let isSigningIn = false;

export interface GoogleDriveFile {
  id: string;
  name: string;
  mimeType: string;
  size?: string;
  webViewLink?: string;
  webContentLink?: string;
  iconLink?: string;
  modifiedTime?: string;
  parents?: string[];
}

export interface StudioFolderInfo {
  id: string;
  name: string;
  type: 'root' | 'audio' | 'stems' | 'video' | 'projects' | 'chat' | 'custom';
  webViewLink?: string;
}

export const initDriveAuth = (
  onAuthSuccess?: (user: User, token: string) => void,
  onAuthFailure?: () => void
) => {
  return onAuthStateChanged(auth, async (user: User | null) => {
    if (user && cachedAccessToken) {
      if (onAuthSuccess) onAuthSuccess(user, cachedAccessToken);
    } else {
      if (!isSigningIn) {
        cachedAccessToken = null;
        if (onAuthFailure) onAuthFailure();
      }
    }
  });
};

export const connectGoogleDrive = async (): Promise<{ user: User; accessToken: string } | null> => {
  try {
    isSigningIn = true;
    const result = await signInWithPopup(auth, provider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    if (!credential?.accessToken) {
      throw new Error('Could not retrieve Google Drive access token from credential.');
    }
    cachedAccessToken = credential.accessToken;
    return { user: result.user, accessToken: cachedAccessToken };
  } catch (error: any) {
    console.error('Google Drive sign in failed:', error);
    throw error;
  } finally {
    isSigningIn = false;
  }
};

export const getDriveAccessToken = (): string | null => {
  return cachedAccessToken;
};

export const disconnectGoogleDrive = async () => {
  await signOut(auth);
  cachedAccessToken = null;
};

/**
 * Fetch folders or files from Google Drive
 */
export const listDriveFiles = async (searchTerm?: string, parentFolderId?: string): Promise<GoogleDriveFile[]> => {
  if (!cachedAccessToken) {
    throw new Error('Google Drive is not connected. Please connect first.');
  }

  let query = "trashed = false";
  if (parentFolderId) {
    query += ` and '${parentFolderId}' in parents`;
  }
  if (searchTerm && searchTerm.trim()) {
    query += ` and name contains '${searchTerm.replace(/'/g, "\\'")}'`;
  }

  const fields = 'files(id, name, mimeType, size, webViewLink, webContentLink, iconLink, modifiedTime, parents)';
  const url = `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(query)}&fields=${encodeURIComponent(fields)}&orderBy=folder,modifiedTime desc&pageSize=50`;

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${cachedAccessToken}`,
      Accept: 'application/json'
    }
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Google Drive API error (${response.status}): ${errorText}`);
  }

  const data = await response.json();
  return data.files || [];
};

/**
 * Create a new folder in Google Drive
 */
export const createDriveFolder = async (folderName: string, parentFolderId?: string): Promise<GoogleDriveFile> => {
  if (!cachedAccessToken) {
    throw new Error('Google Drive is not connected.');
  }

  const metadata: { name: string; mimeType: string; parents?: string[] } = {
    name: folderName,
    mimeType: 'application/vnd.google-apps.folder'
  };

  if (parentFolderId) {
    metadata.parents = [parentFolderId];
  }

  const response = await fetch('https://www.googleapis.com/drive/v3/files?fields=id,name,mimeType,webViewLink', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${cachedAccessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(metadata)
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to create folder (${response.status}): ${errorText}`);
  }

  return await response.json();
};

/**
 * Automatically creates/detects the Nain Music Studio folder structure:
 * - Nain Music - Studio Vault
 *   ├── 01 - Master Audio & WAVs
 *   ├── 02 - Audio Stems & Multitracks
 *   ├── 03 - Music Videos & Visualizers
 *   ├── 04 - Project Sessions & ZIPs
 *   └── 05 - Chat Files & Media (Audio, Video, PDF, Docs)
 */
export const setupStudioFolderStructure = async (): Promise<StudioFolderInfo[]> => {
  if (!cachedAccessToken) {
    throw new Error('Google Drive is not connected.');
  }

  // 1. Search for existing root folder
  const existingFiles = await listDriveFiles('Nain Music - Studio Vault');
  let rootFolder = existingFiles.find(
    f => f.mimeType === 'application/vnd.google-apps.folder' && f.name.includes('Nain Music')
  );

  if (!rootFolder) {
    rootFolder = await createDriveFolder('📁 Nain Music - Studio Vault');
  }

  // 2. Sub-folders to create
  const targetSubFolders = [
    { name: '🎧 01 - Master Audio & WAVs', type: 'audio' as const },
    { name: '🎹 02 - Audio Stems & Multitracks', type: 'stems' as const },
    { name: '🎬 03 - Music Videos & Visualizers', type: 'video' as const },
    { name: '📦 04 - Project Sessions & ZIPs', type: 'projects' as const },
    { name: '💬 05 - Chat Files & Media (Audio, Video, PDF, Docs)', type: 'chat' as const }
  ];

  const existingSubFiles = await listDriveFiles('', rootFolder.id);
  const resultFolders: StudioFolderInfo[] = [
    {
      id: rootFolder.id,
      name: rootFolder.name,
      type: 'root',
      webViewLink: rootFolder.webViewLink || `https://drive.google.com/drive/folders/${rootFolder.id}`
    }
  ];

  for (const target of targetSubFolders) {
    let sub = existingSubFiles.find(
      f => f.mimeType === 'application/vnd.google-apps.folder' && (
        f.name.includes(target.name.split('-')[1]?.trim() || target.name) ||
        (target.type === 'chat' && f.name.toLowerCase().includes('chat'))
      )
    );

    if (!sub) {
      sub = await createDriveFolder(target.name, rootFolder.id);
    }

    resultFolders.push({
      id: sub.id,
      name: sub.name,
      type: target.type,
      webViewLink: sub.webViewLink || `https://drive.google.com/drive/folders/${sub.id}`
    });
  }

  return resultFolders;
};

/**
 * Get or automatically create the dedicated Chat Files & Media folder in Google Drive
 */
export const getOrCreateChatDriveFolder = async (): Promise<StudioFolderInfo> => {
  const allFolders = await setupStudioFolderStructure();
  const chatFolder = allFolders.find(f => f.type === 'chat');
  if (chatFolder) {
    return chatFolder;
  }
  return allFolders[0];
};

/**
 * Upload a chat attachment (audio, video, pdf, image, doc) directly to the Google Drive Chat folder
 */
export const uploadChatFileToGoogleDrive = async (
  file: File | Blob,
  fileName: string,
  mimeType?: string
): Promise<GoogleDriveFile> => {
  if (!cachedAccessToken) {
    throw new Error('Google Drive is not connected.');
  }

  const chatFolder = await getOrCreateChatDriveFolder();

  const metadata: { name: string; mimeType: string; description: string; parents?: string[] } = {
    name: fileName,
    mimeType: mimeType || (file instanceof File ? file.type : 'application/octet-stream') || 'application/octet-stream',
    description: 'Uploaded via Nain Music Private Chat & Collaboration'
  };

  if (chatFolder && chatFolder.id) {
    metadata.parents = [chatFolder.id];
  }

  const form = new FormData();
  form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
  form.append('file', file, fileName);

  const response = await fetch(
    'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,mimeType,size,webViewLink,webContentLink,modifiedTime,parents',
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${cachedAccessToken}`
      },
      body: form
    }
  );

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Drive upload failed: ${err}`);
  }

  return await response.json();
};

/**
 * Upload a file directly to Google Drive into a designated folder
 */
export const uploadFileToDrive = async (
  file: File, 
  targetFolderId?: string
): Promise<GoogleDriveFile> => {
  if (!cachedAccessToken) {
    throw new Error('Google Drive is not connected.');
  }

  const metadata: { name: string; mimeType: string; description: string; parents?: string[] } = {
    name: file.name,
    mimeType: file.type || 'application/octet-stream',
    description: 'Uploaded via Nain Music Studio Platform'
  };

  if (targetFolderId) {
    metadata.parents = [targetFolderId];
  }

  const form = new FormData();
  form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
  form.append('file', file);

  const response = await fetch(
    'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,mimeType,size,webViewLink,webContentLink,modifiedTime,parents',
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${cachedAccessToken}`
      },
      body: form
    }
  );

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Drive upload failed: ${err}`);
  }

  return await response.json();
};

/**
 * Delete a file permanently or move to trash from Google Drive
 */
export const deleteDriveFile = async (fileId: string): Promise<boolean> => {
  if (!cachedAccessToken) {
    console.warn('Google Drive is not connected: cannot delete file');
    return false;
  }

  try {
    const response = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${cachedAccessToken}`
      }
    });

    if (response.status === 204 || response.ok || response.status === 404) {
      return true;
    }

    console.warn(`Drive delete returned status ${response.status}`);
    return false;
  } catch (err) {
    console.error('Failed to delete file from Google Drive:', err);
    return false;
  }
};

/**
 * Delete a chat attachment from Google Drive in real-time.
 * Searches by explicit driveFileId, and also by fileName in the Chat Media folder & Studio Vault to guarantee complete removal.
 */
export const deleteChatAttachmentFromDrive = async (
  fileName: string,
  driveFileId?: string
): Promise<boolean> => {
  if (!cachedAccessToken) {
    console.warn('Google Drive token missing. Skipping remote Drive deletion.');
    return false;
  }

  let deletedAny = false;

  // 1. Direct ID deletion if known
  if (driveFileId) {
    const ok = await deleteDriveFile(driveFileId);
    if (ok) deletedAny = true;
  }

  // 2. Search by filename across the Chat Folder and Studio Vault to ensure no orphan files remain
  try {
    const cleanFileName = fileName.trim().replace(/'/g, "\\'");
    
    // Search query in Google Drive
    const query = `name = '${cleanFileName}' and trashed = false`;
    const searchUrl = `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(query)}&fields=files(id,name,parents)`;
    
    const res = await fetch(searchUrl, {
      headers: {
        Authorization: `Bearer ${cachedAccessToken}`,
        Accept: 'application/json'
      }
    });

    if (res.ok) {
      const data = await res.json();
      if (data.files && Array.isArray(data.files) && data.files.length > 0) {
        for (const file of data.files) {
          if (file.id !== driveFileId) {
            const ok = await deleteDriveFile(file.id);
            if (ok) deletedAny = true;
          }
        }
      }
    }
  } catch (err) {
    console.error('Error during Google Drive file search and delete:', err);
  }

  return deletedAny;
};

/**
 * Get or create specific delivery folders in Google Drive (Master Audio, Stems, Projects)
 */
export const getOrCreateDeliveryDriveFolder = async (
  folderType: 'audio' | 'stems' | 'video' | 'projects' = 'audio'
): Promise<StudioFolderInfo> => {
  const allFolders = await setupStudioFolderStructure();
  const matched = allFolders.find(f => f.type === folderType);
  if (matched) return matched;
  return allFolders[0];
};

/**
 * Upload an Order Delivery heavy file (WAV master, Stems archive, ZIP) to Google Drive
 * These files are permanently preserved for accepted/completed orders.
 */
export const uploadDeliveryFileToGoogleDrive = async (
  file: File | Blob,
  fileName: string,
  orderNumber: string,
  folderType: 'audio' | 'stems' | 'video' | 'projects' = 'audio',
  mimeType?: string
): Promise<GoogleDriveFile> => {
  if (!cachedAccessToken) {
    throw new Error('Google Drive is not connected.');
  }

  const targetFolder = await getOrCreateDeliveryDriveFolder(folderType);

  const metadata: { name: string; mimeType: string; description: string; parents?: string[] } = {
    name: fileName,
    mimeType: mimeType || (file instanceof File ? file.type : 'application/octet-stream') || 'application/octet-stream',
    description: `Nain Music Order Delivery Deliverable for Order #${orderNumber}`
  };

  if (targetFolder && targetFolder.id) {
    metadata.parents = [targetFolder.id];
  }

  const form = new FormData();
  form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
  form.append('file', file, fileName);

  const response = await fetch(
    'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,mimeType,size,webViewLink,webContentLink,modifiedTime,parents',
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${cachedAccessToken}`
      },
      body: form
    }
  );

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Order delivery Google Drive upload failed: ${err}`);
  }

  return await response.json();
};

/**
 * Verify actual existence of a file in Google Drive after upload
 */
export const verifyDriveFile = async (fileId: string): Promise<{ exists: boolean; file?: GoogleDriveFile }> => {
  if (!cachedAccessToken) {
    return { exists: false };
  }

  try {
    const response = await fetch(
      `https://www.googleapis.com/drive/v3/files/${fileId}?fields=id,name,mimeType,size,webViewLink,webContentLink,modifiedTime,trashed`,
      {
        headers: {
          Authorization: `Bearer ${cachedAccessToken}`,
          Accept: 'application/json'
        }
      }
    );

    if (!response.ok) {
      return { exists: false };
    }

    const data = await response.json();
    return {
      exists: !data.trashed,
      file: data
    };
  } catch (err) {
    console.error('Error verifying Google Drive file:', err);
    return { exists: false };
  }
};

