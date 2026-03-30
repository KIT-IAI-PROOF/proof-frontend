import {ReactNode} from "react";

export type Provider<T> = (t: T) => ReactNode;
