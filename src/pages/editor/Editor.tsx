import {Fragment, ReactNode, useContext, useEffect, useState} from "react";
import {
    Box,
    Button,
    ButtonGroup,
    FormControl,
    IconButton,
    InputLabel,
    MenuItem,
    Paper,
    Popover,
    Select,
    SelectChangeEvent,
    Stack,
    Theme,
    Tooltip,
    Typography,
    useMediaQuery,
    useTheme
} from "@mui/material";
import Grid from "@mui/material/Grid2";
import EditorBoard from "./components/EditorBoard.tsx";
import AccountTreeRoundedIcon from "@mui/icons-material/AccountTreeRounded";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import {IEditorContext} from "../../provider/EditorProvider.tsx";
import {useTranslation} from "react-i18next";
import {WorkflowDetail, WorkflowDetailCommunicationParadigmEnum, WorkflowDetailSimulationStrategyEnum} from "@kit-iai-proof/proof-config-manager-client";
import {NavigateFunction, useLocation, useNavigate, useParams} from "react-router-dom";
import {convertRemoteBlocks, convertRemoteEdges} from "../../utils/storage/outboundConverter.ts";
import TerminalIcon from "@mui/icons-material/Terminal";
import SaveIcon from "@mui/icons-material/Save";
import SettingsIcon from "@mui/icons-material/Settings";
import {Info} from "@mui/icons-material";
import {getTypeColor} from "../../utils/palette.ts";
import {EditorContext} from "../../provider/IEditorContext.tsx";
import {IAppContext} from "../../provider/AppProvider.tsx";
import {AppContext} from "../../provider/AppContext.tsx";
import {STEPBASEDCONFIG_DEFAULT} from "../../utils/constants.ts";
import dayjs from "dayjs";

