import {TBlock} from "./TBlock.ts";
import {TEdge} from "./TEdge.ts";

export interface TWorkflow {
    nodes: TBlock[];
    edges: TEdge[];
}