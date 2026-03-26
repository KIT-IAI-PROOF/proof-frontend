import {Fragment, ReactNode, useContext} from "react";
import {FormControl, InputLabel, MenuItem, Paper, Select, SelectChangeEvent, Theme, useTheme} from "@mui/material";
import {WorkflowDetail} from "@webis/proof-config-manager-client";
import {IMonitoringContext} from "../../../provider/MonitoringProvider.tsx";
import {NavigateFunction, useNavigate} from "react-router-dom";
import Grid from "@mui/material/Grid2";
import {MonitoringContext} from "../../../provider/IMonitoringContext.tsx";

const UnselectedStart: () => ReactNode = (): ReactNode => {

    const {workflows} = useContext<IMonitoringContext>(MonitoringContext);
    const theme: Theme = useTheme();
    const navigate: NavigateFunction = useNavigate();

    return (
        <Fragment>
            <Paper
                elevation={0}
                style={{background: theme.palette.background.default}}>
                <Grid
                    padding={3}
                    container={true}>
                    <Grid size={12}>
                        <FormControl
                            color={"primary"}
                            fullWidth={true}
                            variant={"outlined"}
                            size={"small"}
                        >
                            <InputLabel id={"workflow-label"}>Workflow</InputLabel>
                            <Select
                                fullWidth={true}
                                autoWidth={true}
                                color={"primary"}
                                labelId="workflow-label"
                                id="workflow"
                                label="Workflow"
                                value={""}
                                disabled={workflows?.length === 0}
                                onChange={(event: SelectChangeEvent): void => {
                                    event.preventDefault();
                                    const selectedId: string = event.target.value;
                                    if (selectedId !== "") navigate(`/monitoring/execution/${selectedId}`);
                                }}
                                variant={"outlined"}
                                style={{minWidth: 150}}
                            >
                                return (
                                <MenuItem
                                    value={""}
                                >
                                    <i>Keine Auswahl</i>
                                </MenuItem>
                                {
                                    workflows?.map((workflow: WorkflowDetail): ReactNode => {
                                        return (
                                            <MenuItem
                                                key={workflow.id}
                                                value={workflow.id}
                                            >
                                                {workflow.label ?? workflow.id}
                                            </MenuItem>
                                        );
                                    })
                                }
                            </Select>
                        </FormControl>
                    </Grid>
                </Grid>
            </Paper>
        </Fragment>
    );

};

export default UnselectedStart;