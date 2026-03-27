import {Fragment, ReactNode, useContext} from "react";
import {Alert, Box, Dialog, DialogTitle, List, ListItemButton, ListItemIcon, ListItemText, Snackbar, Theme, Typography, useTheme} from "@mui/material";
import LoginRoundedIcon from "@mui/icons-material/LoginRounded";
import LogoutRoundedIcon from "@mui/icons-material/LogoutRounded";
import {AuthContextProps, useAuth} from "react-oidc-context";
import {useTranslation} from "react-i18next";
import {IAppContext} from "../../provider/AppProvider.tsx";
import {AppContext} from "../../provider/AppContext.tsx";

const Dialogs = (): ReactNode => {

    const theme: Theme = useTheme();
    const {t} = useTranslation();
    const {isAuthenticated, signinRedirect, signoutRedirect, user}: AuthContextProps = useAuth();
    const {dialog, updateDialog, error, updateError, info, updateInfo} = useContext<IAppContext>(AppContext);

    return (
        <Fragment>
            <Dialog
                onClose={(): void => updateDialog(undefined)}
                open={dialog === "account"}>
                <Box
                    padding={3}
                    style={{background: theme.palette.background.paper}}>
                    <DialogTitle>{t("dialog.header.account")}</DialogTitle>
                    <Box
                        paddingLeft={2}
                        paddingRight={2}
                        paddingBottom={2}>
                        <Typography variant={"body1"}>{user?.profile.preferred_username}</Typography>
                        <Typography variant={"body1"}>{user?.profile.email}</Typography>
                    </Box>
                    <List
                        dense={false}
                        component="div">
                        {
                            isAuthenticated ?
                                <ListItemButton
                                    autoFocus
                                    onClick={async (): Promise<void> => await signoutRedirect()}
                                >
                                    <ListItemIcon>
                                        <LogoutRoundedIcon color={"primary"}/>
                                    </ListItemIcon>
                                    <ListItemText
                                        color={"primary"}
                                        primary={t("action.logout")}/>
                                </ListItemButton>
                                :
                                <ListItemButton
                                    autoFocus
                                    onClick={async (): Promise<void> => await signinRedirect()}
                                >
                                    <ListItemIcon>
                                        <LoginRoundedIcon color={"primary"}/>
                                    </ListItemIcon>
                                    <ListItemText
                                        color={"primary"}
                                        primary={t("action.login")}/>
                                </ListItemButton>
                        }
                    </List>
                </Box>
            </Dialog>
            <Snackbar
                open={!!error}
                autoHideDuration={5000}
                onClose={(): void => updateError(undefined)}>
                <Alert
                    onClose={(): void => updateError(undefined)}
                    variant={"filled"}
                    severity={"error"}
                    sx={{width: "100%", color: "inherit"}}
                >
                    {error}
                </Alert>
            </Snackbar>
            <Snackbar
                open={!!info}
                autoHideDuration={5000}
                onClose={(): void => updateInfo(undefined)}>
                <Alert
                    onClose={(): void => updateInfo(undefined)}
                    variant={"filled"}
                    sx={{
                        width: "100%",
                        backgroundColor: theme.palette.background.default,
                        color: theme.palette.text.primary
                    }}
                >
                    {info}
                </Alert>
            </Snackbar>
        </Fragment>
    );

};

export default Dialogs;