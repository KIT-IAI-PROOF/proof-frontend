import {Dispatch, SetStateAction, useEffect, useState} from "react";

type UsePersistedState<T> = [T, Dispatch<SetStateAction<T>>];

const usePersistedState = <T, >(defaultValue: T, key: string): UsePersistedState<T> => {

    const [value, setValue] = useState<T>(() => {
        const value = window.localStorage.getItem(key);
        return value ? (JSON.parse(value) as T) : defaultValue;
    });

    useEffect(() => {
        window.localStorage.setItem(key, JSON.stringify(value));
    }, [key, value]);

    return [value, setValue];

};

export {usePersistedState};