export enum Platform {
    LENS = 'lens',
    FIREFLY = 'firefly',
    TWITTER = 'twitter',
    FARCASTER = 'farcaster',
}

export enum SupportedNativeMethod {
    GET_SUPPORTED_METHODS = 'getSupportMethod',
    GET_WALLET_ADDRESS = 'getWalletAddress',
    CONNECT_WALLET = 'connectWallet',
    LOGIN = 'login',
    SHARE = 'share',
    COMPOSE = 'compose',
}

export enum SupportedWebMethod {
    GET_SUPPORTED_METHODS = 'getSupportMethod',
    GET_WALLET_ADDRESS = 'getWalletAddress',
    CONNECT_WALLET = 'connectWallet',
    LOGIN = 'login',
}

export interface HeaderItem {
    type: 'header';
    name: 'authorization' | 'x-theme' | 'x-language';
}

export type NativeMethodItem =
    | {
          type: 'native-method-call';
          name:
              | SupportedNativeMethod.GET_SUPPORTED_METHODS
              | SupportedNativeMethod.GET_WALLET_ADDRESS
              | SupportedNativeMethod.CONNECT_WALLET;
      }
    | {
          type: 'native-method-call';
          name: SupportedNativeMethod.LOGIN;
          params: {
              platform: Platform;
          };
      }
    | {
          type: 'native-method-call';
          name: SupportedNativeMethod.SHARE;
          params: {
              text: string;
          };
      }
    | {
          type: 'native-method-call';
          name: SupportedNativeMethod.COMPOSE;
          params: {
              text: string;
              platform: Platform;
              urls?: string[];
          };
      };

export type WebMethodItem =
    | {
          type: 'web-method-call';
          name: SupportedWebMethod.GET_SUPPORTED_METHODS;
          params: SupportedWebMethod[];
      }
    | {
          type: 'web-method-call';
          name: SupportedWebMethod.GET_WALLET_ADDRESS;
          params: string[];
      }
    | {
          type: 'web-method-call';
          name: SupportedWebMethod.CONNECT_WALLET;
          params: {
              walletAddress: string;
          };
      }
    | {
          type: 'web-method-call';
          name: 'login';
          params: {
              success: 'true' | 'false';
          };
      };
