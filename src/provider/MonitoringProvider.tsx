import {ReactNode, useCallback, useEffect, useLayoutEffect, useRef, useState} from "react";
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
import {ExecutionDetail, ExecutionPagingModelListing, WorkflowDetail} from "@webis/proof-config-manager-client";
import {TEdge} from "../model/TEdge.ts";
import {UseMutationResult} from "@tanstack/react-query";
import {GridFilterModel, GridPaginationModel, GridSortModel} from "@mui/x-data-grid";
import {DEFAULT_FILTER, DEFAULT_PAGINATION, DEFAULT_MONITORING_SORTING} from "../utils/constants.ts";
import {Provider} from "../types/provider.ts";
import {useWorkflows} from "../hooks/storage/useWorkflows.ts";
import {useExecutions} from "../hooks/storage/useExecutions.ts";
import {BlockEdge} from "../pages/editor/components/BlockEdge.tsx";
import BlockNode from "../pages/monitoring/components/BlockNode.tsx";
import {MonitoringContext} from "./IMonitoringContext.tsx";
import {AxiosError} from "axios";
import {useWebSocket} from "../hooks/useWebSocket.ts";

interface IProps {
    children: ReactNode;
}

export interface IMonitoringContext {
    nodeTypes: NodeTypes;
    edgeTypes: EdgeTypes;
    nodes: TBlock[];
    edges: TEdge[];
    workflow: WorkflowDetail | undefined;
    workflows: WorkflowDetail[] | undefined;
    executions: ExecutionDetail[] | undefined;
    filteredExecutions: ExecutionPagingModelListing | undefined;
    execution: ExecutionDetail | undefined;
    appliedInputs: { [key: string]: string; };
    executionLabel: string | undefined;
    executionDescription: string | undefined;
    onNodesChange: OnNodesChange<TBlock>;
    onEdgesChange: OnEdgesChange<TEdge>;
    updateExecutionId: (executionId: (string | undefined)) => void;
    updateWorkflowId: (workflowId: (string | undefined)) => void;
    addAppliedInput: (key: string, value: string) => void;
    updateAppliedInputs: (appliedInputs: { [key: string]: string; }) => void
    removeKeyFromAppliedInputs: (keyToRemove: string) => void
    updateExecutionLabel: (label: string) => void;
    updateExecutionDescription: (description: string) => void;
    sortModel: GridSortModel;
    filterModel: GridFilterModel;
    paginationModel: GridPaginationModel;
    onFilterModelChange: (filterModel: GridFilterModel) => void;
    onSortModelChange: (sortModel: GridSortModel) => void;
    onPaginationModelChange: (paginationModel: GridPaginationModel) => void;
    executionsMutation: UseMutationResult<ExecutionDetail, any, ExecutionDetail, void>;
    deleteExecutionMutation: UseMutationResult<boolean, AxiosError, string, void>
    executionRequest: any;
    jsonError: { [key: string]: string | undefined; };
    updateJsonError: (key: string, value: string | undefined) => void;
    missingRequiredFields: string[];
    updateMissingRequiredFields: (value: string[]) => void;
}

const nodeTypes: NodeTypes = {block: BlockNode};
const edgeTypes: EdgeTypes = {block: BlockEdge};

