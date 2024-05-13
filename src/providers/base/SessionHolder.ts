import type { Session } from '@/providers/types/Session.js';

export class SessionHolder<T extends Session> {
    protected internalSession: T | null = null;

    get session() {
        return this.internalSession;
    }

    get sessionRequired() {
        if (!this.internalSession) throw new Error('No session found.');
        return this.internalSession;
    }

    resumeSession(session: T) {
        this.internalSession = session;
    }

    removeSession() {
        this.internalSession = null;
    }

    withSession<K extends (session: T | null) => unknown>(callback: K, required = false) {
        return callback(required ? this.sessionRequired : this.session) as ReturnType<K>;
    }

    fetch<T>(url: string, options?: RequestInit, required = false) {
        throw new Error('Not implemented.');
    }
}
