import {
    ChangeEvent,
    DragEvent,
    DragEventHandler,
    Fragment,
    MouseEvent as ReactMouseEvent,
    ReactNode,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useRef,
    useState
} from "react";
import {Background, Connection, ConnectionMode, ControlButton, Controls, ReactFlow, useReactFlow} from "@xyflow/react";
import {
    Alert,
    Box,
    Button,
    ButtonGroup,
    Collapse,
    FormControl,
    IconButton,
    List,
    ListItem,
    Paper,
    TextField,
    Theme,
    Tooltip,
    Typography,
    useColorScheme,
    useTheme
} from "@mui/material";
import Grid from "@mui/material/Grid2";
import {IEditorContext} from "../../../provider/EditorProvider.tsx";
import {useTranslation} from "react-i18next";
import HelperLines from "./HelperLines.tsx";
import {BlockDetail, TemplateDetail} from "@kit-iai-proof/proof-config-manager-client";
import GridGoldenratioIcon from "@mui/icons-material/GridGoldenratio";
import {ConnectionLine} from "./ConnectionLine.tsx";
import {TBlock} from "../../../model/TBlock.ts";
import {TEdge} from "../../../model/TEdge.ts";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import FullscreenIcon from "@mui/icons-material/Fullscreen";
import NodeContextMenu, {INodeMenuProps} from "./NodeContextMenu.tsx";
import {ArrowBackRounded, ArrowForwardRounded} from "@mui/icons-material";
import {lighten} from "@mui/material/styles";
import {EditorContext} from "../../../provider/IEditorContext.tsx";
import {IAppContext} from "../../../provider/AppProvider.tsx";
import {AppContext} from "../../../provider/AppContext.tsx";
import EdgeContextMenu, {IEdgeMenuProps} from "./EdgeContextMenu.tsx";

