import {Position} from "@xyflow/react";

function calculateControlOffset(distance: number, curvature: number): number {
    if (distance >= 0) {
        return 0.5 * distance;
    }

    return curvature * 25 * Math.sqrt(-distance);
}

export function getControlWithCurvature(
    pos: Position,
    x1: number,
    y1: number,
    x2: number,
    y2: number,
    c: number,
    isSelf: boolean = false
): [number, number] {
    if (isSelf) {
        const radiusX = (x1 - x2) * 0.6;
        const radiusY = 100;

        return [x1 + radiusX, y1 - radiusY];
    }

    switch (pos) {
        case Position.Left:
            return [x1 - calculateControlOffset(x1 - x2, c), y1];
        case Position.Right:
            return [x1 + calculateControlOffset(x2 - x1, c), y1];
        case Position.Top:
            return [x1, y1 - calculateControlOffset(y1 - y2, c)];
        case Position.Bottom:
            return [x1, y1 + calculateControlOffset(y2 - y1, c)];
    }
}