import {Context, createContext} from "react";
import {IConfigContext} from "./ConfigProvider.tsx";

export const ConfigContext: Context<IConfigContext> = createContext({} as IConfigContext);