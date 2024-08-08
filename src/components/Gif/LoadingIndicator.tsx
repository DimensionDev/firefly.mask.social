import LoadingIcon from '@/assets/loading.svg';

export function LoadingIndicator() {
    return (
        <div className="absolute inset-0 flex h-full w-full items-center justify-center text-darkBottom dark:text-lightBottom">
            <LoadingIcon width={24} height={24} className="animate-spin" />
        </div>
    );
}
