import {Fragment, ReactNode, SyntheticEvent, useContext, useEffect, useState} from "react";
import {IMonitoringContext} from "../../../provider/MonitoringProvider.tsx";
import {
    Accordion,
    AccordionDetails,
    AccordionSummary,
    Alert,
    Box,
    Divider,
    List,
    ListItem,
    ListItemText,
    Paper,
    Stack,
    TextField,
    Theme,
    Tooltip,
    Typography,
    useTheme
} from "@mui/material";
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import {Info} from "@mui/icons-material";
import {useTranslation} from "react-i18next";
import Grid from "@mui/material/Grid2";
import {BlockDetail, ExecutionDetail, InputDetail, OutputDetail} from "@webis/proof-config-manager-client";
import {MonitoringContext} from "../../../provider/IMonitoringContext.tsx";
import {InputCommunicationTypeEnum, OutputCommunicationTypeEnum} from "@webis/proof-orchestrator-client";
import Handle from "./Handle.tsx";

interface IProps {
    workflowId: string;
}


const PreselectedStart: ({workflowId}: IProps) => ReactNode = ({workflowId}: IProps): ReactNode => {

    const theme: Theme = useTheme();
    const {t} = useTranslation();

    const [expandedBlocks, setExpandedBlocks] = useState<Set<string>>(new Set());

    const {
        workflow,
        appliedInputs,
        updateWorkflowId,
        updateAppliedInputs,
        executionLabel,
        updateExecutionLabel,
        executionDescription,
        updateExecutionDescription,
        missingRequiredFields,
        executions
    } = useContext<IMonitoringContext>(MonitoringContext);

    useEffect((): void => {
        if (workflowId) {
            updateWorkflowId(workflowId)
            const lastExecution: ExecutionDetail | undefined = executions?.sort((a, b) => Number(b.creationDate) - Number(a.creationDate)).find((execution: ExecutionDetail) => execution.workflow?.id === workflowId);
            updateExecutionDescription(lastExecution?.description ?? "")
            updateAppliedInputs(lastExecution?.appliedInputs ?? {})
            updateExecutionLabel(lastExecution?.label ?? "")
        }
    }, [executions, updateWorkflowId, workflowId, updateAppliedInputs, updateExecutionDescription, updateExecutionLabel]);

    useEffect(() => {
        if (!workflow?.blocks) return;
        setExpandedBlocks(prev => {
            const next = new Set(prev);
            workflow.blocks!.forEach((block: BlockDetail) => {
                const optionalInputs = block.inputs?.filter(input => input.communicationType?.includes('_STATIC') && !input.required) ?? [];
                const hasValue = optionalInputs.some(input => {
                    const val = appliedInputs[input.id!];
                    return !!val;
                });
                if (hasValue) {
                    if (!next.has(block.id!))
                        next.add(block.id!);
                }
            });

            return next;
        });
    }, [appliedInputs, workflow?.blocks]);

    useEffect(() => {
        if (!workflow?.blocks) return;
        if (Object.keys(appliedInputs).length > 0) return;

        const defaults: Record<string, string> = {};

        workflow.blocks.forEach(block => {
            block.inputs?.forEach(input => {
                if (
                    input.communicationType?.includes("_STATIC") &&
                    !input.required &&
                    input.defaultValue
                ) {
                    defaults[input.id!] = input.defaultValue;
                }
            });
        });

        updateAppliedInputs(defaults);

    }, [workflow]);

    const handleAccordionToggle: (blockId: string) => (_event: SyntheticEvent, isExpanded: boolean) => void = (blockId: string) => (_event: SyntheticEvent, isExpanded: boolean) => {
        setExpandedBlocks(prev => {
            const next = new Set(prev);
            if (isExpanded) next.add(blockId);
            else next.delete(blockId);
            return next;
        });
    };

    return (
        <Fragment>
            <Paper
                elevation={0}
                style={{background: theme.palette.background.default}}>
                <Grid
                    padding={3}
                    spacing={1}
                    container={true}
                >
                    <Grid size={12} paddingBottom={2}>
                        {
                            missingRequiredFields.some(field =>
                                field.startsWith("executionRunning") ||
                                field.startsWith("missingBlock") ||
                                field.startsWith("missingHandles") ||
                                field.startsWith("missingProgram") ||
                                field.startsWith("missingParadigm") ||
                                field.startsWith("missingStrategy") ||
                                field.startsWith("missingProgramEntryPoint") ||
                                field.startsWith("missingEntryPointPath")
                            ) && (
                                <Alert
                                    severity="error"
                                    sx={{alignItems: "center"}}
                                >
                                    <List dense disablePadding>
                                        {
                                            missingRequiredFields.map((field) => {
                                                if (field.startsWith("executionRunning")) {
                                                    const [, detail] = field.split(":");
                                                    const [label, status] = detail.split("__");
                                                    return (
                                                        <ListItem key={field} disableGutters>
                                                            <ListItemText primary={t("word.executionRunning", {
                                                                label: label,
                                                                status: status
                                                            })}/>
                                                        </ListItem>
                                                    );
                                                }
                                                if (field === "missingBlock") {
                                                    return (
                                                        <ListItem key={field} disableGutters>
                                                            <ListItemText primary={t("word.missingBlock")}/>
                                                        </ListItem>
                                                    );
                                                }
                                                if (field.startsWith('missingHandles')) {
                                                    const [, detail] = field.split(":");
                                                    const [id, label] = detail.split('__');
                                                    return (
                                                        <ListItem key={field} disableGutters>
                                                            <ListItemText
                                                                primary={`${t('word.missingHandles')} ${label} (${id}).`}/>
                                                        </ListItem>
                                                    )
                                                }
                                                if (field.startsWith("missingParadigm")) {
                                                    return (
                                                        <ListItem key={field} disableGutters>
                                                            <ListItemText primary={t("word.missingParadigm")}/>
                                                        </ListItem>
                                                    );
                                                }
                                                if (field.startsWith("missingStrategy")) {
                                                    return (
                                                        <ListItem key={field} disableGutters>
                                                            <ListItemText primary={t("word.missingStrategy")}/>
                                                        </ListItem>
                                                    );
                                                }
                                                if (field.startsWith("missingProgram:")) {
                                                    const [, detail] = field.split(":");
                                                    const [id, label] = detail.split('__')
                                                    return (
                                                        <ListItem key={field} disableGutters>
                                                            <ListItemText
                                                                primary={`${t("word.missingProgram")} ${label} (${id}).`}/>
                                                        </ListItem>
                                                    );
                                                }
                                                if (field.startsWith("missingProgramEntryPoint:")) {
                                                    const [, detail] = field.split(":");
                                                    const [id, label] = detail.split('__')
                                                    return (
                                                        <ListItem key={field} disableGutters>
                                                            <ListItemText
                                                                primary={`${t("word.missingProgramEntryPoint")} ${label} (${id}).`}/>
                                                        </ListItem>
                                                    );
                                                }
                                                if (field.startsWith("missingEntryPointPath:")) {
                                                    const [, detail] = field.split(":");
                                                    const [id, label] = detail.split('__')
                                                    return (
                                                        <ListItem key={field} disableGutters>
                                                            <ListItemText
                                                                primary={`${t("word.missingEntryPointPath")} ${label} (${id}).`}/>
                                                        </ListItem>
                                                    );
                                                }
                                                return null;
                                            })}
                                    </List>
                                </Alert>
                            )}
                    </Grid>
                    <Grid size={{xs: 3, lg: 2, xl: 2}}>
                        <Stack direction={"row"} alignItems={"center"}>
                            <Typography
                                variant={"body1"}
                                color={"primary"}
                            >
                                {t("word.id")}
                            </Typography>
                            <Tooltip title={t("tooltip.id")}>
                                <Info
                                    color={"primary"}
                                    fontSize={"small"}
                                    sx={{ml: 1, cursor: "pointer"}}
                                />
                            </Tooltip>
                        </Stack>
                    </Grid>
                    <Grid size={{xs: 9, lg: 10, xl: 10}}>
                        <TextField
                            value={workflowId ?? ""}
                            size={"small"}
                            disabled={true}
                            fullWidth={true}
                        />
                    </Grid>
                    <Grid size={{xs: 3, lg: 2, xl: 2}}>
                        <Stack direction={"row"} alignItems={"center"}>
                            <Typography
                                variant={"body1"}
                                color={"primary"}
                            >
                                {t("word.workflowLabel")}
                            </Typography>
                            <Tooltip title={t("tooltip.workflowLabel")}>
                                <Info
                                    color={"primary"}
                                    fontSize={"small"}
                                    sx={{ml: 1, cursor: "pointer"}}
                                />
                            </Tooltip>
                        </Stack>
                    </Grid>
                    <Grid size={{xs: 9, lg: 10, xl: 10}}>
                        <TextField
                            value={workflow?.label ?? ""}
                            size={"small"}
                            disabled={true}
                            fullWidth={true}
                        />
                    </Grid>
                    <Grid size={{xs: 3, lg: 2, xl: 2}}>
                        <Stack direction={"row"} alignItems={"center"}>
                            <Typography
                                variant={"body1"}
                                color={"primary"}
                            >
                                {t("word.label")} *
                            </Typography>
                            <Tooltip title={t("tooltip.label")}>
                                <Info
                                    color={"primary"}
                                    fontSize={"small"}
                                    sx={{ml: 1, cursor: "pointer"}}
                                />
                            </Tooltip>
                        </Stack>
                    </Grid>
                    <Grid size={{xs: 9, lg: 10, xl: 10}}>
                        <TextField
                            value={executionLabel ?? ""}
                            size={"small"}
                            fullWidth={true}
                            onChange={(e) => updateExecutionLabel(e.target.value)}
                            required={true}
                            error={missingRequiredFields.includes('missingLabel')}
                            helperText={
                                missingRequiredFields.includes('missingLabel')
                                    ? t("word.required")
                                    : ""
                            }
                        />
                    </Grid>
                    <Grid size={{xs: 3, lg: 2, xl: 2}}>
                        <Stack direction={"row"} alignItems={"center"}>
                            <Typography
                                variant={"body1"}
                                color={"primary"}
                            >
                                {t("word.description")}
                            </Typography>
                            <Tooltip title={t("tooltip.description")}>
                                <Info
                                    color={"primary"}
                                    fontSize={"small"}
                                    sx={{ml: 1, cursor: "pointer"}}
                                />
                            </Tooltip>
                        </Stack>
                    </Grid>
                    <Grid size={{xs: 9, lg: 10, xl: 10}}>
                        <TextField
                            value={executionDescription ?? ""}
                            size={"small"}
                            fullWidth={true}
                            onChange={(e) => updateExecutionDescription(e.target.value)}
                        />
                    </Grid>
                </Grid>
                <Grid
                    paddingLeft={3}
                    paddingRight={3}
                    paddingBottom={3}
                    container={true}
                    spacing={1}
                >
                    <Grid pt={3}>
                        <Typography
                            variant={"h5"}
                        >
                            {t("word.startParameters")}
                            <Tooltip title={t("tooltip.startParameters")}>
                                <Info sx={{ml: 1, cursor: "pointer"}}/>
                            </Tooltip>
                        </Typography>
                    </Grid>
                    {
                        workflow?.blocks?.slice()
                            .sort((block1: BlockDetail, block2: BlockDetail) => {
                                if (block1.label && block2.label)
                                    return block1.label.localeCompare(block2.label)
                                else return 1
                            })
                            .filter((block: BlockDetail): boolean => {
                                return (
                                    block.inputs?.some((handle: InputDetail) =>
                                        handle.communicationType === InputCommunicationTypeEnum.EventStatic ||
                                        handle.communicationType === InputCommunicationTypeEnum.StepbasedStatic
                                    )
                                    ||
                                    block.outputs?.some((handle: OutputDetail) =>
                                        handle.communicationType === OutputCommunicationTypeEnum.EventStatic ||
                                        handle.communicationType === OutputCommunicationTypeEnum.StepbasedStatic
                                    )
                                ) ?? false;
                            })
                            .map((block: BlockDetail): ReactNode =>
                                <Grid
                                    size={12}
                                    key={block.id}
                                >
                                    <Paper
                                        elevation={0}
                                        sx={{padding: 3, borderRadius: 2}}
                                    >
                                        <Stack alignItems={"center"} direction={"row"} spacing={1}>
                                            <Typography
                                                variant="h6"
                                                color="primary"
                                                sx={{
                                                    overflow: "hidden",
                                                    textOverflow: "ellipsis",
                                                    whiteSpace: "nowrap",
                                                    flexShrink: 1,
                                                    minWidth: 0
                                                }}
                                            >
                                                {block.label}
                                            </Typography>
                                            <Typography
                                                variant="body1"
                                                color="textSecondary"
                                            >
                                                Index: {block.index}
                                            </Typography>
                                        </Stack>
                                        {
                                            block.inputs!.filter((handle: InputDetail): boolean | undefined => handle.communicationType?.includes("_STATIC")).length! > 0 &&
                                            <Box mt={3}>
                                                <Typography
                                                    variant="subtitle1"
                                                    color="secondary"
                                                    gutterBottom
                                                >
                                                    {t("word.requiredInputs")}
                                                    <Tooltip title={t("tooltip.requiredInputs")}>
                                                        <Info
                                                            sx={{ml: 1, cursor: "pointer"}}
                                                            fontSize={"small"}
                                                        />
                                                    </Tooltip>
                                                </Typography>
                                                <Divider sx={{marginBottom: 2}}/>
                                                {
                                                    block.inputs!.filter((handle: InputDetail): boolean | undefined => handle.communicationType?.includes("_STATIC") && handle.required)
                                                        .map(handle => <Handle key={handle.id} handle={handle}/>)
                                                }
                                                {
                                                    block.inputs!.filter((handle: InputDetail): boolean | undefined => handle.communicationType?.includes("_STATIC") && !handle.required).length! > 0 &&
                                                    <Accordion
                                                        expanded={expandedBlocks.has(block.id!)}
                                                        onChange={handleAccordionToggle(block.id!)}
                                                    >
                                                        <AccordionSummary
                                                            expandIcon={
                                                                <Tooltip
                                                                    title={expandedBlocks.has(block.id!)
                                                                        ? t("action.collapseOptionalInputs")
                                                                        : t("action.expandOptionalInputs")
                                                                    }
                                                                >
                                                                    <ArrowDownwardIcon/>
                                                                </Tooltip>
                                                            }
                                                        >
                                                            <Typography
                                                                variant="subtitle1"
                                                                color="secondary"
                                                                gutterBottom
                                                            >
                                                                {t("word.optionalInputs")}
                                                                <Tooltip title={t("tooltip.optionalInputs")}>
                                                                    <Info
                                                                        sx={{ml: 1, cursor: "pointer"}}
                                                                        fontSize={"small"}
                                                                    />
                                                                </Tooltip>
                                                            </Typography>
                                                        </AccordionSummary>
                                                        <AccordionDetails>
                                                            {
                                                                block.inputs!.filter((handle: InputDetail): boolean | undefined => handle.communicationType?.includes("_STATIC") && !handle.required)
                                                                    .map(handle => <Handle key={handle.id}
                                                                                           handle={handle}/>)
                                                            }
                                                        </AccordionDetails>
                                                    </Accordion>
                                                }
                                            </Box>
                                        }
                                    </Paper>
                                </Grid>
                            )}
                </Grid>
            </Paper>
        </Fragment>
    );
};

export default PreselectedStart;