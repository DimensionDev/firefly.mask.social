if (!URL.canParse) {
    console.info('[polyfill URL.canParse]: created');

    URL.canParse = (url: string) => {
        try {
            new URL(url);
            return true;
        } catch {
            return false;
        }
    };
}
