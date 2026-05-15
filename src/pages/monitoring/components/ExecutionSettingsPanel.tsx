import {
    Accordion,
    AccordionDetails,
    AccordionSummary,
    Paper,
    Stack,
    Theme,
    Tooltip,
    Typography,
    useTheme
} from "@mui/material";
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import Grid from "@mui/material/Grid2";
import {Fragment, ReactNode} from "react";
import {ExecutionDetail, InputDetail} from "@kit-iai-proof/proof-config-manager-client";
import {useTranslation} from "react-i18next";
import {Info} from "@mui/icons-material";
import Progress from "./Progress.tsx";

interface IProps {
    execution: ExecutionDetail
}

const ExecutionSettingsPanel: ({execution}: IProps) => ReactNode = ({execution}: IProps): ReactNode => {
    const theme: Theme = useTheme();
    const {t} = useTranslation();

    const staticInputs: { [blockId: string]: InputDetail[] }[] = execution.workflow?.blocks?.map((block) => ({
            [block.label!]: block.inputs?.filter((input) => input.communicationType?.includes("STATIC") && execution.appliedInputs && Object.keys(execution.appliedInputs!).includes(input.id!)) || []
        })
    ) || []

    return (
        <Fragment>
            <Grid
                paddingX={2}
                container={true}
                spacing={2}
            >
                <Grid
                    size={{xs: 12, lg: 6}}
                    alignContent="flex-start"
                >
                    <Accordion sx={{background: theme.palette.background.default}}>
                        <AccordionSummary
                            expandIcon={<ExpandMoreIcon/>}
                        >
                            <Grid size={12}>
                                <Typography
                                    variant={"h3"}
                                >
                                    {t("word.executionDetails")}
                                    <Tooltip title={t("tooltip.executionDetails")}>
                                        <Info
                                            color={"primary"}
                                            fontSize={"small"}
                                            sx={{ml: 1, cursor: "pointer"}}
                                        />
                                    </Tooltip>
                                </Typography>
                            </Grid>
                        </AccordionSummary>
                        <AccordionDetails>
                            <Grid container={true} paddingX={1} spacing={1}>
                                <Grid size={4}>
                                    <Stack
                                        direction={"row"}
                                        alignItems={"center"}
                                    >
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
                                <Grid size={8}>
                                    <Typography
                                        variant={"body1"}
                                    >
                                        {execution?.id}
                                    </Typography>
                                </Grid>
                                <Grid size={4}>
                                    <Stack
                                        direction={"row"}
                                        alignItems={"center"}
                                    >
                                        <Typography
                                            variant={"body1"}
                                            color={"primary"}
                                        >
                                            {t("word.label")}
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
                                <Grid size={8}>
                                    <Typography
                                        variant={"body1"}
                                    >
                                        {execution?.label}
                                    </Typography>
                                </Grid>
                                <Grid size={4}>
                                    <Stack
                                        direction={"row"}
                                        alignItems={"center"}
                                    >
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
                                <Grid size={8}>
                                    <Typography
                                        variant={"body1"}>
                                        {execution?.description}
                                    </Typography>
                                </Grid>
                                <Grid size={4}>
                                    <Stack
                                        direction={"row"}
                                        alignItems={"center"}
                                    >
                                        <Typography
                                            variant={"body1"}
                                            color={"primary"}
                                        >
                                            {t("word.status")}

                                        </Typography>
                                        <Tooltip title={t("tooltip.status")}>
                                            <Info
                                                color={"primary"}
                                                fontSize={"small"}
                                                sx={{ml: 1, cursor: "pointer"}}
                                            />
                                        </Tooltip>
                                    </Stack>
                                </Grid>
                                <Grid size={8}>
                                    <Typography
                                        variant={"body1"}
                                    >
                                        {execution?.status}
                                    </Typography>
                                </Grid>
                                <Grid size={4}>
                                    <Stack
                                        direction={"row"}
                                        alignItems={"center"}
                                    >
                                        <Typography
                                            variant={"body1"}
                                            color={"primary"}
                                        >
                                            {t("word.startedAt")}

                                        </Typography>
                                        <Tooltip title={t("tooltip.startedAt")}>
                                            <Info
                                                color={"primary"}
                                                fontSize={"small"}
                                                sx={{ml: 1, cursor: "pointer"}}
                                            />
                                        </Tooltip>
                                    </Stack>
                                </Grid>
                                <Grid size={8}>
                                    <Typography
                                        variant={"body1"}
                                    >
                                        {execution?.startedAt && new Date(execution.startedAt).toLocaleString("de-DE")}
                                    </Typography>
                                </Grid>
                                <Grid size={4}>
                                    <Stack
                                        direction={"row"}
                                        alignItems={"center"}
                                    >
                                        <Typography
                                            variant={"body1"}
                                            color={"primary"}
                                        >
                                            {t("word.stoppedAt")}

                                        </Typography>
                                        <Tooltip title={t("tooltip.stoppedAt")}>
                                            <Info
                                                color={"primary"}
                                                fontSize={"small"}
                                                sx={{ml: 1, cursor: "pointer"}}
                                            />
                                        </Tooltip>
                                    </Stack>
                                </Grid>
                                <Grid size={8}>
                                    <Typography
                                        variant={"body1"}
                                    >
                                        {execution?.stoppedAt ? new Date(execution.stoppedAt).toLocaleString("de-DE") : t('word.notStopped')}
                                    </Typography>
                                </Grid>
                                <Grid size={12} paddingTop={1}>
                                    <Accordion sx={{background: theme.palette.background.paper}}>
                                        <AccordionSummary
                                            expandIcon={<ExpandMoreIcon/>}
                                        >
                                            <Stack direction={"row"} alignItems={"center"}>
                                                <Typography variant={"h3"}>
                                                    {t("word.staticInputs")}
                                                </Typography>
                                                <Tooltip title={t("tooltip.staticInputs")}>
                                                    <Info
                                                        color={"primary"}
                                                        fontSize={"small"}
                                                        sx={{ml: 1, cursor: "pointer"}}
                                                    />
                                                </Tooltip>
                                            </Stack>
                                        </AccordionSummary>
                                        <AccordionDetails>
                                            {Object.keys(execution.appliedInputs!).length === 0 ?
                                                <Typography>
                                                    {t("word.noStaticInputs")}
                                                </Typography>
                                                :
                                                staticInputs.map((block: {
                                                    [blockId: string]: InputDetail[]
                                                }): ReactNode[] =>
                                                    Object.entries(block)
                                                        .map(([blockLabel, inputs]: [string, InputDetail[]]): ReactNode =>
                                                            inputs.length > 0 &&
                                                            <Paper key={blockLabel} elevation={1}>
                                                                <Grid
                                                                    container={true}
                                                                    marginBottom={1}
                                                                    padding={2}
                                                                >
                                                                    <Grid size={12}>
                                                                        <Stack direction={"row"}
                                                                               alignItems={"center"}>
                                                                            <Typography
                                                                                variant={"body1"}
                                                                                color={"primary"}
                                                                                sx={{
                                                                                    overflow: "hidden",
                                                                                    textOverflow: "ellipsis",
                                                                                    whiteSpace: "nowrap",
                                                                                    flexShrink: 1,
                                                                                    minWidth: 0
                                                                                }}
                                                                            >
                                                                                {blockLabel}
                                                                            </Typography>
                                                                            <Tooltip
                                                                                title={t("tooltip.blockLabel")}
                                                                            >
                                                                                <Info
                                                                                    color={"primary"}
                                                                                    fontSize={"small"}
                                                                                    sx={{ml: 1, cursor: "pointer"}}
                                                                                />
                                                                            </Tooltip>
                                                                        </Stack>
                                                                    </Grid>
                                                                    {inputs.map((input: InputDetail, index: number): ReactNode =>
                                                                        <Fragment key={index}>
                                                                            <Grid paddingLeft={2} size={5}>
                                                                                <Stack
                                                                                    direction={"row"}
                                                                                    alignItems={"center"}
                                                                                >
                                                                                    <Typography
                                                                                        variant={"body1"}
                                                                                        color={"primary"}
                                                                                        sx={{
                                                                                            overflow: "hidden",
                                                                                            textOverflow: "ellipsis",
                                                                                            whiteSpace: "nowrap",
                                                                                            flexShrink: 1,
                                                                                            minWidth: 0
                                                                                        }}
                                                                                    >
                                                                                        {input.label}
                                                                                    </Typography>
                                                                                    <Tooltip
                                                                                        title={input.description + (input.unit ? `\n${t("word.unit")}: ${input.unit}` : "")}
                                                                                    >
                                                                                        <Info
                                                                                            color={"primary"}
                                                                                            fontSize={"small"}
                                                                                            sx={{
                                                                                                ml: 1,
                                                                                                cursor: "pointer"
                                                                                            }}
                                                                                        />
                                                                                    </Tooltip>
                                                                                </Stack>
                                                                            </Grid>
                                                                            <Grid size={7} paddingLeft={1}>
                                                                                <Stack
                                                                                    direction={"row"}
                                                                                    alignItems={"center"}
                                                                                    spacing={1}
                                                                                >
                                                                                    <Typography variant={"body1"}>
                                                                                        {Object.entries(execution.appliedInputs!).find(([key]: [string, string]): boolean => input.id === key)?.[1]}
                                                                                    </Typography>
                                                                                    <Typography variant={"body2"}>
                                                                                        {input.unit ? input.unit : ""}
                                                                                    </Typography>
                                                                                    <Tooltip
                                                                                        title={t("tooltip.inputValue")}
                                                                                    >
                                                                                        <Info
                                                                                            color={"primary"}
                                                                                            fontSize={"small"}
                                                                                            sx={{cursor: "pointer"}}
                                                                                        />
                                                                                    </Tooltip>
                                                                                </Stack>
                                                                            </Grid>
                                                                        </Fragment>
                                                                    )}
                                                                </Grid>
                                                            </Paper>
                                                        ))}
                                        </AccordionDetails>
                                    </Accordion>
                                </Grid>
                            </Grid>
                        </AccordionDetails>
                    </Accordion>
                </Grid>
                <Grid
                    container={true}
                    size={{xs: 12, lg: 6}}
                    alignContent="flex-start"
                >
                    <Accordion sx={{background: theme.palette.background.default}}>
                        <AccordionSummary
                            expandIcon={<ExpandMoreIcon/>}
                        >
                            <Grid size={12}>
                                <Typography
                                    variant={"h3"}
                                >
                                    {t("word.executionWorkflow")}
                                    <Tooltip title={t("tooltip.executionWorkflow")}>
                                        <Info
                                            color={"primary"}
                                            fontSize={"small"}
                                            sx={{ml: 1, cursor: "pointer"}}
                                        />
                                    </Tooltip>
                                </Typography>
                            </Grid>
                        </AccordionSummary>
                        <AccordionDetails>
                            <Grid container={true} paddingX={1} spacing={1}>
                                <Grid size={4}>
                                    <Stack
                                        direction={"row"}
                                        alignItems={"center"}
                                    >
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
                                <Grid size={8}>
                                    <Typography
                                        variant={"body1"}>
                                        {execution?.workflow?.label ?? t("word.unknownWorkflow")}
                                    </Typography>
                                </Grid>
                                <Grid size={4}>
                                    <Stack
                                        direction={"row"}
                                        alignItems={"center"}
                                    >
                                        <Typography
                                            variant={"body1"}
                                            color={"primary"}
                                        >
                                            {t("word.communicationParadigm")}

                                        </Typography>
                                        <Tooltip title={t("tooltip.communicationParadigm")}>
                                            <Info
                                                color={"primary"}
                                                fontSize={"small"}
                                                sx={{ml: 1, cursor: "pointer"}}
                                            />
                                        </Tooltip>
                                    </Stack>

                                </Grid>
                                <Grid size={8}>
                                    <Typography variant={"body1"}>
                                        {execution?.workflow?.communicationParadigm ?? ""}
                                    </Typography>
                                </Grid>
                                <Grid size={4}>
                                    <Stack
                                        direction={"row"}
                                        alignItems={"center"}
                                    >
                                        <Typography
                                            variant={"body1"}
                                            color={"primary"}
                                        >
                                            {t("word.simulationStrategy")}

                                        </Typography>
                                        <Tooltip title={t("tooltip.simulationStrategy")}>
                                            <Info
                                                color={"primary"}
                                                fontSize={"small"}
                                                sx={{ml: 1, cursor: "pointer"}}
                                            />
                                        </Tooltip>
                                    </Stack>
                                </Grid>
                                <Grid size={8}>
                                    <Typography variant={"body1"}>
                                        {execution.workflow?.simulationStrategy ?? ""}
                                    </Typography>
                                </Grid>
                                <Grid size={4}>
                                    <Stack
                                        direction={"row"}
                                        alignItems={"center"}
                                    >
                                        <Typography
                                            variant={"body1"}
                                            color={"primary"}
                                        >
                                            {t("word.startTime")}

                                        </Typography>
                                        <Tooltip title={t("tooltip.startTime")}>
                                            <Info
                                                color={"primary"}
                                                fontSize={"small"}
                                                sx={{ml: 1, cursor: "pointer"}}
                                            />
                                        </Tooltip>
                                    </Stack>
                                </Grid>
                                <Grid size={8}>
                                    <Typography variant={"body1"}>
                                        {execution.workflow?.stepBasedConfig?.startTime ?? ""}
                                    </Typography>
                                </Grid>
                                <Grid size={4}>
                                    <Stack
                                        direction={"row"}
                                        alignItems={"center"}
                                    >
                                        <Typography
                                            variant={"body1"}
                                            color={"primary"}
                                        >
                                            {t("word.endTime")}

                                        </Typography>
                                        <Tooltip title={t("tooltip.endTime")}>
                                            <Info
                                                color={"primary"}
                                                fontSize={"small"}
                                                sx={{ml: 1, cursor: "pointer"}}
                                            />
                                        </Tooltip>
                                    </Stack>
                                </Grid>
                                <Grid size={8}>
                                    <Typography variant={"body1"}>
                                        {execution.workflow?.stepBasedConfig?.endTime ?? ""}
                                    </Typography>
                                </Grid>
                                <Grid size={4}>
                                    <Stack
                                        direction={"row"}
                                        alignItems={"center"}
                                    >
                                        <Typography
                                            variant={"body1"}
                                            color={"primary"}
                                        >
                                            {t("word.duration")}

                                        </Typography>
                                        <Tooltip title={t("tooltip.duration")}>
                                            <Info
                                                color={"primary"}
                                                fontSize={"small"}
                                                sx={{ml: 1, cursor: "pointer"}}
                                            />
                                        </Tooltip>
                                    </Stack>
                                </Grid>
                                <Grid size={8}>
                                    <Typography variant={"body1"}>
                                        {execution.workflow?.stepBasedConfig?.duration ?? ""}
                                    </Typography>
                                </Grid>
                            </Grid></AccordionDetails>
                    </Accordion>
                </Grid>
            </Grid>
            <Progress execution={execution}/>
        </Fragment>
    )
}

export default ExecutionSettingsPanel;