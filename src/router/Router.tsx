import {createBrowserRouter, RouteObject, RouterProvider} from "react-router-dom";
import App from "../app/App.tsx";
import {Fragment, ReactNode} from "react";
import Landing from "../pages/landing/Landing.tsx";
import {getRoutes} from "./Routes.tsx";
import {IRoute} from "../model/IRoute.ts";
import {useTranslation} from "react-i18next";

const Router: () => ReactNode = (): ReactNode => {

    const {t} = useTranslation();
    const router = createBrowserRouter([{
        path: "/",
        element: <App/>,
        children: [
            {
                index: true, element: <Landing/>
            },
            ...getRoutes(t).map((route: IRoute): RouteObject => {
                return ({
                    path: route.routingPath,
                    element: route.element,
                    children: route.children.map((route: IRoute) => {
                        return {
                            id: route.name,
                            path: route.routingPath,
                            element: route.element
                        };
                    })
                });
            })]
    }]);

    return (
        <Fragment>
            <RouterProvider future={{v7_startTransition: true}} router={router}/>
        </Fragment>
    );

};

export default Router;