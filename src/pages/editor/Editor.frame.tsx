import {ReactFlowProvider} from "@xyflow/react";
import EditorProvider from "../../provider/EditorProvider.tsx";
import Editor from "./Editor.tsx";
import {Fragment} from "react";

export const Frame = () => {

    return (
        <Fragment>
            <ReactFlowProvider>
                <EditorProvider>
                    <Editor/>
                </EditorProvider>
            </ReactFlowProvider>
        </Fragment>
    );

}