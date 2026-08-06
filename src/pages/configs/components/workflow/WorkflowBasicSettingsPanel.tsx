import React, {ChangeEvent, Fragment, ReactNode, useContext} from "react";
import Grid from "@mui/material/Grid2";
import {FormControl, InputLabel, MenuItem, Select, SelectChangeEvent, Stack, TextField, Tooltip, Typography} from "@mui/material";
import {StepBasedConfigurationDetail, WorkflowDetailCommunicationParadigmEnum, WorkflowDetailSimulationStrategyEnum} from "@kit-iai-proof/proof-config-manager-client";
import {useTranslation} from "react-i18next";
import {Info} from "@mui/icons-material";
import {IAppContext} from "../../../../provider/AppProvider.tsx";
import {AppContext} from "../../../../provider/AppContext.tsx";
import dayjs from "dayjs";

interface IProps {
    id: string | undefined,
    label: string | undefined,
    labelError: boolean,
    description: string | undefined,
    communicationParadigm: WorkflowDetailCommunicationParadigmEnum | undefined,
    paradigmError: boolean,
    simulationStrategy: WorkflowDetailSimulationStrategyEnum | undefined,
    simulationStrategyError: boolean,
    stepBasedConfig: StepBasedConfigurationDetail | undefined,
    setId: (id: string) => void,
    setCommunicationParadigm: (communicationParadigm: WorkflowDetailCommunicationParadigmEnum) => void,
    setSimulationStrategy: (simulationStrategy: WorkflowDetailSimulationStrategyEnum) => void,
    setLabel: (label: string) => void,
    setDescription: (description: string) => void,
    modifiedBy: string | undefined,
    modifiedDate: Date | undefined,
    createdBy: string | undefined,
    creationDate: Date | undefined,
}

