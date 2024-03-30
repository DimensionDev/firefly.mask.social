'use client';

import { useEffect } from "react";

import { isEmptyPost } from "@/helpers/isEmptyPost.js";
import { useComposeStateStore } from "@/store/useComposeStore.js";

export function BeforeUnload() {
    const { posts } = useComposeStateStore()

    useEffect(() => {
        const handleBeforeUnload = (event: BeforeUnloadEvent) => {
            if (posts.some(x => isEmptyPost(x))) {
                event.preventDefault();
                event.returnValue = true;
            }
        }

        window.addEventListener('beforeunload', handleBeforeUnload);

        return () => {
            window.removeEventListener('beforeunload', handleBeforeUnload);
        }
    }, [posts])

    return null
}
