import {ReactNode, useCallback, useMemo, useRef, useState} from "react";
import {usePersistedState} from "../hooks/usePersistedState.ts";
import {v4 as uuidv4} from "uuid";
import {DEFAULT_PALETTE} from "../utils/palette.ts";
import {IPalette} from "../model/IPalette.ts";
import {Provider} from "../types/provider.ts";
import {Updater} from "../types/updater.ts";
import {useNavigationProtection} from "../hooks/useNavigationProtection.ts";
import {AppContext} from "./AppContext.tsx";
import {useWebSocket} from "../hooks/useWebSocket.ts";
import {IStatusUpdate, useStatusWebsocket} from "../hooks/useStatusWebSocket.ts";
import {DEFAULT_SETTINGS} from "../utils/settings.ts";

interface IProps {
    children: ReactNode;
}

export interface IAppContext {
    sessionId: string;
    dialog: string | undefined;
    dialogData: object | undefined;
    primaryPaletteIndex: number;
    secondaryPaletteIndex: number;
    sessionKey: string;
    updatePrimaryPalette: Updater<number>;
    updateSecondaryPalette: Updater<number>;
    updatePalette: Updater<IPalette[]>;
    updateDialog: (dialog: string | undefined, data?: object) => void;
    palette: IPalette[];
    error: string | undefined;
    info: string | undefined;
    updateInfo: Updater<string | undefined>;
    updateError: Updater<string | undefined>;
    hasUnsavedChanges: boolean;
    updateHasUnsavedChanges: Updater<boolean>;
    updateAllowNavigation: Updater<boolean>;
    lastUsedWorkflowId: string | undefined;
    updateLastUsedWorkflowId: (value: string) => void;
    publishEntityMessage: (id: string, entity: string) => void;
    currentExecutionId: string | undefined;
    updateCurrentExecutionId: (executionId: string | undefined) => void;
    registerStatusUpdateCallback: (callback: (update: IStatusUpdate) => void) => void;
}

const AppProvider: Provider<IProps> = ({children}: IProps): ReactNode => {

    const sessionId: string = useMemo((): string => uuidv4(), []);
    const [dialog, setDialog] = useState<string | undefined>(undefined);
    const [dialogData, setDialogData] = useState<object | undefined>(undefined);
    const [error, setError] = useState<string | undefined>(undefined);
    const [info, setInfo] = useState<string | undefined>(undefined);
    const [sessionKey] = useState<string>(uuidv4());
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState<boolean>(false);
    const [allowNavigation, setAllowNavigation] = useState<boolean>(false);
    const [lastUsedWorkflowId, setLastUsedWorkflowId] = usePersistedState<string>("", "lastUsedWorkflowId");
    const [currentExecutionId, setCurrentExecutionId] = useState<string | undefined>(undefined);
    const statusUpdateCallbackRef = useRef<((update: IStatusUpdate) => void) | undefined>(undefined);

    const [palette, setPalette] = usePersistedState<IPalette[]>(DEFAULT_PALETTE, "palette");
    const [primaryPaletteIndex, setPrimaryPalette] = usePersistedState<number>(2, "primaryPalette");
    const [secondaryPaletteIndex, setSecondaryPalette] = usePersistedState<number>(3, "secondaryPalette");

    const updateError: Updater<string | undefined> = useCallback((error: string | undefined): void => {
        setError(error);
    }, []);

    const updateInfo: Updater<string | undefined> = useCallback((info: string | undefined): void => {
        setInfo(info);
    }, []);

    const updatePalette: Updater<IPalette[]> = useCallback((palette: IPalette[]): void => {
        setPalette(palette);
    }, [setPalette]);

    const updatePrimaryPalette: Updater<number> = useCallback((primaryPalette: number): void => {
        setPrimaryPalette(primaryPalette);
    }, [setPrimaryPalette]);

    const updateSecondaryPalette: Updater<number> = useCallback((secondaryPalette: number): void => {
        setSecondaryPalette(secondaryPalette);
    }, [setSecondaryPalette]);

    const updateHasUnsavedChanges: Updater<boolean> = useCallback((hasUnsavedChanges: boolean): void => {
        setHasUnsavedChanges(hasUnsavedChanges);
    }, [setHasUnsavedChanges]);

    const updateLastUsedWorkflowId: (value: string) => void = useCallback((value: string): void => {
        setLastUsedWorkflowId(value);
    }, [setLastUsedWorkflowId]);

    const updateCurrentExecutionId: (executionId: string | undefined) => void = useCallback((executionId: string | undefined): void => {
        setCurrentExecutionId(executionId);
    }, []);

    const registerStatusUpdateCallback: (callback: (update: IStatusUpdate) => void) => void = useCallback((callback: (update: IStatusUpdate) => void): void => {
        statusUpdateCallbackRef.current = callback;
    }, []);

    const handleStatusUpdate = useCallback((update: IStatusUpdate): void => {
        statusUpdateCallbackRef.current?.(update);
    }, []);

    useNavigationProtection({
        hasUnsavedChanges,
        clearUnsavedChanges: () => updateHasUnsavedChanges(false),
        allowNavigation
    });

    const updateAllowNavigation: Updater<boolean> = useCallback((allowNavigation: boolean): void => {
        setAllowNavigation(allowNavigation);
    }, [setAllowNavigation]);

    const updateDialog: (dialog: (string | undefined), data: (object | undefined)) => void = useCallback((dialog: string | undefined, data: object | undefined): void => {
        setDialog(dialog);
        setDialogData(data);
    }, []);

    const publishEntityMessage = useWebSocket({updateInfo: updateInfo, settings: DEFAULT_SETTINGS, sessionKey: sessionKey});

    useStatusWebsocket({executionId: currentExecutionId ?? "", onStatusUpdate: handleStatusUpdate, settings: DEFAULT_SETTINGS});

    return (
        <AppContext.Provider
            value={{
                lastUsedWorkflowId: lastUsedWorkflowId,

                dialog: dialog,
                dialogData: dialogData,
                primaryPaletteIndex: primaryPaletteIndex,
                secondaryPaletteIndex: secondaryPaletteIndex,
                sessionId: sessionId,
                palette: palette,
                error: error,
                info: info,
                sessionKey: sessionKey,
                hasUnsavedChanges: hasUnsavedChanges,
                currentExecutionId: currentExecutionId,
                publishEntityMessage: publishEntityMessage,
                updateError: updateError,
                updateInfo: updateInfo,
                updateDialog: updateDialog,
                updatePrimaryPalette: updatePrimaryPalette,
                updateSecondaryPalette: updateSecondaryPalette,
                updatePalette: updatePalette,
                updateHasUnsavedChanges: updateHasUnsavedChanges,
                updateAllowNavigation: updateAllowNavigation,
                updateLastUsedWorkflowId: updateLastUsedWorkflowId,
                updateCurrentExecutionId: updateCurrentExecutionId,
                registerStatusUpdateCallback: registerStatusUpdateCallback,
            }}
        >
            {children}
        </AppContext.Provider>
    );

};

export default AppProvider;