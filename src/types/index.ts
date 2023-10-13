import { ServerErrorCodes } from '@/helpers/createErrorResponseJSON';
import { HomeIcon } from '@heroicons/react/24/outline';

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
