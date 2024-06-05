if (!URL.canParse) {
    URL.canParse = (url: string) => {
        try {
            new URL(url);
            return true;
        } catch {
            return false;
        }
    };
}
