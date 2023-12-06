import { createReactClient, studioProvider } from "@livepeer/react";

export const livepeerClient = createReactClient({
    provider: studioProvider({ apiKey: '' }),
});
