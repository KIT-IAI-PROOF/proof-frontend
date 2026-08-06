import {Client} from "@stomp/stompjs";
import {useEffect} from "react";
import {AuthContextProps, useAuth} from "react-oidc-context";
import {BlockDetailStatusEnum} from "@kit-iai-proof/proof-orchestrator-client";
import {ISettings} from "../model/ISettings.ts";

const client: Client = new Client();

interface IStatusUpdate {
    executionId: string;
    blockId: string;
    status: BlockDetailStatusEnum;
    cp?: number;
    message: string;
}

interface IProps {
    executionId: string;
    onStatusUpdate?: (update: IStatusUpdate) => void;
    settings?: ISettings;
}

const useStatusWebsocket: ({executionId, onStatusUpdate, settings}: IProps) => void = ({executionId, onStatusUpdate, settings}: IProps) => {
    const {user}: AuthContextProps = useAuth();

    useEffect(() => {
        if (user?.access_token && settings?.statusWebsocketPath && executionId && onStatusUpdate) {
            console.log('Connecting to status websocket for execution:', executionId);
            const headers: any = {
                "X-ACCESS_TOKEN": user.access_token
            }
            client.reconnectDelay = 1000;
            client.brokerURL = settings.statusWebsocketPath;
            client.connectHeaders = headers;
            client.onConnect = () => {
                console.log('Status websocket connected, subscribing to:', `/topic/executions/${executionId}/status`);
                client.subscribe("/topic/executions/" + executionId + "/status", (message) => {
                    const update: IStatusUpdate = JSON.parse(message.body);
                    onStatusUpdate?.(update);
                })
            }
            client.activate();
            return () => {
                console.log('Disconnecting status websocket');
                client.deactivate().then(() => {
                })
            }
        }
    }, [user?.access_token, settings?.statusWebsocketPath, executionId, onStatusUpdate]);
}

export type {IStatusUpdate};
export {useStatusWebsocket};
