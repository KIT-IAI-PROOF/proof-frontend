import {ReactNode, useCallback, useEffect, useMemo, useState} from 'react';
import {Checkbox, FormControlLabel, Paper, Stack, TextField, Theme, ToggleButton, ToggleButtonGroup, Typography, useTheme} from "@mui/material";
import {useTranslation} from "react-i18next";

interface IProps {
    block: any,
    setModifiedBlock: (block: any, attachmentsEnabled: boolean, textBaseName: string) => void
}

const PhaseSelector: ({block, setModifiedBlock}: IProps) => ReactNode = ({block, setModifiedBlock}: IProps): ReactNode => {

    const {t} = useTranslation();
    const theme: Theme = useTheme();
    const [selectedPhases, setSelectedPhases] = useState<any>({});
    const [requiredStates, setRequiredStates] = useState<any>({});
    const [attachmentsEnabled, setAttachmentsEnabled] = useState(false);
    const [textBaseName, setTextBaseName] = useState('');

    useEffect(() => {
        const initialPhases: any = {};
        const initialRequiredStates: any = {};
        block.inputs.concat(block.outputs).forEach((item: any) => {
            initialPhases[item.name] = item.phase || 'EXECUTE';
            if (item.required !== undefined) {
                initialRequiredStates[item.name] = item.required;
            }
        });
        setSelectedPhases(initialPhases);
        setRequiredStates(initialRequiredStates);
        const updatedBlock = {
            ...block,
            inputs: block.inputs.map((item: any) => {
                return {
                    ...item,
                    phase: item.phase || 'EXECUTE',
                    communicationType: item.communicationType || 'STEPBASED',
                };
            }),
            outputs: block.outputs.map((item: any) => {
                return {
                    ...item,
                    phase: item.phase || 'EXECUTE',
                    communicationType: item.communicationType || 'STEPBASED',
                };
            }),
        };
        setModifiedBlock(updatedBlock, attachmentsEnabled, textBaseName);
    }, [block, setModifiedBlock, attachmentsEnabled, textBaseName]);

    useEffect(() => {
        if (setModifiedBlock) {
            setModifiedBlock(block, attachmentsEnabled, textBaseName);
        }
    }, [block, setModifiedBlock, attachmentsEnabled, textBaseName]);

    const handlePhaseChange = useCallback((name: any, phase: any) => {
        const updatedBlock = {
            ...block,
            inputs: block.inputs.map((item: any) =>
                item.name === name ? {...item, phase, communicationType: phase === 'INIT' ? 'STEPBASED_STATIC' : phase === 'EXECUTE' ? 'STEPBASED' : 'STEPBASED'} : item
            ),
            outputs: block.outputs.map((item: any) =>
                item.name === name ? {...item, phase, communicationType: phase === 'INIT' ? 'STEPBASED_STATIC' : phase === 'EXECUTE' ? 'STEPBASED' : 'STEPBASED'} : item
            ),
        };
        setSelectedPhases((prevPhases: any) => ({...prevPhases, [name]: phase}));
        setModifiedBlock(updatedBlock, attachmentsEnabled, textBaseName);
    }, [block, setModifiedBlock, attachmentsEnabled, textBaseName]);

    const handleRequiredChange = useCallback((name: any, checked: any) => {
        const updatedBlock = {
            ...block,
            inputs: block.inputs.map((item: any) =>
                item.name === name ? {...item, required: checked} : item
            ),
            outputs: block.outputs,
        };
        setRequiredStates((prevStates: any) => ({...prevStates, [name]: checked}));
        setModifiedBlock(updatedBlock, attachmentsEnabled, textBaseName);
    }, [block, setModifiedBlock, attachmentsEnabled, textBaseName]);

    const handleCheckboxChange = (event: any) => {
        setAttachmentsEnabled(event.target.checked);
        const updatedBlock = {
            ...block,
            programId: `prog_${textBaseName}`,
        };
        setModifiedBlock(updatedBlock, event.target.checked, textBaseName);
    };

    const handleTextChange = (event: any) => {
        setTextBaseName(event.target.value);
        const programId = `prog_${event.target.value}`;
        const updatedBlock = {
            ...block,
            programId: programId,
        };

        setModifiedBlock(updatedBlock, attachmentsEnabled, event.target.value);
    };

    const memoizedSelectedPhases = useMemo(() => selectedPhases, [selectedPhases]);
    const memoizedRequiredStates = useMemo(() => requiredStates, [requiredStates]);

    return (
        <Stack spacing={1}>
            <Paper sx={{background: theme.palette.background.default}}>
                <Stack padding={2}>
                    <FormControlLabel
                        label={t("action.createAttachment")}
                        control={<Checkbox onChange={handleCheckboxChange}/>}
                    />
                    {attachmentsEnabled && (
                        <TextField
                            size={"small"}
                            placeholder={t("word.baseName")}
                            value={textBaseName}
                            onChange={handleTextChange}
                            style={{marginTop: '10px'}}
                        />
                    )}
                </Stack>
            </Paper>
            <Stack paddingTop={1} spacing={1}>
                {
                    block.inputs.concat(block.outputs).map((item: any, index: number) => {
                        return <Stack direction={"row"} justifyContent={"space-between"} key={index}>
                            <Typography>{item.name}</Typography>
                            <ToggleButtonGroup
                                color="primary"
                                exclusive
                                value={memoizedSelectedPhases[item.name]}
                                onChange={(e: any) => handlePhaseChange(item.name, e.target.value)}
                                aria-label="Platform"
                            >
                                <ToggleButton value="INIT">INIT</ToggleButton>
                                <ToggleButton value="EXECUTE">EXECUTE</ToggleButton>
                                <ToggleButton value="FINALIZE">FINALIZE</ToggleButton>
                            </ToggleButtonGroup>
                            {
                                item.required !== undefined &&
                                <FormControlLabel
                                    label={t("action.createAttachment")}
                                    control={
                                        <Checkbox
                                            checked={memoizedRequiredStates[item.name]}
                                            onChange={(e: any) => handleRequiredChange(item.name, e.target.checked)}
                                        />
                                    }
                                />
                            }
                        </Stack>
                    })
                }
            </Stack>
        </Stack>
    );
};

export default PhaseSelector;