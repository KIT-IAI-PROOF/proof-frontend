import {Context, createContext} from "react";
import {IEditorContext} from "./EditorProvider.tsx";

export const EditorContext: Context<IEditorContext> = createContext({} as IEditorContext);