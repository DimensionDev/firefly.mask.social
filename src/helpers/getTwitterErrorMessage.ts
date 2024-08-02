interface TwitterV1ErrorData {
    errors: Array<{
        message: string;
        code: number;
    }>;
}

interface TwitterV2ErrorData {
    detail: string;
    title: string;
    status: number;
}

interface TwitterError {
    data: TwitterV1ErrorData | TwitterV2ErrorData;
}

export function getTwitterErrorMessage(error: unknown): { status?: number; message: string } {
    if (!(error instanceof Error)) return { message: 'Unknown error.' };

    try {
        const { data } = error as unknown as TwitterError;
        if (Array.isArray((data as TwitterV1ErrorData).errors)) {
            const v1Data = data as TwitterV1ErrorData;
            return { message: v1Data.errors.map(({ message, code }) => `${message} (code: ${code})`).join('\n') };
        }

        const { detail, title, status } = data as TwitterV2ErrorData;
        return { message: [`${title} ${status}`, detail].join('\n') };
    } catch {
        return { message: error.message };
    }
}
