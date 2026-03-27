import {Position, XYPosition} from "@xyflow/react";

import type {ControlPointData} from "../../pages/editor/components/ControlPoint.tsx";
import {getLinearControlPoints, getLinearPath} from "./linear.ts";
import {getCatmullRomControlPoints, getCatmullRomPath} from "./catmull-rom.ts";
import {EAlgorithm} from "../../model/EAlgorithm.ts";

export const isControlPoint = (
    point: ControlPointData | XYPosition
): point is ControlPointData => "id" in point;

export function getControlPoints(
    points: (ControlPointData | XYPosition)[],
    algorithm: EAlgorithm = EAlgorithm.BezierCatmullRom,
    sides = {fromSide: Position.Left, toSide: Position.Right},
    isSelf: boolean
) {
    switch (algorithm) {
        case EAlgorithm.Linear:
            return getLinearControlPoints(points);

        case EAlgorithm.CatmullRom:
            return getCatmullRomControlPoints(points, false, isSelf);

        case EAlgorithm.BezierCatmullRom:
            return getCatmullRomControlPoints(points, true, isSelf, sides);
    }
}

export function getPath(
    points: XYPosition[],
    algorithm: EAlgorithm = EAlgorithm.BezierCatmullRom,
    sides = {fromSide: Position.Left, toSide: Position.Right},
    isSelf: boolean
) {
    switch (algorithm) {
        case EAlgorithm.Linear:
            return getLinearPath(points);
        case EAlgorithm.CatmullRom:
            return getCatmullRomPath(points, false, isSelf);
        case EAlgorithm.BezierCatmullRom:
            return getCatmullRomPath(points, true, isSelf, sides);
    }
}