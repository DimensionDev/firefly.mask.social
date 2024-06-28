import { fetchJSON } from '@/helpers/fetchJSON.js';
import type {
    ActionsSpecGetResponse,
    ActionsSpecPostRequestBody,
    ActionsSpecPostResponse,
    Parameter,
} from '@/providers/solana-blink/type.js';

export class Action {
    private readonly _actions: ActionComponent[];

    private constructor(
        private readonly _url: string,
        private readonly _data: ActionsSpecGetResponse,
    ) {
        // if no links present, fallback to original solana pay spec
        if (!_data.links?.actions) {
            this._actions = [new ActionComponent(this, _data.label, _url)];
            return;
        }

        const urlObj = new URL(_url);
        this._actions = _data.links.actions.map((action) => {
            const href = action.href.startsWith('http') ? action.href : urlObj.origin + action.href;

            return new ActionComponent(this, action.label, href, action.parameters);
        });
    }

    public get url() {
        return this._url;
    }

    public get icon() {
        return this._data.icon;
    }

    public get title() {
        return this._data.title;
    }

    public get description() {
        return this._data.description;
    }

    public get disabled() {
        return this._data.disabled ?? false;
    }

    public get actions() {
        return this._actions;
    }

    public get error() {
        return this._data.error?.message ?? null;
    }

    public resetActions() {
        this._actions.forEach((action) => action.reset());
    }

    static async fetch(apiUrl: string) {
        const data = await fetchJSON<ActionsSpecGetResponse>(apiUrl);
        return new Action(apiUrl, data);
    }
}

export class ActionComponent {
    private parameterValue: string = '';

    constructor(
        private _parent: Action,
        private _label: string,
        private _href: string,
        private _parameters?: [Parameter],
    ) {}

    public get href() {
        if (this.parameter) {
            return this._href.replace(`{${this.parameter.name}}`, this.parameterValue.trim());
        }

        return this._href;
    }

    public get parent() {
        return this._parent;
    }

    public get label() {
        return this._label;
    }

    // initial version uses only one parameter, so using the first one
    public get parameter() {
        const [param] = this._parameters ?? [];

        return param;
    }

    public reset() {
        this.parameterValue = '';
    }

    public setValue(value: string) {
        this.parameterValue = value;
    }

    public async post(account: string) {
        return fetchJSON<ActionsSpecPostResponse>(this.href, {
            method: 'POST',
            body: JSON.stringify({ account } as ActionsSpecPostRequestBody),
        });
    }
}
