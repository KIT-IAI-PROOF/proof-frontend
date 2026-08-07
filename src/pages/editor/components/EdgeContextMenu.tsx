import {Menu, MenuItem, PopoverPosition} from "@mui/material";
import {useTranslation} from "react-i18next";
import {Dispatch, Fragment, ReactNode, SetStateAction, useState} from "react";
import ConfirmDialog from "../../../app/components/ConfirmDialog.tsx";

export interface EdgeMenuObject {
    id?: string;
    anchorPosition?: PopoverPosition | undefined;
    onDelete?: (id: string) => void;
}

export interface IEdgeMenuProps {
    edgeMenuObject: EdgeMenuObject | undefined;
    setEdgeMenuObject: Dispatch<SetStateAction<EdgeMenuObject | undefined>>;
}

const EdgeContextMenu = ({edgeMenuObject, setEdgeMenuObject}: IEdgeMenuProps): ReactNode => {

    const {t} = useTranslation();
    const open = Boolean(edgeMenuObject?.anchorPosition);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState<boolean>(false);

    return (
        <Fragment>
            <Menu
                id={edgeMenuObject?.id}
                open={open}
                onClose={() => {
                    setEdgeMenuObject(undefined)
                }}
                anchorReference="anchorPosition"
                anchorPosition={edgeMenuObject?.anchorPosition ?? {top: 0, left: 0}}
                transformOrigin={{
                    vertical: 'top',
                    horizontal: 'left'
                }}
            >
                <MenuItem
                    onClick={() => setDeleteDialogOpen(true)}
                >
                    {t("action.delete")}
                </MenuItem>
            </Menu>
            <ConfirmDialog
                dialogTitle={t("dialog.header.confirmDelete")}
                confirmAction={t("action.delete")}
                open={deleteDialogOpen}
                setOpen={setDeleteDialogOpen}
                callback={() => {
                    edgeMenuObject?.onDelete!(edgeMenuObject.id!)
                }}
            />
        </Fragment>
    );
};

export default EdgeContextMenu;