import {Handle, NodeProps, Position} from "@xyflow/react";
import {Fragment, memo, ReactNode, useContext, useEffect, useState} from "react";
import {Box, Stack, Theme, Tooltip, Typography, useTheme} from "@mui/material";
import {TBlock} from "../../../model/TBlock.ts";
import {darken, lighten} from "@mui/material/styles";
import {getTypeBorder, getTypeColor} from "../../../utils/palette.ts";
import {BlockDetail, InputDetail, OutputDetail} from "@kit-iai-proof/proof-config-manager-client";
import CodeMirror from "@uiw/react-codemirror";
import {oneDark} from "@codemirror/theme-one-dark";
import {githubLight} from '@uiw/codemirror-theme-github';
import {json} from "@codemirror/lang-json";
import {useTranslation} from "react-i18next";
import {Info} from "@mui/icons-material";
import {IEditorContext} from "../../../provider/EditorProvider.tsx";
import {EditorContext} from "../../../provider/IEditorContext.tsx";
import {IAppContext} from "../../../provider/AppProvider.tsx";
import {AppContext} from "../../../provider/AppContext.tsx";

const Node = memo(({data, id, selected, height, width}: NodeProps<TBlock>): ReactNode => {

    const theme: Theme = useTheme();
    const {t} = useTranslation();
    const {palette} = useContext<IAppContext>(AppContext);
    const {
        isConnecting,
        outdatedBlocks,
        changedBlocks,
        differingParameters
    } = useContext<IEditorContext>(EditorContext);
    const [tooltipOpenMap, setTooltipOpenMap] = useState<Record<string, boolean>>({});

    const handleTooltipOpen = (id: string) => {
        setTooltipOpenMap(prev => ({...prev, [id]: true}));
    };

    const handleTooltipClose = (id: string) => {
        setTooltipOpenMap(prev => ({...prev, [id]: false}));
    };

    useEffect(() => {
        if (isConnecting) {
            setTooltipOpenMap({});
        }
    }, [isConnecting]);

    return (
        <Fragment>
            <div
                key={`node-${id}`}
                style={{
                    width: width,
                    height: height,
                    background: lighten(data.color ?? theme.palette.background.paper, 0.5),
                    borderColor: selected ? lighten(data.color ?? theme.palette.background.paper, 0.6) : lighten(data.color ?? theme.palette.background.paper, 0.2),
                    borderStyle: "solid",
                    borderWidth: "2px",
                    borderRadius: "5px",
                    opacity: 0.95
                }}
            >
                {/*<NodeResizer*/}
                {/*    minWidth={data.minWidth}*/}
                {/*    minHeight={data.minHeight}*/}
                {/*    color={lighten(data.color ?? theme.palette.background.paper, 0.5)}*/}
                {/*    handleStyle={{*/}
                {/*        width: "10px",*/}
                {/*        height: "10px"*/}
                {/*    }}*/}
                {/*    isVisible={selected}*/}
                {/*/>*/}
                <Stack
                    padding={"5px"}
                    direction={"column"}
                    alignItems={"start"}
                    style={{cursor: "pointer"}}
                >
                    <Stack
                        width={"100%"}
                        direction={"row"}
                        spacing={1}
                    >
                        {
                            (outdatedBlocks && outdatedBlocks.find((block: BlockDetail) => block.id === data.id) ||
                                changedBlocks && changedBlocks.find((block: BlockDetail) => block.id === data.id)) &&
                            <Tooltip
                                title={
                                    <Stack>
                                        {outdatedBlocks && outdatedBlocks.find((block: BlockDetail) => block.id === data.id) &&
                                            <Typography
                                                sx={{color: data.textColor ?? "#ffffff"}}
                                            >
                                                {t("word.blockOutdated")}
                                            </Typography>
                                        }
                                        {changedBlocks && changedBlocks.find((block: BlockDetail) => block.id === data.id) &&
                                            <Typography
                                                sx={{color: data.textColor ?? "#ffffff"}}
                                            >
                                                {t('tooltip.blockChanged', {
                                                    parameters: differingParameters
                                                })}
                                            </Typography>
                                        }
                                    </Stack>
                                }
                            >
                                <Info fontSize="inherit"/>
                            </Tooltip>
                        }
                        <Typography
                            variant={"body1"}
                            sx={{color: data.textColor ?? "#ffffff"}}
                            title={data.label}
                            noWrap={true}
                            textOverflow={"ellipsis"}
                            overflow={"hidden"}
                            fontSize={"10px"}
                        >
                            {data.label}
                        </Typography>
                    </Stack>
                    <Typography
                        variant={"body2"}
                        noWrap={true}
                        sx={{color: data.textColor ?? "#ffffff"}}
                        color={"textSecondary"}
                        textOverflow={"ellipsis"}
                        overflow={"hidden"}
                        fontSize={"8px"}
                    >
                        Index: {data.index}
                    </Typography>
                </Stack>
                <Box
                    paddingTop={"35px"}
                    paddingBottom={"5px"}
                    sx={{color: data.textColor ?? "#ffffff"}}
                    className="handles targets"
                >
                    {
                        data.inputs?.sort((a, b) => (a.label ?? "").localeCompare((b.label ?? "")))
                            .map((handle: InputDetail): false | ReactNode => (
                                (!handle.communicationType || !handle.communicationType.toString().includes("STATIC")) &&
                                <Stack
                                    key={handle.id}
                                    marginLeft={"-8px"}
                                    width={"90px"}
                                    spacing={"3px"}
                                    alignItems={"center"}
                                    justifyContent={"center"}
                                    direction={"row"}
                                >
                                    <Tooltip

                                        open={tooltipOpenMap[handle.id!] ?? false}
                                        onOpen={() => handleTooltipOpen(handle.id!)}
                                        onClose={() => handleTooltipClose(handle.id!)}
                                        disableHoverListener={isConnecting}
                                        title={
                                            <CodeMirror
                                                value={JSON.stringify({
                                                    label: handle.label,
                                                    description: handle.description ?? "",
                                                    type: handle.type,
                                                    unit: handle.unit ?? "",
                                                    required: handle.required,
                                                    modelVarName: handle.modelVarName
                                                }, null, 2)}
                                                extensions={[json()]}
                                                readOnly={true}
                                                onClick={(event): void => {
                                                    event.stopPropagation()
                                                }}
                                                theme={theme.palette.mode === "dark" ? oneDark : githubLight}
                                            />
                                        }
                                        placement="left"
                                        arrow
                                        slotProps={{
                                            tooltip: {
                                                sx: {
                                                    minWidth: '380px',
                                                    bgcolor: darken(theme.palette.background.paper, 0.1)
                                                },
                                            },
                                        }}
                                    >
                                        <Handle
                                            key={handle.id}
                                            id={handle.id}
                                            type="target"
                                            position={Position.Left}
                                            style={{
                                                backgroundColor: getTypeColor(handle.type, palette),
                                                border: getTypeBorder(handle.type, palette)
                                            }}
                                        >
                                        </Handle>
                                    </Tooltip>
                                    <Typography
                                        variant={"body2"}
                                        sx={{
                                            overflow: "hidden",
                                            wordWrap: "normal",
                                            textOverflow: "ellipsis",
                                            maxWidth: "20ch",
                                            minWidth: "20ch",
                                            lineHeight: 1.2,
                                        }}
                                        fontSize={"6px"}
                                    >
                                        {handle.label}
                                    </Typography>
                                </Stack>
                            ))}
                </Box>
                <Box
                    paddingTop={"35px"}
                    paddingBottom={"5px"}
                    sx={{color: data.textColor ?? "#ffffff"}}
                    className="handles sources"
                >
                    {
                        data.outputs?.sort((a, b) => (a.label ?? "").localeCompare((b.label ?? "")))
                            .map((handle: OutputDetail): false | ReactNode => (
                                (!handle.communicationType || !handle.communicationType.toString().includes("STATIC")) &&
                                <Stack
                                    key={handle.id}
                                    marginLeft={"-73px"}
                                    width={"90px"}
                                    spacing={"3px"}
                                    alignItems={"center"}
                                    justifyContent={"center"}
                                    direction={"row-reverse"}
                                >
                                    <Tooltip
                                        key={handle.id}
                                        open={tooltipOpenMap[handle.id!] ?? false}
                                        onOpen={() => handleTooltipOpen(handle.id!)}
                                        onClose={() => handleTooltipClose(handle.id!)}
                                        disableHoverListener={isConnecting}
                                        title={
                                            <CodeMirror
                                                value={JSON.stringify({
                                                    label: handle.label,
                                                    description: handle.description ?? "",
                                                    type: handle.type,
                                                    unit: handle.unit ?? "",
                                                    modelVarName: handle.modelVarName
                                                }, null, 2)}
                                                extensions={[json()]}
                                                readOnly={true}
                                                onClick={(event): void => {
                                                    event.stopPropagation()
                                                }}
                                                theme={theme.palette.mode === "dark" ? oneDark : githubLight}
                                            />
                                        }
                                        placement="right"
                                        arrow={true}
                                        slotProps={{
                                            tooltip: {
                                                sx: {
                                                    minWidth: '380px',
                                                    bgcolor: darken(theme.palette.background.paper, 0.1)
                                                },
                                            },
                                        }}
                                    >
                                        <Handle
                                            key={handle.id}
                                            id={handle.id}
                                            position={Position.Right}
                                            type="source"
                                            style={{
                                                backgroundColor: getTypeColor(handle.type, palette),
                                                border: getTypeBorder(handle.type, palette)
                                            }}
                                        />
                                    </Tooltip>
                                    <Typography
                                        textAlign={"right"}
                                        variant={"body2"}
                                        sx={{
                                            overflow: "hidden",
                                            wordWrap: "normal",
                                            textOverflow: "ellipsis",
                                            width: "grow",
                                            maxWidth: "20ch",
                                            minWidth: "20ch",
                                            lineHeight: 1.2,
                                        }}
                                        fontSize={"6px"}
                                    >
                                        {handle.label}
                                    </Typography>
                                </Stack>
                            ))}
                </Box>
            </div>
        </Fragment>
    );

});

Node.displayName = "Node";
export default Node;