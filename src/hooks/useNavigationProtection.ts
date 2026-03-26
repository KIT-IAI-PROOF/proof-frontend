import {useBlocker, useLocation} from "react-router-dom";
import {MutableRefObject, useEffect, useRef} from "react";
import {useTranslation} from "react-i18next";

type UseNavigationProtectionProps = {
    hasUnsavedChanges: boolean;
    clearUnsavedChanges: () => void;
    allowNavigation?: boolean;
};

export const useNavigationProtection: ({
                                           hasUnsavedChanges,
                                           clearUnsavedChanges,
                                           allowNavigation,
                                       }: UseNavigationProtectionProps) => void = ({
                                                                                       hasUnsavedChanges,
                                                                                       clearUnsavedChanges,
                                                                                       allowNavigation,
                                                                                   }: UseNavigationProtectionProps): void => {
    const {t} = useTranslation();
    const location = useLocation();
    const confirmedRef: MutableRefObject<boolean> = useRef(false);
    const previousPathRef: MutableRefObject<string> = useRef(location.pathname);

    useBlocker((): boolean => {
        if (!hasUnsavedChanges || allowNavigation) return false;

        const confirmed: boolean = window.confirm(
            `${t("word.leaveWithoutSaving")}`
        );

        if (confirmed) {
            confirmedRef.current = true;
            return false;
        }

        return true;
    });

    useEffect((): void => {
        if (
            confirmedRef.current &&
            location.pathname !== previousPathRef.current
        ) {
            clearUnsavedChanges();
            confirmedRef.current = false;
        }

        previousPathRef.current = location.pathname;
    }, [location, clearUnsavedChanges]);

    useEffect(() => {
        const handleBeforeUnload: (event: BeforeUnloadEvent) => void = (event: BeforeUnloadEvent): void => {
            if (!hasUnsavedChanges) return;
            event.preventDefault();
            event.returnValue = "";
        };

        window.addEventListener("beforeunload", handleBeforeUnload);
        return () => window.removeEventListener("beforeunload", handleBeforeUnload);
    }, [hasUnsavedChanges]);
};