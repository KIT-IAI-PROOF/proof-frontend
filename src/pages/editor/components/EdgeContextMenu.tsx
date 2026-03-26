import {Menu, MenuItem, PopoverPosition} from "@mui/material";
import {useTranslation} from "react-i18next";
import {Fragment, ReactNode, useEffect, useState} from "react";
import ConfirmDialog from "../../../app/components/ConfirmDialog.tsx";

export interface IEdgeMenuProps {
    id?: string;
    anchorPosition?: PopoverPosition | undefined;
    onDelete?: (id: string) => void;
}

const EdgeContextMenu = ({id, anchorPosition, onDelete}: IEdgeMenuProps): ReactNode => {

    const {t} = useTranslation();
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
                    onDelete!(id!)
                }}
            />
        </Fragment>
    );
};

export default EdgeContextMenu;