const Editor: () => ReactNode = (): ReactNode => {

    const {t} = useTranslation();
    const {workflowId} = useParams();
    const theme: Theme = useTheme();
    const navigate: NavigateFunction = useNavigate();
    const location = useLocation();
    const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
    const [anchorEl, setAnchorEl] = useState(null);
    const open: boolean = Boolean(anchorEl);

    const {
        workflow,
        workflows,
        workflowsMutation,
        updateWorkflowId,
        edges,
        nodes
    } = useContext<IEditorContext>(EditorContext);

    const {
        hasUnsavedChanges,
        updateHasUnsavedChanges,
        palette,
        lastUsedWorkflowId
    } = useContext<IAppContext>(AppContext);

    const handleOpenLegend: (event: any) => void = (event: any): void => {
        setAnchorEl(event.currentTarget);
    };

    const handleCloseLegend: () => void = (): void => {
        setAnchorEl(null);
    };

    useEffect((): void => {
        if (workflowId) updateWorkflowId(workflowId);
        else updateWorkflowId(undefined);
    }, [updateWorkflowId, workflowId]);

    useEffect((): void => {
        const from: any = location.state?.from;
        if (!(from && (from.includes('/editor') || from.includes('/configs/workflows')))) {
            if (lastUsedWorkflowId && lastUsedWorkflowId !== workflowId) {
                navigate(`/editor/${lastUsedWorkflowId}`, {state: {from: location.pathname}}) // Always navigate to the last used workflow
            }
        }
    }, [lastUsedWorkflowId, location, navigate, workflowId]);

    return (
        <Fragment>
            <Box
                padding={2}
                paddingTop={7}
                paddingLeft={10}
                paddingBottom={10}
            >
                <Paper>
                    <Box padding={3}>
                        <Grid
                            container={true}
                            justifyContent={"space-between"}
                            alignItems={"center"}
                            paddingBottom={1}
                            spacing={1}
                        >
                            <Grid>
                                <Stack
                                    direction={"row"}
                                    spacing={1}>
                                    <AccountTreeRoundedIcon
                                        color={"primary"}
                                        fontSize={"large"}
                                    />
                                    <Typography variant={"h4"}>{t("page.header.editor")}</Typography>
                                </Stack>
                            </Grid>
                            <Grid size={{xs: 12, lg: "auto"}}>
                                <Stack direction={"row"} spacing={1}>
                                    <Box>
                                        <FormControl
                                            fullWidth={true}
                                            color={"primary"}
                                            variant={"outlined"}
                                            size={"small"}
                                            sx={{minWidth: "150px"}}
                                        >
                                            <InputLabel id={"workflow-label"}>Workflow</InputLabel>
                                            <Select
                                                color={"primary"}
                                                labelId="workflow-label"
                                                id="workflow"
                                                label="Workflow"
                                                variant={"outlined"}
                                                value={workflow?.id ?? ""}
                                                onChange={(event: SelectChangeEvent): void => {
                                                    navigate(`/editor/${event.target.value}`, {state: {from: location.pathname}})
                                                }}
                                            >
                                                {
                                                    !workflows || workflows.length === 0 && <MenuItem value={""}>
                                                        <Typography
                                                            variant={"body1"}
                                                            fontStyle={"italic"}>{t("word.unselected")}
                                                        </Typography>
                                                    </MenuItem>
                                                }
                                                {
                                                    workflows?.map((workflow: WorkflowDetail): ReactNode => {
                                                        return (
                                                            <MenuItem
                                                                key={workflow.id}
                                                                value={workflow.id}
                                                                style={{fontWeight: lastUsedWorkflowId === workflow.id ? "bold" : "inherit"}}
                                                            >
                                                                {workflow.label}
                                                            </MenuItem>
                                                        );
                                                    })
                                                }
                                            </Select>
                                        </FormControl>
                                    </Box>
                                    <Box>
                                        <Tooltip title={t("action.addWorkflow")}>
                                            <IconButton
                                                color={"primary"}
                                                onClick={async (): Promise<void> => {
                                                    await workflowsMutation
                                                        .mutateAsync({
                                                            label: `workflow-${dayjs().format("DD.MM.YYYY")}`,
                                                            description: `workflow-${dayjs().format("DD.MM.YYYY")}`,
                                                            communicationParadigm: WorkflowDetailCommunicationParadigmEnum.Stepbased,
                                                            simulationStrategy: WorkflowDetailSimulationStrategyEnum.WaitAndContinue,
                                                            stepBasedConfig: STEPBASEDCONFIG_DEFAULT,
                                                            blocks: [],
                                                            connections: []
                                                        })
                                                        .then((result: WorkflowDetail): void => {
                                                            navigate(`/configs/workflows/${result.id}?workflowId=${result.id}`, {state: {from: location.pathname}})
                                                        });
                                                }}
                                            >
                                                <AddRoundedIcon color={"primary"}/>
                                            </IconButton>
                                        </Tooltip>
                                    </Box>
                                </Stack>
                            </Grid>
                            <Grid size={{xs: 12, lg: "auto"}}>
                                <Stack direction={"row"} spacing={1}>
                                    <ButtonGroup
                                        orientation={isMobile ? "vertical" : "horizontal"}
                                    >
                                        <Button
                                            startIcon={<SaveIcon/>}
                                            disabled={!workflow || !hasUnsavedChanges}
                                            onClick={async (): Promise<void> => {
                                                await workflowsMutation.mutateAsync({
                                                    ...workflow,
                                                    connections: convertRemoteEdges(edges),
                                                    blocks: convertRemoteBlocks(nodes)
                                                });
                                                if (hasUnsavedChanges) updateHasUnsavedChanges(false);
                                            }}
                                            color={"primary"}
                                            variant={"outlined"}
                                        >
                                            {t("action.save")}
                                        </Button>
                                        <Button
                                            onClick={(): void => navigate(`/monitoring/execution/${workflow?.id}`)}
                                            startIcon={<TerminalIcon/>}
                                            disabled={!workflow}
                                            color={"primary"}
                                            variant={"outlined"}
                                        >
                                            {t("action.run")}
                                        </Button>
                                        <Button
                                            onClick={(): void => navigate(`/configs/workflows/${workflow?.id}?workflowId=${workflow?.id}`)}
                                            disabled={!workflow}
                                            startIcon={<SettingsIcon/>}
                                            color={"primary"}
                                            variant={"outlined"}
                                        >
                                            {t("action.settings")}
                                        </Button>
                                    </ButtonGroup>
                                    <Box>
                                        <Tooltip title={t("action.showLegend")}>
                                            <IconButton color="primary" onClick={handleOpenLegend}>
                                                <Info color={"primary"}/>
                                            </IconButton>
                                        </Tooltip>
                                    </Box>
                                </Stack>
                            </Grid>
                            <Popover
                                open={open}
                                anchorEl={anchorEl}
                                onClose={handleCloseLegend}
                                anchorOrigin={{
                                    vertical: "bottom",
                                    horizontal: "left",
                                }}
                                transformOrigin={{
                                    vertical: "top",
                                    horizontal: "left",
                                }}
                                sx={{margin: 1}}
                            >
                                <Paper sx={{padding: 2, width: 180}}>
                                    <Typography variant="h6" gutterBottom>
                                        {t("popover.header.legend")}
                                    </Typography>
                                    {
                                        [
                                            {
                                                key: "STRING",
                                                value: t("popover.word.string")
                                            },
                                            {
                                                key: "NUMBER",
                                                value: t("popover.word.number")
                                            },
                                            {
                                                key: "OBJECT",
                                                value: t("popover.word.object")
                                            }

                                        ].map((type: any): ReactNode => {
                                            return (
                                                <Stack
                                                    direction={"row"}
                                                    spacing={1}
                                                    paddingBottom={1}
                                                    sx={{alignItems: "center", justifyContent: "space-between"}}
                                                    key={type.key}>
                                                    <div style={{
                                                        width: "50px",
                                                        height: "25px",
                                                        borderRadius: "5px",
                                                        background: getTypeColor(type.key, palette)
                                                    }}></div>
                                                    <Typography variant={"body1"}>{type.value}</Typography>
                                                </Stack>
                                            );
                                        })
                                    }
                                </Paper>
                            </Popover>
                        </Grid>
                        <EditorBoard/>
                    </Box>
                </Paper>
            </Box>
        </Fragment>
    );

};

export default Editor;