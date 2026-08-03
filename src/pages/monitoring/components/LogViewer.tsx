import React, {ReactNode, useEffect, useRef} from "react";
import {Box, Paper, Stack, Typography} from "@mui/material";
import {AuthContextProps, useAuth} from "react-oidc-context";
import {Client, IMessage} from "@stomp/stompjs";
import {DEFAULT_SETTINGS} from "../../../utils/settings.ts";

interface IProps {
    height?: number | string;
    level: string;
    appId: string | undefined;
    messages: IMessage[];
    setMessages: any;
    follow?: boolean;
}

const client: Client = new Client();

const LogViewer: React.FC<IProps> = ({height = 500, appId, setMessages, follow, level, messages}: IProps): ReactNode => {

    const endRef = useRef<HTMLDivElement | null>(null);

    const {user}: AuthContextProps = useAuth();

    useEffect((): () => void => {
        if (user?.access_token && appId) {
            setMessages([]);
            const headers: any = {
                "X-ACCESS_TOKEN": user.access_token
            };
            client.reconnectDelay = 1000;
            client.brokerURL = DEFAULT_SETTINGS.websocketPath;
            client.connectHeaders = headers;
            client.onConnect = (): void => {
                client.subscribe(
                    `/queue/logs.${appId}`,
                    (message: IMessage): void => {
                        setMessages((prevMessages: IMessage[]) => [...prevMessages, message]);
                    }, {
                        "ack": "client-individual",
                        "durable": "true",
                        "prefetch-count": "1000"
                    }
                );
            };
            client.activate();
        }
        return (): void => {
            client.deactivate().then(() => {
            });
        };
    }, [appId, setMessages, user?.access_token]);

    useEffect(() => {
        if (endRef.current) {
            if (follow) endRef.current.scrollIntoView({behavior: "smooth"});
        }
    }, [follow, level, messages]);

    return (
        <Paper
            elevation={3}
            sx={{
                p: 1,
                height,
                overflowY: "auto",
                backgroundColor: "#121212",
                color: "#e0e0e0",
                fontFamily: "monospace",
                borderRadius: 2
            }}
        >
            <Box
                component="pre"
                sx={{
                    m: 0,
                    whiteSpace: "pre-wrap",
                    fontFamily: "monospace",
                    fontSize: "12px"
                }}
            >
                {
                    messages
                        .sort((a, b) => {
                            return Number(a.headers["timestamp"]) - Number(b.headers["timestamp"]);
                        })
                        .filter((message: IMessage): boolean => {
                            switch (level) {
                                case "INFO": {
                                    return true;
                                }
                                case "WARN": {
                                    return message.headers["level"] === "WARN" || message.headers["level"] === "ERROR";
                                }
                                case "ERROR": {
                                    return message.headers["level"] === "ERROR";
                                }
                                default: {
                                    return false;
                                }
                            }
                        })
                        .map((message: IMessage, index: number): ReactNode => {
                            let color = "#e0e0e0";
                            if (message.body.includes("ERROR")) color = "#ef5350";
                            else if (message.body.includes("WARN")) color = "#ffb300";
                            return (
                                <Stack direction={"row"} key={index} spacing={1}>
                                    <Typography variant="body2" sx={{color}}>
                                        {message.body}
                                    </Typography>
                                </Stack>
                            );
                        })
                }
                {
                    messages.length === 0 && <Typography variant="body2" sx={{color: "#e0e0e0"}}>Waiting for logs...</Typography>
                }
                <div ref={endRef}/>
            </Box>
        </Paper>
    );

};

export default LogViewer;
