import {Fragment, ReactNode, useState} from "react";
import {Box, Stack, Theme, Typography, useTheme} from "@mui/material";
import {Link} from "react-router-dom";
import {useTranslation} from "react-i18next";
import AboutDialog from "./AboutDialog.tsx";

const Footer: () => ReactNode = (): ReactNode => {

    const {t} = useTranslation();
    const theme: Theme = useTheme();
    const [open, setOpen] = useState(false);

    const onOpenAbout = (open: boolean): void => {
        setOpen(open);
    }

    return (
        <Fragment>
            <AboutDialog open={open} setOpen={onOpenAbout}/>
            <Stack
                direction={"row"}
                zIndex={theme.zIndex.drawer + 2}
                bgcolor={theme.palette.background.paper}
                padding={1}
                paddingLeft={5}
                paddingRight={5}
                style={{width: "100%", position: "fixed", bottom: 0, left: 0, right: 0}}
            >
                <Typography variant={"body2"}>© {new Date().getFullYear()} Institut für Automation und angewandte Informatik</Typography>
                <Box paddingRight={1} flex={30}></Box>
                <Stack display={{xs: "none", lg: "flex"}} direction={"row"} spacing={1} alignItems={"center"}>
                    <Link
                        to={"https://kit-iai-proof.github.io/faq"}
                        style={{textDecoration: "none", color: "inherit"}}
                    >
                        <Typography variant={"body2"}>{t("links.help")}</Typography>
                    </Link>
                    <Box flex={1}></Box>
                    <Link
                        to={"https://www.iai.kit.edu/impressum.php"}
                        style={{textDecoration: "none", color: "inherit"}}
                    >
                        <Typography variant={"body2"}>{t("links.imprint")}</Typography>
                    </Link>
                    <Box flex={1}></Box>
                    <Typography
                        variant={"body2"} onClick={() => onOpenAbout(true)}
                        sx={{"&:hover": {cursor: "pointer"}}}
                    >
                        {t("links.about")}</Typography>
                    <Box flex={1}></Box>
                    <Link
                        to={"https://kit-iai-proof.github.io/"}
                        style={{textDecoration: "none", color: "inherit"}}
                    >
                        <Typography variant={"body2"}>{t("links.doc")}</Typography>
                    </Link>
                </Stack>
            </Stack>
        </Fragment>
    );

};

export default Footer;