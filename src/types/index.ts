import { ServerErrorCodes } from '@/helpers/createErrorResponseJSON.js';
import { SocialPlatform } from '@/constants/enum.js';

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

export type LensPublicationViewCount = {
    id: string;
    views: number;
};

export interface Account {
    profileId: string;
    avatar: string;
    name: string;
    id: string;
    platform: SocialPlatform;
    signless?: boolean;
    handle?: string;
}
