import {Fragment, ReactNode, useCallback, useContext, useRef} from "react";
import {BaseEdge, BuiltInNode, type Edge, type EdgeProps, useReactFlow, useStore, type XYPosition} from "@xyflow/react";

import {ControlPoint, type ControlPointData} from "./ControlPoint.tsx";
import {TEdge} from "../../../model/TEdge.ts";
import {getControlPoints, getPath} from "../../../utils/layout/utils.ts";
import {useTheme} from "@mui/material";
import {getTypeColor} from "../../../utils/palette.ts";
import {EAlgorithm} from "../../../model/EAlgorithm.ts";
import {IAppContext} from "../../../provider/AppProvider.tsx";
import {AppContext} from "../../../provider/AppContext.tsx";
import {IEditorContext} from "../../../provider/EditorProvider.tsx";
import {EditorContext} from "../../../provider/IEditorContext.tsx";

const useIdsForInactiveControlPoints = (points: ControlPointData[]) => {

    const ids = useRef<string[]>([]);

    if (ids.current.length === points.length) {
        return points.map((point, i) => point.id ? point : (
            {...point, id: ids.current[i]}));
    } else {
        ids.current = [];

        return points.map((point, i) => {
            if (!point.id) {
                const id = window.crypto.randomUUID();
                ids.current[i] = id;
                return {...point, id: id};
            } else {
                ids.current[i] = point.id;
                return point;
            }
        });
    }
};

export const BlockEdge = ({
                              id,
                              selected,
                              source,
                              sourceX,
                              sourceY,
                              sourcePosition,
                              target,
                              targetX,
                              targetY,
                              targetPosition,
                              markerEnd,
                              markerStart,
                              style,
                              data = {
                                  points: [],
                                  algorithm: EAlgorithm.BezierCatmullRom
                              },

                              ...delegated
                          }: EdgeProps<TEdge>): ReactNode => {

    const theme = useTheme();
    const {palette, hasUnsavedChanges, updateHasUnsavedChanges} = useContext<IAppContext>(AppContext);
    const {takeSnapshot} = useContext<IEditorContext>(EditorContext);
    const {setEdges} = useReactFlow<BuiltInNode, TEdge>();
    const selfNode = source === target;

    const sourceOrigin = {x: sourceX, y: sourceY} as XYPosition;
    const targetOrigin = {x: targetX, y: targetY} as XYPosition;

    const shouldShowPoints = useStore((store) => {
        const sourceNode = store.nodeLookup.get(source)!;
        const targetNode = store.nodeLookup.get(target)!;

        return (selected ?? sourceNode.selected) ?? targetNode.selected;
    });
    const setControlPoints = useCallback((update: (points: ControlPointData[]) => ControlPointData[]): void => {
        setEdges((edges: TEdge[]): TEdge[] =>
            edges.map((e: TEdge): TEdge => {
                if (e.id !== id) return e;
                if (!isEditableEdge(e)) return e;
                const points = e.data?.points ?? [];
                const data = {...e.data, points: update(points)};
                return {...e, data};
            })
        );
    }, [id, setEdges]);
    const pathPoints = [sourceOrigin, ...data.points, targetOrigin];
    const controlPoints = getControlPoints(pathPoints, EAlgorithm.BezierCatmullRom, {
        fromSide: sourcePosition,
        toSide: targetPosition
    }, selfNode);
    const path = getPath(pathPoints, EAlgorithm.BezierCatmullRom, {
        fromSide: sourcePosition,
        toSide: targetPosition,
    }, selfNode);

    const controlPointsWithIds = useIdsForInactiveControlPoints(controlPoints);

    const handleDragStart = () => {
        if (!hasUnsavedChanges) updateHasUnsavedChanges(true);
        takeSnapshot();
    }

    return (
        <Fragment>
            <BaseEdge
                id={id}
                path={path}
                {...delegated}
                markerStart={markerStart}
                markerEnd={markerEnd}
                style={{
                    ...style,
                    strokeWidth: 1.5,
                    stroke: getTypeColor(data?.connectionType, palette)
                }}
            />
            {
                shouldShowPoints && controlPointsWithIds.map((point, index) => (
                    <ControlPoint
                        key={point.id}
                        index={index}
                        setControlPoints={setControlPoints}
                        onDragStart={handleDragStart}
                        color={theme.palette.primary.main}
                        {...point}
                    />
                ))}
        </Fragment>
    );
};

const isEditableEdge = (edge: Edge): edge is TEdge => edge.type === "block";
