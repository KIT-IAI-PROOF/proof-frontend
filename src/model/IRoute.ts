import {ReactNode} from "react";

export interface IRoute {
    index: boolean;
    name: string;
    displayPath: string;
    routingPath: string;
    description: string;
    element: ReactNode;
    icon: ReactNode;
    menu: { 1: boolean, 2: boolean };
    children: IRoute[];
}