// In-memory store for attached files so large files (up to 200 MB) don't blow up localStorage
const memoryFileMap = new Map<string, { file: Blob | File; name: string; type: string; objectUrl?: string }>();

export function registerChatFile(id: string, file: Blob | File, name: string, type: string): string {
  let objectUrl = '';
  try {
    objectUrl = URL.createObjectURL(file);
  } catch {
    objectUrl = '';
  }
  memoryFileMap.set(id, { file, name, type, objectUrl });
  return objectUrl;
}

export function getChatFile(id: string): { file: Blob | File; name: string; type: string; objectUrl?: string } | undefined {
  return memoryFileMap.get(id);
}

export type AttachmentMediaType = 'image' | 'audio' | 'video' | 'document';

export function getAttachmentMediaType(fileName: string, mimeType?: string): AttachmentMediaType {
  const ext = (fileName.split('.').pop() || '').toLowerCase();
  const mime = (mimeType || '').toLowerCase();

  // 1. Images: JPG, JPEG, PNG, WEBP, GIF, etc.
  const imageExtensions = ['jpg', 'jpeg', 'png', 'webp', 'gif', 'svg', 'bmp', 'avif', 'ico'];
  if (imageExtensions.includes(ext) || mime.startsWith('image/')) {
    return 'image';
  }

  // 2. Audio: MP3, WAV, M4A, AAC, FLAC, etc.
  const audioExtensions = ['mp3', 'wav', 'm4a', 'aac', 'flac', 'ogg', 'aiff', 'wma', 'opus', 'mid', 'midi'];
  if (audioExtensions.includes(ext) || mime.startsWith('audio/')) {
    return 'audio';
  }

  // 3. Video: MP4, MOV, WEBM, etc.
  const videoExtensions = ['mp4', 'mov', 'webm', 'mkv', 'avi', 'm4v', '3gp', 'wmv', 'flv'];
  if (videoExtensions.includes(ext) || mime.startsWith('video/')) {
    return 'video';
  }

  // 4. Documents / Other: PDF, DOC, DOCX, XLS, XLSX, ZIP, RAR, etc.
  return 'document';
}

export function getChatFileUrl(attachment: { id?: string; name: string; size: number; type?: string; url?: string }): string {
  if (attachment.id && memoryFileMap.has(attachment.id)) {
    const item = memoryFileMap.get(attachment.id)!;
    if (item.objectUrl) {
      return item.objectUrl;
    }
    try {
      item.objectUrl = URL.createObjectURL(item.file);
      return item.objectUrl;
    } catch {
      // ignore
    }
  }
  if (attachment.url) {
    return attachment.url;
  }
  return '';
}

export function downloadChatAttachment(attachment: { id?: string; name: string; size: number; type?: string; url?: string }) {
  let downloadUrl = attachment.url;
  let revokeAfter = false;

  if (attachment.id && memoryFileMap.has(attachment.id)) {
    const item = memoryFileMap.get(attachment.id)!;
    downloadUrl = item.objectUrl || URL.createObjectURL(item.file);
    revokeAfter = !item.objectUrl;
  } else if (!downloadUrl || downloadUrl.startsWith('mock:')) {
    // Generate fallback blob for initial demo attachments or after browser reload
    const dummyContent = `Nain Music Private Audio Attachment: ${attachment.name}\nFile Size: ${formatFileSize(attachment.size)}\nCreated: ${new Date().toISOString()}\n\n[Protected 1-to-1 Marketplace Attachment]`;
    const blob = new Blob([dummyContent], { type: attachment.type || 'application/octet-stream' });
    downloadUrl = URL.createObjectURL(blob);
    revokeAfter = true;
  }

  const link = document.createElement('a');
  link.href = downloadUrl;
  link.download = attachment.name;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  if (revokeAfter) {
    setTimeout(() => URL.revokeObjectURL(downloadUrl!), 5000);
  }
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}
