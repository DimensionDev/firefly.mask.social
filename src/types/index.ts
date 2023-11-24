import { ServerErrorCodes } from '@/helpers/createErrorResponseJSON.js';

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
