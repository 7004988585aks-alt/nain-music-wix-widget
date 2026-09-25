/**
 * Configuration for Nain Music Direct and External Attachments
 *
 * Current policy: Production storage costs are kept low by limiting direct server/in-memory
 * attachments to 50 MB. For larger project files (DAW projects, multi-track WAV stems, large zip archives),
 * external transfer shortcuts (WeTransfer, TransferNow) are provided.
 *
 * NOTE: This is intentionally configurable so limits can easily be upgraded in future tiers
 * (e.g. 100 MB, 200 MB, 500 MB) without changing business logic across multiple components.
 */

export interface AttachmentConfig {
  /** Maximum direct attachment size in megabytes */
  directAttachmentLimitMb: number;
  /** Maximum direct attachment size in bytes */
  maxDirectSizeBytes: number;
  /** Label to display in the UI */
  directLimitLabel: string;
  /** External large file transfer providers */
  externalProviders: {
    weTransfer: {
      name: string;
      url: string;
      description: string;
      freeLimitText: string;
    };
    transferNow: {
      name: string;
      url: string;
      description: string;
      freeLimitText: string;
    };
  };
}

// Configurable setting (default: 50 MB)
export const DIRECT_ATTACHMENT_LIMIT_MB = 50;

export const ATTACHMENT_CONFIG: AttachmentConfig = {
  directAttachmentLimitMb: DIRECT_ATTACHMENT_LIMIT_MB,
  maxDirectSizeBytes: DIRECT_ATTACHMENT_LIMIT_MB * 1024 * 1024,
  directLimitLabel: `Maximum file size: ${DIRECT_ATTACHMENT_LIMIT_MB} MB`,
  externalProviders: {
    weTransfer: {
      name: 'WeTransfer',
      url: 'https://wetransfer.com/',
      description: 'Upload larger files',
      freeLimitText: 'Up to 2 GB free (no account needed)'
    },
    transferNow: {
      name: 'TransferNow',
      url: 'https://www.transfernow.net/en',
      description: 'Upload larger files',
      freeLimitText: 'Up to 5 GB free per transfer'
    }
  }
};

/**
 * Validates if a file size is within direct attachment limits.
 */
export function validateDirectAttachmentSize(fileSizeBytes: number): {
  isValid: boolean;
  sizeMb: number;
  limitMb: number;
  errorMessage?: string;
} {
  const sizeMb = Number((fileSizeBytes / (1024 * 1024)).toFixed(2));
  const limitMb = ATTACHMENT_CONFIG.directAttachmentLimitMb;

  if (fileSizeBytes > ATTACHMENT_CONFIG.maxDirectSizeBytes) {
    return {
      isValid: false,
      sizeMb,
      limitMb,
      errorMessage: `File exceeds direct attachment limit of ${limitMb} MB (selected file is ${sizeMb} MB). Please use WeTransfer or TransferNow for larger project files.`
    };
  }

  return {
    isValid: true,
    sizeMb,
    limitMb
  };
}

/**
 * Checks if a given URL is a known external file transfer link (WeTransfer, TransferNow, etc.)
 */
export function identifyExternalTransferService(rawUrl: string): {
  isExternalTransfer: boolean;
  serviceName?: 'WeTransfer' | 'TransferNow' | 'Generic';
  domain?: string;
} {
  try {
    const cleanUrl = rawUrl.trim().toLowerCase();
    if (cleanUrl.includes('wetransfer.com') || cleanUrl.includes('we.tl')) {
      return { isExternalTransfer: true, serviceName: 'WeTransfer', domain: 'wetransfer.com' };
    }
    if (cleanUrl.includes('transfernow.net')) {
      return { isExternalTransfer: true, serviceName: 'TransferNow', domain: 'transfernow.net' };
    }
    return { isExternalTransfer: false };
  } catch {
    return { isExternalTransfer: false };
  }
}
