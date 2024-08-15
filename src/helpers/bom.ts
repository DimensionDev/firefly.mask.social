export const bom = {
    get window() {
        return typeof window === 'undefined' ? null : window;
    },

    get document() {
        return this.window?.document ?? null;
    },

    get location() {
        return this.window?.location ?? null;
    },

    get navigator() {
        return this.window?.navigator ?? null;
    },

    get localStorage() {
        return this.window?.localStorage ?? null;
    },
};
