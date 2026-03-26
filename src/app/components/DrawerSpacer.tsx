import {styled} from "@mui/material";

const DrawerSpacer = styled("div")(({theme}) => ({
    display: "flex",
    alignItems: "center",
    justifyContent: "flex-end",
    padding: theme.spacing(0, 5),
    ...theme.mixins.toolbar
}));

export default DrawerSpacer;