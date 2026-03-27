import {useCallback, useEffect, useState} from "react";
import {Edge, Node, useReactFlow} from "@xyflow/react";

export interface UseHistoryOptions {
    maxHistorySize: number;
    enableShortcuts: boolean;
}

export interface HistoryItem {
    nodes: Node[];
    edges: Edge[];
}

const defaultOptions: UseHistoryOptions = {
    maxHistorySize: 100,
    enableShortcuts: true
};

export type UseHistory = (options?: UseHistoryOptions) => {
    undo: () => void;
    redo: () => void;
    takeSnapshot: () => void;
    canUndo: boolean;
    canRedo: boolean;
    edited: boolean;
    resetHistory: () => void;
};


export const useHistory: UseHistory = ({
                                           maxHistorySize = defaultOptions.maxHistorySize,
                                           enableShortcuts = defaultOptions.enableShortcuts
                                       }: UseHistoryOptions = defaultOptions) => {

    const [past, setPast] = useState<HistoryItem[]>([]);
    const [future, setFuture] = useState<HistoryItem[]>([]);
    const {setNodes, setEdges, getNodes, getEdges} = useReactFlow();
    const [edited, setEdited] = useState<boolean>(false);

    const reset = useCallback(() => {
        setPast([]);
        setFuture([]);
        setEdited(false);
    }, []);

    const takeSnapshot = useCallback(() => {
        setEdited(true);
        setPast((past) => [
            ...past.slice(past.length - maxHistorySize + 1, past.length),
            {nodes: getNodes(), edges: getEdges()}
        ]);
        setFuture([]);
    }, [getNodes, getEdges, maxHistorySize]);

    const undo = useCallback(() => {
        const pastState = past[past.length - 1];

        if (pastState) {
            setPast((past) => past.slice(0, past.length - 1));
            setFuture((future) => [
                ...future,
                {nodes: getNodes(), edges: getEdges()}
            ]);
            setNodes(pastState.nodes);
            setEdges(pastState.edges);
        }
    }, [setNodes, setEdges, getNodes, getEdges, past]);

    const redo = useCallback(() => {
        const futureState = future[future.length - 1];

        if (futureState) {
            setFuture((future) => future.slice(0, future.length - 1));
            setPast((past) => [...past, {nodes: getNodes(), edges: getEdges()}]);
            setNodes(futureState.nodes);
            setEdges(futureState.edges);
        }
    }, [setNodes, setEdges, getNodes, getEdges, future]);

    useEffect(() => {
        if (!enableShortcuts) {
            return;
        }

        const keyDownHandler = (event: KeyboardEvent) => {
            if (
                event.key === "z" &&
                (event.ctrlKey || event.metaKey) &&
                event.shiftKey
            ) {
                redo();
            } else if (event.key === "z" && (event.ctrlKey || event.metaKey)) {
                undo();
            }
        };

        document.addEventListener("keydown", keyDownHandler);

        return () => {
            document.removeEventListener("keydown", keyDownHandler);
        };
    }, [undo, redo, enableShortcuts]);

    return {
        undo,
        redo,
        takeSnapshot,
        canUndo: !past.length,
        canRedo: !future.length,
        edited,
        resetHistory: reset
    };

};

export default useHistory;