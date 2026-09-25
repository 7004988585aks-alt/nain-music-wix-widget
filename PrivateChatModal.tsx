import React, { useState, useRef, useEffect } from 'react';
import { 
  X, 
  Send, 
  Sparkles, 
  Clock, 
  RotateCcw, 
  CheckCircle2, 
  XCircle, 
  MessageSquare, 
  ShieldCheck, 
  ShieldAlert,
  FileText, 
  IndianRupee, 
  HelpCircle,
  AlertCircle,
  ArrowRight,
  UserCheck,
  User,
  Music,
  Sliders,
  Check,
  Paperclip,
  Download,
  File,
  Image as ImageIcon,
  Maximize2,
  Video,
  MoreVertical,
  Reply,
  Bookmark,
  BookmarkCheck,
  Star,
  Archive,
  ArchiveRestore,
  Flag,
  Bell,
  Filter,
  Shield,
  UploadCloud,
  ExternalLink,
  Trash2,
  HardDrive
} from 'lucide-react';
import { 
  getDriveAccessToken, 
  uploadChatFileToGoogleDrive, 
  getOrCreateChatDriveFolder,
  deleteChatAttachmentFromDrive
} from '../../services/googleDriveService';
import { useGig } from '../../context/GigContext';
import { formatCurrency, formatGigPrice, formatCustomOfferPrice } from '../../data/servicesData';
import { Conversation, CustomOffer, ChatMessage, ChatAttachment, ChatFilter } from '../../types';
import { 
  registerChatFile, 
  downloadChatAttachment, 
  formatFileSize,
  getAttachmentMediaType,
  getChatFileUrl 
} from '../../utils/fileStore';
import { SafeMessageText } from './SafeMessageText';
import { ReportMessageModal } from './ReportMessageModal';
import { AdminModerationDrawer } from './AdminModerationDrawer';
import { getCategorySafetyNotice } from '../../utils/chatModeration';
import { 
  ATTACHMENT_CONFIG, 
  validateDirectAttachmentSize 
} from '../../config/attachmentConfig';

interface PrivateChatModalProps {
  onClose: () => void;
  onOpenCustomOfferBuilder: (conversation: Conversation) => void;
  onAcceptOfferToCheckout: (offer: CustomOffer) => void;
}

