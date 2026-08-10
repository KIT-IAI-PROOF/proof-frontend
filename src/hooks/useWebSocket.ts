import {useCallback, useEffect} from "react";
import {Client, IMessage} from "@stomp/stompjs";
import {AuthContextProps, useAuth} from "react-oidc-context";
import {IMessage as RMessage} from "../model/IMessage.ts";
import {useTranslation} from "react-i18next";
import {QueryClient, useQueryClient} from "@tanstack/react-query";
import {ATTACHMENTS_KEY, BLOCKS_KEY, ENTITY_TYPES, EXECUTIONS_KEY, INVALIDATION_KEYS, PROGRAMS_KEY, TEMPLATES_KEY, VALID_ACTIONS, WORKFLOWS_KEY} from "../utils/constants.ts";
import {ISettings} from "../model/ISettings.ts";

const client: Client = new Client();

type UseWebSocket = ({updateInfo, sessionKey, settings}: { updateInfo: any, sessionKey: string, settings: ISettings }) => (id: string, entity: string) => void

const useWebSocket: UseWebSocket = ({updateInfo, sessionKey, settings}: { updateInfo: any, sessionKey: string, settings: ISettings }): (id: string, entity: string) => void => {

    const {t} = useTranslation();
    const {user}: AuthContextProps = useAuth();
    const queryClient: QueryClient = useQueryClient();

    const invalidateQueries: (queryKeys: string[]) => Promise<void> = useCallback(async (queryKeys: string[]): Promise<void> => {
        for (const queryKey of queryKeys) await queryClient.invalidateQueries({queryKey: [queryKey], exact: false});
    }, [queryClient])

    const handleMessage: (entityType: string, user: string, action: string, id: string) => Promise<void> = useCallback(async (entityType: string, user: string, action: string, id: string): Promise<void> => {
        if (entityType && entityType !== ENTITY_TYPES[EXECUTIONS_KEY] && VALID_ACTIONS.includes(action)) {
            updateInfo(`${t("word.user")} ${user ?? ""} ${t(`word.${action.toLowerCase()}`)} ${t(`word.${entityType}`)} ${(id)}`);
        }

    }, [t, updateInfo]);

    const publishEntityMessage: (id: string, entity: string) => void = useCallback((id: string, entity: string): void => {
        if (client.connected) {
            const message: RMessage = {id: id, sessionKey: sessionKey, action: "OPENED", entity: entity};
            client.publish({
                destination: "/app/edits",
                body: JSON.stringify(message)
            });
        }
    }, [sessionKey]);

    useEffect((): () => void => {
        if (user?.access_token) {
            const headers: any = {
                "X-ACCESS_TOKEN": user.access_token
            };
            client.reconnectDelay = 1000;
            client.brokerURL = settings.websocketPath
            client.connectHeaders = headers
            client.onConnect = (): void => {
                client.subscribe("/topic/updates", async (message: IMessage): Promise<void> => {
                    const rMessage = JSON.parse(message.body) as RMessage;
                    const {entity, action, user, id, sessionKey: msgSessionKey} = rMessage;
                    if (!entity || !action || !user || !id) return;
                    await handleMessage(ENTITY_TYPES[entity], user, action, id);
                    if (sessionKey.toString() !== msgSessionKey) {
                        await invalidateQueries(INVALIDATION_KEYS[entity]);
                    }
                });
                client.subscribe("/topic/edits", (message: IMessage): void => {
                        const body: RMessage = JSON.parse(message.body) as RMessage;
                        if (sessionKey.toString() !== body.sessionKey) {
                            if (body.entity === WORKFLOWS_KEY) {
                                updateInfo(`${t("word.user")} ${body.user} ${t("word.opened")} ${t("word.workflow")} ${body.id}`);
                            } else if (body.entity === TEMPLATES_KEY) {
                                updateInfo(`${t("word.user")} ${body.user} ${t("word.opened")} ${t("word.template")} ${body.id}`);
                            } else if (body.entity === BLOCKS_KEY) {
                                updateInfo(`${t("word.user")} ${body.user} ${t("word.opened")} ${t("word.block")} ${body.id}`);
                            } else if (body.entity === PROGRAMS_KEY) {
                                updateInfo(`${t("word.user")} ${body.user} ${t("word.opened")} ${t("word.program")} ${body.id}`);
                            } else if (body.entity === ATTACHMENTS_KEY) {
                                updateInfo(`${t("word.user")} ${body.user} ${t("word.opened")} ${t("word.attachment")} ${body.id}`);
                            }
                        }
                    }
                );
            };
            client.activate();
        }
        return (): void => {
            client.deactivate().then(() => {
            });
        };
    }, [handleMessage, invalidateQueries, sessionKey, settings.websocketPath, t, updateInfo, user?.access_token]);

    return publishEntityMessage;

};

export {useWebSocket};