import {Fragment, MouseEvent, ReactNode, useContext, useState} from "react";
import {
    Box,
    Breadcrumbs,
    IconButton,
    List,
    ListItem,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    Stack,
    Theme,
    ToggleButton,
    ToggleButtonGroup,
    Toolbar,
    Tooltip,
    Typography,
    useColorScheme,
    useTheme
} from "@mui/material";
import {Link, Location, NavigateFunction, useLocation, useNavigate} from "react-router-dom";
import {getRoutes} from "../../router/Routes.tsx";
import AppBar from "./AppBar.tsx";
import Drawer from "./Drawer.tsx";
import DrawerSpacer from "./DrawerSpacer.tsx";
import MenuIcon from "@mui/icons-material/Menu";
import SettingsIcon from "@mui/icons-material/Settings";
import {IRoute} from "../../model/IRoute.ts";
import PersonIcon from "@mui/icons-material/Person";
import {useTranslation} from "react-i18next";
import {AuthContextProps, useAuth} from "react-oidc-context";
import FormatAlignLeftIcon from "@mui/icons-material/FormatAlignLeft";
import DarkModeIcon from "@mui/icons-material/DarkMode";
import LightModeIcon from "@mui/icons-material/LightMode";
import LinearLoader from "./LinearLoader.tsx";
import {IAppContext} from "../../provider/AppProvider.tsx";
import {AppContext} from "../../provider/AppContext.tsx";

