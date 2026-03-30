import {Fragment, ReactNode} from "react";
import {Box, Button, ButtonGroup, Dialog, DialogActions, DialogContent, DialogTitle, Theme, useTheme} from "@mui/material";
import {useTranslation} from "react-i18next";

interface IProps {
    dialogTitle: string;
    confirmAction: string;
    disableAction?: boolean;
    open: boolean;
    setOpen: (open: boolean) => void;
    callback: any;
    extraContent?: ReactNode;
}

const ConfirmDialog = ({
                           dialogTitle,
                           confirmAction,
                           open,
                           disableAction,
                           setOpen,
                           callback,
                           extraContent
                       }: IProps): ReactNode => {

    const theme: Theme = useTheme();
    const {t} = useTranslation();

    return (
        <Fragment>
            <Dialog
                fullWidth={true}
                open={open}
                onClose={(): void => {
                    setOpen(false)
                }}>
                <Box
                    sx={{background: theme.palette.background.paper}}
                    padding={2}>
                    <DialogTitle>{dialogTitle}</DialogTitle>
                    <DialogContent>
                        {
                            extraContent && <Fragment>
                                {extraContent}
                            </Fragment>
                        }
                    </DialogContent>
                    <DialogActions>
                        <ButtonGroup>
                            <Button
                                onClick={() => {
                                    setOpen(false)
                                }}
                            >
                                {t("action.cancel")}
                            </Button>
                            <Button
                                disabled={disableAction}
                                onClick={() => {
                                    callback()
                                    setOpen(false)
                                }}
                            >
                                {confirmAction}
                            </Button>
                        </ButtonGroup>
                    </DialogActions>
                </Box>
            </Dialog>
        </Fragment>
    );
};

export default ConfirmDialog;