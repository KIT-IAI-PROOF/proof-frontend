import {TBlock} from "../../model/TBlock.ts";
import {Position} from "@xyflow/react";
import dagre from "@dagrejs/dagre";
import {TEdge} from "../../model/TEdge.ts";

const dagreGraph = new dagre.graphlib.Graph().setDefaultEdgeLabel((): any => ({}));

export const getDagreLayoutedElements = (nodes: TBlock[], edges: TEdge[]): TBlock[] => {
    dagreGraph.setGraph({rankdir: "LR"});
    nodes.forEach((node: TBlock): any => dagreGraph.setNode(node.id, {
        width: node.width ?? 50,
        height: node.height ?? 50
    }));
    edges.forEach((edge: TEdge): any => {
        return dagreGraph.setEdge(edge.source, edge.target);
    });
    dagre.layout(dagreGraph);
    return nodes.map((node: TBlock): TBlock => {
        const nodeWithPosition = dagreGraph.node(node.id);
        return {
            ...node,
            targetPosition: Position.Left,
            sourcePosition: Position.Right,
            position: {
                x: nodeWithPosition.x - (node.width ?? 150) / 2,
                y: nodeWithPosition.y - (node.height ?? 50) / 2
            }
        };
    });
};