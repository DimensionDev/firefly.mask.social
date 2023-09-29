import { Session, Provider } from '@/providers/types/Auth';

export class TwitterAuth implements Provider {
    async isLogin(identifier: string) {
        return false;
    }

    login(): Promise<Session> {
        throw new Error('Method not implemented.');
    }

    logout(): Promise<void> {
        throw new Error('Method not implemented.');
    }
}