const MonitoringProvider: Provider<IProps> = ({children}: IProps): ReactNode => {

    const {fitView} = useReactFlow();
    const nodesInitialized: boolean = useNodesInitialized({includeHiddenNodes: false});
    const [workflowId, setWorkflowId] = useState<string>();
    const [isConnecting] = useState<boolean>(false);
    const wasConnectingRecently = useRef(false);
    const [executionId, setExecutionId] = useState<string>();
    const [appliedInputs, setAppliedInputs] = useState<{ [key: string]: string; }>({});
    const [executionLabel, setExecutionLabel] = useState<string>();
    const [executionDescription, setExecutionDescription] = useState<string>();
    const [nodes, setNodes] = useNodesState<TBlock>([]);
    const [edges, setEdges] = useEdgesState<TEdge>([]);
    const [executionRequest, setExecutionRequest] = useState<any>();
    const [executionSortModel, setExecutionSortModel] = useState<GridSortModel>(DEFAULT_MONITORING_SORTING);
    const [executionFilterModel, setExecutionFilterModel] = useState<GridFilterModel>(DEFAULT_FILTER);
    const [executionPaginationModel, setExecutionPaginationModel] = useState<GridPaginationModel>(DEFAULT_PAGINATION);
    const [jsonError, setJsonError] = useState<{ [key: string]: string | undefined; }>({});
    const [missingRequiredFields, setMissingRequiredFields] = useState<string[]>([]);

    const [workflows, , workflow] = useWorkflows({
        workflowId: workflowId,
        filter: false
    });

    const [executions, filteredExecutions, execution, executionMutation, deleteExecutionMutation] = useExecutions({
        executionId: executionId,
        request: executionRequest,
        filter: true
    });

    useEffect((): void => {
        setExecutionRequest({
            sort: executionSortModel,
            filter: executionFilterModel,
            pagination: executionPaginationModel
        });
    }, [executionFilterModel, executionPaginationModel, executionSortModel]);

    useEffect((): void => {
        Object.keys(appliedInputs).forEach((key: string): void => {
            if (missingRequiredFields.includes(key) && appliedInputs[key] !== "") {
                setMissingRequiredFields((prev: string[]): string[] =>
                    prev.filter((id: string): boolean => id !== key)
                );
            }
        });
    }, [appliedInputs, missingRequiredFields]);

    const updateWorkflowId: (workflowId: (string | undefined)) => void = useCallback((workflowId: string | undefined): void => {
        setWorkflowId(workflowId);
    }, []);

    const updateExecutionId: (executionId: (string | undefined)) => void = useCallback((executionId: string | undefined): void => {
        setNodes([]);
        setEdges([]);
        setExecutionId(executionId);
    }, [setEdges, setNodes]);

    const addAppliedInput: (key: string, value: string) => void = useCallback((key: string, value: string): void => {
        setAppliedInputs((prevState: { [p: string]: string }): { [p: string]: string } => ({
            ...prevState,
            [key]: value
        }))
    }, []);

    const updateAppliedInputs: (appliedInputs: { [key: string]: string; }) => void = useCallback((appliedInputs: {
        [key: string]: string;
    }) => {
        setAppliedInputs(appliedInputs);
    }, [])

    const removeKeyFromAppliedInputs: (keyToRemove: string) => void = useCallback((keyToRemove: string): void => {
        setAppliedInputs((prev: { [p: string]: string }) => {
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
    }, [])

    const updateJsonError: (key: string, value: string | undefined) => void = useCallback((key: string, value: string | undefined): void => {
        setJsonError((prevState: { [p: string]: string | undefined }): { [p: string]: string | undefined } => ({
            ...prevState,
            [key]: value
        }))
    }, []);

    const updateMissingRequiredFields: (value: string[]) => void = useCallback((value: string[]): void => {
        setMissingRequiredFields(value);
    }, []);

    const onNodesChange: OnNodesChange<TBlock> = useCallback((changes: NodeChange<TBlock>[]): void => {
        setNodes((nodes: TBlock[]): any => applyNodeChanges(changes, nodes));
    }, [setNodes]);

    const onEdgesChange: OnEdgesChange<TEdge> = useCallback((changes: EdgeChange<TEdge>[]): void => {
        setEdges((edges: TEdge[]): TEdge[] => applyEdgeChanges(changes, edges));
    }, [setEdges]);

    const onFilterModelChange: (filterModel: GridFilterModel) => void = useCallback((filterModel: GridFilterModel): void => {
        setExecutionFilterModel(filterModel);
    }, []);

    const onSortModelChange: (sortModel: GridSortModel) => void = useCallback((sortModel: GridSortModel): void => {
        setExecutionSortModel(sortModel);
    }, []);

    const onPaginationModelChange: (paginationModel: GridPaginationModel) => void = useCallback((paginationModel: GridPaginationModel): void => {
        setExecutionPaginationModel(paginationModel);
    }, []);

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

    useWebSocket({});

    return (
        <MonitoringContext.Provider
            value={{
                workflow: workflow,
                workflows: workflows,
                executions: executions,
                filteredExecutions: filteredExecutions,
                execution: execution,
                appliedInputs: appliedInputs,
                executionLabel: executionLabel,
                executionDescription: executionDescription,
                nodeTypes: nodeTypes,
                edgeTypes: edgeTypes,
                nodes: nodes,
                edges: edges,
                onNodesChange: onNodesChange,
                onEdgesChange: onEdgesChange,
                updateExecutionId: updateExecutionId,
                updateWorkflowId: updateWorkflowId,
                addAppliedInput: addAppliedInput,
                updateAppliedInputs: updateAppliedInputs,
                removeKeyFromAppliedInputs: removeKeyFromAppliedInputs,
                updateExecutionLabel: updateExecutionLabel,
                updateExecutionDescription: updateExecutionDescription,
                executionsMutation: executionMutation,
                deleteExecutionMutation: deleteExecutionMutation,
                sortModel: executionSortModel,
                paginationModel: executionPaginationModel,
                filterModel: executionFilterModel,
                onFilterModelChange: onFilterModelChange,
                onPaginationModelChange: onPaginationModelChange,
                onSortModelChange: onSortModelChange,
                executionRequest: executionRequest,
                jsonError: jsonError,
                updateJsonError: updateJsonError,
                missingRequiredFields,
                updateMissingRequiredFields: updateMissingRequiredFields
            }}
        >
            {children}
        </MonitoringContext.Provider>
    );

};

export default MonitoringProvider;