const Menu: () => ReactNode = (): ReactNode => {

    const {t, i18n} = useTranslation();
    const auth: AuthContextProps = useAuth();

    const {mode, setMode} = useColorScheme();
    const {updateDialog} = useContext<IAppContext>(AppContext);
    const [open, setOpen] = useState<boolean>(false);
    const navigate: NavigateFunction = useNavigate();
    const location: Location = useLocation();
    const theme: Theme = useTheme();

    const pathNames: string[] = location.pathname.split("/").filter((x: string): string => x);

    const handleMode: (event: MouseEvent, mode: any) => void = (event: MouseEvent, mode: any): void => {
        event.preventDefault();
        if (mode) setMode(mode);
    };

    const handleLanguage: (event: MouseEvent, language: string) => void = async (event: MouseEvent, language: string): Promise<void> => {
        event.preventDefault();
        await i18n.changeLanguage(language);
    }

    return (<Fragment>
        <AppBar
            sx={(theme: Theme): any =>
                theme.palette.mode === "dark" ?
                    {
                        background: theme.palette.background.default,
                        border: "none"
                    } :
                    {
                        background: theme.palette.background.default,
                    }
            }>
            <Toolbar>
                <Tooltip title={open ? t("action.closeMenu") : t("action.openMenu")}>
                    <IconButton
                        onClick={(): void => setOpen((open: boolean): boolean => !open)}
                        sx={{marginRight: 3}}
                        edge={"start"}
                    >
                        <MenuIcon color={"inherit"}/>
                    </IconButton>
                </Tooltip>
                <Link
                    to={"/"}
                    style={{textDecoration: "none"}}>
                    <Stack
                        direction={"row"}
                        alignItems={"center"}
                        justifyContent={"center"}>
                        <img
                            style={{
                                height: "50px",
                                padding: "5px",
                                filter: theme.palette.mode === "dark" ? "brightness(0) invert(0.95)" : "brightness(0) invert(0.25)"
                            }}
                            src={"/kit.png"}
                            alt={"Logo"}/>
                        <Typography
                            variant={"body1"}
                            fontSize={"35px"}
                            paddingLeft={2}
                            paddingRight={2}
                            color={"primary"}
                            fontWeight={"bold"}
                            fontStyle={"italic"}
                        >
                            PROOF
                        </Typography>
                    </Stack>
                </Link>
                <Box sx={{flexGrow: 1}}/>
                <Typography variant={"body1"} color={"textPrimary"}>
                    {auth.user?.profile.preferred_username}
                </Typography>
                <Tooltip title={t("action.profile")}>
                    <IconButton
                        onClick={(): void => updateDialog("account")}
                        sx={{marginRight: 1}}
                        edge={"end"}
                    >
                        <PersonIcon color={"inherit"}/>
                    </IconButton>
                </Tooltip>
                {mode && <ToggleButtonGroup
                    size={"small"}
                    exclusive={true}
                    value={mode}
                    onChange={handleMode}
                    sx={{marginLeft: 2, marginRight: 2}}
                >
                    <Tooltip title={t("action.systemMode")}>
                        <ToggleButton
                            size={"small"}
                            value="system">
                            <FormatAlignLeftIcon/>
                        </ToggleButton>
                    </Tooltip>
                    <Tooltip title={t("action.lightMode")}>
                        <ToggleButton
                            size={"small"}
                            value="light">
                            <LightModeIcon/>
                        </ToggleButton>
                    </Tooltip>
                    <Tooltip title={t("action.darkMode")}>
                        <ToggleButton
                            size={"small"}
                            value="dark">
                            <DarkModeIcon/>
                        </ToggleButton>
                    </Tooltip>
                </ToggleButtonGroup>
                }
                <ToggleButtonGroup
                    size={"small"}
                    exclusive={true}
                    value={i18n.language.toString()}
                    onChange={handleLanguage}
                    sx={{marginLeft: 2, marginRight: 2}}
                >
                    <Tooltip title={t("action.languageEn")}>
                        <ToggleButton
                            size={"small"}
                            value={"en"}
                        >
                            <Typography>EN</Typography>
                        </ToggleButton>
                    </Tooltip>
                    <Tooltip title={t("action.languageDe")}>
                        <ToggleButton
                            size={"small"}
                            value="de"
                        >
                            <Typography>DE</Typography>
                        </ToggleButton>
                    </Tooltip>
                </ToggleButtonGroup>

                <Tooltip title={t("action.settings")}>
                    <IconButton
                        onClick={(): void => navigate("/settings")}
                        sx={{marginRight: 2, marginLeft: 2}}
                        edge={"end"}
                    >
                        <SettingsIcon/>
                    </IconButton>
                </Tooltip>
            </Toolbar>
            <Box
                padding={1}
                paddingLeft={3}
                bgcolor={theme.palette.background.paper}>
                <Breadcrumbs>
                    <Link
                        style={{textDecoration: "none", color: "inherit"}}
                        to="/">
                        {t("page.header.start")}
                    </Link>
                    {
                        pathNames.map((value: string, index: number): ReactNode => {
                            const to = `/${pathNames.slice(0, index + 1).join("/")}`;
                            const routeName: string | undefined = getRoutes(t).find((route: IRoute): boolean => route.displayPath === to)?.name;
                            return index === pathNames.length - 1 ?
                                <Typography
                                    textOverflow={"ellipsis"}
                                    width={"100px"}
                                    whiteSpace={"nowrap"}
                                    overflow={"hidden"}
                                    variant={"body1"}
                                    color={"primary"}
                                    key={to}
                                >
                                    {routeName ?? t(`page.header.${value}`, {defaultValue: value})}
                                </Typography>
                                :
                                <Link
                                    style={{textDecoration: "none", color: "inherit"}}
                                    to={to}
                                    key={to}>
                                    {routeName ?? t(`page.header.${value}`, {defaultValue: value})}
                                </Link>;
                        })}
                </Breadcrumbs>
            </Box>
            <LinearLoader/>
        </AppBar>
        <Drawer
            variant={"permanent"}
            open={open}>
            <Box paddingTop={13}>
                <List>
                    {
                        getRoutes(t)
                            .filter((route: IRoute): boolean => route.menu["1"])
                            .map((route: IRoute): ReactNode => (
                                <ListItem
                                    key={route.displayPath}
                                    disablePadding
                                    sx={{display: "block"}}>
                                    <Tooltip
                                        title={!open && route.name}
                                        placement="right"
                                    >
                                        <ListItemButton
                                            sx={{
                                                minHeight: 48, justifyContent: open ? "initial" : "center", px: 2.5
                                            }}
                                            onClick={(): void => {
                                                setOpen(false);
                                                navigate(route.displayPath);
                                            }}
                                        >
                                            <ListItemIcon
                                                sx={{
                                                    minWidth: 0, mr: open ? 2 : "auto", justifyContent: "center"
                                                }}
                                            >
                                                {route.icon}
                                            </ListItemIcon>
                                            <ListItemText
                                                primary={route.name}
                                                sx={{opacity: open ? 1 : 0}}/>
                                        </ListItemButton>
                                    </Tooltip>
                                </ListItem>)
                            )
                    }
                </List>
            </Box>
        </Drawer>
        <DrawerSpacer/>
    </Fragment>);

};

export default Menu;