import i18n from "i18next";
import {I18nextProvider, initReactI18next} from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import {Fragment, ReactNode} from "react";
import Backend from 'i18next-http-backend';

interface IProps {
    children: ReactNode;
}

const getInitialLanguage: () => string = (): string => {
    const savedLang: string | null = localStorage.getItem("i18nextLng");
    if (savedLang) return savedLang;
    const browserLang = navigator.language || navigator.languages[0] || "en";
    return browserLang.startsWith("de") ? "de" : "en";
};

i18n
    .use(Backend)
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
        lng: getInitialLanguage(),
        fallbackLng: "en",
        interpolation: {escapeValue: false},
        detection: {
            order: ["localStorage", "navigator"],
            caches: ["localStorage"]
        }
    })
    .catch((error: Error): void => console.error(error));

const I18n: ({children}: IProps) => ReactNode = ({children}: IProps): ReactNode => {

    return (<Fragment>
        <I18nextProvider
            i18n={i18n}
            defaultNS={"translation"}
        >
            {children}
        </I18nextProvider>
    </Fragment>);

};

export default I18n;

