import {Context, createContext} from "react";
import {IMonitoringContext} from "./MonitoringProvider.tsx";

export const MonitoringContext: Context<IMonitoringContext> = createContext({} as IMonitoringContext);