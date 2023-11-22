import { HomeIcon } from '@heroicons/react/24/outline';

import { ServerErrorCodes } from '@/helpers/createErrorResponseJSON.js';

export interface NavigationItem {
    id: string;
    name: React.ReactNode;
    icon: typeof HomeIcon;
    href: string;
    selected?: boolean;
}

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
