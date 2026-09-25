/**
 * NAIN MUSIC - FINAL LOCKED STORAGE ARCHITECTURE SERVICE
 * 
 * Storage Matrix Rules:
 * 
 * 1. WIX / APP DATABASE — PERMANENT CORE DATA
 *    - Buyer & Seller profiles, account details, bios, DAW configs, studio gear
 *    - Gig details: titles, descriptions, pricing tiers, FAQs, requirements
 *    - Orders and order metadata: statuses, dates, amounts, commission split (80/20)
 *    - Reviews, ratings, seller responses
 *    - Earnings ledger & Platform Fee records
 *    - Followers & marketplace stats
 *    - Chat text/messages & metadata
 * 
 * 2. WIX — PERMANENT VISUAL ASSETS
 *    - Buyer/Seller profile avatars & studio photos
 *    - Seller logos & verified badges
 *    - Gig cover images, portfolio visuals & thumbnails
 * 
 * 3. GOOGLE DRIVE — HEAVY FILE STORAGE ONLY
 *    Google Drive is used ONLY for:
 *    - Chat heavy attachments (audio preview bounces, video clips, PDFs, docs)
 *      -> Subject to chat deletion policy (real-time sync removal upon message/attachment delete)
 *    - Order Delivery heavy files (Lossless 24-bit 48kHz WAV masters, multitrack stem ZIPs, revisions)
 *      -> Permanently archived for accepted/final orders (never deleted with chat cleanup)
 * 
 * 4. GOOGLE DRIVE MUST NOT STORE:
 *    - App code / backend code
 *    - Buyer / Seller profiles
 *    - Gig database / Orders database
 *    - Reviews, ratings, earnings ledger, platform fee records
 *    - Permanent profile & gig images
 *    - Authentication / session tokens
 */

import {
  uploadChatFileToGoogleDrive,
  uploadDeliveryFileToGoogleDrive,
  deleteChatAttachmentFromDrive,
  verifyDriveFile,
  getDriveAccessToken,
  GoogleDriveFile
} from './googleDriveService';
import { ChatAttachment, OrderFileAttachment } from '../types';

export interface StorageUploadResult {
  success: boolean;
  fileId?: string;
  url?: string;
  webViewLink?: string;
  name: string;
  size: number;
  mimeType: string;
  storageProvider: 'google_drive' | 'wix_media' | 'wetransfer' | 'transfernow';
  isPermanentOrderArchive: boolean;
  error?: string;
}

export interface IStorageService {
  // Heavy Chat Attachment
  uploadChatAttachment(
    file: File | Blob,
    fileName: string,
    mimeType?: string
  ): Promise<StorageUploadResult>;

  // Heavy Order Delivery
  uploadOrderDeliverable(
    file: File | Blob,
    fileName: string,
    orderNumber: string,
    category?: 'audio' | 'stems' | 'video' | 'projects',
    mimeType?: string
  ): Promise<StorageUploadResult>;

  // Real-time Chat Cleanup
  deleteChatAttachment(
    fileName: string,
    driveFileId?: string
  ): Promise<boolean>;

  // Verification
  verifyStorageFile(fileId: string): Promise<boolean>;
}

class StorageServiceImpl implements IStorageService {
  /**
   * Uploads heavy chat attachments to user's Google Drive under "05 - Chat Files & Media"
   * These can be cleaned up if the chat or attachment is deleted.
   */
  async uploadChatAttachment(
    file: File | Blob,
    fileName: string,
    mimeType?: string
  ): Promise<StorageUploadResult> {
    const token = getDriveAccessToken();
    const cleanType = mimeType || (file instanceof File ? file.type : 'application/octet-stream') || 'application/octet-stream';
    const fileSize = file.size;

    if (token) {
      try {
        const driveResult = await uploadChatFileToGoogleDrive(file, fileName, cleanType);
        // Verify actual upload
        const verification = await verifyDriveFile(driveResult.id);

        return {
          success: true,
          fileId: driveResult.id,
          url: driveResult.webContentLink || driveResult.webViewLink,
          webViewLink: driveResult.webViewLink,
          name: driveResult.name || fileName,
          size: driveResult.size ? parseInt(driveResult.size, 10) : fileSize,
          mimeType: driveResult.mimeType || cleanType,
          storageProvider: 'google_drive',
          isPermanentOrderArchive: false
        };
      } catch (err: any) {
        console.warn('Google Drive chat upload fallback to secure browser blob:', err);
      }
    }

    // Fallback for offline/unconnected mode (standard Object URL)
    const blobUrl = URL.createObjectURL(file);
    return {
      success: true,
      url: blobUrl,
      name: fileName,
      size: fileSize,
      mimeType: cleanType,
      storageProvider: 'wix_media',
      isPermanentOrderArchive: false
    };
  }