export const PrivateChatModal: React.FC<PrivateChatModalProps> = ({
  onClose,
  onOpenCustomOfferBuilder,
  onAcceptOfferToCheckout,
}) => {
  const { 
    conversations, 
    activeConversationId, 
    setActiveConversationId,
    sendMessage,
    updateMessageAttachmentDriveId,
    respondToCustomOffer,
    customOffers,
    chatRole,
    setChatRole,
    currentUser,
    selectedCurrency,
    deleteChatMessage,
    deleteMessageAttachment,
    toggleSaveMessage,
    toggleStarConversation,
    toggleArchiveConversation,
    toggleSpamConversation,
    toggleFollowUpConversation,
    sendNudge
  } = useGig();

  const [messageInput, setMessageInput] = useState('');
  const [stagedFile, setStagedFile] = useState<{
    file: File;
    name: string;
    size: number;
    type: string;
  } | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [isAttachmentMenuOpen, setIsAttachmentMenuOpen] = useState(false);
  const [externalTransferGuide, setExternalTransferGuide] = useState<{
    provider: 'WeTransfer' | 'TransferNow';
    url: string;
  } | null>(null);
  const attachmentMenuRef = useRef<HTMLDivElement>(null);

  const [requestChangesOfferId, setRequestChangesOfferId] = useState<string | null>(null);
  const [changeNotes, setChangeNotes] = useState('');
  const [lightboxImage, setLightboxImage] = useState<{
    url: string;
    name: string;
    size: number;
  } | null>(null);

  // Delete action toast notification
  const [deleteToast, setDeleteToast] = useState<string | null>(null);
  const [driveToast, setDriveToast] = useState<string | null>(null);

  const handleOpenDriveChatFolder = async () => {
    try {
      const token = getDriveAccessToken();
      if (!token) {
        setDriveToast('Please connect Google Drive from Studio Header first.');
        setTimeout(() => setDriveToast(null), 4000);
        return;
      }
      setDriveToast('Opening "05 - Chat Files & Media" in Google Drive...');
      const chatFolder = await getOrCreateChatDriveFolder();
      const folderUrl = chatFolder.webViewLink || `https://drive.google.com/drive/folders/${chatFolder.id}`;
      window.open(folderUrl, '_blank', 'noopener,noreferrer');
      setDriveToast(null);
    } catch (err: any) {
      console.error('Failed to open Drive folder:', err);
      setDriveToast(err?.message || 'Could not open Google Drive folder.');
      setTimeout(() => setDriveToast(null), 4000);
    }
  };

  const handleDeleteAttachment = (conversationId: string, message: ChatMessage) => {
    const attachmentName = message.attachment?.name;
    const driveFileId = message.attachment?.drive_file_id;

    if (message.text && message.text.trim()) {
      deleteMessageAttachment(conversationId, message.id);
    } else {
      deleteChatMessage(conversationId, message.id);
    }

    if (attachmentName && getDriveAccessToken()) {
      deleteChatAttachmentFromDrive(attachmentName, driveFileId)
        .then((deleted) => {
          if (deleted) {
            console.log(`Deleted "${attachmentName}" from Google Drive folder.`);
          }
        })
        .catch((err) => {
          console.warn('Error deleting chat attachment from Google Drive:', err);
        });
    }

    setDeleteToast(attachmentName ? `Deleted "${attachmentName}" from Chat & Google Drive` : 'Media deleted');
    setTimeout(() => setDeleteToast(null), 3500);
  };

  const handleDeleteMessage = (conversationId: string, messageId: string) => {
    const targetConv = conversations.find(c => c.id === conversationId);
    const targetMsg = targetConv?.messages.find(m => m.id === messageId);
    const attachmentName = targetMsg?.attachment?.name;
    const driveFileId = targetMsg?.attachment?.drive_file_id;

    deleteChatMessage(conversationId, messageId);

    if (attachmentName && getDriveAccessToken()) {
      deleteChatAttachmentFromDrive(attachmentName, driveFileId)
        .then((deleted) => {
          if (deleted) {
            console.log(`Deleted "${attachmentName}" from Google Drive.`);
          }
        })
        .catch((err) => {
          console.warn('Error deleting chat message attachment from Google Drive:', err);
        });
    }

    setDeleteToast(attachmentName ? `Deleted message & removed "${attachmentName}" from Google Drive` : 'Message deleted');
    setTimeout(() => setDeleteToast(null), 3500);
  };

  // Moderation, safety, filters & reply states
  const [activeFilter, setActiveFilter] = useState<ChatFilter>('all');
  const [replyTo, setReplyTo] = useState<{ id: string; sender_name: string; snippet: string } | null>(null);
  const [reportingMessage, setReportingMessage] = useState<ChatMessage | null>(null);
  const [showAdminModeration, setShowAdminModeration] = useState(false);
  const [openMessageMenuId, setOpenMessageMenuId] = useState<string | null>(null);
  const [sendFeedback, setSendFeedback] = useState<{ 
    type: 'blocked' | 'warn'; 
    message: string; 
    role?: 'buyer' | 'seller';
    category?: string;
    title?: string;
  } | null>(null);
  const [nudgeToast, setNudgeToast] = useState<string | null>(null);

  // Private UI state for report confirmations: strictly user-specific to the reporter
  // Keyed by `${conversationId}_${reporterRole}` so it ONLY appears in the reporter's chat view
  const [reportNotices, setReportNotices] = useState<Record<string, {
    reporterRole: 'buyer' | 'seller';
    message: string;
  }>>({});

  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const activeConversation = conversations.find(c => c.id === activeConversationId) || conversations[0];

  // User-specific report notice for the current reporter role in active conversation
  const activeReportNotice = activeConversation ? reportNotices[`${activeConversation.id}_${chatRole}`] : null;

  const dismissReportNotice = (role: 'buyer' | 'seller') => {
    if (!activeConversation) return;
    setReportNotices(prev => {
      const next = { ...prev };
      delete next[`${activeConversation.id}_${role}`];
      return next;
    });
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeConversation?.messages.length]);

  useEffect(() => {
    setSendFeedback(null);
  }, [activeConversationId]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && lightboxImage) {
        setLightboxImage(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [lightboxImage]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validation = validateDirectAttachmentSize(file.size);
    if (!validation.isValid) {
      setFileError(
        `File exceeds maximum direct attachment limit of ${ATTACHMENT_CONFIG.directAttachmentLimitMb} MB (selected file is ${validation.sizeMb} MB). To keep production costs low, please upload files larger than ${ATTACHMENT_CONFIG.directAttachmentLimitMb} MB via WeTransfer or TransferNow.`
      );
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      return;
    }

    setFileError(null);
    setStagedFile({
      file,
      name: file.name,
      size: file.size,
      type: file.type || 'application/octet-stream',
    });
    setIsAttachmentMenuOpen(false);
  };

  const handleRemoveStagedFile = () => {
    setStagedFile(null);
    setFileError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleTriggerFileInput = () => {
    setFileError(null);
    setIsAttachmentMenuOpen(false);
    fileInputRef.current?.click();
  };

  const handleOpenWeTransfer = () => {
    setIsAttachmentMenuOpen(false);
    setFileError(null);
    window.open(ATTACHMENT_CONFIG.externalProviders.weTransfer.url, '_blank', 'noopener,noreferrer');
    setExternalTransferGuide({
      provider: 'WeTransfer',
      url: ATTACHMENT_CONFIG.externalProviders.weTransfer.url
    });
  };

  const handleOpenTransferNow = () => {
    setIsAttachmentMenuOpen(false);
    setFileError(null);
    window.open(ATTACHMENT_CONFIG.externalProviders.transferNow.url, '_blank', 'noopener,noreferrer');
    setExternalTransferGuide({
      provider: 'TransferNow',
      url: ATTACHMENT_CONFIG.externalProviders.transferNow.url
    });
  };

  // Close 3-dot menus and attachment menu on outside click
  useEffect(() => {
    const handleDocumentClick = (e: MouseEvent) => {
      setOpenMessageMenuId(null);
      if (attachmentMenuRef.current && !attachmentMenuRef.current.contains(e.target as Node)) {
        setIsAttachmentMenuOpen(false);
      }
    };
    window.addEventListener('click', handleDocumentClick);
    return () => window.removeEventListener('click', handleDocumentClick);
  }, []);

  const handleSendMessage = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if ((!messageInput.trim() && !stagedFile) || !activeConversation) return;

    let attachmentPayload: ChatAttachment | undefined = undefined;

    if (stagedFile) {
      const attachmentId = `att_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
      const objectUrl = registerChatFile(attachmentId, stagedFile.file, stagedFile.name, stagedFile.type);
      attachmentPayload = {
        id: attachmentId,
        name: stagedFile.name,
        size: stagedFile.size,
        type: stagedFile.type,
        url: objectUrl,
      };
    }

    const res = sendMessage(
      activeConversation.id, 
      messageInput, 
      chatRole, 
      attachmentPayload, 
      replyTo ? { id: replyTo.id, sender_name: replyTo.sender_name, snippet: replyTo.snippet } : undefined
    );

    const createdMsgId = res?.messageId;

    // If Google Drive is connected, back up into "05 - Chat Files & Media" folder in Google Drive and link file ID
    if (stagedFile && getDriveAccessToken()) {
      const fileToUpload = stagedFile.file;
      const fileName = stagedFile.name;
      const fileType = stagedFile.type;
      const targetConvId = activeConversation.id;

      uploadChatFileToGoogleDrive(fileToUpload, fileName, fileType)
        .then((driveFile) => {
          console.log('Successfully backed up chat file to Google Drive:', driveFile);
          if (createdMsgId && updateMessageAttachmentDriveId) {
            updateMessageAttachmentDriveId(targetConvId, createdMsgId, driveFile.id, driveFile.webViewLink);
          }
          setDriveToast(`Saved "${fileName}" to Google Drive (05 - Chat Files & Media)`);
          setTimeout(() => setDriveToast(null), 4500);
        })
        .catch((err) => {
          console.warn('Google Drive chat backup notice:', err);
        });
    }

    if (res?.blocked) {
      const notice = getCategorySafetyNotice(res.category);
      setSendFeedback({
        type: 'blocked',
        category: res.category,
        title: notice.title,
        message: notice.fullNotice,
        role: chatRole
      });
      setMessageInput('');
      setStagedFile(null);
      setFileError(null);
      setReplyTo(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      return;
    }

    if (res?.warning) {
      setSendFeedback({
        type: 'warn',
        title: 'Safety Notice',
        message: res.warning,
        role: chatRole
      });
      setTimeout(() => setSendFeedback(null), 6000);
    } else {
      setSendFeedback(null);
    }

    setMessageInput('');
    setStagedFile(null);
    setFileError(null);
    setReplyTo(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSendNudge = () => {
    if (!activeConversation) return;
    const res = sendNudge(activeConversation.id);
    if (res.success) {
      setNudgeToast(res.message);
      setTimeout(() => setNudgeToast(null), 4000);
    } else {
      setSendFeedback({ type: 'warn', message: res.message, role: chatRole });
      setTimeout(() => setSendFeedback(null), 5000);
    }
  };

  // Filtered conversation list based on activeFilter folder
  const filteredConversations = conversations.filter(conv => {
    if (activeFilter === 'all') {
      return !conv.is_archived && !conv.is_spam;
    }
    if (activeFilter === 'unread') {
      return (conv.unread_count || 0) > 0;
    }
    if (activeFilter === 'starred') {
      return Boolean(conv.is_starred);
    }
    if (activeFilter === 'custom_offers') {
      return conv.messages.some(m => Boolean(m.custom_offer_id));
    }
    if (activeFilter === 'archived') {
      return Boolean(conv.is_archived);
    }
    if (activeFilter === 'spam') {
      return Boolean(conv.is_spam);
    }
    if (activeFilter === 'follow_up') {
      return Boolean(conv.needs_follow_up);
    }
    if (activeFilter === 'nudge') {
      return Boolean(conv.last_nudged_at);
    }
    return true;
  });

  const getFilterCount = (filter: ChatFilter) => {
    if (filter === 'all') return conversations.filter(c => !c.is_archived && !c.is_spam).length;
    if (filter === 'unread') return conversations.filter(c => (c.unread_count || 0) > 0).length;
    if (filter === 'starred') return conversations.filter(c => Boolean(c.is_starred)).length;
    if (filter === 'custom_offers') return conversations.filter(c => c.messages.some(m => Boolean(m.custom_offer_id))).length;
    if (filter === 'archived') return conversations.filter(c => Boolean(c.is_archived)).length;
    if (filter === 'spam') return conversations.filter(c => Boolean(c.is_spam)).length;
    if (filter === 'follow_up') return conversations.filter(c => Boolean(c.needs_follow_up)).length;
    if (filter === 'nudge') return conversations.filter(c => Boolean(c.last_nudged_at)).length;
    return 0;
  };

  const getFileIcon = (fileName: string, mimeType?: string) => {
    const mediaType = getAttachmentMediaType(fileName, mimeType);
    if (mediaType === 'image') {
      return <ImageIcon className="w-4 h-4" />;
    }
    if (mediaType === 'audio') {
      return <Music className="w-4 h-4" />;
    }
    if (mediaType === 'video') {
      return <Video className="w-4 h-4" />;
    }
    const ext = fileName.split('.').pop()?.toLowerCase() || '';
    if (['zip', 'rar', '7z', 'tar', 'gz'].includes(ext)) {
      return <Sliders className="w-4 h-4" />;
    }
    return <FileText className="w-4 h-4" />;
  };

  const handleSendChangeRequest = (offerId: string) => {
    if (!changeNotes.trim()) return;
    respondToCustomOffer(offerId, 'request_changes', changeNotes);
    setRequestChangesOfferId(null);
    setChangeNotes('');
  };

  if (!activeConversation) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-900/25 backdrop-blur-xs">
      <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-4xl shadow-2xl overflow-hidden flex flex-col h-[90vh]">
        
        {/* Top Header */}
        <div className="p-4 sm:px-6 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 bg-white">
          
          <div className="flex items-center gap-3">
            <div className="relative">
              <img
                src={activeConversation.buyer_avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
                alt={activeConversation.buyer_name}
                className="w-10 h-10 rounded-full object-cover border border-amber-400/60"
              />
              <span className="w-3 h-3 rounded-full bg-emerald-500 border-2 border-white absolute bottom-0 right-0" />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                  {chatRole === 'seller' ? activeConversation.buyer_name : activeConversation.seller_name}
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-50 text-amber-800 font-semibold border border-amber-200">
                    Private 1-to-1 Chat
                  </span>
                </h3>
              </div>
              <p className="text-[11px] text-slate-500 flex items-center gap-1 truncate max-w-xs sm:max-w-md">
                <Music className="w-3 h-3 text-amber-600 shrink-0" />
                <span>Service Inquiry: <strong className="text-slate-800">{activeConversation.service_name || 'Music Production'}</strong></span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Perspective Switcher for Testing Buyer vs Seller */}
            <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs">
              <span className="text-[10px] text-slate-500 uppercase font-bold px-2 hidden sm:inline">
                Viewing As:
              </span>
              <button
                type="button"
                onClick={() => setChatRole('seller')}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition flex items-center gap-1 ${
                  chatRole === 'seller' 
                    ? 'bg-amber-500 text-slate-950 font-bold shadow-xs' 
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title="Switch to Seller Studio mode (Has 'Create a Custom Offer' action)"
              >
                <Sliders className="w-3 h-3" />
                Seller (You)
              </button>
              <button
                type="button"
                onClick={() => setChatRole('buyer')}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition flex items-center gap-1 ${
                  chatRole === 'buyer' 
                    ? 'bg-amber-500 text-slate-950 font-bold shadow-xs' 
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title="Switch to Buyer view (Can review, accept, decline, or request changes on custom offers)"
              >
                <User className="w-3 h-3" />
                Buyer ({activeConversation.buyer_name.split(' ')[0]})
              </button>
            </div>

            {/* Conversation Actions: Star, Follow-up, Nudge, Archive, Admin Safety Log */}
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => toggleStarConversation(activeConversation.id)}
                className={`p-2 rounded-xl border transition ${
                  activeConversation.is_starred
                    ? 'bg-amber-50 border-amber-300 text-amber-600'
                    : 'bg-white border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
                title={activeConversation.is_starred ? "Starred conversation" : "Star conversation"}
              >
                <Star className={`w-3.5 h-3.5 ${activeConversation.is_starred ? 'fill-amber-500 text-amber-500' : ''}`} />
              </button>

              <button
                type="button"
                onClick={() => toggleFollowUpConversation(activeConversation.id)}
                className={`px-2.5 py-1.5 rounded-xl border text-xs font-semibold transition hidden sm:flex items-center gap-1.5 ${
                  activeConversation.needs_follow_up
                    ? 'bg-blue-50 border-blue-300 text-blue-700'
                    : 'bg-white border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
                title="Mark for follow-up"
              >
                <Bookmark className={`w-3.5 h-3.5 ${activeConversation.needs_follow_up ? 'fill-blue-500 text-blue-500' : ''}`} />
                <span>Follow-up</span>
              </button>

              <button
                type="button"
                onClick={handleSendNudge}
                className="px-2.5 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 hover:text-amber-700 text-xs font-semibold transition flex items-center gap-1.5"
                title="Send a polite reminder check-in to this client"
              >
                <Bell className="w-3.5 h-3.5 text-amber-600" />
                <span className="hidden sm:inline">Send Nudge</span>
              </button>

              <button
                type="button"
                onClick={() => toggleArchiveConversation(activeConversation.id)}
                className={`p-2 rounded-xl border transition ${
                  activeConversation.is_archived
                    ? 'bg-purple-50 border-purple-300 text-purple-700'
                    : 'bg-white border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
                title={activeConversation.is_archived ? "Unarchive conversation" : "Archive conversation"}
              >
                <Archive className="w-3.5 h-3.5" />
              </button>

              {/* Discreet Safety & Moderation Log button for Admins */}
              <button
                type="button"
                onClick={() => setShowAdminModeration(true)}
                className="px-2 py-1.5 rounded-xl border border-amber-300 bg-amber-50 hover:bg-amber-100 text-amber-800 text-xs font-semibold transition flex items-center gap-1"
                title="Confidential Safety & Moderation Center (Admin Review Queue)"
              >
                <Shield className="w-3.5 h-3.5 text-amber-600" />
                <span className="hidden lg:inline text-[11px]">Safety Log</span>
              </button>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition ml-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

        </div>

        {/* Middle Area: Sidebar (if multiple) + Main Chat */}
        <div className="flex-1 flex overflow-hidden">
          
          {/* Conversation list (optional / sidebar on larger screens) with Chat Folders */}
          {conversations.length > 0 && (
            <div className="w-72 border-r border-slate-200 bg-white p-3 hidden md:flex flex-col gap-2.5 overflow-y-auto">
              <div className="flex items-center justify-between px-1">
                <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider flex items-center gap-1">
                  <Filter className="w-3 h-3 text-amber-600" />
                  Chat Folders
                </span>
                <span className="text-[10px] text-slate-400 font-mono font-semibold">
                  {filteredConversations.length} shown
                </span>
              </div>

              {/* Chat Folder Chips */}
              <div className="flex items-center gap-1 overflow-x-auto pb-1 scrollbar-none">
                {(['all', 'unread', 'starred', 'custom_offers', 'follow_up', 'nudge', 'archived', 'spam'] as ChatFilter[]).map(filter => {
                  const count = getFilterCount(filter);
                  const label = filter === 'all' ? 'All' :
                                filter === 'unread' ? 'Unread' :
                                filter === 'starred' ? 'Starred' :
                                filter === 'custom_offers' ? 'Offers' :
                                filter === 'follow_up' ? 'Follow-up' :
                                filter === 'nudge' ? 'Nudge' :
                                filter === 'archived' ? 'Archived' : 'Spam';
                  return (
                    <button
                      key={filter}
                      type="button"
                      onClick={() => setActiveFilter(filter)}
                      className={`px-2 py-1 rounded-lg text-[10px] font-semibold whitespace-nowrap transition flex items-center gap-1 shrink-0 ${
                        activeFilter === filter
                          ? 'bg-amber-500 text-slate-950 font-bold shadow-xs'
                          : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200'
                      }`}
                    >
                      <span>{label}</span>
                      {count > 0 && (
                        <span className={`px-1 rounded text-[9px] font-mono font-bold ${
                          activeFilter === filter ? 'bg-slate-950/20 text-slate-950' : 'bg-slate-100 text-slate-700'
                        }`}>
                          {count}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              {filteredConversations.length === 0 ? (
                <div className="p-4 text-center text-slate-500 text-xs italic bg-white rounded-xl border border-dashed border-slate-200 my-2">
                  No conversations in "{activeFilter.replace('_', ' ')}".
                </div>
              ) : (
                filteredConversations.map(conv => (
                  <button
                    key={conv.id}
                    type="button"
                    onClick={() => setActiveConversationId(conv.id)}
                    className={`w-full p-2.5 rounded-xl text-left transition flex items-center gap-2.5 ${
                      conv.id === activeConversation.id 
                        ? 'bg-slate-50 text-slate-900 border border-slate-300 shadow-xs' 
                        : 'hover:bg-slate-50 text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <div className="relative shrink-0">
                      <img
                        src={conv.buyer_avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
                        alt={conv.buyer_name}
                        className="w-8 h-8 rounded-full object-cover border border-slate-200"
                      />
                      {conv.is_starred && (
                        <Star className="w-2.5 h-2.5 text-amber-500 fill-amber-500 absolute -top-1 -right-1" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-1">
                        <p className="text-xs font-semibold text-slate-900 truncate">{conv.buyer_name}</p>
                        {conv.needs_follow_up && (
                          <span className="text-[9px] px-1 py-0.2 rounded bg-blue-100 text-blue-800 font-semibold shrink-0">
                            Follow-up
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] text-slate-500 truncate">{conv.service_name}</p>
                    </div>
                  </button>
                ))
              )}
            </div>
          )}

          {/* Chat Messages Timeline */}
          <div className="flex-1 flex flex-col justify-between overflow-hidden bg-white">
            
            {/* Scrollable Messages */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 bg-white">
              
              {/* Private Communication Notice */}
              <div className="p-3 bg-white border border-slate-200 rounded-2xl text-center max-w-md mx-auto space-y-1 shadow-xs">
                <div className="flex items-center justify-center gap-1.5 text-xs text-amber-700 font-semibold">
                  <ShieldCheck className="w-4 h-4 text-amber-600" />
                  <span>Private Buyer-Seller Communication</span>
                </div>
                <p className="text-[11px] text-slate-600">
                  Custom offers created here remain private between you and this client. They will never be published as public gigs or packages.
                </p>
              </div>

              {activeConversation.messages.map((msg: ChatMessage) => {
                const isMe = (chatRole === 'seller' && msg.sender === 'seller') ||
                             (chatRole === 'buyer' && msg.sender === 'buyer');
                
                // Requirements 3 & 4: Buyer adjustment and buyer declined notices must be visible to the seller only!
                const isSellerOnlyNotice = 
                  msg.target_audience === 'seller_only' ||
                  (msg.text && (
                    msg.text.includes('declined this custom offer') ||
                    msg.text.includes('Buyer declined') ||
                    msg.text.includes('Buyer requested adjustments') ||
                    msg.text.includes('requested adjustments')
                  ));

                if (chatRole === 'buyer' && isSellerOnlyNotice) {
                  return null;
                }

                // System message rendering
                if (msg.sender === 'system') {
                  return (
                    <div key={msg.id} className="text-center my-3">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-slate-200 text-[11px] text-slate-600 shadow-xs">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        {msg.text}
                      </span>
                    </div>
                  );
                }

                // Custom Offer Card Rendering
                if (msg.custom_offer_id) {
                  const offer = customOffers.find(o => o.id === msg.custom_offer_id);
                  if (!offer) return null;

                  return (
                    <div 
                      key={msg.id} 
                      className={`my-4 max-w-lg ${isMe ? 'ml-auto' : 'mr-auto'}`}
                    >
                      <div className="bg-white border-2 border-amber-400/80 rounded-2xl shadow-md overflow-hidden">
                        
                        {/* Offer Header */}
                        <div className="p-4 bg-gradient-to-r from-amber-50 via-amber-50/50 to-white border-b border-amber-200 flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center font-bold">
                              <Sparkles className="w-4 h-4" />
                            </div>
                            <div>
                              <span className="text-[10px] uppercase font-extrabold tracking-wider text-amber-700 block">
                                Tailored Custom Offer
                              </span>
                              <h4 className="text-xs font-bold text-slate-900">{offer.service_name}</h4>
                            </div>
                          </div>

                          {/* Status Badge */}
                          <div>
                            {offer.status === 'pending' && (
                              <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300 flex items-center gap-1">
                                <Clock className="w-3 h-3 text-amber-600" />
                                Pending Review
                              </span>
                            )}
                            {offer.status === 'accepted' && (
                              <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-900 border border-emerald-300 flex items-center gap-1">
                                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                Accepted & Paid
                              </span>
                            )}
                            {offer.status === 'declined' && (
                              <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-red-100 text-red-900 border border-red-300 flex items-center gap-1">
                                <XCircle className="w-3 h-3 text-red-600" />
                                {chatRole === 'seller' ? 'Buyer Declined' : 'Offer Closed'}
                              </span>
                            )}
                            {offer.status === 'change_requested' && (
                              <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-blue-100 text-blue-900 border border-blue-300 flex items-center gap-1">
                                <RotateCcw className="w-3 h-3 text-blue-600" />
                                {chatRole === 'seller' ? 'Buyer Requested Adjustments' : 'Adjustments Sent'}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Offer Body */}
                        <div className="p-4 space-y-3.5 bg-white">
                          
                          {/* Scope & Specifications */}
                          <div>
                            <span className="text-[10px] uppercase font-bold text-slate-500 block mb-1">
                              Scope & Specifications
                            </span>
                            <p className="text-xs font-bold text-slate-900 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                              {offer.title}
                            </p>
                          </div>

                          {/* Offer Description & Terms */}
                          <div>
                            <span className="text-[10px] uppercase font-bold text-slate-500 block mb-1">
                              Offer Description & Terms
                            </span>
                            <p className="text-xs text-slate-700 leading-relaxed bg-slate-50 p-2.5 rounded-xl border border-slate-200 whitespace-pre-line">
                              {offer.description}
                            </p>
                          </div>

                          {/* Deliverables Checklist */}
                          {offer.deliverables && offer.deliverables.length > 0 && (
                            <div>
                              <span className="text-[10px] uppercase font-bold text-slate-500 block mb-1">
                                Included Deliverables ({offer.deliverables.length})
                              </span>
                              <div className="space-y-1 bg-slate-50 p-2.5 rounded-xl border border-slate-200 text-[11px] text-slate-700">
                                {offer.deliverables.map((del, idx) => (
                                  <div key={idx} className="flex items-center gap-2">
                                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                                    <span>{del}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Extras / Add-ons if provided */}
                          {offer.extras && offer.extras.length > 0 && (
                            <div>
                              <span className="text-[10px] uppercase font-bold text-slate-500 block mb-1">
                                Optional Extras
                              </span>
                              <div className="space-y-1 bg-slate-50 p-2 rounded-xl border border-slate-200 text-[11px] text-slate-700">
                                {offer.extras.map((ext, idx) => (
                                  <div key={idx} className="flex items-center justify-between">
                                    <span className="flex items-center gap-1.5">
                                      <Sparkles className="w-3 h-3 text-amber-600" />
                                      {ext.name}
                                    </span>
                                    <span className="font-mono font-semibold text-amber-700">
                                      +{formatGigPrice(ext.price_inr, (ext as any).pricing_currency, selectedCurrency, undefined, (ext as any).price_usd)}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Requirements list */}
                          {offer.requirements && offer.requirements.length > 0 && (
                            <div>
                              <span className="text-[10px] uppercase font-bold text-slate-500 block mb-1">
                                Client Requirements Needed Upon Ordering
                              </span>
                              <ul className="space-y-1 bg-slate-50 p-2.5 rounded-xl border border-slate-200 text-[11px] text-slate-700">
                                {offer.requirements.map((req, idx) => (
                                  <li key={idx} className="flex items-start gap-1.5">
                                    <span className="text-amber-600 font-bold">•</span>
                                    <span>{req}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}

                          {/* Cancellation Terms */}
                          {offer.cancellation_terms && (
                            <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 text-[10px] text-slate-600 flex items-start gap-2">
                              <ShieldCheck className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                              <div>
                                <span className="font-bold text-slate-800">Terms & Guarantee: </span>
                                <span>{offer.cancellation_terms}</span>
                              </div>
                            </div>
                          )}

                          {/* Specs Grid: Price, Delivery Time, Revisions */}
                          <div className="grid grid-cols-3 gap-2 pt-1">
                            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-center">
                              <span className="text-[10px] uppercase text-slate-500 block font-semibold">Custom Price</span>
                              <span className="text-sm font-extrabold text-amber-600 font-mono">
                                {formatCustomOfferPrice(offer)}
                              </span>
                            </div>

                            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-center">
                              <span className="text-[10px] uppercase text-slate-500 block font-semibold">Delivery Time</span>
                              <span className="text-xs font-bold text-slate-900 flex items-center justify-center gap-1 mt-0.5">
                                <Clock className="w-3 h-3 text-amber-600" />
                                {offer.delivery_days} Days
                              </span>
                            </div>

                            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-center">
                              <span className="text-[10px] uppercase text-slate-500 block font-semibold">Revisions</span>
                              <span className="text-xs font-bold text-slate-900 flex items-center justify-center gap-1 mt-0.5">
                                <RotateCcw className="w-3 h-3 text-amber-600" />
                                {offer.revisions === -1 ? 'Unlimited' : `${offer.revisions}`}
                              </span>
                            </div>
                          </div>

                          {/* Note if changes were requested - STRICTLY SELLER ONLY (Requirement 3) */}
                          {chatRole === 'seller' && offer.status === 'change_requested' && offer.change_request_note && (
                            <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-900 space-y-1">
                              <span className="font-bold flex items-center gap-1">
                                <RotateCcw className="w-3.5 h-3.5 text-blue-600" />
                                Buyer requested the following adjustments:
                              </span>
                              <p className="italic text-slate-700">"{offer.change_request_note}"</p>
                            </div>
                          )}
                          {chatRole === 'buyer' && offer.status === 'change_requested' && (
                            <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 flex items-center gap-2">
                              <RotateCcw className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                              <span>Your requested adjustments were submitted to the provider.</span>
                            </div>
                          )}

                          {/* SELLER ONLY: Internal platform split calculation note */}
                          {chatRole === 'seller' && (
                            <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-[11px] text-slate-600 space-y-1">
                              <div className="flex justify-between items-center">
                                <span className="font-semibold text-slate-800">Private Seller Calculation:</span>
                                <span className="text-amber-700 font-mono font-bold">{formatCustomOfferPrice(offer)} Total</span>
                              </div>
                              <div className="flex justify-between text-[10px] pt-1 border-t border-slate-200">
                                <span>Platform 20%: -{formatCurrency(Math.round(offer.price_inr * 0.2), selectedCurrency)}</span>
                                <span className="text-emerald-700 font-bold">Your Net Earnings (80%): {formatCurrency(Math.round(offer.price_inr * 0.8), selectedCurrency)}</span>
                              </div>
                            </div>
                          )}

                          {/* BUYER ACTION CONTROLS */}
                          {chatRole === 'buyer' && offer.status === 'pending' && (
                            <div className="pt-2 border-t border-slate-200 space-y-2">
                              <span className="text-[11px] text-slate-600 font-semibold block text-center">
                                You can review, accept, request changes, or decline this offer:
                              </span>

                              <div className="flex items-center gap-2">
                                <button
                                  type="button"
                                  onClick={() => onAcceptOfferToCheckout(offer)}
                                  className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs rounded-xl transition shadow-xs flex items-center justify-center gap-1.5"
                                >
                                  <Check className="w-4 h-4 stroke-[3]" />
                                  Accept & Pay ({formatCustomOfferPrice(offer)})
                                </button>

                                <button
                                  type="button"
                                  onClick={() => setRequestChangesOfferId(offer.id)}
                                  className="px-3 py-2.5 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs rounded-xl transition border border-slate-300 shadow-xs"
                                >
                                  Request Changes
                                </button>

                                <button
                                  type="button"
                                  onClick={() => respondToCustomOffer(offer.id, 'decline')}
                                  className="px-3 py-2.5 bg-white hover:bg-red-50 text-red-600 font-semibold text-xs rounded-xl transition border border-red-200 shadow-xs"
                                >
                                  Decline
                                </button>
                              </div>

                              {/* Request changes drawer */}
                              {requestChangesOfferId === offer.id && (
                                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2 mt-2">
                                  <label className="text-[11px] font-semibold text-slate-700 block">
                                    Specify requested adjustments (e.g. price, timeline, or extra revisions):
                                  </label>
                                  <textarea
                                    rows={2}
                                    value={changeNotes}
                                    onChange={(e) => setChangeNotes(e.target.value)}
                                    placeholder="e.g. Could we do 4 days delivery and include 1 extra revision?"
                                    className="w-full bg-white border border-slate-300 rounded-lg p-2 text-xs text-slate-900 focus:outline-none focus:border-amber-500 resize-none shadow-xs"
                                  />
                                  <div className="flex items-center justify-end gap-2">
                                    <button
                                      type="button"
                                      onClick={() => setRequestChangesOfferId(null)}
                                      className="px-2.5 py-1 text-xs text-slate-600 hover:text-slate-900 font-medium"
                                    >
                                      Cancel
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => handleSendChangeRequest(offer.id)}
                                      className="px-3 py-1 bg-amber-500 text-slate-950 font-bold text-xs rounded-lg hover:bg-amber-400 shadow-xs"
                                    >
                                      Send Request
                                    </button>
                                  </div>
                                </div>
                              )}

                            </div>
                          )}

                          {/* SELLER ACTION CONTROLS (if changes were requested) */}
                          {chatRole === 'seller' && offer.status === 'change_requested' && (
                            <div className="pt-2 border-t border-slate-200">
                              <button
                                type="button"
                                onClick={() => onOpenCustomOfferBuilder(activeConversation)}
                                className="w-full py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl transition flex items-center justify-center gap-1.5 shadow-xs"
                              >
                                <Sparkles className="w-3.5 h-3.5" />
                                Create Revised Custom Offer for {activeConversation.buyer_name}
                              </button>
                            </div>
                          )}

                        </div>

                      </div>
                    </div>
                  );
                }

                // Standard Text & Attachment Message
                return (
                  <div
                    key={msg.id}
                    className={`flex flex-col max-w-md ${isMe ? 'ml-auto items-end' : 'mr-auto items-start'}`}
                  >
                    <div className="flex items-center justify-between w-full mb-1 px-1 gap-2">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] font-semibold text-slate-500">
                          {msg.sender_name}
                        </span>
                        <span className="text-[9px] text-slate-400">
                          {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                        {msg.is_saved && (
                          <span className="text-[9px] text-amber-800 flex items-center gap-0.5 bg-amber-50 px-1.5 py-0.2 rounded border border-amber-200 font-semibold">
                            <BookmarkCheck className="w-2.5 h-2.5 text-amber-600" />
                            Saved
                          </span>
                        )}
                      </div>

                      {/* Message Actions Menu (For both current user and sender) */}
                      <div className="flex items-center gap-1">
                        {/* Quick Trash Icon on message header */}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteMessage(activeConversation.id, msg.id);
                          }}
                          className="p-1 rounded-md text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition opacity-70 hover:opacity-100"
                          title="Delete message"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>

                        <div className="relative">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setOpenMessageMenuId(openMessageMenuId === msg.id ? null : msg.id);
                            }}
                            className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
                            title="Message options"
                          >
                            <MoreVertical className="w-3.5 h-3.5" />
                          </button>

                          {openMessageMenuId === msg.id && (
                            <div
                              className={`absolute ${isMe ? 'right-0' : 'left-0 sm:right-0 sm:left-auto'} top-full mt-1 z-30 w-44 bg-white border border-slate-200 rounded-xl shadow-xl p-1 text-xs space-y-0.5 animate-in fade-in zoom-in-95 duration-100`}
                              onClick={(e) => e.stopPropagation()}
                            >
                              <button
                                type="button"
                                onClick={() => {
                                  setReplyTo({
                                    id: msg.id,
                                    sender_name: msg.sender_name,
                                    snippet: msg.text || (msg.attachment ? msg.attachment.name : 'Message')
                                  });
                                  setOpenMessageMenuId(null);
                                }}
                                className="w-full px-2.5 py-1.5 rounded-lg text-left text-slate-700 hover:text-slate-900 hover:bg-slate-100 transition flex items-center gap-2"
                              >
                                <Reply className="w-3.5 h-3.5 text-amber-600" />
                                <span>Reply</span>
                              </button>

                              <button
                                type="button"
                                onClick={() => {
                                  toggleSaveMessage(activeConversation.id, msg.id);
                                  setOpenMessageMenuId(null);
                                }}
                                className="w-full px-2.5 py-1.5 rounded-lg text-left text-slate-700 hover:text-slate-900 hover:bg-slate-100 transition flex items-center gap-2"
                              >
                                {msg.is_saved ? (
                                  <>
                                    <BookmarkCheck className="w-3.5 h-3.5 text-amber-600" />
                                    <span>Unsave</span>
                                  </>
                                ) : (
                                  <>
                                    <Bookmark className="w-3.5 h-3.5 text-slate-400" />
                                    <span>Save</span>
                                  </>
                                )}
                              </button>

                              {/* If message has media attachment, offer to delete just the attachment */}
                              {msg.attachment && msg.text && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    handleDeleteAttachment(activeConversation.id, msg);
                                    setOpenMessageMenuId(null);
                                  }}
                                  className="w-full px-2.5 py-1.5 rounded-lg text-left text-amber-700 hover:text-amber-800 hover:bg-amber-50 transition flex items-center gap-2 font-medium"
                                >
                                  <Trash2 className="w-3.5 h-3.5 text-amber-600" />
                                  <span>Delete Media Only</span>
                                </button>
                              )}

                              {!isMe && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    toggleSpamConversation(activeConversation.id);
                                    setOpenMessageMenuId(null);
                                  }}
                                  className="w-full px-2.5 py-1.5 rounded-lg text-left text-slate-700 hover:text-slate-900 hover:bg-slate-100 transition flex items-center gap-2"
                                >
                                  <Archive className="w-3.5 h-3.5 text-purple-600" />
                                  <span>{activeConversation.is_spam ? 'Not Spam' : 'Move to Spam'}</span>
                                </button>
                              )}

                              <div className="border-t border-slate-200 my-0.5" />

                              {/* Delete message permanently */}
                              <button
                                type="button"
                                onClick={() => {
                                  handleDeleteMessage(activeConversation.id, msg.id);
                                  setOpenMessageMenuId(null);
                                }}
                                className="w-full px-2.5 py-1.5 rounded-lg text-left text-rose-600 hover:text-rose-700 hover:bg-rose-50 transition flex items-center gap-2 font-semibold"
                              >
                                <Trash2 className="w-3.5 h-3.5 text-rose-500" />
                                <span>Delete Message</span>
                              </button>

                              {!isMe && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    setReportingMessage(msg);
                                    setOpenMessageMenuId(null);
                                  }}
                                  className="w-full px-2.5 py-1.5 rounded-lg text-left text-slate-500 hover:text-slate-700 hover:bg-slate-50 transition flex items-center gap-2 text-[11px]"
                                >
                                  <Flag className="w-3.5 h-3.5 text-slate-400" />
                                  <span>Report</span>
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    <div
                      className={`p-3.5 rounded-2xl text-xs leading-relaxed space-y-2.5 ${
                        isMe
                          ? 'bg-amber-500 text-slate-950 font-medium rounded-tr-none shadow-xs'
                          : 'bg-white text-slate-800 rounded-tl-none border border-slate-200 shadow-xs'
                      }`}
                    >
                      {/* Quoted reply if present */}
                      {msg.reply_to && (
                        <div className={`p-2 rounded-xl text-[11px] mb-1.5 border ${
                          isMe 
                            ? 'bg-amber-600/15 border-amber-600/25 text-slate-950' 
                            : 'bg-slate-50 border-slate-200 text-slate-700'
                        }`}>
                          <div className="flex items-center gap-1 font-bold text-[10px] uppercase tracking-wide opacity-80 mb-0.5">
                            <Reply className="w-3 h-3" />
                            <span>Replying to {msg.reply_to.sender_name}</span>
                          </div>
                          <p className="line-clamp-1 italic text-[11px]">"{msg.reply_to.snippet}"</p>
                        </div>
                      )}

                      {/* Moderation safety warning notice if flagged */}
                      {msg.moderation_warning && (
                        <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-[11px] flex items-start gap-2 mb-1.5">
                          <AlertCircle className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                          <div>
                            <span className="font-bold text-amber-800 block text-[10px] uppercase tracking-wider">Safety Reminder</span>
                            <span>{msg.moderation_warning}</span>
                          </div>
                        </div>
                      )}

                      {/* Safe message text rendering with external transfer scanner & report capability */}
                      {msg.text && (
                        <SafeMessageText 
                          text={msg.text} 
                          isMe={isMe} 
                          message={msg}
                          onReportMessage={setReportingMessage}
                        />
                      )}

                      {/* File Attachment Rendered conditionally by file type */}
                      {msg.attachment && (() => {
                        const mediaType = getAttachmentMediaType(msg.attachment.name, msg.attachment.type);
                        const mediaUrl = getChatFileUrl(msg.attachment);

                        // 1. IMAGES: preview directly inside message, click opens lightbox
                        if (mediaType === 'image') {
                          return (
                            <div className="space-y-1.5 pt-0.5">
                              <div
                                onClick={() => setLightboxImage({ url: mediaUrl, name: msg.attachment!.name, size: msg.attachment!.size })}
                                className="relative group rounded-xl overflow-hidden border border-slate-200 bg-slate-100/60 cursor-pointer shadow-xs hover:border-amber-400 transition"
                                title="Click to view full image in lightbox"
                              >
                                <img
                                  src={mediaUrl}
                                  alt={msg.attachment.name}
                                  className="w-full max-h-60 sm:max-h-64 object-cover transition duration-200 group-hover:scale-[1.02]"
                                  loading="lazy"
                                />
                                <div className="absolute inset-0 bg-slate-900/0 group-hover:bg-slate-900/30 transition flex items-center justify-center opacity-0 group-hover:opacity-100">
                                  <span className="px-3 py-1.5 rounded-xl bg-white/95 text-slate-900 font-semibold text-xs flex items-center gap-1.5 shadow-md border border-slate-200">
                                    <Maximize2 className="w-3.5 h-3.5 text-amber-600" />
                                    View Full Image
                                  </span>
                                </div>
                              </div>

                              {/* Image caption strip with file details, download and delete option */}
                              <div className={`flex items-center justify-between text-[11px] px-1 ${isMe ? 'text-slate-950 font-medium' : 'text-slate-600'}`}>
                                <div className="flex items-center gap-1.5 truncate max-w-[140px] sm:max-w-[200px]">
                                  <ImageIcon className={`w-3.5 h-3.5 shrink-0 ${isMe ? 'text-slate-950' : 'text-amber-600'}`} />
                                  <span className="truncate font-medium" title={msg.attachment.name}>{msg.attachment.name}</span>
                                  <span className="text-[10px] opacity-75 shrink-0">({formatFileSize(msg.attachment.size)})</span>
                                </div>

                                <div className="flex items-center gap-2">
                                  <button
                                    type="button"
                                    onClick={() => downloadChatAttachment(msg.attachment!)}
                                    className={`text-[11px] font-bold flex items-center gap-1 hover:underline ${
                                      isMe ? 'text-slate-950' : 'text-amber-700'
                                    }`}
                                    title={`Download ${msg.attachment.name}`}
                                  >
                                    <Download className="w-3 h-3" />
                                    <span>Download</span>
                                  </button>

                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleDeleteAttachment(activeConversation.id, msg);
                                    }}
                                    className="text-[11px] font-bold text-rose-600 hover:text-rose-700 hover:bg-rose-100/80 px-1.5 py-0.5 rounded transition flex items-center gap-1"
                                    title="Delete this image"
                                  >
                                    <Trash2 className="w-3 h-3 text-rose-600" />
                                    <span>Delete</span>
                                  </button>
                                </div>
                              </div>
                            </div>
                          );
                        }

                        // 2. AUDIO: inline audio player directly inside chat
                        if (mediaType === 'audio') {
                          return (
                            <div
                              className={`p-3 rounded-xl border space-y-2.5 ${
                                isMe
                                  ? 'bg-amber-600/15 border-amber-600/25 text-slate-950'
                                  : 'bg-slate-50 border-slate-200 text-slate-800'
                              }`}
                            >
                              <div className="flex items-center justify-between gap-2">
                                <div className="flex items-center gap-2 min-w-0">
                                  <div
                                    className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border ${
                                      isMe
                                        ? 'bg-amber-600/20 border-amber-600/30 text-slate-950'
                                        : 'bg-amber-100 border-amber-200 text-amber-700'
                                    }`}
                                  >
                                    <Music className="w-4 h-4" />
                                  </div>
                                  <div className="min-w-0">
                                    <div
                                      className={`font-bold text-xs truncate max-w-[120px] sm:max-w-[170px] ${
                                        isMe ? 'text-slate-950' : 'text-slate-900'
                                      }`}
                                      title={msg.attachment.name}
                                    >
                                      {msg.attachment.name}
                                    </div>
                                    <div
                                      className={`text-[10px] font-medium flex items-center gap-1.5 ${
                                        isMe ? 'text-slate-900/80' : 'text-slate-500'
                                      }`}
                                    >
                                      <span>{formatFileSize(msg.attachment.size)}</span>
                                      <span>•</span>
                                      <span className="uppercase text-[9px] font-bold">Audio Track</span>
                                    </div>
                                  </div>
                                </div>

                                <div className="flex items-center gap-1.5 shrink-0">
                                  <button
                                    type="button"
                                    onClick={() => downloadChatAttachment(msg.attachment!)}
                                    className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 shrink-0 ${
                                      isMe
                                        ? 'bg-amber-600 hover:bg-amber-500 text-white shadow-xs'
                                        : 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-xs'
                                    }`}
                                    title={`Download ${msg.attachment.name}`}
                                  >
                                    <Download className="w-3.5 h-3.5" />
                                    <span>Download</span>
                                  </button>

                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleDeleteAttachment(activeConversation.id, msg);
                                    }}
                                    className="px-2 py-1.5 rounded-lg text-xs font-bold text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 transition flex items-center gap-1 shadow-xs"
                                    title="Delete this audio track"
                                  >
                                    <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                                    <span>Delete</span>
                                  </button>
                                </div>
                              </div>

                              {/* Inline Audio Player - direct playback without downloading */}
                              <div className="pt-0.5">
                                <audio
                                  controls
                                  className="w-full h-8 rounded-lg"
                                  preload="metadata"
                                  src={mediaUrl}
                                >
                                  Your browser does not support inline audio playback.
                                </audio>
                              </div>
                            </div>
                          );
                        }

                        // 3. VIDEO: inline video player directly inside chat
                        if (mediaType === 'video') {
                          return (
                            <div
                              className={`p-2 rounded-xl border space-y-2 overflow-hidden ${
                                isMe
                                  ? 'bg-amber-600/15 border-amber-600/25 text-slate-950'
                                  : 'bg-slate-50 border-slate-200 text-slate-800'
                              }`}
                            >
                              {/* Inline Video Player - direct playback inside chat */}
                              <video
                                controls
                                className="w-full rounded-lg max-h-60 sm:max-h-64 bg-black object-contain shadow-inner"
                                preload="metadata"
                                playsInline
                                src={mediaUrl}
                              >
                                Your browser does not support inline video playback.
                              </video>

                              <div className="flex items-center justify-between px-1 text-xs">
                                <div className="flex items-center gap-2 min-w-0">
                                  <Video className={`w-4 h-4 shrink-0 ${isMe ? 'text-slate-950' : 'text-amber-600'}`} />
                                  <div className="min-w-0">
                                    <div
                                      className={`font-bold text-xs truncate max-w-[120px] sm:max-w-[170px] ${
                                        isMe ? 'text-slate-950' : 'text-slate-900'
                                      }`}
                                      title={msg.attachment.name}
                                    >
                                      {msg.attachment.name}
                                    </div>
                                    <div
                                      className={`text-[10px] font-medium ${
                                        isMe ? 'text-slate-900/80' : 'text-slate-500'
                                      }`}
                                    >
                                      {formatFileSize(msg.attachment.size)} • Video
                                    </div>
                                  </div>
                                </div>

                                <div className="flex items-center gap-1.5 shrink-0">
                                  <button
                                    type="button"
                                    onClick={() => downloadChatAttachment(msg.attachment!)}
                                    className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 shrink-0 ${
                                      isMe
                                        ? 'bg-amber-600 hover:bg-amber-500 text-white shadow-xs'
                                        : 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-xs'
                                    }`}
                                    title={`Download ${msg.attachment.name}`}
                                  >
                                    <Download className="w-3.5 h-3.5" />
                                    <span>Download</span>
                                  </button>

                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleDeleteAttachment(activeConversation.id, msg);
                                    }}
                                    className="px-2 py-1.5 rounded-lg text-xs font-bold text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 transition flex items-center gap-1 shadow-xs"
                                    title="Delete this video"
                                  >
                                    <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                                    <span>Delete</span>
                                  </button>
                                </div>
                              </div>
                            </div>
                          );
                        }

                        // 4. DOCUMENTS / OTHER FILES: remain as file cards with name, size, download and delete
                        return (
                          <div
                            className={`p-2.5 rounded-xl border flex items-center justify-between gap-3 ${
                              isMe
                                ? 'bg-amber-600/15 border-amber-600/25 text-slate-950'
                                : 'bg-slate-50 border-slate-200 text-slate-800'
                            }`}
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              <div
                                className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 border ${
                                  isMe
                                    ? 'bg-amber-600/20 border-amber-600/30 text-slate-950'
                                    : 'bg-amber-100 border-amber-200 text-amber-700'
                                }`}
                              >
                                {getFileIcon(msg.attachment.name, msg.attachment.type)}
                              </div>

                              <div className="min-w-0">
                                <div
                                  className={`font-bold text-xs truncate max-w-[120px] sm:max-w-[170px] ${
                                    isMe ? 'text-slate-950' : 'text-slate-900'
                                  }`}
                                  title={msg.attachment.name}
                                >
                                  {msg.attachment.name}
                                </div>
                                <div
                                  className={`text-[10px] font-medium flex items-center gap-1.5 ${
                                    isMe ? 'text-slate-900/80' : 'text-slate-500'
                                  }`}
                                >
                                  <span>{formatFileSize(msg.attachment.size)}</span>
                                  <span>•</span>
                                  <span className="uppercase text-[9px] font-bold">
                                    {msg.attachment.name.split('.').pop() || 'FILE'}
                                  </span>
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center gap-1.5 shrink-0">
                              <button
                                type="button"
                                onClick={() => downloadChatAttachment(msg.attachment!)}
                                className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 shrink-0 ${
                                  isMe
                                    ? 'bg-amber-600 hover:bg-amber-500 text-white shadow-xs'
                                    : 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-xs'
                                }`}
                                title={`Download ${msg.attachment.name}`}
                              >
                                <Download className="w-3.5 h-3.5" />
                                <span>Download</span>
                              </button>

                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteAttachment(activeConversation.id, msg);
                                }}
                                className="px-2 py-1.5 rounded-lg text-xs font-bold text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 transition flex items-center gap-1 shadow-xs"
                                title="Delete this file"
                              >
                                <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                                <span>Delete</span>
                              </button>
                            </div>
                          </div>
                        );
                      })()}
                    </div>
                  </div>
                );
              })}

              <div ref={messagesEndRef} />

            </div>

            {/* Chat Action Bar & Input */}
            <div className="p-3 sm:p-4 bg-white border-t border-slate-200 space-y-3">
              
              {/* User-Specific Report Confirmation / Status Board (strictly visible ONLY to the reporter) */}
              {activeReportNotice && (
                <div
                  id={`report-status-${chatRole}`}
                  className="flex items-start justify-between p-3 rounded-xl text-xs border border-amber-300 bg-amber-50 text-amber-900 animate-in fade-in duration-200"
                >
                  <div className="flex items-start gap-2.5">
                    <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold block uppercase text-[10px] tracking-wider mb-0.5">
                        Safety Notice
                      </span>
                      <span>{activeReportNotice.message}</span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => dismissReportNotice(chatRole)}
                    className="p-1 text-slate-400 hover:text-slate-700 transition ml-2 shrink-0"
                    title="Dismiss"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}

              {/* Safety & Moderation Feedback Banner (Blocked message or Warning notice) */}
              {sendFeedback && (!sendFeedback.role || sendFeedback.role === chatRole) && (
                <div
                  id={`safety-feedback-banner-${chatRole}`}
                  className="flex items-start justify-between p-3 rounded-xl text-xs border animate-in fade-in duration-200 bg-amber-50 border-amber-300 text-amber-900"
                >
                  <div className="flex items-start gap-2.5">
                    <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-semibold text-amber-950 block leading-relaxed">
                        {sendFeedback.message}
                      </span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSendFeedback(null)}
                    className="p-1 text-slate-400 hover:text-slate-700 transition ml-2 shrink-0"
                    title="Dismiss"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}

              {/* Nudge Notification Feedback Banner */}
              {nudgeToast && (
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs animate-in fade-in duration-200">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span className="font-semibold">{nudgeToast}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setNudgeToast(null)}
                    className="p-1 hover:text-slate-700 transition"
                    title="Dismiss"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}

              {/* External Transfer Guidance Banner (WeTransfer or TransferNow instructions) */}
              {externalTransferGuide && (
                <div className="p-3.5 rounded-2xl bg-gradient-to-r from-amber-50 via-white to-white border border-amber-200 text-xs text-slate-800 space-y-3 shadow-sm animate-in fade-in duration-200">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-amber-100 border border-amber-200 flex items-center justify-center text-amber-700 shrink-0">
                        <UploadCloud className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900 text-xs block">
                            {externalTransferGuide.provider} External Upload Shortcut
                          </span>
                          <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-100 text-amber-800 border border-amber-200 uppercase tracking-wider font-semibold">
                            Official Site
                          </span>
                        </div>
                        <span className="text-[10px] text-slate-500 block truncate max-w-xs sm:max-w-md">
                          Opened in new tab: {externalTransferGuide.url}
                        </span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setExternalTransferGuide(null)}
                      className="p-1 text-slate-400 hover:text-slate-700 rounded-lg transition"
                      title="Dismiss instructions"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Primary User Instruction as specifically required */}
                  <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-950">
                    <p className="font-bold text-xs sm:text-[13px] leading-relaxed text-amber-900">
                      “After uploading your file, copy the share/download link and paste it into this chat to send it to the other person.”
                    </p>
                  </div>

                  {/* Simple Visual Flow: Upload → Copy Link → Paste in Chat → Send */}
                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                    <div className="text-[10px] uppercase font-bold text-slate-500 tracking-wider mb-2 flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                      <span>Next Steps Flow:</span>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 text-center text-[11px] font-semibold">
                      <div className="p-1.5 rounded-lg bg-white text-slate-700 border border-slate-200 shadow-2xs">
                        <span className="text-amber-600 block text-[10px] font-mono">STEP 1</span>
                        <span>Upload File</span>
                      </div>
                      <div className="p-1.5 rounded-lg bg-white text-slate-700 border border-slate-200 shadow-2xs">
                        <span className="text-amber-600 block text-[10px] font-mono">STEP 2</span>
                        <span>Copy Link</span>
                      </div>
                      <div className="p-1.5 rounded-lg bg-white text-amber-700 border border-amber-300 shadow-2xs">
                        <span className="text-amber-600 block text-[10px] font-mono">STEP 3</span>
                        <span>Paste in Chat</span>
                      </div>
                      <div className="p-1.5 rounded-lg bg-amber-500 text-slate-950 font-bold border border-amber-400 shadow-xs">
                        <span className="text-slate-950 block text-[10px] font-mono">STEP 4</span>
                        <span>Send</span>
                      </div>
                    </div>
                  </div>

                  {/* Crucial Understanding Notice */}
                  <div className="text-[10px] text-slate-700 leading-relaxed bg-amber-50 p-2 rounded-xl border border-amber-200 flex items-start gap-2">
                    <AlertCircle className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-amber-900 block">
                        External upload ≠ File sent.
                      </span>
                      <span>
                        Files uploaded on external websites are not transferred automatically. You must paste the download link into this Nain chat and click <strong>Send</strong> for the other person to receive it.
                      </span>
                    </div>
                  </div>

                  {/* Helper Action Buttons */}
                  <div className="flex items-center justify-between gap-2 pt-1 border-t border-slate-200">
                    <button
                      type="button"
                      onClick={() => {
                        window.open(externalTransferGuide.url, '_blank', 'noopener,noreferrer');
                      }}
                      className="text-[11px] font-semibold text-amber-700 hover:text-amber-800 flex items-center gap-1 underline underline-offset-2"
                    >
                      Re-open {externalTransferGuide.provider}
                      <ExternalLink className="w-3 h-3" />
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        const inputEl = document.querySelector('input[placeholder*="Message"], input[placeholder*="Reply"]') as HTMLInputElement;
                        inputEl?.focus();
                      }}
                      className="px-3 py-1 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold rounded-lg transition shadow-xs flex items-center gap-1"
                    >
                      <span>Focus Chat Box</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              )}

              {/* Error Alert: Max 50 MB Direct Limit Exceeded */}
              {fileError && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs animate-in fade-in duration-200 space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold text-rose-900 block">Maximum file size: {ATTACHMENT_CONFIG.directAttachmentLimitMb} MB</span>
                        <span className="font-medium text-[11px] leading-relaxed block text-rose-700">{fileError}</span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setFileError(null)}
                      className="p-1 hover:text-slate-700 transition shrink-0"
                      title="Dismiss"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Quick Shortcut Buttons to External Uploads */}
                  <div className="pt-2 border-t border-rose-200 flex flex-wrap items-center gap-2">
                    <span className="text-[10px] font-semibold text-slate-600">Upload large project file via:</span>
                    <button
                      type="button"
                      onClick={handleOpenWeTransfer}
                      className="px-2.5 py-1 rounded-lg bg-sky-50 border border-sky-200 hover:bg-sky-100 text-sky-700 font-bold text-[11px] flex items-center gap-1 transition"
                    >
                      <span>WeTransfer</span>
                      <ExternalLink className="w-3 h-3" />
                    </button>
                    <button
                      type="button"
                      onClick={handleOpenTransferNow}
                      className="px-2.5 py-1 rounded-lg bg-emerald-50 border border-emerald-200 hover:bg-emerald-100 text-emerald-700 font-bold text-[11px] flex items-center gap-1 transition"
                    >
                      <span>TransferNow</span>
                      <ExternalLink className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              )}

              {/* Staged Reply Banner (if replying to a message) */}
              {replyTo && (
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs animate-in fade-in duration-200">
                  <div className="flex items-center gap-2 min-w-0">
                    <Reply className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                    <div className="truncate">
                      <span className="font-bold text-slate-800">Replying to {replyTo.sender_name}: </span>
                      <span className="text-slate-600 italic">"{replyTo.snippet}"</span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setReplyTo(null)}
                    className="p-1 text-slate-400 hover:text-slate-700 rounded-lg transition shrink-0 ml-2"
                    title="Cancel reply"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}

              {/* Staged File Preview (selected file before sending) */}
              {stagedFile && (
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-amber-300 text-xs animate-in fade-in duration-200">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-8 h-8 rounded-lg bg-amber-100 border border-amber-200 flex items-center justify-center shrink-0 text-amber-700">
                      {getFileIcon(stagedFile.name, stagedFile.type)}
                    </div>
                    <div className="min-w-0">
                      <div className="font-bold text-slate-900 truncate max-w-xs sm:max-w-md" title={stagedFile.name}>
                        {stagedFile.name}
                      </div>
                      <div className="text-[10px] text-slate-500 flex flex-wrap items-center gap-2">
                        <span className="font-medium text-slate-700">{formatFileSize(stagedFile.size)}</span>
                        <span className="text-amber-700 font-semibold">
                          • {getAttachmentMediaType(stagedFile.name, stagedFile.type).toUpperCase()} (ready to send)
                        </span>
                        {/* Clearly show Maximum file size: 50 MB */}
                        <span className="text-emerald-700 font-medium bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200 text-[9px]">
                          Maximum file size: {ATTACHMENT_CONFIG.directAttachmentLimitMb} MB
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      type="button"
                      onClick={handleTriggerFileInput}
                      className="px-2.5 py-1 text-[11px] font-semibold text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg transition shadow-2xs"
                      title="Replace file"
                    >
                      Replace
                    </button>
                    <button
                      type="button"
                      onClick={handleRemoveStagedFile}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                      title="Remove attachment"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* Message Input Form with Paperclip Attachment Button & Popover Menu */}
              <form onSubmit={handleSendMessage} className="flex items-center gap-2 relative">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileSelect}
                  className="hidden"
                />

                {/* Attachment Menu Container */}
                <div className="relative" ref={attachmentMenuRef}>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsAttachmentMenuOpen(prev => !prev);
                    }}
                    title={`Attach files (Direct max ${ATTACHMENT_CONFIG.directAttachmentLimitMb} MB, WeTransfer, TransferNow)`}
                    className={`p-2.5 rounded-xl border transition flex items-center justify-center shrink-0 ${
                      isAttachmentMenuOpen || stagedFile 
                        ? 'bg-amber-100 border-amber-300 text-amber-800 shadow-xs' 
                        : 'bg-white border-slate-200 text-slate-500 hover:text-amber-700 hover:border-slate-300 shadow-xs'
                    }`}
                  >
                    <Paperclip className="w-4 h-4" />
                  </button>

                  {/* Clean, Simple Attachment Menu Dropdown */}
                  {isAttachmentMenuOpen && (
                    <div 
                      className="absolute bottom-full left-0 mb-2 w-72 bg-white border border-slate-200 rounded-2xl shadow-xl p-2 z-40 text-xs space-y-1 animate-in fade-in zoom-in-95 duration-150"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="px-2.5 py-1.5 border-b border-slate-200 flex items-center justify-between">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                          Attach Files
                        </span>
                        <span className="text-[10px] text-amber-800 font-semibold bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
                          Direct: {ATTACHMENT_CONFIG.directAttachmentLimitMb} MB
                        </span>
                      </div>

                      {/* Option 1: Direct Upload */}
                      <button
                        type="button"
                        onClick={handleTriggerFileInput}
                        className="w-full text-left p-2.5 rounded-xl hover:bg-slate-50 border border-transparent hover:border-slate-200 transition flex items-start gap-3 group"
                      >
                        <div className="w-8 h-8 rounded-lg bg-amber-100 border border-amber-200 text-amber-700 flex items-center justify-center shrink-0 mt-0.5 group-hover:bg-amber-500 group-hover:text-slate-950 transition shadow-xs">
                          <Paperclip className="w-4 h-4" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="font-bold text-slate-800 group-hover:text-amber-700 flex items-center justify-between">
                            <span>Direct Upload</span>
                            <span className="text-[10px] text-slate-400 font-normal">Nain storage</span>
                          </div>
                          <div className="text-[11px] font-bold text-amber-700">
                            Maximum {ATTACHMENT_CONFIG.directAttachmentLimitMb} MB
                          </div>
                          <div className="text-[10px] text-slate-500 leading-tight mt-0.5">
                            Audio previews, bounces, lyrics, PDFs
                          </div>
                        </div>
                      </button>

                      {/* Option 2: WeTransfer */}
                      <button
                        type="button"
                        onClick={handleOpenWeTransfer}
                        className="w-full text-left p-2.5 rounded-xl hover:bg-slate-50 border border-transparent hover:border-slate-200 transition flex items-start gap-3 group"
                      >
                        <div className="w-8 h-8 rounded-lg bg-sky-100 border border-sky-200 text-sky-700 flex items-center justify-center shrink-0 mt-0.5 group-hover:bg-sky-500 group-hover:text-white transition shadow-xs">
                          <UploadCloud className="w-4 h-4" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="font-bold text-slate-800 group-hover:text-sky-700 flex items-center justify-between">
                            <span>WeTransfer</span>
                            <ExternalLink className="w-3 h-3 text-slate-400 group-hover:text-sky-600" />
                          </div>
                          <div className="text-[11px] font-semibold text-sky-700">
                            Upload larger files
                          </div>
                          <div className="text-[10px] text-slate-500 leading-tight mt-0.5">
                            Up to 2 GB free (no account needed)
                          </div>
                        </div>
                      </button>

                      {/* Option 3: TransferNow */}
                      <button
                        type="button"
                        onClick={handleOpenTransferNow}
                        className="w-full text-left p-2.5 rounded-xl hover:bg-slate-50 border border-transparent hover:border-slate-200 transition flex items-start gap-3 group"
                      >
                        <div className="w-8 h-8 rounded-lg bg-emerald-100 border border-emerald-200 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5 group-hover:bg-emerald-500 group-hover:text-white transition shadow-xs">
                          <UploadCloud className="w-4 h-4" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="font-bold text-slate-800 group-hover:text-emerald-700 flex items-center justify-between">
                            <span>TransferNow</span>
                            <ExternalLink className="w-3 h-3 text-slate-400 group-hover:text-emerald-600" />
                          </div>
                          <div className="text-[11px] font-semibold text-emerald-700">
                            Upload larger files
                          </div>
                          <div className="text-[10px] text-slate-500 leading-tight mt-0.5">
                            Up to 5 GB free per transfer
                          </div>
                        </div>
                      </button>
                    </div>
                  )}
                </div>

                {/* Seller Quick Action: Create Custom Offer (Next to Attachment) */}
                {chatRole === 'seller' && (
                  <button
                    type="button"
                    onClick={() => onOpenCustomOfferBuilder(activeConversation)}
                    title="Generate and send a tailored Custom Offer to this client"
                    className="p-2.5 px-3 rounded-xl border border-amber-300 bg-amber-50 hover:bg-amber-100 text-amber-900 font-bold text-xs flex items-center gap-1.5 transition shrink-0 shadow-xs"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                    <span className="hidden sm:inline">Create Offer</span>
                  </button>
                )}

                <input
                  type="text"
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  placeholder={
                    replyTo
                      ? `Type your reply to ${replyTo.sender_name}...`
                      : stagedFile
                        ? `Add an optional message (direct max: ${ATTACHMENT_CONFIG.directAttachmentLimitMb} MB)...`
                        : chatRole === 'seller'
                          ? `Reply to ${activeConversation.buyer_name}...`
                          : `Message SoundWave Studios...`
                  }
                  className="flex-1 bg-white border border-slate-300 rounded-xl px-4 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-amber-500 transition shadow-xs"
                />

                <button
                  type="submit"
                  disabled={!messageInput.trim() && !stagedFile}
                  className="px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-xs rounded-xl transition disabled:opacity-40 disabled:hover:bg-amber-500 disabled:hover:text-slate-950 flex items-center gap-1.5 shrink-0 shadow-xs"
                >
                  <Send className="w-3.5 h-3.5" />
                  Send
                </button>
              </form>

            </div>

          </div>

        </div>

      </div>

      {/* Lightbox / Full-Screen Image Viewer */}
      {lightboxImage && (
        <div
          className="fixed inset-0 z-[80] flex flex-col items-center justify-center bg-slate-950/95 backdrop-blur-md p-4 animate-in fade-in duration-200"
          onClick={() => setLightboxImage(null)}
        >
          {/* Lightbox top action bar */}
          <div
            className="w-full max-w-4xl flex items-center justify-between mb-3 text-white px-2"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-2 min-w-0">
              <ImageIcon className="w-4 h-4 text-amber-400 shrink-0" />
              <span className="text-sm font-bold truncate max-w-xs sm:max-w-md">{lightboxImage.name}</span>
              <span className="text-xs text-slate-400 shrink-0">({formatFileSize(lightboxImage.size)})</span>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => downloadChatAttachment({ name: lightboxImage.name, size: lightboxImage.size, url: lightboxImage.url })}
                className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 hover:bg-slate-800 text-xs font-bold text-amber-400 flex items-center gap-1.5 transition shadow"
                title={`Download ${lightboxImage.name}`}
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download</span>
              </button>
              <button
                type="button"
                onClick={() => setLightboxImage(null)}
                className="p-1.5 rounded-xl bg-slate-900 border border-slate-700 hover:bg-slate-800 text-slate-300 hover:text-white transition"
                title="Close viewer (Esc)"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Lightbox image content */}
          <div
            className="max-h-[82vh] max-w-[92vw] overflow-hidden rounded-2xl border border-slate-800 shadow-2xl flex items-center justify-center bg-slate-900/60 p-1"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={lightboxImage.url}
              alt={lightboxImage.name}
              className="max-h-[80vh] max-w-[90vw] object-contain rounded-xl"
            />
          </div>
        </div>
      )}

      {/* User Report Modal */}
      {reportingMessage && (
        <ReportMessageModal
          message={reportingMessage}
          conversationId={activeConversation.id}
          reporterRole={chatRole}
          reporterName={chatRole === 'seller' ? 'SoundWave Studios' : activeConversation.buyer_name}
          onClose={() => setReportingMessage(null)}
          onReportSubmitted={() => {
            const submittingRole = chatRole;
            setReportNotices(prev => ({
              ...prev,
              [`${activeConversation.id}_${submittingRole}`]: {
                reporterRole: submittingRole,
                message: 'Your report has been submitted to Nain Trust & Safety team for confidential review. Thank you for keeping Nain Music secure.'
              }
            }));
          }}
        />
      )}

      {/* Confidential Safety & Moderation Center (Admin Review Queue) */}
      {showAdminModeration && (
        <AdminModerationDrawer
          onClose={() => setShowAdminModeration(false)}
        />
      )}

      {/* Action / Delete Toast Alert */}
      {deleteToast && (
        <div className="fixed bottom-6 right-6 z-[100] bg-slate-900 border border-slate-700 text-white px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2.5 text-xs font-semibold animate-in slide-in-from-bottom-3 duration-200">
          <Trash2 className="w-4 h-4 text-rose-400 shrink-0" />
          <span>{deleteToast}</span>
        </div>
      )}

      {/* Google Drive Action Toast */}
      {driveToast && (
        <div className="fixed bottom-6 right-6 z-[100] bg-slate-900 border border-amber-500/50 text-white px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2.5 text-xs font-semibold animate-in slide-in-from-bottom-3 duration-200">
          <HardDrive className="w-4 h-4 text-amber-400 shrink-0" />
          <span>{driveToast}</span>
        </div>
      )}
    </div>
  );
};
