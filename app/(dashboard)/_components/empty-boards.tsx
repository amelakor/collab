import { Button } from "@/components/ui/button";
import Image from "next/image";

export const EmptyBoards = () => {
    return (
        <div className="h-full flex flex-col items-center justify-center">
            <Image src="/note.svg" alt="empty" height={110} width={110} />
            <h2 className="text-2xl font-semibold mt-6">
                Create yout first board
            </h2>
            <div className="mt-6">
                <Button size="lg">Create board</Button>
            </div>
        </div>
    );
};
