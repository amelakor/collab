import React from "react";

export const Toolbar = () => {
    return (
        <div className="absolute top-[50%] -translate-y-[50%] left-2 flex flex-col gap-y-4">
            <div className="bg-white rounded-md p-1.5 flex gap-y-1 flex-col items-center shadow-md">
                Tollbar - Pencil...
            </div>
            <div className="bg-white rounded-md p-1.5 flex flex-col items-center shadow-md">
                Undo/redo
            </div>
        </div>
    );
};
