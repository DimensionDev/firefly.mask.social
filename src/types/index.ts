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

// https://github.com/microsoft/TypeScript/issues/29729#issuecomment-1483854699
export interface Nothing {}

// We discard boolean as the default type.
export type LiteralUnion<U, T = U extends string ? string : U extends number ? number : never> = U | (T & Nothing);

export type MindNever<T extends never> = T extends never ? true : false;
