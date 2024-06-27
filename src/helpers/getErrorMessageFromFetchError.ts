import { t } from '@lingui/macro';
import { StatusCodes } from 'http-status-codes';

import type { FetchError } from '@/constants/error.js';

export function getErrorMessageFromFetchError(error: FetchError): string {
    switch (error.status) {
        case StatusCodes.UNAUTHORIZED:
            return t`Unauthorized. Please check your login`;
        case StatusCodes.FORBIDDEN:
            return t`Forbidden. Please check your permissions`;
        case StatusCodes.NOT_FOUND:
            return t`Not Found. Please check your URL[${error.url}]`;
        case StatusCodes.INTERNAL_SERVER_ERROR:
            return t`Internal Server Error. Please try again later`;
        default:
            return t`Failed to fetch: ${error.status}. Please try again later`;
    }
}
