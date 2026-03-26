import {styled} from "@mui/material";
import MuiAppBar from "@mui/material/AppBar";
import {AppBarProps as MuiAppBarProps} from "@mui/material/AppBar/AppBar";

interface AppBarProps extends MuiAppBarProps {
    open?: boolean;
}

const AppBar = styled(
    MuiAppBar, {shouldForwardProp: (prop: string): boolean => prop !== "open"})<AppBarProps>(({theme, open}) => {
    return ({
        zIndex: theme.zIndex.drawer + 1,
        transition: theme.transitions.create(["width", "margin"], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen
        }),
        ...(open && {
            marginLeft: 240,
            width: `calc(100% - ${240}px)`,
            transition: theme.transitions.create(["width", "margin"], {
                easing: theme.transitions.easing.sharp,
                duration: theme.transitions.duration.enteringScreen
            })
        })
    });
});

export default AppBar;