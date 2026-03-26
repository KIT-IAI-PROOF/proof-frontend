import {Fragment, ReactNode, useContext} from "react";
import {Checkbox, FormControl, FormControlLabel, FormLabel, Stack} from "@mui/material";
import {useTranslation} from "react-i18next";
import ColorPicker from "../../../app/components/ColorPicker.tsx";
import {IAppContext} from "../../../provider/AppProvider.tsx";
import {AppContext} from "../../../provider/AppContext.tsx";

interface IProps {
    label: string,
    value: string,
    onChange: (color: string) => void,
    index: number
}

export const ColorField = ({label, value, onChange, index}: IProps): ReactNode => {

    const {t} = useTranslation();
    const {
        primaryPaletteIndex,
        secondaryPaletteIndex,
        updatePrimaryPalette,
        updateSecondaryPalette
    } = useContext<IAppContext>(AppContext);

    return (
        <Fragment>
            <FormControl
                fullWidth={true}
                component="fieldset"
                variant="standard">
                <FormLabel
                    sx={{
                        color: "inherit",
                        "&.Mui-focused": {
                            color: value
                        }
                    }}
                >
                    {label}
                </FormLabel>
                <Stack direction={"row"} alignItems={"center"} spacing={1}>
                    <ColorPicker
                        color={value}
                        onChange={(color: string) => {
                            onChange(color)
                        }}
                    />
                    <FormControlLabel
                        color={value}
                        control={<Checkbox
                            checked={primaryPaletteIndex === index}
                            sx={{
                                color: value,
                                "&.Mui-checked": {
                                    color: value
                                }
                            }}
                        />}
                        label={t("word.primary")}
                        onChange={(): void => updatePrimaryPalette(index)}/>
                    <FormControlLabel
                        control={<Checkbox
                            checked={secondaryPaletteIndex === index}
                            sx={{
                                color: value,
                                "&.Mui-checked": {
                                    color: value
                                }
                            }}
                        />}
                        label={t("word.secondary")}
                        onChange={(): void => updateSecondaryPalette(index)}/>
                </Stack>
            </FormControl>
        </Fragment>
    );

};