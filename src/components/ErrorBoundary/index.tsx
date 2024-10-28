import { Component } from 'react';

import { type CrashProps, CrashUI, type ErrorBoundaryError } from '@/components/ErrorBoundary/Crash.js';

export class ErrorBoundary extends Component<Partial<CrashProps>> {
    static getDerivedStateFromError(error: unknown) {
        return { error };
    }

    override state: {
        error: Error | null;
    } = { error: null };

    override render() {
        if (!this.state.error) return <>{this.props.children}</>;
        return <CrashUI onRetry={() => this.setState({ error: null })} {...this.props} {...this.normalizedError} />;
    }

    private get normalizedError(): ErrorBoundaryError {
        let stack = '<stack not available>';
        let type = 'UnknownError';
        let message = 'unknown error';
        if (!this.state.error) return { stack, type, message };
        try {
            stack = String(this.state.error.stack!) || '<stack not available>';
        } catch {}
        try {
            type = String(this.state.error.name) || '<type not available>';
        } catch {}
        try {
            message = String(this.state.error.message) || '<message not available>';
        } catch {}
        return { stack, type, message };
    }
}
