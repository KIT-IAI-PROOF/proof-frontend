import {
    DragEvent,
    DragEventHandler,
    MutableRefObject,
    ReactNode,
    useCallback,
    useContext,
    useEffect,
    useLayoutEffect,
    useRef,
    useState
} from "react";
import {isEqual} from "lodash";
import {TBlock} from "../model/TBlock.ts";
import {
    addEdge,
    applyEdgeChanges,
    applyNodeChanges,
    Connection,
    EdgeChange,
    EdgeTypes,
    IsValidConnection,
    NodeChange,
    NodeTypes,
    OnConnect,
    OnEdgesChange,
    OnEdgesDelete,
    OnNodeDrag,
    OnNodesChange,
    OnNodesDelete,
    SelectionDragHandler,
    useEdgesState,
    useNodesInitialized,
    useNodesState,
    useReactFlow,
    XYPosition
} from "@xyflow/react";
import BlockNode from "../pages/editor/components/BlockNode.tsx";
import {
    BlockDetail,
    InputDetail,
    OutputDetail,
    TemplateDetail,
    WorkflowDetail
} from "@kit-iai-proof/proof-config-manager-client";
import {convertWorkflow, getNextAvailableIndex, makeEdge, makeNode} from "../utils/storage/inboundConverter.ts";
import {TWorkflow} from "../model/TWorkflow.ts";
import useHistory from "../hooks/useHistory.ts";
import {getHelperLines} from "../utils/lines.ts";
import {getDagreLayoutedElements} from "../utils/layout/layout.ts";
import {TEdge} from "../model/TEdge.ts";
import {BlockEdge} from "../pages/editor/components/BlockEdge.tsx";
import {UseMutationResult} from "@tanstack/react-query";
import {Provider} from "../types/provider.ts";
import {UseWorkflows, useWorkflows} from "../hooks/storage/useWorkflows.ts";
import {UseTemplates, useTemplates} from "../hooks/storage/useTemplates.ts";
import {useWebSocket} from "../hooks/useWebSocket.ts";
import {EditorContext} from "./IEditorContext.tsx";
import {AppContext} from "./AppContext.tsx";
import {IAppContext} from "./AppProvider.tsx";
import {HandleSchema, HandleType} from "../types/handle.ts";
import {useBlocks} from "../hooks/storage/useBlocks.ts";
import {convertRemoteBlocks, convertRemoteEdges} from "../utils/storage/outboundConverter.ts";
import {useTranslation} from "react-i18next";

interface IProps {
    children: ReactNode;
}

export interface IEditorContext {
    nodes: TBlock[];
    edges: TEdge[];
    onNodesChange: OnNodesChange<TBlock>;
    onEdgesChange: OnEdgesChange<any>;
    isValidConnection: IsValidConnection;
    onConnect: OnConnect;
    onNodeDragStart: OnNodeDrag;
    onSelectionDragStart: SelectionDragHandler;
    onNodesDelete: OnNodesDelete;
    onEdgesDelete: OnEdgesDelete;
    nodeTypes: NodeTypes;
    edgeTypes: EdgeTypes;
    workflows: WorkflowDetail[] | undefined;
    outdatedBlocks: BlockDetail[];
    changedBlocks: BlockDetail[];
    differingParameters: string | undefined;
    template: TemplateDetail | undefined;
    templates: TemplateDetail[] | undefined;
    workflow: WorkflowDetail | undefined;
    helperLineHorizontal: number | undefined;
    helperLineVertical: number | undefined;
    undo: () => void;
    redo: () => void;
    canUndo: boolean;
    canRedo: boolean;
    layout: () => void;
    onDrop: DragEventHandler<HTMLDivElement>;
    edited: boolean;
    takeSnapshot: () => void;
    updateTemplateId: (templateId: string | undefined) => void;
    updateWorkflowId: (workflowId: string | undefined) => void;
    connectionLinePath: XYPosition[];
    updateConnectionLinePath: (path: XYPosition[]) => void;
    workflowsMutation: UseMutationResult<WorkflowDetail, any, WorkflowDetail, void>;
    isConnecting: boolean;
    updateIsConnecting: (isConnecting: boolean) => void;
    wasConnectingRecently: MutableRefObject<boolean>;
    deleteEdge: (edgeId: string) => void;
    deleteNode: (nodeId: string) => void;
    updateNode: (template: TemplateDetail, block: BlockDetail) => void;
}