const WorkflowBasicSettingsPanel: ({
                                       id,
                                       setId,
                                       description,
                                       setDescription,
                                       simulationStrategy,
                                       simulationStrategyError,
                                       setSimulationStrategy,
                                       label,
                                       labelError,
                                       setLabel,
                                       communicationParadigm,
                                       paradigmError,
                                       setCommunicationParadigm,
                                       modifiedBy,
                                       modifiedDate,
                                       createdBy,
                                       creationDate,

                                   }: IProps)
    => ReactNode = ({
                        id,
                        setId,
                        description,
                        setDescription,
                        simulationStrategy,
                        simulationStrategyError,
                        setSimulationStrategy,
                        label,
                        labelError,
                        setLabel,
                        communicationParadigm,
                        paradigmError,
                        setCommunicationParadigm,
                        modifiedBy,
                        modifiedDate,
                        createdBy,
                        creationDate,
                    }: IProps): ReactNode => {

    const {t} = useTranslation();
    const {hasUnsavedChanges, updateHasUnsavedChanges} = useContext<IAppContext>(AppContext);

    return (
        <Fragment>
            <Grid
                container={true}
                padding={1}
                paddingTop={5}
                spacing={2}
                paddingBottom={5}
            >
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
                        disabled={true}
                        fullWidth={true}
                        value={id ?? ""}
                        size={"small"}
                        label={t("word.id")}
                        variant="outlined"
                        onChange={(event: ChangeEvent<HTMLTextAreaElement | HTMLInputElement>): void => {
                            const id: string = event.target.value;
                            setId(id);
                        }}/>
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
                        required={true}
                        fullWidth={true}
                        value={label ?? ""}
                        size={"small"}
                        label={t("word.label")}
                        variant="outlined"
                        error={labelError}
                        helperText={labelError ? t("word.required") : ""}
                        onChange={(event: ChangeEvent<HTMLTextAreaElement | HTMLInputElement>): void => {
                            const label: string = event.target.value;
                            setLabel(label);
                            if (!hasUnsavedChanges) updateHasUnsavedChanges(true)
                        }}/>
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
                        fullWidth={true}
                        value={description ?? ""}
                        size={"small"}
                        label={t("word.description")}
                        variant="outlined"
                        onChange={(event: ChangeEvent<HTMLTextAreaElement | HTMLInputElement>): void => {
                            const description: string = event.target.value;
                            setDescription(description);
                            if (!hasUnsavedChanges) updateHasUnsavedChanges(true)
                        }}/>
                </Grid>
                <Grid size={{xs: 3, lg: 2, xl: 2}}>
                    <Stack direction={"row"} alignItems={"center"}>
                        <Typography
                            variant={"body1"}
                            color={"primary"}
                        >
                            {t("word.communicationParadigm")} *
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
                <Grid size={{xs: 9, lg: 10, xl: 10}}>
                    <FormControl
                        required={true}
                        color={"primary"}
                        fullWidth={true}
                        variant={"outlined"}
                        size={"small"}
                    >
                        <InputLabel
                            id={"communicationParadigm-label"}>{t("word.communicationParadigm")}</InputLabel>
                        <Select
                            fullWidth={true}
                            color={"primary"}
                            labelId="communicationParadigm-label"
                            id="communicationParadigm"
                            label={t("word.communicationParadigm")}
                            value={communicationParadigm ?? ""}
                            variant={"outlined"}
                            error={paradigmError}
                            onChange={(event: SelectChangeEvent<WorkflowDetailCommunicationParadigmEnum>): void => {
                                const communicationParadigm: WorkflowDetailCommunicationParadigmEnum = event.target.value as WorkflowDetailCommunicationParadigmEnum;
                                setCommunicationParadigm(communicationParadigm);
                                if (!hasUnsavedChanges) updateHasUnsavedChanges(true)
                            }}
                        >
                            <MenuItem
                                key={WorkflowDetailCommunicationParadigmEnum.Stepbased}
                                value={WorkflowDetailCommunicationParadigmEnum.Stepbased}
                            >
                                {WorkflowDetailCommunicationParadigmEnum.Stepbased}
                            </MenuItem>
                            {/* <MenuItem
                                key={WorkflowDetailCommunicationParadigmEnum.Event}
                                value={WorkflowDetailCommunicationParadigmEnum.Event}
                            >
                                {WorkflowDetailCommunicationParadigmEnum.Event}
                            </MenuItem> */}
                        </Select>
                        {paradigmError && (
                            <Typography paddingLeft={2} paddingTop={0.5} variant="caption" color="error">
                                {t("word.required")}
                            </Typography>
                        )}
                    </FormControl>
                </Grid>
                <Grid size={{xs: 3, lg: 2, xl: 2}}>
                    <Stack direction={"row"} alignItems={"center"}>
                        <Typography
                            variant={"body1"}
                            color={"primary"}
                        >
                            {t("word.simulationStrategy")} *
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
                <Grid size={{xs: 9, lg: 10, xl: 10}}>
                    <FormControl
                        required={true}
                        color={"primary"}
                        fullWidth={true}
                        variant={"outlined"}
                        size={"small"}
                    >
                        <InputLabel id={"simulationStrategy-label"}>{t("word.simulationStrategy")}</InputLabel>
                        <Select
                            fullWidth={true}
                            color={"primary"}
                            labelId="simulationStrategy-label"
                            id="simulationStrategy"
                            label={t("word.simulationStrategy")}
                            value={simulationStrategy ?? ""}
                            variant={"outlined"}
                            error={simulationStrategyError}
                            onChange={(event: SelectChangeEvent<WorkflowDetailSimulationStrategyEnum>): void => {
                                const simulationStrategy: WorkflowDetailSimulationStrategyEnum = event.target.value as WorkflowDetailSimulationStrategyEnum;
                                setSimulationStrategy(simulationStrategy);
                                if (!hasUnsavedChanges) updateHasUnsavedChanges(true)
                            }}
                        >
                            {/*
                            <MenuItem
                                key={WorkflowDetailSimulationStrategyEnum.Abort}
                                value={WorkflowDetailSimulationStrategyEnum.Abort}
                            >
                                {WorkflowDetailSimulationStrategyEnum.Abort}
                            </MenuItem>
                            <MenuItem
                                key={WorkflowDetailSimulationStrategyEnum.Latest}
                                value={WorkflowDetailSimulationStrategyEnum.Latest}
                            >
                                {WorkflowDetailSimulationStrategyEnum.Latest}
                            </MenuItem>
                            <MenuItem
                                key={WorkflowDetailSimulationStrategyEnum.Ignore}
                                value={WorkflowDetailSimulationStrategyEnum.Ignore}
                            >
                                {WorkflowDetailSimulationStrategyEnum.Ignore}
                            </MenuItem>
                            */}
                            <MenuItem
                                key={WorkflowDetailSimulationStrategyEnum.WaitAndContinue}
                                value={WorkflowDetailSimulationStrategyEnum.WaitAndContinue}
                            >
                                {WorkflowDetailSimulationStrategyEnum.WaitAndContinue}
                            </MenuItem>
                            {/*
                            <MenuItem
                                key={WorkflowDetailSimulationStrategyEnum.WaitAndRetry}
                                value={WorkflowDetailSimulationStrategyEnum.WaitAndRetry}
                            >
                                {WorkflowDetailSimulationStrategyEnum.WaitAndRetry}
                            </MenuItem>
                            */}
                        </Select>
                        {simulationStrategyError && (
                            <Typography paddingLeft={2} paddingTop={0.5} variant="caption" color="error">
                                {t("word.required")}
                            </Typography>
                        )}
                    </FormControl>
                </Grid>
                <Grid size={{xs: 3, lg: 2, xl: 2}}>
                    <Stack direction={"row"} alignItems={"center"}>
                        <Typography
                            variant={"body1"}
                            color={"primary"}
                        >
                            {t("word.lastModifiedBy")}
                        </Typography>
                        <Tooltip title={t("tooltip.lastModifiedBy")}>
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
                        fullWidth={true}
                        value={modifiedBy ?? ""}
                        size={"small"}
                        label={t("word.lastModifiedBy")}
                        variant="outlined"
                        disabled/>
                </Grid>
                <Grid size={{xs: 3, lg: 2, xl: 2}}>
                    <Stack direction={"row"} alignItems={"center"}>
                        <Typography
                            variant={"body1"}
                            color={"primary"}
                        >
                            {t("word.lastModifiedDate")}
                        </Typography>
                        <Tooltip title={t("tooltip.lastModifiedDate")}>
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
                        fullWidth={true}
                        value={modifiedDate ? dayjs.unix(Number(modifiedDate)).format("DD.MM.YYYY HH:mm [Uhr]") : ""}
                        size={"small"}
                        label={t("word.lastModifiedDate")}
                        variant="outlined"
                        disabled/>
                </Grid>
                <Grid size={{xs: 3, lg: 2, xl: 2}}>
                    <Stack direction={"row"} alignItems={"center"}>
                        <Typography
                            variant={"body1"}
                            color={"primary"}
                        >
                            {t("word.createdBy")}
                        </Typography>
                        <Tooltip title={t("tooltip.createdBy")}>
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
                        fullWidth={true}
                        value={createdBy ?? ""}
                        size={"small"}
                        label={t("word.createdBy")}
                        variant="outlined"
                        disabled/>
                </Grid>
                <Grid size={{xs: 3, lg: 2, xl: 2}}>
                    <Stack direction={"row"} alignItems={"center"}>
                        <Typography
                            variant={"body1"}
                            color={"primary"}
                        >
                            {t("word.creationDate")}
                        </Typography>
                        <Tooltip title={t("tooltip.creationDate")}>
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
                        fullWidth={true}
                        value={creationDate ? dayjs.unix(Number(creationDate)).format("DD.MM.YYYY HH:mm [Uhr]") : ""}
                        size={"small"}
                        label={t("word.creationDate")}
                        variant="outlined"
                        disabled/>
                </Grid>

            </Grid>
        </Fragment>
    );

}

export default React.memo(WorkflowBasicSettingsPanel);