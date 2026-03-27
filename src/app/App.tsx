import {Fragment, ReactNode} from "react";
import {Outlet} from "react-router-dom";
import Footer from "./components/Footer.tsx";
import Menu from "./components/Menu.tsx";
import Theme from "../theme/Theme.tsx";
import Dialogs from "./components/Dialogs.tsx";
import I18n from "../i18n/I18n.tsx";
import Query from "../query/Query.tsx";
import AppProvider from "../provider/AppProvider.tsx";
import Auth from "../auth/Auth.tsx";
import {Box} from "@mui/material";
import {ConnectionStatus} from "../pages/error/ConnectionStatus.tsx";

const App: () => ReactNode = (): ReactNode => {

    return (
        <Fragment>
            <Auth>
                <Query>
                    <AppProvider>
                        <I18n>
                            <Theme>
                                <Menu/>
                                <Box padding={{xs: 0, sm: 1}}>
                                    <Outlet/>
                                </Box>
                                <Footer/>
                                <Dialogs/>
                                <ConnectionStatus/>
                            </Theme>
                        </I18n>
                    </AppProvider>
                </Query>
            </Auth>
        </Fragment>
    );

};

export default App;
