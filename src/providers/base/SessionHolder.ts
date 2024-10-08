import { Emitter } from '@servie/events';
import { type Subscription } from 'use-subscription';

import { queryClient } from '@/configs/queryClient.js';
import { NotImplementedError } from '@/constants/error.js';
import { resolveSourceFromSessionType } from '@/helpers/resolveSource.js';
import type { Session } from '@/providers/types/Session.js';

export class SessionHolder<T extends Session> {
    protected emitter = new Emitter<{
        // the actual type is T | null, use unknown to avoid type errors
        update: [unknown];
    }>();
    protected internalSession: T | null = null;

    private removeQueries() {
        if (!this.session) return;
        queryClient.removeQueries({ queryKey: ['profile', resolveSourceFromSessionType(this.session.type)] });
    }

    get session() {
        return this.internalSession;
    }

    get sessionRequired() {
        if (!this.internalSession) throw new Error('No session found.');
        return this.internalSession;
    }

    get subscription() {
        return {
            getCurrentValue: () => this.internalSession,
            subscribe: (callback: () => void) => {
                return this.emitter.on('update', (session) => {
                    if (this.internalSession === session) return;
                    callback();
                });
            },
        } satisfies Subscription<T | null>;
    }

    assertSession(message?: string) {
        try {
            return this.sessionRequired;
        } catch (error: unknown) {
            if (typeof message === 'string') throw new Error(message);
            throw error;
        }
    }

    refreshSession(): Promise<T> {
        throw new NotImplementedError();
    }

    resumeSession(session: T) {
        this.removeQueries();
        this.internalSession = session;
        this.emitter.emit('update', session);
    }

    removeSession() {
        this.removeQueries();
        this.internalSession = null;
        this.emitter.emit('update', null);
    }

    withSession<K extends (session: T | null) => unknown>(callback: K, required = false) {
        return callback(required ? this.sessionRequired : this.session) as ReturnType<K>;
    }

    fetchWithSession<T>(url: string, options?: RequestInit): Promise<T> {
        throw new NotImplementedError();
    }

    fetchWithoutSession<T>(url: string, options?: RequestInit): Promise<T> {
        throw new NotImplementedError();
    }

    /**
     * Fetch w/ or w/o session.
     *
     * withSession = true: fetch with session
     * withSession = false: fetch without session
     * withSession = undefined: fetch with session if session exists
     * @param url
     * @param options
     * @param withSession
     */
    fetch<T>(url: string, options?: RequestInit, withSession?: boolean): Promise<T> {
        if (withSession === true) return this.fetchWithSession<T>(url, options);
        if (withSession === false) return this.fetchWithoutSession<T>(url, options);
        if (this.session) return this.fetchWithSession<T>(url, options);
        return this.fetchWithoutSession<T>(url, options);
    }
}
