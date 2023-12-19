import { ServerErrorCodes } from '@/helpers/createErrorResponseJSON.js';
import type { IPFSResponse } from '@/services/uploadToIPFS.js';

export type ResponseJSON<T> =
    | {
          success: true;
          data: T;
      }
    | {
          success: false;
          error: {
              code: ServerErrorCodes;
              message: string;
          };
      };

export interface MetadataAsset {
    type: 'Image' | 'Video' | 'Audio';
    uri: string;
    cover?: string;
    artist?: string;
    title?: string;
}

export interface MediaObject {
    file: File;
    ipfs?: IPFSResponse;
}

export interface MediaObject_WithIPFS {
    file: File;
    ipfs: IPFSResponse;
}

export type ThemeMode = 'light' | 'dark' | 'default';

export type PartialWith<T, K extends keyof T> = Partial<Pick<T, K>> & Omit<T, K>;
