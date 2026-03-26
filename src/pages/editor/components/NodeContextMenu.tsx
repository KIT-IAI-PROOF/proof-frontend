import {Menu, MenuItem, PopoverPosition} from "@mui/material";
import {useTranslation} from "react-i18next";
import {Fragment, ReactNode, useContext, useEffect, useState} from "react";
import ConfirmDialog from "../../../app/components/ConfirmDialog.tsx";
import {EditorContext} from "../../../provider/IEditorContext.tsx";
import {BlockDetail, TemplateDetail} from "@webis/proof-config-manager-client";
import {useBlocks} from "../../../hooks/storage/useBlocks.ts";
import {NavigateFunction, useNavigate} from "react-router-dom";

export interface INodeMenuProps {
    id?: string;
    data?: any,
    anchorPosition?: PopoverPosition | undefined;
    onDelete?: (id: string) => void;
    onUpdate?: (template: TemplateDetail, block: BlockDetail) => void;
    onDuplicate?: () => any;
}

const NodeContextMenu = ({id, anchorPosition, data, onDelete, onUpdate, onDuplicate}: INodeMenuProps): ReactNode => {

    const {t} = useTranslation();
    const navigate: NavigateFunction = useNavigate();
    const {template, outdatedBlocks, wasConnectingRecently} = useContext(EditorContext);
    const [, , block] = useBlocks({blockId: data?.temporary ? undefined : id, filter: true});
    const [position, setPosition] = useState<PopoverPosition | undefined>(anchorPosition);
    const open = Boolean(position);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState<boolean>(false);

    useEffect(() => {
        setPosition(anchorPosition)
    }, [anchorPosition]);

    return (
        <Fragment>
            <Menu
                id={id}
                open={open}
                onClose={() => {
                    setPosition(undefined)
                }}
                anchorReference="anchorPosition"
                anchorPosition={position ?? {top: 0, left: 0}}
                transformOrigin={{
                    vertical: 'top',
                    horizontal: 'left'
                }}
            >
                <MenuItem
                    disabled={data?.temporary}
                    onClick={(e): void => {
                        e.stopPropagation();
                        if (wasConnectingRecently.current) return;
                        else navigate(`/configs/blocks/${id}?workflowId=${data.workflowId}`);
                    }}
                >
                    {t("action.settings")}
                </MenuItem>
                <MenuItem
                    onClick={() => setDeleteDialogOpen(true)}
                >
                    {t("action.delete")}
                </MenuItem>
                {onUpdate && id && outdatedBlocks.find((block) => block.id === id) &&
                    <MenuItem onClick={() => onUpdate(template!, block!)}>{t("action.update")}</MenuItem>
                }
                {onDuplicate &&
                    <MenuItem onClick={onDuplicate}>{t("action.duplicate")}</MenuItem>
                }
            </Menu>
            <ConfirmDialog
                dialogTitle={t("dialog.header.confirmDelete")}
                confirmAction={t("action.delete")}
                open={deleteDialogOpen}
                setOpen={setDeleteDialogOpen}
                callback={() => {
                    onDelete!(id!)
                }}
            />
        </Fragment>
    );
};

export default NodeContextMenu;