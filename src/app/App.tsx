import {Fragment, ReactNode} from "react";
import Auth from "../auth/Auth.tsx";
import {Frame} from "./components/Frame.tsx";

const App: () => ReactNode = (): ReactNode => {

    return (
        <Fragment>
            <Auth>
                <Frame/>
            </Auth>
        </Fragment>
    );

};

export default App;
