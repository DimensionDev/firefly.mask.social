import type { ActionGetResponse } from '@/providers/types/Blink.js';
import type { Response } from '@/providers/types/Firefly.js';

export type ActionType = 'trusted' | 'malicious' | 'unknown';

// Linked action inspired by HAL https://datatracker.ietf.org/doc/html/draft-kelly-json-hal-11
export interface LinkedAction {
    href: string; // solana pay/actions get/post url
    label: string; // button text
    // optional parameters for the action, e.g. input fields, inspired by OpenAPI
    // enforcing single parameter for now for simplicity and determenistic client UIs
    // can be extended to multiple inputs w/o breaking change by switching to Parameter[]
    // note: there are no use-cases for multiple parameters atm, e.g. farcaster frames also have just single input
    parameters?: [ActionParameter];
}

export interface ActionParameter {
    name: string; // parameter name in url
    label?: string; // input placeholder
    required?: boolean; // input required
}

// A common error data structure that should be used in all responses for error indication,
// can be used in both GET and POST and extended with additional fields if needed
export interface ActionError {
    message: string;
}

export interface Action {
    url: string;
    icon: string;
    title: string;
    description: string;
    disabled: boolean;
    actions: ActionComponent[];
    error?: ActionError;
    websiteUrl: string;
    state: ActionType;
}

export interface ActionComponent {
    label: string;
    href: string;
    parameters: ActionParameter[];
    parameter?: ActionParameter;
}

export type FireflyBlinkParserBlinkResponse = Response<{
    action: ActionGetResponse;
    actionApiUrl: string;
    actionUrl: string;
    state: ActionType;
} | null>;
