/* cspell:disable */

import type { ActionError, ActionType, LinkedAction } from '@/types/blink.js';

export interface ActionGetResponse {
    icon: string; // image
    label: string; // button text
    title: string;
    description: string;
    disabled?: boolean; // allows to model invalid state of the action e.g. nft sold out
    links?: {
        // linked actions inspired by HAL https://datatracker.ietf.org/doc/html/draft-kelly-json-hal-11
        actions: LinkedAction[];
    };
    // optional error indication for non-fatal errors, if present client should display it to the user
    // doesn't prevent client from interpreting the action or displaying it to the user
    // e.g. can be used together with 'disabled' to display the reason: business constraints, authorization
    error?: ActionError;
}

export interface ActionPostResponse {
    transaction: string; // base64-encoded serialized transaction
    message?: string; // the nature of the transaction response e.g. the name of an item being purchased
    redirect?: string; // redirect URL after the transaction is successful
}

interface RegisteredAction {
    host: string;
    state: ActionType;
}

export interface ActionsRegistryResponse {
    actions: RegisteredAction[];
}
