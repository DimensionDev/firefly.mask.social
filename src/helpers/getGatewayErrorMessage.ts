export function getGatewayErrorMessage(error: unknown, fallback?: string) {
    if (error instanceof Error) {
        return error.message;
    }

    return JSON.stringify(error);
}
