import type {ControlPointData} from "../../pages/editor/components/ControlPoint.tsx";
import type {XYPosition} from "@xyflow/react";

import {isControlPoint} from "./utils.ts";

export function getLinearPath(points: XYPosition[]) {
    if (points.length < 1) return "";
    let path = `M ${points[0].x} ${points[0].y}`;
    for (const item of points) path += ` L ${item.x} ${item.y}`;
    return path;
}

export function getLinearControlPoints(
    points: (ControlPointData | XYPosition)[]
) {
    const controlPoints = [] as ControlPointData[];

    for (let i = 0; i < points.length - 1; i++) {
        const p1 = points[i];
        const p2 = points[i + 1];

        if (isControlPoint(p1)) {
            controlPoints.push(p1);
        }

        controlPoints.push({
            prev: "id" in p1 ? p1.id : undefined,
            id: `spline-${window.crypto.randomUUID()}`,
            active: false,
            x: (p1.x + p2.x) / 2,
            y: (p1.y + p2.y) / 2
        });
    }

    return controlPoints;
}
