import TextareaAutosize from 'react-textarea-autosize';

interface ComposeContentProps {
    setCharacters: (characters: number) => void;
}
export default function ComposeContent({ setCharacters }: ComposeContentProps) {
    return (
        <div className=" p-4">
            <div className=" p-[14px] rounded-lg border border-[rgb(231,231,231)] bg-[#F9F9F9]">
                <TextareaAutosize
                    className=" bg-transparent text-base w-full flex-1 resize-none border-none outline-0 appearance-none p-0 focus:ring-0"
                    minRows={13}
                    maxRows={13}
                    placeholder="What's happening..."
                    onChange={(e) => setCharacters(e.target.value.length)}
                />
            </div>
        </div>
    );
}
