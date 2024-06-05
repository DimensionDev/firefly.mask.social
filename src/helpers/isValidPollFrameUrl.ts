import { FRAME_SERVER_URL } from "@/constants/index.js";

export const isValidPollFrameUrl = (url: string): boolean => {
    return url.startsWith(FRAME_SERVER_URL);
};
