import Image from 'next/image';
export default function Loading() {
    return (
        <div className="flex justify-center items-center min-h-[500px]">
            <Image src="/svg/loading.svg" className="animate-spin" width={24} height={24} alt="loading" />
        </div>
    );
}
