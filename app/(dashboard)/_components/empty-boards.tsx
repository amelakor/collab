"use client";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import Image from "next/image";

import { api } from "@/convex/_generated/api";
import { useOrganization } from "@clerk/nextjs";
import { useApiMutation } from "@/hooks/use-api-mutation";

export const EmptyBoards = () => {
    const { organization } = useOrganization();
    const { mutate, pending } = useApiMutation(api.board.create);

    const onClick = () => {
        if (!organization) return;
        mutate({
            orgId: organization.id,
            title: "Untitled",
        })
            .then((id) => {
                toast.success("Board has been created.");
            })
            .catch(() => toast.error("Failed to create board"));
    };
    return (
        <div className="h-full flex flex-col items-center justify-center">
            <Image src="/note.svg" alt="empty" height={110} width={110} />
            <h2 className="text-2xl font-semibold mt-6">
                Create yout first board
            </h2>
            <div className="mt-6">
                <Button disabled={pending} size="lg" onClick={onClick}>
                    Create board
                </Button>
            </div>
        </div>
    );
};
