/* cspell:disable */

import type { FarcasterNetwork } from '@farcaster/core';

export type Response<T> =
    | {
          name: string;
          code: number;
          errCode: string;
          presentable: boolean;
          details: string;
          metadata: {
              errcode: string[];
          };
      }
    | T;

export interface SignaturePacket {
    signer: `0x${string}`;
    messageHash: `0x${string}`;
    messageSignature: `0x${string}`;
}

export interface FrameSignaturePacket {
    untrustedData: {
        fid: number;
        url: string;
        messageHash: string;
        timestamp: number;
        network: FarcasterNetwork;
        buttonIndex: number;
        inputText?: string;
        address?: string;
        transactionId?: string;
        castId: {
            fid: number;
            hash: string;
        };
        state?: string;
    };
    trustedData: {
        messageBytes: string;
    };
}