const nodeTypes: NodeTypes = {block: BlockNode};
const edgeTypes: EdgeTypes = {block: BlockEdge};

const EditorProvider: Provider<IProps> = ({children}: IProps): ReactNode => {
    const {t} = useTranslation();
    const {hasUnsavedChanges, updateHasUnsavedChanges, updateLastUsedWorkflowId} = useContext<IAppContext>(AppContext);
    const [connectionLinePath, setConnectionLinePath] = useState<XYPosition[]>([]);
    const [helperLineHorizontal, setHelperLineHorizontal] = useState<number | undefined>(undefined);
    const [helperLineVertical, setHelperLineVertical] = useState<number | undefined>(undefined);
    const [nodes, setNodes] = useNodesState<TBlock>([]);
    const [edges, setEdges] = useEdgesState<TEdge>([]);
    const [workflowId, setWorkflowId] = useState<string | undefined>(undefined);
    const [templateId, setTemplateId] = useState<string | undefined>(undefined);
    const nodesInitialized: boolean = useNodesInitialized({includeHiddenNodes: false});
    const {undo, redo, takeSnapshot, resetHistory, canUndo, canRedo, edited} = useHistory();
    const {screenToFlowPosition, fitView} = useReactFlow();
    const [isConnecting, setIsConnecting] = useState<boolean>(false);
    const wasConnectingRecently = useRef(false);
    const [outdatedBlocks, setOutdatedBlocks] = useState<BlockDetail[]>([]);
    const [changedBlocks, setChangedBlocks] = useState<BlockDetail[]>([]);
    const [differingParameters, setDifferingParameters] = useState<string>();

    const [workflows, , workflow, workflowMutation]: UseWorkflows = useWorkflows({
        workflowId: workflowId,
        filter: false
    });

    const [templates, , template]: UseTemplates = useTemplates({
        templateId: templateId,
        filter: false
    });

    const [, , , blockMutation] = useBlocks({
        filter: true
    });

    const updateWorkflowId: (workflowId: (string | undefined)) => void = useCallback((workflowId: string | undefined): void => {
        setNodes([]);
        setEdges([]);
        resetHistory();
        setWorkflowId(workflowId);
    }, [resetHistory, setEdges, setNodes]);

    const updateTemplateId: (blockId: (string | undefined)) => void = useCallback((templateId: string | undefined): void => {
        setTemplateId(templateId);
    }, []);

    const updateConnectionLinePath: (path: XYPosition[]) => void = useCallback((path: XYPosition[]): void => {
        setConnectionLinePath(path);
    }, []);

    const updateIsConnecting: (isConnecting: boolean) => void = useCallback((isConnecting: boolean): void => {
        setIsConnecting(isConnecting);
    }, []);

    const customApplyNodeChanges: (changes: NodeChange<TBlock>[], nodes: TBlock[]) => TBlock[] = useCallback((changes: NodeChange<TBlock>[], nodes: TBlock[]): TBlock[] => {
        setHelperLineHorizontal(undefined);
        setHelperLineVertical(undefined);
        if (
            changes.length === 1 &&
            changes[0].type === "position" &&
            changes[0].dragging &&
            changes[0].position
        ) {
            const helperLines = getHelperLines(changes[0], nodes);
            changes[0].position.x = helperLines.snapPosition.x ?? changes[0].position.x;
            changes[0].position.y = helperLines.snapPosition.y ?? changes[0].position.y;
            setHelperLineHorizontal(helperLines.horizontal);
            setHelperLineVertical(helperLines.vertical);
        }
        return applyNodeChanges<TBlock>(changes, nodes);
    }, []);

    const onNodesChange: OnNodesChange<TBlock> = useCallback((changes: NodeChange<TBlock>[]): void => {
        setNodes((nodes: TBlock[]): any => customApplyNodeChanges(changes, nodes));
    }, [setNodes, customApplyNodeChanges]);

    const onEdgesChange: OnEdgesChange<TEdge> = useCallback((changes: EdgeChange<TEdge>[]): void => {
        setEdges((edges: TEdge[]): TEdge[] => applyEdgeChanges(changes, edges));
    }, [setEdges]);

    const isValidConnection: IsValidConnection = (connection: (Connection | any)) => {
        const sourceNode: TBlock | undefined = nodes.find((node) => node.id === connection.source);
        const targetNode: TBlock | undefined = nodes.find((node) => node.id === connection.target);
        const output: OutputDetail | undefined =
            sourceNode?.data?.outputs?.find((handle: OutputDetail): boolean => handle.id === connection.sourceHandle);
        const input: InputDetail | undefined =
            targetNode?.data?.inputs?.find((handle: InputDetail): boolean => handle.id === connection.targetHandle);
        if (input?.communicationType?.toString().includes('STATIC') || output?.communicationType?.toString().includes("STATIC") || !input || !output)
            return false
        const usedInput = edges.find((edge) => edge.targetHandle === connection.targetHandle);
        if (usedInput) return false;
        return input?.type === output?.type;
    }

    const onConnect: OnConnect = useCallback((connection: Connection): void => {
        const sourceNode: TBlock | undefined = nodes.find((node) => node.id === connection.source);
        const output: OutputDetail | undefined = sourceNode?.data?.outputs?.find((handle: OutputDetail): boolean => handle.id === connection.sourceHandle);
        takeSnapshot();
        if (!hasUnsavedChanges) updateHasUnsavedChanges(true);
        const edge: TEdge = makeEdge(connection, connectionLinePath, output?.type?.toString());
        setEdges((edges: TEdge[]): TEdge[] => addEdge(edge, edges));
    }, [connectionLinePath, hasUnsavedChanges, nodes, setEdges, takeSnapshot, updateHasUnsavedChanges]);

    const onNodeDragStart: OnNodeDrag = useCallback((): void => {
        takeSnapshot();
        if (!hasUnsavedChanges) updateHasUnsavedChanges(true);
    }, [hasUnsavedChanges, takeSnapshot, updateHasUnsavedChanges]);

    const onSelectionDragStart: SelectionDragHandler = useCallback((): void => takeSnapshot(), [takeSnapshot]);

    const onNodesDelete: OnNodesDelete = useCallback((): void => takeSnapshot(), [takeSnapshot]);

    const onEdgesDelete: OnEdgesDelete = useCallback((): void => takeSnapshot(), [takeSnapshot]);

    const onLayout: () => void = useCallback((): void => {
        takeSnapshot();
        if (!hasUnsavedChanges) updateHasUnsavedChanges(true);
        const layoutedNodes: TBlock[] = getDagreLayoutedElements(nodes, edges);
        const layoutedEdges: TEdge[] = edges.map((edge: TEdge): TEdge => ({
            ...edge,
            data: {...edge.data, points: []}
        }));
        setNodes([...layoutedNodes]);
        setEdges([...layoutedEdges]);
        requestAnimationFrame((): Promise<boolean> => fitView({duration: 250, includeHiddenNodes: true}));
    }, [takeSnapshot, hasUnsavedChanges, updateHasUnsavedChanges, nodes, edges, setNodes, setEdges, fitView]);

    const onDrop: DragEventHandler = useCallback((event: DragEvent): void => {
        takeSnapshot();
        if (!hasUnsavedChanges) updateHasUnsavedChanges(true);
        const position: XYPosition = screenToFlowPosition({x: event.clientX, y: event.clientY});
        const newNode: TBlock = makeNode(template!, position, getNextAvailableIndex(nodes));
        setNodes((nds: TBlock[]): TBlock[] => nds.concat(newNode));
    }, [takeSnapshot, hasUnsavedChanges, updateHasUnsavedChanges, screenToFlowPosition, template, nodes, setNodes]);

    const deleteEdge = useCallback(async (edgeId: string) => {
        takeSnapshot();
        if (!hasUnsavedChanges) updateHasUnsavedChanges(true);
        setEdges((prevEdges) => prevEdges.filter((e) => e.id !== edgeId));
    }, [hasUnsavedChanges, setEdges, takeSnapshot, updateHasUnsavedChanges])

    const deleteNode = useCallback(async (nodeId: string) => {
        takeSnapshot();
        if (!hasUnsavedChanges) updateHasUnsavedChanges(true);
        setNodes((prevNodes: TBlock[]): TBlock[] => prevNodes.filter((n: TBlock): boolean => n.id !== nodeId));
        setEdges((prevEdges: TEdge[]): TEdge[] => prevEdges.filter((e: TEdge): boolean => e.source !== nodeId && e.target !== nodeId)); // Delete connected edge too
    }, [hasUnsavedChanges, setEdges, setNodes, takeSnapshot, updateHasUnsavedChanges])

    const updateNode = useCallback(async (template: TemplateDetail, block: BlockDetail) => {
        const blockInputs = stripInputOutput(block.inputs)
        const templateInputs = stripInputOutput(template.inputs)
        const blockOutputs = stripInputOutput(block.outputs)
        const templateOutputs = stripInputOutput(template.outputs)

        const templateInputsChanged = !isEqual(blockInputs, templateInputs)
        const templateOutputsChanged = !isEqual(blockOutputs, templateOutputs)

        const updatedBlock = {
            ...block,
            templateName: template.name,
            description: template.description,
            containerImage: template.containerImage !== block.containerImage ? block.containerImage : template.containerImage,
            blockType: template.blockType,
            communicationParadigm: template.communicationParadigm,
            syncStrategy: template.syncStrategy !== block.syncStrategy ? block.syncStrategy : template.syncStrategy,
            shutdownRelevant: template.shutdownRelevant !== block.shutdownRelevant ? block.shutdownRelevant : template.shutdownRelevant,
            program: template.program,
            inputs: templateInputsChanged ?
                template.inputs!.map(({id, ...rest}) => rest) : block.inputs,
            outputs: templateOutputsChanged ?
                template.outputs!.map(({id, ...rest}) => rest) : block.outputs,
        }

        await blockMutation.mutateAsync(updatedBlock);

        if (templateInputsChanged || templateOutputsChanged) {
            const newEdges: TEdge[] = edges.filter((e: TEdge): boolean => e.source !== block.id && e.target !== block.id);
            const newNodes: TBlock[] = nodes.map((node) =>
                node.data.id === updatedBlock.id
                    ? {...node, data: updatedBlock as any}
                    : node
            );
            workflowMutation.mutateAsync({
                ...workflow,
                connections: convertRemoteEdges(newEdges),
                blocks: convertRemoteBlocks(newNodes)
            }).then();
        }
    }, [blockMutation, edges, nodes, workflow, workflowMutation])

    const stripInputOutput: (array?: (InputDetail[] | OutputDetail[])) => (HandleType[] | undefined) = (array?: InputDetail[] | OutputDetail[]): HandleType[] | undefined => {
        if (!array) return array;
        return array.map((handle: HandleType): HandleType => HandleSchema.parse(handle)).sort((a: HandleType, b: HandleType): number => a.label!.localeCompare(b.label!)) as HandleType[];
    }

    useEffect((): void => {
        if (workflow && workflow.connections && workflow.blocks) {
            const {edges: convertedEdges, nodes: convertedNodes}: TWorkflow = convertWorkflow(workflow);
            setNodes(convertedNodes);
            setEdges(convertedEdges);
            if (workflow.id) updateLastUsedWorkflowId(workflow.id);
        }
    }, [workflow, setEdges, updateLastUsedWorkflowId, setNodes]);

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

    useEffect(() => {
        if (templates && workflow) {
            const currentBlocks: BlockDetail[] = []
            const outdatedBlocks: BlockDetail[] = []
            const changedBlocks: BlockDetail[] = []
            let differentParameters: string = ''
            nodes.forEach((node: TBlock) => {
                const block = workflow.blocks?.find((block: BlockDetail) => block.id === node.id)
                if (block) currentBlocks.push(block)
            })
            currentBlocks?.forEach((block: BlockDetail) => {
                const template: TemplateDetail | undefined = templates.find((template: TemplateDetail): boolean => template.id === block.templateId);
                if (template) {
                    if (
                        template.name !== block.templateName ||
                        template.description !== block.description ||
                        template.blockType !== block.blockType ||
                        template.communicationParadigm !== block.communicationParadigm ||
                        template.program === block.program
                    )
                        outdatedBlocks.push(block);
                    if (
                        template.containerImage !== block.containerImage ||
                        template.syncStrategy !== block.syncStrategy ||
                        template.shutdownRelevant !== block.shutdownRelevant
                    )
                        changedBlocks.push(block);
                    if (template.containerImage !== block.containerImage) differentParameters += `${t("word.image")}, `
                    if (template.syncStrategy !== block.syncStrategy) differentParameters += `${t("word.syncStrategy")}, `
                    if (template.shutdownRelevant !== block.shutdownRelevant) differentParameters += `${t("word.shutdownRelevant")}, `
                    const strippedTemplateInputs: HandleType[] = stripInputOutput(template.inputs) ?? [];
                    const strippedBlockInputs: HandleType[] = stripInputOutput(block.inputs) ?? [];

                    if (!isEqual(strippedTemplateInputs, strippedBlockInputs) && !outdatedBlocks.includes(block)) {
                        outdatedBlocks.push(block);
                        return;
                    }

                    const strippedTemplateOutputs: HandleType[] = stripInputOutput(template.outputs) ?? [];
                    const strippedBlockOutputs: HandleType[] = stripInputOutput(block.outputs) ?? [];

                    if (!isEqual(strippedTemplateOutputs, strippedBlockOutputs) && !outdatedBlocks.includes(block)) {
                        outdatedBlocks.push(block);
                    }
                }
            })
            setOutdatedBlocks(outdatedBlocks);
            setChangedBlocks(changedBlocks);
            setDifferingParameters(differentParameters);
        }
    }, [templates, workflow, nodes]);

    useWebSocket({workflow: workflow});

    return (
        <EditorContext.Provider
            value={{
                nodeTypes: nodeTypes,
                edgeTypes: edgeTypes,
                nodes: nodes,
                edges: edges,
                canUndo: canUndo,
                canRedo: canRedo,
                edited: edited,
                helperLineHorizontal: helperLineHorizontal,
                helperLineVertical: helperLineVertical,
                workflow: workflow,
                outdatedBlocks: outdatedBlocks,
                changedBlocks: changedBlocks,
                differingParameters: differingParameters,
                workflows: workflows,
                template: template,
                templates: templates,
                workflowsMutation: workflowMutation,
                connectionLinePath: connectionLinePath,
                onDrop: onDrop,
                deleteEdge: deleteEdge,
                deleteNode: deleteNode,
                updateNode: updateNode,
                isConnecting,
                wasConnectingRecently,
                updateConnectionLinePath: updateConnectionLinePath,
                layout: onLayout,
                isValidConnection: isValidConnection,
                onConnect: onConnect,
                onNodesChange: onNodesChange,
                onEdgesChange: onEdgesChange,
                onNodeDragStart: onNodeDragStart,
                onSelectionDragStart: onSelectionDragStart,
                onNodesDelete: onNodesDelete,
                onEdgesDelete: onEdgesDelete,
                undo: undo,
                redo: redo,
                takeSnapshot: takeSnapshot,
                updateWorkflowId: updateWorkflowId,
                updateTemplateId: updateTemplateId,
                updateIsConnecting: updateIsConnecting
            }}
        >
            {children}
        </EditorContext.Provider>
    );

};

export default EditorProvider;