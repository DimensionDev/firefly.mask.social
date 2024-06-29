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

export type SearchParams = Record<string, string | string[] | undefined>;

export type PartialWith<T, K extends keyof T> = Partial<Pick<T, K>> & Omit<T, K>;

// eslint-disable-next-line @typescript-eslint/ban-types
export interface ClassType<T> extends Function {
    new (...args: unknown[]): T;
}

// learn more: https://nextjs.org/docs/app/api-reference/file-conventions/route#context-optional
export interface NextRequestContext {
    params: Record<string, string | undefined>;
}

export type NonUndefined<T> = T extends undefined ? never : T;
