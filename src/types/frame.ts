/* cspell:disable */

// #region frame v1
import type { FrameHost } from '@farcaster/frame-host';

import type { FrameProtocol } from '@/constants/enum.js';

export type Index = 1 | 2 | 3 | 4;

export enum ActionType {
    Post = 'post',
    PostRedirect = 'post_redirect',
    Link = 'link',
    Mint = 'mint',
    Transaction = 'tx',
}

export interface FrameInput {
    label: string;
    placeholder?: string;
}

export interface FrameButton {
    index: Index;
    text: string;
    action: ActionType;
    // action target URL
    target?: string;
    // send signature packet to, overrides fc:frame:post_url
    postUrl?: string;
}

export interface FrameImage {
    url: string;
    alt?: string;
    width?: number;
    height?: number;
}

export interface FrameV1 {
    url: string;
    // frame title
    title: string;
    // fc:frame
    version: 'vNext';
    // fc:frame:image or og:image
    image: FrameImage;
    // fc:frame:post_url
    postUrl: string;
    // fc:frame:input:text
    input: FrameInput | null;
    // fc:frame:button:$idx and fc:frame:button:$idx:action
    buttons: FrameButton[];
    // fc:frame:refresh_period
    refreshPeriod: number;
    // fc:frame:aspect_ratio
    aspectRatio?: '1.91:1' | '1:1';
    // fc:frame:state
    state?: string;
    // frame client protocol
    protocol?: FrameProtocol;
}

/**
 * Supported chain IDs by Frame
 * Learn more: https://docs.farcaster.xyz/developers/frames/spec
 */
export enum ChainId {
    Ethereum = 1,
    Polygon = 137,
    Arbitrum = 42161,
    Base = 8453,
    Base_Sepolia = 84532,
    Gnosis = 100,
    Optimism = 10,
    Zora = 7777777,
}

export enum MethodType {
    ETH_SEND_TRANSACTION = 'eth_sendTransaction',
    ETH_SIGN_TYPED_DATA_V4 = 'eth_signTypedData_v4',
}

export interface LinkDigestedResponse<T = Frame> {
    frame: T | null;
}

export interface RedirectUrlResponse {
    redirectUrl: string;
}
// #endregion

// #region frame v2
export enum FrameInvocationType {
    // Called when the app is invoked from the app launcher or any other unspecified context.
    // Loads the `homeUrl` defined in the frame application manifest.
    Global = 'global',
    // Called when the frame is invoked from an embed in a feed or direct cast.
    // Loads the `url` specified in the FrameEmbed metadata.
    Embed = 'embed',
    // Called when a user taps/clicks a frame notification.
    // Loads the `targetUrl` specified in the notification payload.
    Notification = 'notification',
}

export type TriggerConfig =
    | {
          // Type of trigger, either cast or composer. Required.
          type: 'cast';

          // Unique ID. Required. Reported to the frame.
          // Example: "yoink-score"
          id: string;

          // Handler URL. Required.
          // Example: "https://yoink.party/triggers/cast"
          url: string;

          // Name override. Optional, defaults to FrameConfig.name
          // Example: "View Yoink Score"
          name?: string;
      }
    | {
          type: 'composer';
          id: string;
          url: string;
          name?: string;
      };

export interface FrameConfig {
    // Manifest version. Required.
    version: '1';

    // App name. Required.
    // Max length of 32 characters.
    // Example: "Yoink!"
    name: string;

    // Default launch URL. Required.
    // Max 512 characters.
    // Example: "https://yoink.party/"
    homeUrl: string;

    // Frame application icon URL.
    // Max 512 characters.
    // Image must be 200x200px and less than 1MB.
    // Example: "https://yoink.party/img/icon.png"
    iconUrl: string;

    // Splash image URL.
    // Max 512 characters.
    // Image must be 200x200px and less than 1MB.
    // Example: "https://yoink.party/img/splash.png"
    splashImageUrl?: string;

    // Hex color code.
    // Example: "#eeeee4"
    splashBackgroundColor?: string;

    // URL to which clients will POST events.
    // Max 512 characters.
    // Required if the frame application uses notifications.
    // Example: "https://yoink.party/webhook"
    webhookUrl?: string;
}

export interface FarcasterManifest {
    // Metadata associating the domain with a Farcaster account
    accountAssociation: {
        // base64url encoded JFS header.
        // See FIP: JSON Farcaster Signatures for details on this format.
        header: string;

        // base64url encoded payload containing a single property `domain`
        payload: string;

        // base64url encoded signature bytes
        signature: string;
    };

    // Frame configuration
    frame: FrameConfig;

    // Trigger configuration
    triggers?: TriggerConfig[];
}

/**
 * The embedded frame configuration.
 */
export interface FrameV2 {
    x_url: string;
    x_manifest?: FarcasterManifest;

    // Frame spec version. Required.
    // Example: "next"
    version: Omit<string, 'next'> | 'next';

    // Frame image.
    // Max 512 characters.
    // Image must be 3:2 aspect ratio and less than 10 MB.
    // Example: "https://yoink.party/img/start.png"
    imageUrl: string;

    // Button attributes
    button: {
        // Button text.
        // Max length of 32 characters.
        // Example: "Yoink Flag"
        title: string;

        // Action attributes
        action: {
            // Action type. Must be "launch_frame".
            type: 'launch_frame';

            // App name
            // Max length of 32 characters.
            // Example: "Yoink!"
            name: string;

            // Frame launch URL.
            // Max 512 characters.
            // Example: "https://yoink.party/"
            url: string;

            // Splash image URL.
            // Max 512 characters.
            // Image must be 200x200px and less than 1MB.
            // Example: "https://yoink.party/img/splash.png"
            splashImageUrl: string;

            // Hex color code.
            // Example: "#eeeee4"
            splashBackgroundColor: string;
        };
    };
}

export type FrameV2Host = Omit<FrameHost, 'ethProviderRequestV2'>;
// #endregion

export type Frame = FrameV1 | FrameV2;
