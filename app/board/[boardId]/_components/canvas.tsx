"use client";

import { nanoid } from "nanoid";
import { Info } from "./info";
import { Participants } from "./participants";
import { Toolbar } from "./toolbar";
import {
    useCanRedo,
    useCanUndo,
    useHistory,
    useSelf,
    useMutation,
    useStorage,
    useOthersMapped,
} from "@/liveblocks.config";
import { useCallback, useMemo, useState } from "react";
import {
    Camera,
    CanvasMode,
    CanvasState,
    Color,
    LayerType,
    Point,
} from "@/types/canvas";
import { CursorsPresence } from "./cursor-presence";
import { connectionIdToColor, poniterEventToCanvasPoint } from "@/lib/utils";
import { LiveObject } from "@liveblocks/client";
import { LayerPreview } from "./layer-preview";

const MAX_LAYERS = 100;

interface CanvasProps {
    boardId: string;
}

export const Canvas = ({ boardId }: CanvasProps) => {
    const layerIds = useStorage((root) => root.layerIds);
    const [canvasState, setCanvasState] = useState<CanvasState>({
        mode: CanvasMode.None,
    });
    const [camera, setCamera] = useState<Camera>({ x: 0, y: 0 });
    const [lastUsedColor, setLastUsedColor] = useState<Color>({
        r: 0,
        b: 0,
        g: 0,
    });

    const history = useHistory();
    const canUndo = useCanUndo();
    const canRedo = useCanRedo();

    const insertLayer = useMutation(
        (
            { storage, setMyPresence },
            layerType:
                | LayerType.Ellipse
                | LayerType.Note
                | LayerType.Rectangle
                | LayerType.Text,
            position: Point
        ) => {
            const liveLayers = storage.get("layers");

            if (liveLayers.size >= MAX_LAYERS) return;

            const liveLayerIds = storage.get("layerIds");
            const layerId = nanoid();

            const layer = new LiveObject({
                type: layerType,
                x: position.x,
                y: position.y,
                height: 100,
                width: 100,
                fill: lastUsedColor,
            });

            liveLayerIds.push(layerId);
            liveLayers.set(layerId, layer);

            setMyPresence({ selection: [layerId] }, { addToHistory: true });
            setCanvasState({ mode: CanvasMode.None });
        },
        [lastUsedColor]
    );

    const onWheel = useCallback((e: React.WheelEvent) => {
        setCamera((camera) => ({
            x: camera.x - e.deltaX,
            y: camera.y - e.deltaY,
        }));
    }, []);

    const onPointerMove = useMutation(
        ({ setMyPresence }, e: React.PointerEvent) => {
            e.preventDefault();

            const current = poniterEventToCanvasPoint(e, camera);

            setMyPresence({ cursor: current });
        },
        []
    );

    const onPointerLeave = useMutation(({ setMyPresence }) => {
        setMyPresence({ cursor: null });
    }, []);

    const onPointerUp = useMutation(
        ({}, e) => {
            const point = poniterEventToCanvasPoint(e, camera);

            if (canvasState.mode === CanvasMode.Inserting) {
                insertLayer(canvasState.layerType, point);
            } else {
                setCanvasState({
                    mode: CanvasMode.None,
                });
            }
            history.resume();
        },
        [camera, canvasState, history, insertLayer]
    );

    const selections = useOthersMapped((other) => other.presence.selection);
    console.log(selections, "SELECTIONS");

    const layerIdsToColorSelection = useMemo(() => {
        const layerIdsToColorSelection: Record<string, string> = {};

        for (const user of selections) {
            const [connectionid, selection] = user;

            for (const layerId of selection) {
                layerIdsToColorSelection[layerId] =
                    connectionIdToColor(connectionid);
            }
        }

        return layerIdsToColorSelection;
    }, [selections]);

    console.log(layerIdsToColorSelection, "OTHER SELECTIONS");

    return (
        <main className="h-full w-full relative bg-neutral-100 touch-none">
            <Info boardId={boardId} />
            <Participants />
            <Toolbar
                canvasState={canvasState}
                setCanvasState={setCanvasState}
                undo={history.undo}
                redo={history.redo}
                canRedo={canRedo}
                canUndo={canUndo}
            />
            <svg
                className="h-[100vh] w-[100vw]"
                onWheel={onWheel}
                onPointerMove={onPointerMove}
                onPointerLeave={onPointerLeave}
                onPointerUp={onPointerUp}
            >
                <g
                    style={{
                        transform: `translate(${camera.x}px, ${camera.y}px)`,
                    }}
                >
                    {layerIds.map((layerId) => (
                        <LayerPreview
                            key={layerId}
                            id={layerId}
                            onLayerPointerDown={() => {}}
                            selectionColor={layerIdsToColorSelection[layerId]}
                        />
                    ))}
                    <CursorsPresence />
                </g>
            </svg>
        </main>
    );
};