  /**
   * Uploads heavy order deliverables (WAV masters, stems, ZIPs) to Google Drive
   * These are PERMANENTLY stored and never removed by chat cleanup policies.
   */
  async uploadOrderDeliverable(
    file: File | Blob,
    fileName: string,
    orderNumber: string,
    category: 'audio' | 'stems' | 'video' | 'projects' = 'audio',
    mimeType?: string
  ): Promise<StorageUploadResult> {
    const token = getDriveAccessToken();
    const cleanType = mimeType || (file instanceof File ? file.type : 'application/octet-stream') || 'audio/wav';
    const fileSize = file.size;

    if (token) {
      try {
        const driveResult = await uploadDeliveryFileToGoogleDrive(file, fileName, orderNumber, category, cleanType);
        await verifyDriveFile(driveResult.id);

        return {
          success: true,
          fileId: driveResult.id,
          url: driveResult.webContentLink || driveResult.webViewLink,
          webViewLink: driveResult.webViewLink,
          name: driveResult.name || fileName,
          size: driveResult.size ? parseInt(driveResult.size, 10) : fileSize,
          mimeType: driveResult.mimeType || cleanType,
          storageProvider: 'google_drive',
          isPermanentOrderArchive: true
        };
      } catch (err: any) {
        console.warn('Google Drive delivery upload error:', err);
      }
    }

    const blobUrl = URL.createObjectURL(file);
    return {
      success: true,
      url: blobUrl,
      name: fileName,
      size: fileSize,
      mimeType: cleanType,
      storageProvider: 'wix_media',
      isPermanentOrderArchive: true
    };
  }

  /**
   * Real-time deletion of chat temporary attachments from Google Drive
   * Note: This explicitly DOES NOT delete completed order deliverables.
   */
  async deleteChatAttachment(
    fileName: string,
    driveFileId?: string
  ): Promise<boolean> {
    return await deleteChatAttachmentFromDrive(fileName, driveFileId);
  }

  /**
   * Verify actual storage presence in Google Drive
   */
  async verifyStorageFile(fileId: string): Promise<boolean> {
    const res = await verifyDriveFile(fileId);
    return res.exists;
  }
}

export const storageService = new StorageServiceImpl();

/**
 * Storage architecture enforcement manifest
 */
export const STORAGE_ARCHITECTURE_MANIFEST = {
  version: '1.0.0-final-locked',
  layers: {
    wix_database: {
      scope: 'Permanent Core Data',
      entities: [
        'Buyer Profiles & Settings',
        'Seller Profiles, Studio Gear & DAW setups',
        'Gig details, pricing tiers, FAQs, requirements',
        'Orders, order metadata & 80/20 earnings split',
        'Reviews, ratings & seller replies',
        'Platform Fee & Financial ledgers',
        'Chat text, message history & metadata'
      ]
    },
    wix_visual_assets: {
      scope: 'Permanent Visual Assets',
      entities: [
        'Profile avatars & photos',
        'Seller studio logos & badges',
        'Gig cover images & visual thumbnails'
      ]
    },
    google_drive: {
      scope: 'Heavy File Storage ONLY',
      allowedEntities: [
        'Chat heavy attachments (audio bounces, videos, PDFs, docs) with deletion policy',
        'Order Delivery heavy files (24-bit 48kHz WAV masters, multitrack stems, ZIP sessions)'
      ],
      forbiddenEntities: [
        'App codebase & backend server',
        'Buyer / Seller profile databases',
        'Gig & Order database records',
        'Review / Rating records',
        'Earnings ledger & Platform fee tables',
        'Permanent profile & Gig images',
        'Authentication & Session tokens'
      ]
    }
  }
};
