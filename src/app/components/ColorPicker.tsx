import {Fragment, ReactNode, useState} from "react";
import {TwitterPicker} from 'react-color';
import {Theme, useTheme} from "@mui/material";

interface IProps {
    color: string | undefined;
    onChange: (color: string) => void;
}

const ColorPicker: ({color, onChange}: IProps) => ReactNode = ({color, onChange}: IProps): ReactNode => {

    const theme: Theme = useTheme();
    const [displayColorPicker, setDisplayColorPicker] = useState<boolean>(false);

    const handleClick: () => void = () => {
        setDisplayColorPicker(!displayColorPicker)
    };

    const handleClose: () => void = () => {
        setDisplayColorPicker(false)
    };

    return (
        <Fragment>
            {
                color && <div
                    style={{
                        display: 'inline-block',
                        cursor: 'pointer',
                    }}
                    onClick={handleClick}
                >
                    <div
                        style={{
                            width: '100px',
                            height: '25px',
                            borderRadius: '5px',
                            background: color,
                        }}
                    />
                </div>
            }
            {
                displayColorPicker && <div
                    style={{
                        position: 'absolute',
                        zIndex: '2',
                    }}>
                    <div
                        style={{
                            position: 'fixed',
                            top: '0px',
                            right: '0px',
                            bottom: '0px',
                            left: '0px',
                        }}
                        onClick={handleClose}
                    />
                    <TwitterPicker
                        styles={{
                            default: {
                                triangle: {
                                    borderColor: "transparent transparent" + theme.palette.elevated.default
                                },
                                hash: {
                                    borderStyle: "solid",
                                    borderWidth: "2px 0 2px 2px",
                                    borderColor: theme.palette.elevated.paper,
                                    boxShadow: "none",
                                    height: "32px",
                                    WebkitBoxShadow: "none",
                                    color: theme.palette.text.primary,
                                    background: theme.palette.background.paper,
                                },
                                input: {
                                    borderStyle: "solid",
                                    borderWidth: "2px 2px 2px 2px",
                                    borderColor: theme.palette.elevated.paper,
                                    boxShadow: "none",
                                    height: "26px",
                                    WebkitBoxShadow: "none",
                                    color: theme.palette.text.primary,
                                    background: theme.palette.background.paper,
                                },
                                card: {
                                    background: theme.palette.elevated.default,
                                },
                            }
                        }}
                        triangle={"top-left"}
                        color={color}
                        colors={['#FF6900', '#FCB900', '#7BDCB5', '#00D084', '#8ED1FC', '#0693E3', '#ABB8C3', '#EB144C', '#F78DA7', '#9900EF', '#ffffff']}
                        onChangeComplete={(color): void => {
                            onChange(color.hex);
                        }}
                    />
                </div>
            }
        </Fragment>
    );

}

export default ColorPicker;