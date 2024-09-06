const getCurrentFrame = (file: File, currentTime: number): Promise<Blob | null> => {
    return new Promise((resolve) => {
        const video = document.createElement('video');
        const canvas = document.createElement('canvas');
        video.autoplay = true;
        video.muted = true;
        video.src = URL.createObjectURL(file);
        video.onloadedmetadata = () => {
            video.currentTime = currentTime;
        };

        video.oncanplay = () => {
            setTimeout(() => {
                const ctx = canvas.getContext('2d');
                canvas.width = video.videoWidth;
                canvas.height = video.videoHeight;
                ctx?.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);
                canvas.toBlob(resolve);
            }, 100);
        };

        video.onerror = () => {
            resolve(null);
        };

        video.onabort = () => {
            resolve(null);
        };
    });
};

export const generateVideoCover = (file: File, count: number): Promise<Blob[]> => {
    return new Promise((resolve) => {
        try {
            if (!file.size) {
                return resolve([]);
            }

            const video = document.createElement('video');
            video.autoplay = true;
            video.muted = true;
            video.src = URL.createObjectURL(file);

            video.onloadeddata = async () => {
                const covers: Blob[] = [];
                const averageSplitTime = Math.floor(video.duration / count);
                for (let i = 0; i < count; i += 1) {
                    const currentTime = averageSplitTime * i;
                    const currentCover = await getCurrentFrame(file, currentTime);
                    if (currentCover) {
                        covers.push(currentCover);
                    }
                }
                resolve(covers);
            };
        } catch {
            resolve([]);
        }
    });
};
