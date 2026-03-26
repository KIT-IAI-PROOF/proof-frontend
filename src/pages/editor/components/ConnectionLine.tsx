import {useContext, useEffect, useState} from "react";
import {type ConnectionLineComponentProps, XYPosition} from "@xyflow/react";

import {DEFAULT_ALGORITHM} from "../../../utils/constants.ts";

import {getPath} from "../../../utils/layout/utils.ts";
import {Theme, useTheme} from "@mui/material";
import {IEditorContext} from "../../../provider/EditorProvider.tsx";
import {EAlgorithm} from "../../../model/EAlgorithm.ts";
import {EditorContext} from "../../../provider/IEditorContext.tsx";

const DISTANCE: number = DEFAULT_ALGORITHM === EAlgorithm.BezierCatmullRom ? 50 : 25;

export const ConnectionLine = ({
                                   fromX,
                                   fromY,
                                   toX,
                                   toY,
                                   fromPosition,
                                   toPosition,
                                   connectionStatus
                               }: ConnectionLineComponentProps) => {

    const theme: Theme = useTheme();
    const {connectionLinePath, updateConnectionLinePath} = useContext<IEditorContext>(EditorContext);
    const [freeDrawing, setFreeDrawing] = useState(false);

    const prev: XYPosition = connectionLinePath[connectionLinePath.length - 1] ?? {
        x: fromX,
        y: fromY
    };
    const distance: number = Math.hypot(prev.x - toX, prev.y - toY);
    const shouldAddPoint: boolean = freeDrawing && distance > DISTANCE;

    useEffect((): void => {
        if (shouldAddPoint) {
            updateConnectionLinePath([...connectionLinePath, {x: toX, y: toY}]);
        }
    }, [connectionLinePath, updateConnectionLinePath, shouldAddPoint, toX, toY]);

    useEffect((): () => void => {
        const onKeyDown = (e: KeyboardEvent): void => {
            if (e.key === " ") {
                setFreeDrawing(true);
            }
        };

        const onKeyUp = (e: KeyboardEvent): void => {
            if (e.key === " ") {
                setFreeDrawing(false);
            }
        };

        updateConnectionLinePath([]);
        window.addEventListener("keydown", onKeyDown);
        window.addEventListener("keyup", onKeyUp);

        return () => {
            window.removeEventListener("keydown", onKeyDown);
            window.removeEventListener("keyup", onKeyUp);
            setFreeDrawing(false);
        };
    }, [updateConnectionLinePath]);

    const path = getPath(
        [{x: fromX, y: fromY}, ...connectionLinePath, {x: toX, y: toY}],
        DEFAULT_ALGORITHM,
        {fromSide: fromPosition, toSide: toPosition},
        false
    );

    return (
        <g>
            <path
                fill="none"
                stroke={theme.palette.primary.main}
                strokeWidth={2}
                className={connectionStatus === "valid" ? "" : "animated"}
                d={path}
                markerWidth={25}
            />
        </g>
    );
};
