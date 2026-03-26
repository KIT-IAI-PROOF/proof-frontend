import {Context, createContext} from "react";
import {IAppContext} from "./AppProvider.tsx";

export const AppContext: Context<IAppContext> = createContext({} as IAppContext);