const EditorBoard: () => ReactNode = (): ReactNode => {

    const theme: Theme = useTheme();
    const {mode} = useColorScheme();
    const {t} = useTranslation();
    const {updateHasUnsavedChanges} = useContext<IAppContext>(AppContext);
    const {
        nodes,
        edges,
        onEdgesChange,
        onNodesChange,
        nodeTypes,
        edgeTypes,
        templates,
        onEdgesDelete,
        onNodesDelete,
        onNodeDragStart,
        onSelectionDragStart,
        isValidConnection,
        onConnect,
        undo,
        redo,
        onDrop,
        canUndo,
        canRedo,
        updateTemplateId,
        deleteEdge,
        deleteNode,
        updateNode,
        helperLineHorizontal,
        helperLineVertical,
        layout,
        workflow,
        updateIsConnecting,
        outdatedBlocks,
        changedBlocks,
        differingParameters
    } = useContext<IEditorContext>(EditorContext);
    const [search, setSearch] = useState<string>("");
    const [nodesOpen, setNodesOpen] = useState<boolean>(true);
    const {zoomIn, zoomOut, fitView} = useReactFlow();
    const [nodeMenuProps, setNodeMenuProps] = useState<INodeMenuProps>({});
    const [edgeMenuProps, setEdgeMenuProps] = useState<IEdgeMenuProps>({});
    const descriptionRefs = useRef<Map<string, HTMLDivElement>>(new Map());
    const [showTooltipIds, setShowTooltipIds] = useState<Set<string>>(new Set());

    const isLocked: boolean = useMemo(() => workflow === undefined, [workflow])

    const onEdgeDelete: (id: string) => void = useCallback((id: string) => {
        deleteEdge(id);
        setEdgeMenuProps({id: undefined, anchorPosition: undefined});
    }, [deleteEdge]);

    const onNodeDelete: (id: string) => void = useCallback((id: string) => {
        deleteNode(id)
        setNodeMenuProps({id: undefined, anchorPosition: undefined, data: undefined});
    }, [deleteNode])

    const onNodeUpdate: (template: TemplateDetail, block: BlockDetail) => void = useCallback((template: TemplateDetail, block: BlockDetail) => {
        updateNode(template, block);
        setNodeMenuProps({id: undefined, anchorPosition: undefined, data: undefined});
    }, [updateNode]);

    const onEdgeContextMenu: (event: ReactMouseEvent, edge: TEdge) => void = useCallback((event: ReactMouseEvent, edge: TEdge): void => {
        event.preventDefault();
        setEdgeMenuProps({
            id: edge.id,
            anchorPosition: {top: event.clientY, left: event.clientX},
            onDelete: onEdgeDelete
        })
    }, [onEdgeDelete])

    const onNodeContextMenu: (event: ReactMouseEvent, node: TBlock) => void = useCallback((event: ReactMouseEvent, node: TBlock): void => {
        event.preventDefault();
        updateTemplateId(node.data.templateId);
        setNodeMenuProps({
            id: node.id,
            data: node.data,
            anchorPosition: {top: event.clientY, left: event.clientX},
            onDelete: onNodeDelete,
            onUpdate: onNodeUpdate
        })
    }, [updateTemplateId, onNodeUpdate, onNodeDelete])

    const onDragStart: (event: DragEvent, template: TemplateDetail) => void = useCallback((event: DragEvent, template: TemplateDetail): void => {
        updateTemplateId(template.id);
        if (event.dataTransfer) event.dataTransfer.dropEffect = "move";
    }, [updateTemplateId]);

    const onDragOver: DragEventHandler = useCallback((event: DragEvent): void => {
        event.preventDefault();
        if (event.dataTransfer) event.dataTransfer.dropEffect = "move";
    }, []);

    useEffect((): void => {
        if (canUndo) updateHasUnsavedChanges(false);
    }, [canUndo, updateHasUnsavedChanges]);

    useEffect(() => {
        const newSet = new Set<string>();
        descriptionRefs.current.forEach((el: HTMLDivElement, id: string) => {
            if (el.scrollWidth > el.clientWidth) {
                newSet.add(id);
            }
        });
        setShowTooltipIds(newSet);
    }, [templates, search]);

    return (
        <Fragment>
            <Grid
                container={true}
                spacing={1}
                paddingTop={1}
            >
                <Grid flex={1}>
                    <Paper variant={"outlined"}>
                        <Box height={"calc(90vh - 300px)"}>
                            <ReactFlow<TBlock, TEdge>
                                id={"editor"}
                                key={"editor"}
                                fitView={true}
                                style={{borderRadius: "5px"}}
                                nodes={nodes}
                                edges={edges}
                                proOptions={{account: "paid-pro", hideAttribution: true}}
                                onNodesChange={onNodesChange}
                                onEdgesChange={onEdgesChange}
                                isValidConnection={isValidConnection}
                                onNodeDragStart={onNodeDragStart}
                                onSelectionDragStart={onSelectionDragStart}
                                onNodesDelete={onNodesDelete}
                                onEdgesDelete={onEdgesDelete}
                                onEdgeContextMenu={onEdgeContextMenu}
                                onNodeContextMenu={onNodeContextMenu}
                                onDrop={onDrop}
                                nodeTypes={nodeTypes}
                                edgeTypes={edgeTypes}
                                colorMode={mode}
                                connectionMode={ConnectionMode.Loose}
                                connectionLineComponent={ConnectionLine}
                                onConnectStart={(): void => updateIsConnecting(true)}
                                onConnectEnd={(): void => updateIsConnecting(false)}
                                nodesDraggable={!isLocked}
                                nodesConnectable={!isLocked}
                                elementsSelectable={!isLocked}
                                onConnect={(connection: Connection): void => {
                                    if (isLocked) return;
                                    onConnect(connection)
                                }}
                                onDragOver={(event: any) => {
                                    if (isLocked) return;
                                    onDragOver(event);
                                }}
                            >
                                <NodeContextMenu
                                    id={nodeMenuProps?.id}
                                    data={nodeMenuProps.data}
                                    anchorPosition={nodeMenuProps.anchorPosition}
                                    onDelete={nodeMenuProps.onDelete}
                                    onUpdate={nodeMenuProps.onUpdate}
                                />
                                <EdgeContextMenu
                                    id={edgeMenuProps?.id}
                                    anchorPosition={edgeMenuProps.anchorPosition}
                                    onDelete={edgeMenuProps.onDelete}
                                />
                                <Background/>
                                <Controls showZoom={false} showFitView={false} showInteractive={false}>
                                    <Fragment>
                                        <ControlButton
                                            onClick={() => zoomIn()}
                                        >
                                            <Tooltip
                                                title={t("action.zoomIn")}
                                                placement="right"
                                            >
                                                <AddIcon/>
                                            </Tooltip>
                                        </ControlButton>
                                    </Fragment>
                                    <Fragment>
                                        <ControlButton
                                            onClick={() => zoomOut()}
                                        >
                                            <Tooltip
                                                title={t("action.zoomOut")}
                                                placement="right"
                                            >
                                                <RemoveIcon/>
                                            </Tooltip>
                                        </ControlButton>
                                    </Fragment>
                                    <Fragment>
                                        <ControlButton
                                            onClick={() => fitView()}
                                        >
                                            <Tooltip
                                                title={t("action.fitView")}
                                                placement="right"
                                            >
                                                <FullscreenIcon/>
                                            </Tooltip>
                                        </ControlButton>
                                    </Fragment>
                                    <Fragment>
                                        <ControlButton
                                            style={{fontSize: 50}}
                                            onClick={(): void => layout()}>
                                            <Tooltip
                                                title={t("action.autoAlignment")}
                                                placement="right"
                                            >
                                                <GridGoldenratioIcon sx={{fontSize: 50}}/>
                                            </Tooltip>
                                        </ControlButton>
                                    </Fragment>
                                </Controls>
                                <HelperLines
                                    horizontal={helperLineHorizontal}
                                    vertical={helperLineVertical}
                                />
                            </ReactFlow>
                        </Box>
                    </Paper>
                    <Box paddingTop={1}>
                        <ButtonGroup>
                            <Button
                                variant={"text"}
                                color={"primary"}
                                disabled={canUndo}
                                onClick={undo}>
                                <Typography>
                                    {t("action.undo")}
                                </Typography>
                            </Button>
                            <Button
                                variant={"text"}
                                color={"primary"}
                                disabled={canRedo}
                                onClick={redo}>
                                <Typography>
                                    {t("action.redo")}
                                </Typography>
                            </Button>
                        </ButtonGroup>
                    </Box>
                    <Box paddingTop={1}>
                        {
                            outdatedBlocks.length > 0 &&
                            <Alert
                                severity={"info"}
                                sx={{alignItems: "center"}}
                            >
                                <List dense disablePadding>
                                    {
                                        outdatedBlocks.map((block: BlockDetail) =>
                                            <ListItem key={block.id}>
                                                {t('word.outdatedBlock')}: {block.label} ({block.id})
                                            </ListItem>
                                        )
                                    }
                                </List>
                            </Alert>

                        }
                        {changedBlocks.length > 0 &&
                            <Alert
                                severity={"info"}
                                sx={{alignItems: "center", marginTop: 1}}
                            >
                                <List dense disablePadding>
                                    {
                                        changedBlocks.map((block: BlockDetail) =>
                                            <ListItem key={block.id}>
                                                {t('word.blockChanged', {
                                                    block: block.label,
                                                    index: block.index,
                                                    parameters: differingParameters
                                                })}
                                            </ListItem>
                                        )
                                    }
                                </List>
                            </Alert>
                        }
                    </Box>
                </Grid>
                <Grid>
                    <Paper
                        style={{background: theme.palette.elevated.default}}
                        variant={"outlined"}
                    >
                        <Box padding={1} paddingBottom={0}>
                            <IconButton
                                color={"primary"}
                                onClick={(): void => setNodesOpen(!nodesOpen)}>
                                {!nodesOpen ? <ArrowBackRounded/> : <ArrowForwardRounded/>}
                            </IconButton>
                        </Box>
                        <Collapse
                            in={nodesOpen}
                            orientation={"horizontal"}
                        >
                            <Box padding={3}>
                                <Typography
                                    variant={"h5"}
                                    color={"primary"}
                                    paddingBottom={2}
                                >
                                    {t("word.templates")}
                                </Typography>
                                {
                                    templates && templates.length > 0 ?
                                        <Fragment>
                                            <FormControl
                                                color={"primary"}
                                                fullWidth={true}
                                                variant={"outlined"}
                                                size={"small"}
                                            >
                                                <TextField
                                                    color={"primary"}
                                                    id="search"
                                                    fullWidth={true}
                                                    size={"small"}
                                                    label={t("action.search")}
                                                    value={search}
                                                    onChange={(event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>): void => setSearch(event.target.value)}
                                                    variant={"outlined"}
                                                />
                                            </FormControl>
                                            <Box
                                                sx={{
                                                    maxHeight: "calc(100vh - 300px)",
                                                    overflowY: "auto",
                                                    overflowX: "hidden"
                                                }}
                                            >
                                                <List
                                                    component={"div"}
                                                    dense={true}
                                                >
                                                    {
                                                        templates
                                                            .filter((template: TemplateDetail): boolean => {
                                                                if (search) {
                                                                    return (template.name?.toLowerCase().includes(search.toLowerCase()) ||
                                                                        template.description?.toLowerCase().includes(search.toLowerCase())) ?? false;
                                                                }
                                                                return true;
                                                            })
                                                            .map((template: TemplateDetail): ReactNode => {
                                                                return (
                                                                    <Fragment key={template.id}>
                                                                        <ListItem
                                                                            style={{cursor: "pointer"}}
                                                                            draggable={true}
                                                                            onDragStart={(event: DragEvent): void => onDragStart(event, template)}
                                                                            disableGutters={true}
                                                                            alignItems={"center"}
                                                                            component={"div"}
                                                                            disablePadding={false}
                                                                        >
                                                                            <Paper
                                                                                color={"primary"}
                                                                                variant={"outlined"}
                                                                                style={{
                                                                                    width: "100%",
                                                                                    maxWidth: "200px",
                                                                                    background: lighten(template.color ?? "#000", 0.5),
                                                                                    borderColor: lighten(template.color ?? "#000", 0.2),
                                                                                    borderStyle: "solid",
                                                                                    borderWidth: "3px",
                                                                                    borderRadius: "10px",
                                                                                    opacity: 0.95
                                                                                }}
                                                                            >
                                                                                <Box padding={1}>
                                                                                    <Typography
                                                                                        title={template.name}
                                                                                        noWrap={true}
                                                                                        style={{color: "white"}}
                                                                                        textOverflow={"ellipsis"}
                                                                                        overflow={"hidden"}
                                                                                        variant={"body1"}
                                                                                    >
                                                                                        {template.name}
                                                                                    </Typography>

                                                                                    <Tooltip
                                                                                        title={showTooltipIds.has(template.id!) ? template.description : ''}>
                                                                                        <Typography
                                                                                            ref={(el: HTMLDivElement) => {
                                                                                                if (el) descriptionRefs.current.set(template.id!, el);
                                                                                            }}
                                                                                            noWrap
                                                                                            style={{color: "white"}}
                                                                                            textOverflow={"ellipsis"}
                                                                                            overflow={"hidden"}
                                                                                            variant={"body2"}
                                                                                        >
                                                                                            {template.description}
                                                                                        </Typography>
                                                                                    </Tooltip>
                                                                                </Box>
                                                                            </Paper>
                                                                        </ListItem>
                                                                    </Fragment>
                                                                );
                                                            })
                                                    }
                                                </List>
                                            </Box>
                                        </Fragment>
                                        :
                                        <Typography>{t("page.description.nodata")}</Typography>
                                }
                            </Box>
                        </Collapse>
                    </Paper>
                </Grid>
            </Grid>
        </Fragment>
    );
};

export default EditorBoard;
