import {ReactNode, useCallback, useContext, useEffect, useLayoutEffect, useRef, useState} from "react";
import {TBlock} from "../model/TBlock.ts";
import {
    applyEdgeChanges,
    applyNodeChanges,
    EdgeChange,
    EdgeTypes,
    NodeChange,
    NodeTypes,
    OnEdgesChange,
    OnNodesChange,
    useEdgesState,
    useNodesInitialized,
    useNodesState,
    useReactFlow
} from "@xyflow/react";
import {TWorkflow} from "../model/TWorkflow.ts";
import {convertWorkflow} from "../utils/storage/inboundConverter.ts";
import {ExecutionDetail} from "@webis/proof-config-manager-client";
import {TEdge} from "../model/TEdge.ts";
import {Provider} from "../types/provider.ts";
import {BlockEdge} from "../pages/editor/components/BlockEdge.tsx";
import {createBlockNode} from "../pages/monitoring/components/BlockNode.tsx";
import {MonitoringContext} from "./MonitoringContext.tsx";
import {IStatusUpdate} from "../hooks/useStatusWebSocket.ts";
import {usePersistedState} from "../hooks/usePersistedState.ts";
import {AppContext} from "./AppContext.tsx";
import {IAppContext} from "./AppProvider.tsx";

interface IProps {
    children: ReactNode;
}

export interface IMonitoringContext {
    nodeTypes: NodeTypes;
    edgeTypes: EdgeTypes;
    nodes: TBlock[];
    edges: TEdge[];
    execParameters: { [key: string]: string; };
    execStartValues: { [key: string]: string; };
    execDefaultValues: { [key: string]: string; };
    executionLabel: string | undefined;
    executionDescription: string | undefined;
    simulationStartPoint: string | undefined;
    simulationEndPoint: string | undefined;
    simulationDuration: string | undefined;
    onNodesChange: OnNodesChange<TBlock>;
    onEdgesChange: OnEdgesChange<TEdge>;
    updateExecution: (execution: ExecutionDetail) => void;
    addExecParameter: (key: string, value: string) => void;
    updateExecParameters: (execParameters: { [key: string]: string; }) => void
    removeKeyFromExecParameters: (keyToRemove: string) => void
    addExecStartValue: (key: string, value: string) => void;
    updateExecStartValues: (execStartValues: { [key: string]: string; }) => void
    removeKeyFromExecStartValues: (keyToRemove: string) => void
    addExecDefaultValue: (key: string, value: string) => void;
    updateExecDefaultValues: (execDefaultValues: { [key: string]: string; }) => void
    removeKeyFromExecDefaultValues: (keyToRemove: string) => void
    updateExecutionLabel: (label: string) => void;
    updateExecutionDescription: (description: string) => void;
    updateBlockStates: (blockStates: { blockId: string, status: string | undefined, cp?: number }[]) => void
    updateSimulationStartPoint: (startPoint: string) => void;
    updateSimulationEndPoint: (endPoint: string) => void;
    updateSimulationDuration: (duration: string) => void;
    missingRequiredFields: string[];
    updateMissingRequiredFields: (value: string[]) => void;
    blockStates: { blockId: string, status: string | undefined, cp?: number }[];
    resetEditor: () => void;
}

const nodeTypes: NodeTypes = {block: createBlockNode(true)};
const edgeTypes: EdgeTypes = {block: BlockEdge};

