import {Fragment, ReactNode, useContext, useMemo} from "react";
import {createTheme, CssBaseline, Theme as MTheme, ThemeProvider} from "@mui/material";
import {IAppContext} from "../provider/AppProvider.tsx";
import {AppContext} from "../provider/AppContext.tsx";
import {deDE as deDECore, enUS as enUSCore} from "@mui/material/locale";
import {deDE as deDEDG, enUS as enUSDG} from "@mui/x-data-grid/locales";
import {useTranslation} from "react-i18next";

interface IProps {
    children: ReactNode;
}

declare module '@mui/material/styles' {
    interface Palette {
        elevated: Palette['background'];
    }

    interface PaletteOptions {
        elevated?: PaletteOptions['background'];
    }
}

const Theme: ({children}: IProps) => ReactNode = ({children}: IProps): ReactNode => {

    const {i18n} = useTranslation();
    const activeLocale = i18n.language.split('-')[0] === 'de' ? {core: deDECore, dataGrid: deDEDG} : {core: enUSCore, dataGrid: enUSDG}
    const {palette, primaryPaletteIndex, secondaryPaletteIndex} = useContext<IAppContext>(AppContext);

    const theme: MTheme = useMemo(() => {
        return createTheme({
            cssVariables: false,
            typography: {
                fontFamily: "Roboto, sans-serif",
                h1: {
                    fontSize: "2.5rem",
                },
                h2: {
                    fontSize: "2rem",
                    fontWeight: 400,
                },
                h3: {
                    fontSize: "1.3rem",
                }
            },
            colorSchemes: {
                light: {
                    palette: {
                        mode: "light",
                        primary: {
                            light: palette[primaryPaletteIndex].hex,
                            main: palette[primaryPaletteIndex].hex,
                            dark: palette[primaryPaletteIndex].hex
                        },
                        secondary: {
                            light: palette[secondaryPaletteIndex].hex,
                            main: palette[secondaryPaletteIndex].hex,
                            dark: palette[secondaryPaletteIndex].hex,
                        },
                        background: {
                            default: "#ffffff",
                            paper: "#fafafa",
                        },
                        elevated: {
                            default: "#f2f2f2",
                            paper: "#ededed",
                        },
                    }
                },
                dark: {
                    palette: {
                        mode: "dark",
                        primary: {
                            light: palette[primaryPaletteIndex].hex,
                            main: palette[primaryPaletteIndex].hex,
                            dark: palette[primaryPaletteIndex].hex
                        },
                        secondary: {
                            light: palette[secondaryPaletteIndex].hex,
                            main: palette[secondaryPaletteIndex].hex,
                            dark: palette[secondaryPaletteIndex].hex
                        },
                        background: {
                            default: "#2c2c2c",
                            paper: "#3a3a3a",
                        },
                        elevated: {
                            default: "#4a4a4a",
                            paper: "#4f4f4f",
                        },
                    },
                }
            },
            components: {
                MuiTooltip: {
                    defaultProps: {
                        slotProps: {
                            tooltip: {
                                sx: {
                                    '& .MuiTooltip-tooltip': {
                                        whiteSpace: 'pre-line',
                                    },
                                },
                            },
                        },
                    },
                    styleOverrides: {
                        tooltip: {
                            whiteSpace: 'pre-line',
                        },
                    },
                },
                MuiAppBar: {
                    defaultProps: {
                        position: "fixed",
                        enableColorOnDark: true,
                    },
                    styleOverrides: {
                        root: {
                            color: "black",
                            background: "white",
                            boxShadow: "none",
                            borderBottom: "1px solid #efefef"
                        }
                    }
                },
                MuiPaper: {
                    defaultProps: {
                        elevation: 0
                    },
                    styleOverrides: {
                        root: {
                            border: "none"
                        }
                    }
                },
                MuiAccordion: {
                    styleOverrides: {
                        root: {
                            "&.MuiAccordion-root:before": {
                                backgroundColor: "transparent"
                            }
                        }
                    }
                }
            }
        }, activeLocale.dataGrid, activeLocale.core);
    }, [activeLocale.core, activeLocale.dataGrid, palette, primaryPaletteIndex, secondaryPaletteIndex])

    return (
        <Fragment>
            <ThemeProvider theme={theme} defaultMode={"system"} noSsr={true}>
                <CssBaseline/>
                {children}
            </ThemeProvider>
        </Fragment>
    );

};

export default Theme;