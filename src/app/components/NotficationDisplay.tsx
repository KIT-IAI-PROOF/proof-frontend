import {Fade, Paper, Portal, Typography} from '@mui/material';
import {ReactNode} from "react";
import {useReactFlow, XYPosition} from "@xyflow/react";

interface NotificationDisplayProps {
    visible: boolean;
    message: string;
    position: XYPosition | undefined;
}

const NotificationDisplay = ({visible, message, position}: NotificationDisplayProps): ReactNode => {
    const {flowToScreenPosition} = useReactFlow();

    const screenPosition = flowToScreenPosition(position || {x: 20, y: 20});

    return (
        <Portal>
            <Fade in={visible} timeout={{enter: 200, exit: 300}} unmountOnExit>
                <Paper
                    elevation={6}
                    sx={{
                        position: 'fixed',
                        top: `${screenPosition.y}px`,
                        left: `${screenPosition.x}px`,
                        px: 2,
                        py: 1,
                        borderRadius: 2,
                        maxWidth: 320,
                        pointerEvents: 'none',
                    }}
                >
                    <Typography variant="body2">{message}</Typography>
                </Paper>
            </Fade>
        </Portal>
    );
}

export default NotificationDisplay;