const MonitoringProvider: Provider<IProps> = ({children}: IProps): ReactNode => {

    const {fitView} = useReactFlow();
    const appContext: IAppContext = useContext(AppContext);
    const nodesInitialized: boolean = useNodesInitialized({includeHiddenNodes: false});
    const [isConnecting] = useState<boolean>(false);
    const wasConnectingRecently = useRef(false);
    const [execution, setExecution] = useState<ExecutionDetail | undefined>(undefined);
    const [execParameters, setExecParameters] = useState<{ [key: string]: string; }>({});
    const [execStartValues, setExecStartValues] = useState<{ [key: string]: string; }>({});
    const [execDefaultValues, setExecDefaultValues] = useState<{ [key: string]: string; }>({});
    const [executionLabel, setExecutionLabel] = useState<string>();
    const [executionDescription, setExecutionDescription] = useState<string>();
    const [nodes, setNodes] = useNodesState<TBlock>([]);
    const [edges, setEdges] = useEdgesState<TEdge>([]);
    const [missingRequiredFields, setMissingRequiredFields] = useState<string[]>([]);
    const [blockStates, setBlockStates] = usePersistedState<{ blockId: string, status: string | undefined, cp?: number }[]>([], "blockStates");
    const [simulationStartPoint, setSimulationStartPoint] = useState<string>();
    const [simulationEndPoint, setSimulationEndPoint] = useState<string>();
    const [simulationDuration, setSimulationDuration] = useState<string>();

    useEffect((): void => {
        Object.keys(execParameters).forEach((key: string): void => {
            if (missingRequiredFields.includes(key) && execParameters[key] !== "") {
                setMissingRequiredFields((prev: string[]): string[] =>
                    prev.filter((id: string): boolean => id !== key)
                );
            }
        });
    }, [execParameters, missingRequiredFields]);

    const updateExecution: (execution: ExecutionDetail) => void = useCallback((execution: ExecutionDetail): void => {
        setExecution(execution);
    }, []);

    const resetEditor = useCallback(() => {
        setExecution(undefined);
        setNodes([]);
        setEdges([]);
    }, [setEdges, setNodes]);

    const addExecParameter: (key: string, value: string) => void = useCallback((key: string, value: string): void => {
        setExecParameters((prevState: { [p: string]: string }): { [p: string]: string } => ({
            ...prevState,
            [key]: value
        }))
    }, []);

    const updateExecParameters: (execParameters: { [key: string]: string; }) => void = useCallback((execParameters: {
        [key: string]: string;
    }) => {
        setExecParameters(execParameters);
    }, [])

    const removeKeyFromExecParameters: (keyToRemove: string) => void = useCallback((keyToRemove: string): void => {
        setExecParameters((prev: { [p: string]: string }) => {
            const copy = {...prev};
            delete copy[keyToRemove];
            return copy;
        });
    }, []);

    const addExecStartValue: (key: string, value: string) => void = useCallback((key: string, value: string): void => {
        setExecStartValues((prevState: { [p: string]: string }): { [p: string]: string } => ({
            ...prevState,
            [key]: value
        }))
    }, []);

    const updateExecStartValues: (execStartValues: { [key: string]: string; }) => void = useCallback((execStartValues: {
        [key: string]: string;
    }) => {
        setExecStartValues(execStartValues);
    }, [])

    const removeKeyFromExecStartValues: (keyToRemove: string) => void = useCallback((keyToRemove: string): void => {
        setExecStartValues((prev: { [p: string]: string }) => {
            const copy = {...prev};
            delete copy[keyToRemove];
            return copy;
        });
    }, []);

    const addExecDefaultValue: (key: string, value: string) => void = useCallback((key: string, value: string): void => {
        setExecDefaultValues((prevState: { [p: string]: string }): { [p: string]: string } => ({
            ...prevState,
            [key]: value
        }))
    }, []);

    const updateExecDefaultValues: (execDefaultValues: { [key: string]: string; }) => void = useCallback((execDefaultValues: {
        [key: string]: string;
    }) => {
        setExecDefaultValues(execDefaultValues);
    }, [])

    const removeKeyFromExecDefaultValues: (keyToRemove: string) => void = useCallback((keyToRemove: string): void => {
        setExecDefaultValues((prev: { [p: string]: string }) => {
            const copy = {...prev};
            delete copy[keyToRemove];
            return copy;
        });
    }, []);

    const updateExecutionLabel: (executionLabel: string) => void = useCallback((label: string): void => {
        setExecutionLabel(label);
    }, [])

    const updateExecutionDescription: (executionDescription: string) => void = useCallback((description: string): void => {
        setExecutionDescription(description);
    }, []);

    const updateSimulationStartPoint: (startPoint: string) => void = useCallback((startPoint: string): void => {
        setSimulationStartPoint(startPoint);
    }, []);

    const updateSimulationEndPoint: (endPoint: string) => void = useCallback((endPoint: string): void => {
        setSimulationEndPoint(endPoint);
    }, []);

    const updateSimulationDuration: (duration: string) => void = useCallback((duration: string): void => {
        setSimulationDuration(duration);
    }, []);

    const updateMissingRequiredFields: (value: string[]) => void = useCallback((value: string[]): void => {
        setMissingRequiredFields(value);
    }, []);

    const updateBlockStates: (blockStates: { blockId: string, status: string | undefined, cp?: number }[]) => void = useCallback((blockStates: {
        blockId: string,
        status: string | undefined,
        cp?: number
    }[]): void => {
        setBlockStates(blockStates);
    }, [setBlockStates]);

    const onNodesChange: OnNodesChange<TBlock> = useCallback((changes: NodeChange<TBlock>[]): void => {
        setNodes((nodes: TBlock[]): any => applyNodeChanges(changes, nodes));
    }, [setNodes]);

    const onEdgesChange: OnEdgesChange<TEdge> = useCallback((changes: EdgeChange<TEdge>[]): void => {
        setEdges((edges: TEdge[]): TEdge[] => applyEdgeChanges(changes, edges));
    }, [setEdges]);

    useEffect((): void => {
        if (execution?.workflow && execution.workflow.blocks && execution.workflow.connections) {
            const {edges: convertedEdges, nodes: convertedNodes}: TWorkflow = convertWorkflow(execution.workflow);
            setNodes(convertedNodes);
            setEdges(convertedEdges);
        }
    }, [execution?.workflow, setEdges, setNodes]);

    useLayoutEffect((): void => {
        if (nodesInitialized) {
            requestAnimationFrame((): Promise<boolean> => fitView({duration: 50, includeHiddenNodes: true}));
        }
    }, [fitView, nodesInitialized]);

    useEffect(() => {
        if (!isConnecting) {
            wasConnectingRecently.current = true;
            requestAnimationFrame(() => {
                setTimeout(() => {
                    wasConnectingRecently.current = false;
                }, 100);
            });
        }
    }, [isConnecting]);

    const handleStatusUpdate = useCallback((update: IStatusUpdate): void => {
        setBlockStates((prev: { blockId: string, status: string | undefined, cp?: number }[]): { blockId: string, status: string | undefined, cp?: number }[] => {
            const existingIndex: number = prev.findIndex((blockState: {
                blockId: string,
                status: string | undefined,
                cp?: number
            }): boolean => blockState.blockId === update.blockId);
            if (existingIndex !== -1) {
                const copy = [...prev];
                copy[existingIndex] = {blockId: update.blockId, status: update.status, cp: update.cp};
                return copy;
            } else {
                return [...prev, {blockId: update.blockId, status: update.status, cp: update.cp}];
            }
        })
    }, [setBlockStates]);

    useEffect((): void => {
        appContext.registerStatusUpdateCallback(handleStatusUpdate);
    }, [appContext, handleStatusUpdate]);

    useEffect((): void => {
        appContext.updateCurrentExecutionId(execution?.id);
    }, [execution?.id, appContext]);

    return (
        <MonitoringContext.Provider
            value={{
                execParameters: execParameters,
                execStartValues: execStartValues,
                execDefaultValues: execDefaultValues,
                executionLabel: executionLabel,
                executionDescription: executionDescription,
                simulationStartPoint: simulationStartPoint,
                simulationEndPoint: simulationEndPoint,
                simulationDuration: simulationDuration,
                nodeTypes: nodeTypes,
                edgeTypes: edgeTypes,
                nodes: nodes,
                edges: edges,
                missingRequiredFields: missingRequiredFields,
                resetEditor: resetEditor,
                blockStates: blockStates,
                onNodesChange: onNodesChange,
                onEdgesChange: onEdgesChange,
                updateExecution: updateExecution,
                addExecParameter: addExecParameter,
                updateExecParameters: updateExecParameters,
                removeKeyFromExecParameters: removeKeyFromExecParameters,
                addExecStartValue: addExecStartValue,
                updateExecStartValues: updateExecStartValues,
                removeKeyFromExecStartValues: removeKeyFromExecStartValues,
                addExecDefaultValue: addExecDefaultValue,
                updateExecDefaultValues: updateExecDefaultValues,
                removeKeyFromExecDefaultValues: removeKeyFromExecDefaultValues,
                updateExecutionLabel: updateExecutionLabel,
                updateExecutionDescription: updateExecutionDescription,
                updateBlockStates: updateBlockStates,
                updateSimulationStartPoint: updateSimulationStartPoint,
                updateSimulationEndPoint: updateSimulationEndPoint,
                updateSimulationDuration: updateSimulationDuration,
                updateMissingRequiredFields: updateMissingRequiredFields
            }}
        >
            {children}
        </MonitoringContext.Provider>
    );

};

export default MonitoringProvider;