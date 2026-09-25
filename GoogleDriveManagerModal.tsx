import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  X, 
  HardDrive, 
  Upload, 
  Search, 
  Check, 
  ExternalLink, 
  Music, 
  FileAudio, 
  RefreshCw, 
  LogOut, 
  ShieldCheck, 
  AlertCircle,
  File,
  Copy,
  FolderPlus,
  Folder,
  FolderOpen,
  Video,
  Layers,
  Sparkles,
  ArrowRight,
  MessageSquare,
  Trash2
} from 'lucide-react';
import { 
  connectGoogleDrive, 
  disconnectGoogleDrive, 
  listDriveFiles, 
  uploadFileToDrive, 
  deleteDriveFile,
  setupStudioFolderStructure,
  createDriveFolder,
  getDriveAccessToken,
  GoogleDriveFile,
  StudioFolderInfo,
  auth
} from '../../services/googleDriveService';
import { User as FirebaseUser } from 'firebase/auth';

interface GoogleDriveManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onFileSelect?: (file: GoogleDriveFile) => void;
}

export const GoogleDriveManagerModal: React.FC<GoogleDriveManagerModalProps> = ({
  isOpen,
  onClose,
  onFileSelect
}) => {
  const [user, setUser] = useState<FirebaseUser | null>(auth.currentUser);
  const [isConnected, setIsConnected] = useState<boolean>(!!auth.currentUser && !!getDriveAccessToken());
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSettingUpFolders, setIsSettingUpFolders] = useState<boolean>(false);
  const [folders, setFolders] = useState<StudioFolderInfo[]>([]);
  const [selectedFolderId, setSelectedFolderId] = useState<string>('all');
  const [uploadTargetFolderId, setUploadTargetFolderId] = useState<string>('');
  const [files, setFiles] = useState<GoogleDriveFile[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [uploadSuccess, setUploadSuccess] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showNewFolderModal, setShowNewFolderModal] = useState<boolean>(false);
  const [newFolderName, setNewFolderName] = useState<string>('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadFiles = useCallback(async (searchQuery?: string, folderFilter?: string) => {
    const token = getDriveAccessToken();
    if (!token) return;

    setIsLoading(true);
    setErrorMessage(null);
    try {
      const activeFolder = folderFilter !== undefined ? folderFilter : selectedFolderId;
      const targetFolderId = activeFolder !== 'all' ? activeFolder : undefined;
      const driveFiles = await listDriveFiles(
        searchQuery !== undefined ? searchQuery : searchTerm,
        targetFolderId
      );
      setFiles(driveFiles);
    } catch (err: any) {
      console.error('Load files error:', err);
      setErrorMessage(err?.message || 'Unable to fetch files from Google Drive.');
    } finally {
      setIsLoading(false);
    }
  }, [searchTerm, selectedFolderId]);

  const handleInitFolders = useCallback(async () => {
    const token = getDriveAccessToken();
    if (!token) return;

    setIsSettingUpFolders(true);
    setErrorMessage(null);
    try {
      const createdFolders = await setupStudioFolderStructure();
      setFolders(createdFolders);
      
      // Default upload target to Master Audio folder if available
      const audioFolder = createdFolders.find(f => f.type === 'audio') || createdFolders[0];
      if (audioFolder && !uploadTargetFolderId) {
        setUploadTargetFolderId(audioFolder.id);
      }
      setUploadSuccess('Studio folders structure initialized in your Google Drive!');
      setTimeout(() => setUploadSuccess(null), 4000);
      await loadFiles();
    } catch (err: any) {
      console.error('Folder setup error:', err);
      setErrorMessage(err?.message || 'Could not setup studio folders in Google Drive.');
    } finally {
      setIsSettingUpFolders(false);
    }
  }, [loadFiles, uploadTargetFolderId]);

  const handleConnect = async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const res = await connectGoogleDrive();
      if (res?.user) {
        setUser(res.user);
        setIsConnected(true);
        await handleInitFolders();
      }
    } catch (err: any) {
      console.error('Failed to connect Google Drive:', err);
      setErrorMessage(err?.message || 'Google Drive connection failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDisconnect = async () => {
    const confirm = window.confirm('Disconnect Google Drive from your studio session?');
    if (!confirm) return;

    try {
      await disconnectGoogleDrive();
      setUser(null);
      setIsConnected(false);
      setFiles([]);
      setFolders([]);
    } catch (err) {
      console.error('Disconnect error:', err);
    }
  };

  const handleCreateCustomFolder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFolderName.trim()) return;

    setIsLoading(true);
    try {
      const rootFolder = folders.find(f => f.type === 'root');
      const created = await createDriveFolder(newFolderName.trim(), rootFolder?.id);
      setFolders(prev => [
        ...prev,
        {
          id: created.id,
          name: created.name,
          type: 'custom',
          webViewLink: created.webViewLink
        }
      ]);
      setUploadTargetFolderId(created.id);
      setNewFolderName('');
      setShowNewFolderModal(false);
      setUploadSuccess(`Folder "${created.name}" created!`);
      setTimeout(() => setUploadSuccess(null), 3000);
      await loadFiles();
    } catch (err: any) {
      setErrorMessage(err?.message || 'Failed to create folder.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadFiles(searchTerm);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setErrorMessage(null);
    try {
      const targetFolder = uploadTargetFolderId || (folders.find(f => f.type === 'audio')?.id);
      const uploaded = await uploadFileToDrive(file, targetFolder);
      setUploadSuccess(`"${uploaded.name}" uploaded successfully into your Drive folder!`);
      setTimeout(() => setUploadSuccess(null), 4000);
      await loadFiles();
    } catch (err: any) {
      console.error('Upload error:', err);
      setErrorMessage(err?.message || 'File upload failed.');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const formatFileSize = (bytes?: string) => {
    if (!bytes) return 'Unknown size';
    const num = parseInt(bytes, 10);
    if (isNaN(num)) return 'Unknown size';
    if (num < 1024 * 1024) return `${(num / 1024).toFixed(1)} KB`;
    return `${(num / (1024 * 1024)).toFixed(1)} MB`;
  };

  const handleCopyLink = (file: GoogleDriveFile) => {
    const link = file.webViewLink || file.webContentLink || `https://drive.google.com/file/d/${file.id}/view`;
    navigator.clipboard.writeText(link);
    setCopiedId(file.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDeleteDriveItem = async (file: GoogleDriveFile) => {
    if (!confirm(`Are you sure you want to permanently delete "${file.name}" from your Google Drive?`)) {
      return;
    }
    setDeletingId(file.id);
    try {
      const ok = await deleteDriveFile(file.id);
      if (ok) {
        setFiles(prev => prev.filter(f => f.id !== file.id));
        setUploadSuccess(`"${file.name}" deleted from Google Drive!`);
        setTimeout(() => setUploadSuccess(null), 3500);
      } else {
        setErrorMessage(`Could not delete "${file.name}".`);
      }
    } catch (err: any) {
      setErrorMessage(err?.message || 'Delete failed.');
    } finally {
      setDeletingId(null);
    }
  };

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((u) => {
      const hasToken = !!getDriveAccessToken();
      setUser(u);
      setIsConnected(!!u && hasToken);
      if (u && hasToken && isOpen) {
        handleInitFolders();
      } else if (!u) {
        setFiles([]);
        setFolders([]);
      }
    });

    return () => unsubscribe();
  }, [isOpen, handleInitFolders]);

  useEffect(() => {
    if (isOpen && isConnected && getDriveAccessToken()) {
      if (folders.length === 0) {
        handleInitFolders();
      } else {
        loadFiles();
      }
    }
  }, [isOpen, isConnected, handleInitFolders, loadFiles, folders.length]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-4xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Modal Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 text-white font-bold text-sm flex items-center justify-center shadow-md">
              <HardDrive className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-extrabold text-white tracking-tight">
                  Google Drive Studio Storage & Folders
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-400 text-slate-950 border border-amber-300">
                  Seller Studio Private Vault
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Organized Google Drive folders for Master Audio, Audio Stems, Music Videos, and DAW Project Files.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-5">
          
          {errorMessage && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-start gap-2 animate-in fade-in">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {uploadSuccess && (
            <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center gap-2 animate-in fade-in">
              <Check className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{uploadSuccess}</span>
            </div>
          )}

          {/* Connection Status Banner */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-2xs">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 shadow-2xs flex items-center justify-center shrink-0">
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"/>
                  <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"/>
                  <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"/>
                  <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.93 6.72-4.93z"/>
                </svg>
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-slate-900">
                    {isConnected ? 'Google Drive Connected' : 'Google Drive Disconnected'}
                  </h3>
                  {isConnected && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                      <ShieldCheck className="w-3 h-3 text-emerald-600" />
                      Active Studio Vault
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  {isConnected && user?.email 
                    ? `Authorized Account: ${user.email}` 
                    : 'Connect your personal or studio Google Drive account to create and organize audio/video folders.'}
                </p>
              </div>
            </div>

            <div>
              {isConnected ? (
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleInitFolders}
                    disabled={isSettingUpFolders}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition cursor-pointer shadow-xs disabled:opacity-50"
                    title="Auto-create and sync studio audio & video folders in Drive"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isSettingUpFolders ? 'animate-spin' : ''}`} />
                    <span>{isSettingUpFolders ? 'Setting Up...' : 'Sync Folders'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleDisconnect}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-white hover:bg-rose-50 text-slate-700 hover:text-rose-600 text-xs font-bold border border-slate-200 transition cursor-pointer"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    Disconnect
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={handleConnect}
                  disabled={isLoading}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md transition-all cursor-pointer disabled:opacity-50"
                >
                  {isLoading ? (
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <HardDrive className="w-3.5 h-3.5" />
                  )}
                  <span>Connect Google Drive</span>
                </button>
              )}
            </div>
          </div>

          {/* Drive Management Console (When connected) */}
          {isConnected ? (
            <div className="space-y-5">
              
              {/* Organized Studio Folders Section */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FolderOpen className="w-4 h-4 text-blue-600" />
                    <h3 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider">
                      Studio Folders in Google Drive
                    </h3>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setShowNewFolderModal(true)}
                      className="text-[11px] font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 cursor-pointer"
                    >
                      <FolderPlus className="w-3.5 h-3.5" />
                      <span>+ Custom Folder</span>
                    </button>

                    {folders.find(f => f.type === 'root')?.webViewLink && (
                      <a
                        href={folders.find(f => f.type === 'root')?.webViewLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[11px] font-bold text-slate-600 hover:text-slate-900 flex items-center gap-1 hover:underline"
                      >
                        <span>Open Vault in Drive</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                </div>

                {/* Folders Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  
                  {/* 1. Master Audio Folder */}
                  {(() => {
                    const f = folders.find(item => item.type === 'audio');
                    const isActive = selectedFolderId === (f?.id || 'audio_tab');
                    return (
                      <div
                        onClick={() => {
                          if (f) {
                            setSelectedFolderId(f.id);
                            setUploadTargetFolderId(f.id);
                            loadFiles(searchTerm, f.id);
                          }
                        }}
                        className={`p-3 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between space-y-2 ${
                          isActive 
                            ? 'bg-amber-500/10 border-amber-500 ring-2 ring-amber-500/20 shadow-xs' 
                            : 'bg-white border-slate-200 hover:border-amber-400'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center">
                            <FileAudio className="w-4 h-4" />
                          </div>
                          {f?.webViewLink && (
                            <a
                              href={f.webViewLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={(e) => e.stopPropagation()}
                              className="text-slate-400 hover:text-amber-600 p-1"
                              title="Open Audio Folder in Google Drive"
                            >
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          )}
                        </div>
                        <div>
                          <h4 className="font-extrabold text-xs text-slate-900 leading-snug">
                            Master Audio & WAVs
                          </h4>
                          <span className="text-[10px] text-slate-500 block">
                            Final masters, FLAC, MP3
                          </span>
                        </div>
                      </div>
                    );
                  })()}

                  {/* 2. Audio Stems Folder */}
                  {(() => {
                    const f = folders.find(item => item.type === 'stems');
                    const isActive = selectedFolderId === (f?.id || 'stems_tab');
                    return (
                      <div
                        onClick={() => {
                          if (f) {
                            setSelectedFolderId(f.id);
                            setUploadTargetFolderId(f.id);
                            loadFiles(searchTerm, f.id);
                          }
                        }}
                        className={`p-3 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between space-y-2 ${
                          isActive 
                            ? 'bg-purple-500/10 border-purple-500 ring-2 ring-purple-500/20 shadow-xs' 
                            : 'bg-white border-slate-200 hover:border-purple-400'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="w-8 h-8 rounded-lg bg-purple-100 text-purple-800 flex items-center justify-center">
                            <Music className="w-4 h-4" />
                          </div>
                          {f?.webViewLink && (
                            <a
                              href={f.webViewLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={(e) => e.stopPropagation()}
                              className="text-slate-400 hover:text-purple-600 p-1"
                              title="Open Stems Folder in Google Drive"
                            >
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          )}
                        </div>
                        <div>
                          <h4 className="font-extrabold text-xs text-slate-900 leading-snug">
                            Stems & Multitracks
                          </h4>
                          <span className="text-[10px] text-slate-500 block">
                            Vocals, Beats, Synths
                          </span>
                        </div>
                      </div>
                    );
                  })()}

                  {/* 3. Music Videos Folder */}
                  {(() => {
                    const f = folders.find(item => item.type === 'video');
                    const isActive = selectedFolderId === (f?.id || 'video_tab');
                    return (
                      <div
                        onClick={() => {
                          if (f) {
                            setSelectedFolderId(f.id);
                            setUploadTargetFolderId(f.id);
                            loadFiles(searchTerm, f.id);
                          }
                        }}
                        className={`p-3 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between space-y-2 ${
                          isActive 
                            ? 'bg-rose-500/10 border-rose-500 ring-2 ring-rose-500/20 shadow-xs' 
                            : 'bg-white border-slate-200 hover:border-rose-400'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="w-8 h-8 rounded-lg bg-rose-100 text-rose-800 flex items-center justify-center">
                            <Video className="w-4 h-4" />
                          </div>
                          {f?.webViewLink && (
                            <a
                              href={f.webViewLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={(e) => e.stopPropagation()}
                              className="text-slate-400 hover:text-rose-600 p-1"
                              title="Open Video Folder in Google Drive"
                            >
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          )}
                        </div>
                        <div>
                          <h4 className="font-extrabold text-xs text-slate-900 leading-snug">
                            Videos & Visualizers
                          </h4>
                          <span className="text-[10px] text-slate-500 block">
                            MP4s, Reels, 4K Clips
                          </span>
                        </div>
                      </div>
                    );
                  })()}

                  {/* 4. Project Sessions Folder */}
                  {(() => {
                    const f = folders.find(item => item.type === 'projects');
                    const isActive = selectedFolderId === (f?.id || 'projects_tab');
                    return (
                      <div
                        onClick={() => {
                          if (f) {
                            setSelectedFolderId(f.id);
                            setUploadTargetFolderId(f.id);
                            loadFiles(searchTerm, f.id);
                          }
                        }}
                        className={`p-3 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between space-y-2 ${
                          isActive 
                            ? 'bg-emerald-500/10 border-emerald-500 ring-2 ring-emerald-500/20 shadow-xs' 
                            : 'bg-white border-slate-200 hover:border-emerald-400'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center">
                            <Layers className="w-4 h-4" />
                          </div>
                          {f?.webViewLink && (
                            <a
                              href={f.webViewLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={(e) => e.stopPropagation()}
                              className="text-slate-400 hover:text-emerald-600 p-1"
                              title="Open Projects Folder in Google Drive"
                            >
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          )}
                        </div>
                        <div>
                          <h4 className="font-extrabold text-xs text-slate-900 leading-snug">
                            Project ZIPs & DAWs
                          </h4>
                          <span className="text-[10px] text-slate-500 block">
                            Logic, Ableton, FL Studio
                          </span>
                        </div>
                      </div>
                    );
                  })()}

                  {/* 5. Chat Files & Media Folder */}
                  {(() => {
                    const f = folders.find(item => item.type === 'chat');
                    const isActive = selectedFolderId === (f?.id || 'chat_tab');
                    return (
                      <div
                        onClick={() => {
                          if (f) {
                            setSelectedFolderId(f.id);
                            setUploadTargetFolderId(f.id);
                            loadFiles(searchTerm, f.id);
                          }
                        }}
                        className={`p-3 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between space-y-2 ${
                          isActive 
                            ? 'bg-amber-500/10 border-amber-500 ring-2 ring-amber-500/20 shadow-xs' 
                            : 'bg-white border-slate-200 hover:border-amber-400'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center">
                            <MessageSquare className="w-4 h-4" />
                          </div>
                          {f?.webViewLink && (
                            <a
                              href={f.webViewLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={(e) => e.stopPropagation()}
                              className="text-slate-400 hover:text-amber-600 p-1"
                              title="Open Chat Files Folder in Google Drive"
                            >
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          )}
                        </div>
                        <div>
                          <h4 className="font-extrabold text-xs text-slate-900 leading-snug">
                            Chat Media & Files
                          </h4>
                          <span className="text-[10px] text-slate-500 block">
                            Audio, Video, PDF & Docs
                          </span>
                        </div>
                      </div>
                    );
                  })()}

                </div>

                {/* Custom Folder Creator Dialog */}
                {showNewFolderModal && (
                  <form onSubmit={handleCreateCustomFolder} className="p-3 bg-blue-50 border border-blue-200 rounded-xl flex items-center gap-2 animate-in fade-in">
                    <FolderPlus className="w-4 h-4 text-blue-600 shrink-0" />
                    <input
                      type="text"
                      value={newFolderName}
                      onChange={(e) => setNewFolderName(e.target.value)}
                      placeholder="Enter new folder name (e.g., 05 - Commercial Deliverables)..."
                      className="flex-1 px-3 py-1.5 text-xs bg-white rounded-lg border border-blue-300 focus:outline-none"
                      autoFocus
                    />
                    <button
                      type="submit"
                      className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-lg cursor-pointer"
                    >
                      Create Folder
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowNewFolderModal(false)}
                      className="px-2.5 py-1.5 bg-slate-200 text-slate-700 hover:bg-slate-300 font-bold text-xs rounded-lg cursor-pointer"
                    >
                      Cancel
                    </button>
                  </form>
                )}
              </div>

              {/* Upload & Controls Bar */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3">
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                  
                  {/* Folder Selector for Upload */}
                  <div className="flex items-center gap-2 flex-1">
                    <span className="text-xs font-bold text-slate-600 shrink-0">
                      Upload Into:
                    </span>
                    <select
                      value={uploadTargetFolderId}
                      onChange={(e) => setUploadTargetFolderId(e.target.value)}
                      className="flex-1 py-1.5 px-3 text-xs bg-white rounded-xl border border-slate-300 font-bold text-slate-800 focus:outline-none focus:border-blue-500"
                    >
                      <option value="">📁 Root Vault (Default)</option>
                      {folders.filter(f => f.type !== 'root').map((f) => (
                        <option key={f.id} value={f.id}>
                          {f.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Upload button */}
                  <div className="flex items-center gap-2 shrink-0">
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileUpload}
                      className="hidden"
                      accept="audio/*,video/*,application/zip,application/x-zip-compressed,.rar,.wav,.aif,.flac,.mp3,.mp4,.mov,.mkv"
                    />
                    
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isUploading}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-900 hover:bg-amber-500 text-white hover:text-slate-950 font-bold text-xs shadow-xs transition cursor-pointer disabled:opacity-50"
                    >
                      {isUploading ? (
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Upload className="w-3.5 h-3.5" />
                      )}
                      <span>{isUploading ? 'Uploading to Drive...' : 'Upload Audio / Video to Folder'}</span>
                    </button>
                  </div>

                </div>

                {/* Search & Active Folder Filter */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 pt-2 border-t border-slate-200/80">
                  <form onSubmit={handleSearchSubmit} className="flex-1 relative">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder="Search audio, videos, stems, or ZIPs in Drive..."
                      className="w-full pl-9 pr-20 py-1.5 text-xs rounded-xl border border-slate-200 bg-white focus:outline-none focus:border-blue-500"
                    />
                    <button
                      type="submit"
                      className="absolute right-1 top-1/2 -translate-y-1/2 px-2.5 py-0.8 text-[11px] font-bold bg-blue-600 text-white rounded-lg hover:bg-blue-500 cursor-pointer"
                    >
                      Search
                    </button>
                  </form>

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedFolderId('all');
                        loadFiles(searchTerm, 'all');
                      }}
                      className={`px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                        selectedFolderId === 'all'
                          ? 'bg-slate-900 text-white'
                          : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      View All Files
                    </button>

                    <button
                      type="button"
                      onClick={() => loadFiles()}
                      className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-100 transition cursor-pointer"
                      title="Refresh file list"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
                    </button>
                  </div>
                </div>

              </div>

              {/* Files Table / List */}
              <div className="border border-slate-200 rounded-2xl overflow-hidden bg-white shadow-2xs">
                <div className="px-4 py-2.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <span>
                    Drive Files ({files.length}) 
                    {selectedFolderId !== 'all' && (
                      <span className="text-blue-600 font-bold ml-1">
                        • In {folders.find(f => f.id === selectedFolderId)?.name || 'Selected Folder'}
                      </span>
                    )}
                  </span>
                  <span>Actions</span>
                </div>

                {isLoading && files.length === 0 ? (
                  <div className="py-12 text-center text-slate-400 text-xs flex flex-col items-center justify-center gap-2">
                    <RefreshCw className="w-5 h-5 animate-spin text-blue-500" />
                    <span>Loading your Google Drive studio audio & video vault...</span>
                  </div>
                ) : files.length === 0 ? (
                  <div className="py-12 text-center text-slate-500 text-xs space-y-2">
                    <HardDrive className="w-8 h-8 text-slate-300 mx-auto" />
                    <p className="font-bold text-slate-700">No files uploaded yet in this folder</p>
                    <p className="text-[11px] text-slate-400">
                      Use the &quot;Upload Audio / Video&quot; button above to directly upload into your organized Drive folders.
                    </p>
                  </div>
                ) : (
                  <div className="divide-y divide-slate-100 max-h-80 overflow-y-auto">
                    {files.map((file) => {
                      const isFolder = file.mimeType === 'application/vnd.google-apps.folder';
                      const isAudio = file.mimeType.includes('audio') || file.name.endsWith('.wav') || file.name.endsWith('.mp3');
                      const isVideo = file.mimeType.includes('video') || file.name.endsWith('.mp4') || file.name.endsWith('.mov');
                      const isZip = file.mimeType.includes('zip') || file.name.endsWith('.zip') || file.name.endsWith('.rar');

                      return (
                        <div
                          key={file.id}
                          className="px-4 py-3 flex items-center justify-between hover:bg-slate-50/80 transition text-xs gap-3 group"
                        >
                          <div className="flex items-center gap-3 min-w-0 flex-1">
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                              isFolder
                                ? 'bg-blue-100 text-blue-700'
                                : isAudio 
                                  ? 'bg-amber-100 text-amber-700' 
                                  : isVideo
                                    ? 'bg-rose-100 text-rose-700'
                                    : isZip 
                                      ? 'bg-purple-100 text-purple-700' 
                                      : 'bg-slate-100 text-slate-600'
                            }`}>
                              {isFolder ? (
                                <Folder className="w-4 h-4" />
                              ) : isAudio ? (
                                <FileAudio className="w-4 h-4" />
                              ) : isVideo ? (
                                <Video className="w-4 h-4" />
                              ) : isZip ? (
                                <Music className="w-4 h-4" />
                              ) : (
                                <File className="w-4 h-4" />
                              )}
                            </div>

                            <div className="min-w-0 flex-1">
                              <h4 className="font-extrabold text-slate-900 truncate" title={file.name}>
                                {file.name}
                              </h4>
                              <div className="flex items-center gap-2 text-[10px] text-slate-400 mt-0.5">
                                <span>{isFolder ? 'Folder' : formatFileSize(file.size)}</span>
                                {file.modifiedTime && (
                                  <>
                                    <span>•</span>
                                    <span>{new Date(file.modifiedTime).toLocaleDateString()}</span>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-1.5 shrink-0">
                            {isFolder ? (
                              <button
                                type="button"
                                onClick={() => {
                                  setSelectedFolderId(file.id);
                                  setUploadTargetFolderId(file.id);
                                  loadFiles(searchTerm, file.id);
                                }}
                                className="px-2.5 py-1 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-[11px] transition cursor-pointer flex items-center gap-1"
                              >
                                <span>Open Folder</span>
                                <ArrowRight className="w-3 h-3" />
                              </button>
                            ) : (
                              <>
                                {onFileSelect && (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      onFileSelect(file);
                                      onClose();
                                    }}
                                    className="px-2.5 py-1 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-[11px] transition shadow-2xs cursor-pointer"
                                  >
                                    Select File
                                  </button>
                                )}

                                <button
                                  type="button"
                                  onClick={() => handleCopyLink(file)}
                                  className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition cursor-pointer"
                                  title="Copy Google Drive share link"
                                >
                                  {copiedId === file.id ? (
                                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                                  ) : (
                                    <Copy className="w-3.5 h-3.5" />
                                  )}
                                </button>
                              </>
                            )}

                            {file.webViewLink && (
                              <a
                                href={file.webViewLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition"
                                title="Open in Google Drive"
                              >
                                <ExternalLink className="w-3.5 h-3.5" />
                              </a>
                            )}

                            {/* Delete file from Drive */}
                            <button
                              type="button"
                              onClick={() => handleDeleteDriveItem(file)}
                              disabled={deletingId === file.id}
                              className="p-1.5 rounded-lg border border-slate-200 text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                              title="Delete from Google Drive"
                            >
                              <Trash2 className={`w-3.5 h-3.5 ${deletingId === file.id ? 'animate-pulse text-rose-500' : ''}`} />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="text-center py-10 px-4 border border-dashed border-slate-200 rounded-2xl bg-slate-50/50 space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto border border-blue-100 shadow-xs">
                <HardDrive className="w-7 h-7" />
              </div>
              <div className="max-w-md mx-auto space-y-1">
                <h4 className="font-black text-sm text-slate-900">
                  Connect Your Google Drive Vault
                </h4>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Sign in securely with Google to auto-create and sync 4 organized studio folders for Master Audio, Stems, Videos, and DAW Project Sessions.
                </p>
              </div>
              <button
                type="button"
                onClick={handleConnect}
                disabled={isLoading}
                className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md transition-all cursor-pointer inline-flex items-center gap-2"
              >
                {isLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <HardDrive className="w-4 h-4" />}
                <span>Authorize & Auto-Create Studio Folders</span>
              </button>
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <span className="flex items-center gap-1.5 font-medium">
            <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
            Organized Audio/Video Vault • Google Drive REST API
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-3.5 py-1 text-slate-600 hover:bg-slate-200 rounded-lg font-bold cursor-pointer"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};
