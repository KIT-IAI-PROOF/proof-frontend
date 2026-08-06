import {ReactNode, useCallback, useEffect, useState} from "react";
import {
    AttachmentDetail,
    AttachmentPagingModelListing,
    BlockDetail,
    BlockPagingModelListing,
    ProgramDetail,
    ProgramPagingModelListing,
    TemplateDetail,
    TemplatePagingModelListing,
    WorkflowDetail,
    WorkflowPagingModelListing
} from "@webis/proof-config-manager-client";
import {useWorkflows} from "../hooks/storage/useWorkflows.ts";
import {UseMutationResult} from "@tanstack/react-query";
import {GridFilterModel, GridPaginationModel, GridSortModel} from "@mui/x-data-grid";
import {DEFAULT_FILTER, DEFAULT_PAGINATION, DEFAULT_CONFIGS_SORTING, DEFAULT_TEMPLATES_SORTING} from "../utils/constants.ts";
import {useBlocks} from "../hooks/storage/useBlocks.ts";
import {useTemplates} from "../hooks/storage/useTemplates.ts";
import {useWebSocket} from "../hooks/useWebSocket.ts";
import {usePrograms} from "../hooks/storage/usePrograms.ts";
import {useAttachments} from "../hooks/storage/useAttachments.ts";
import {ConfigContext} from "./IConfigContext.tsx";

interface IProps {
    children: ReactNode;
}

export interface IConfigContext {
    workflows: WorkflowPagingModelListing | undefined;
    workflow: WorkflowDetail | undefined;
    blocks: BlockPagingModelListing | undefined;
    block: BlockDetail | undefined;
    templates: TemplatePagingModelListing | undefined;
    template: TemplateDetail | undefined;
    programs: ProgramPagingModelListing | undefined;
    program: ProgramDetail | undefined;
    attachments: AttachmentPagingModelListing | undefined;
    attachment: AttachmentDetail | undefined;
    workflowsSortModel: GridSortModel | undefined;
    workflowsFilterModel: GridFilterModel | undefined;
    workflowsPaginationModel: GridPaginationModel | undefined;
    updateWorkflowId: (workflowId: string | undefined) => void;
    blocksSortModel: GridSortModel | undefined;
    blocksFilterModel: GridFilterModel | undefined;
    blocksPaginationModel: GridPaginationModel | undefined;
    updateBlockId: (blockId: string | undefined) => void;
    templatesSortModel: GridSortModel | undefined;
    templatesFilterModel: GridFilterModel | undefined;
    templatesPaginationModel: GridPaginationModel | undefined;
    updateTemplateId: (templateId: string | undefined) => void;
    programsSortModel: GridSortModel | undefined;
    programsFilterModel: GridFilterModel | undefined;
    programsPaginationModel: GridPaginationModel | undefined;
    updateProgramId: (programsId: string | undefined) => void;
    attachmentsSortModel: GridSortModel | undefined;
    attachmentsFilterModel: GridFilterModel | undefined;
    attachmentsPaginationModel: GridPaginationModel | undefined;
    updateAttachmentId: (attachmentId: string | undefined) => void;
    onSortModelChange: (sortModel: GridSortModel, isWorkflow: boolean, isTemplate: boolean, isBlock: boolean, isProgram: boolean, isAttachment: boolean) => void;
    onFilterModelChange: (filterModel: GridFilterModel, isWorkflow: boolean, isTemplate: boolean, isBlock: boolean, isProgram: boolean, isAttachment: boolean) => void;
    onPaginationModelChange: (paginationModel: GridPaginationModel, isWorkflow: boolean, isTemplate: boolean, isBlock: boolean, isProgram: boolean, isAttachment: boolean) => void;
    blockMutation: UseMutationResult<BlockDetail, Error, BlockDetail, void>;
    workflowMutation: UseMutationResult<WorkflowDetail, any, WorkflowDetail, void>;
    templateMutation: UseMutationResult<TemplateDetail, Error, TemplateDetail, void>;
    templateDeletion: UseMutationResult<boolean, Error, string, void>;
    programMutation: UseMutationResult<ProgramDetail, Error, ProgramDetail, void>;
    deleteProgramMutation: UseMutationResult<boolean, Error, string, void>;
    attachmentMutation: UseMutationResult<AttachmentDetail, Error, {
        attachment: AttachmentDetail,
        file: File | undefined
    }, void>;
    attachmentDeletion: UseMutationResult<boolean, Error, string, void>
    blockDeletion: UseMutationResult<boolean, Error, string, void>;
    workflowDeletion: UseMutationResult<boolean, any, string, void>;
    jsonError: { [key: string]: string | undefined; };
    updateJsonError: (key: string, value: string | undefined) => void;
    templatesRequest: any;
    blocksRequest: any;
    workflowsRequest: any;
    programsRequest: any;
    attachmentsRequest: any;
}

const ConfigProvider = ({children}: IProps): ReactNode => {

    const [workflowId, setWorkflowId] = useState<string | undefined>(undefined);
    const [workflowsRequest, setWorkflowsRequest] = useState<any>();
    const [workflowsSortModel, setWorkflowsSortModel] = useState<GridSortModel>(DEFAULT_CONFIGS_SORTING);
    const [workflowsFilterModel, setWorkflowsFilterModel] = useState<GridFilterModel>(DEFAULT_FILTER);
    const [workflowsPaginationModel, setWorkflowsPaginationModel] = useState<GridPaginationModel>(DEFAULT_PAGINATION);
    const [blockId, setBlockId] = useState<string | undefined>(undefined);
    const [blocksRequest, setBlocksRequest] = useState<any>();
    const [blocksSortModel, setBlocksSortModel] = useState<GridSortModel>(DEFAULT_CONFIGS_SORTING);
    const [blocksFilterModel, setBlocksFilterModel] = useState<GridFilterModel>(DEFAULT_FILTER);
    const [blocksPaginationModel, setBlocksPaginationModel] = useState<GridPaginationModel>(DEFAULT_PAGINATION);
    const [templateId, setTemplateId] = useState<string | undefined>(undefined);
    const [templatesRequest, setTemplatesRequest] = useState<any>();
    const [templatesSortModel, setTemplatesSortModel] = useState<GridSortModel>(DEFAULT_TEMPLATES_SORTING);
    const [templatesFilterModel, setTemplatesFilterModel] = useState<GridFilterModel>(DEFAULT_FILTER);
    const [templatesPaginationModel, setTemplatesPaginationModel] = useState<GridPaginationModel>(DEFAULT_PAGINATION);
    const [programId, setProgramId] = useState<string | undefined>(undefined);
    const [programsRequest, setProgramsRequest] = useState<any>();
    const [programsSortModel, setProgramsSortModel] = useState<GridSortModel>(DEFAULT_CONFIGS_SORTING);
    const [programsFilterModel, setProgramsFilterModel] = useState<GridFilterModel>(DEFAULT_FILTER);
    const [programsPaginationModel, setProgramsPaginationModel] = useState<GridPaginationModel>(DEFAULT_PAGINATION);
    const [attachmentId, setAttachmentId] = useState<string | undefined>(undefined);
    const [attachmentsRequest, setAttachmentsRequest] = useState<any>();
    const [attachmentsSortModel, setAttachmentsSortModel] = useState<GridSortModel>(DEFAULT_CONFIGS_SORTING);
    const [attachmentsFilterModel, setAttachmentsFilterModel] = useState<GridFilterModel>(DEFAULT_FILTER);
    const [attachmentsPaginationModel, setAttachmentsPaginationModel] = useState<GridPaginationModel>(DEFAULT_PAGINATION);
    const [jsonError, setJsonError] = useState<{ [key: string]: string | undefined; }>({});

    const [, filteredWorkflows, workflow, workflowMutation, workflowDeletion] = useWorkflows({
        workflowId: workflowId,
        request: workflowsRequest,
        filter: true
    });

    const [, filteredBlocks, block, blockMutation, blockDeletion] = useBlocks({
        blockId: blockId,
        request: blocksRequest,
        filter: true
    });

    const [, filteredTemplates, template, templateMutation, deleteTemplateMutation] = useTemplates({
        templateId: templateId,
        request: templatesRequest,
        filter: true
    });

    const [, filteredPrograms, program, programMutation, deleteProgramMutation] = usePrograms({
        programId: programId,
        request: programsRequest,
        filter: true
    })

    const [, filteredAttachments, attachment, attachmentMutation, deleteAttachmentMutation] = useAttachments({
        attachmentId: attachmentId,
        request: attachmentsRequest,
        filter: true
    })

    const updateJsonError: (key: string, value: string | undefined) => void = useCallback((key: string, value: string | undefined): void => {
        setJsonError((prevState: { [p: string]: string | undefined }): { [p: string]: string | undefined } => ({
            ...prevState,
            [key]: value
        }))
    }, []);


    useEffect((): void => {
        setWorkflowsRequest({
            sort: workflowsSortModel,
            filter: workflowsFilterModel,
            pagination: workflowsPaginationModel
        });
    }, [workflowsSortModel, workflowsFilterModel, workflowsPaginationModel]);

    useEffect((): void => {
        setBlocksRequest({
            sort: blocksSortModel,
            filter: blocksFilterModel,
            pagination: blocksPaginationModel
        });
    }, [blocksFilterModel, blocksPaginationModel, blocksSortModel]);

    useEffect((): void => {
        setTemplatesRequest({
            sort: templatesSortModel,
            filter: templatesFilterModel,
            pagination: templatesPaginationModel
        })
    }, [templatesSortModel, templatesFilterModel, templatesPaginationModel]);

    useEffect(() => {
        setProgramsRequest({
            sort: programsSortModel,
            filter: programsFilterModel,
            pagination: programsPaginationModel
        })
    }, [programsFilterModel, programsPaginationModel, programsSortModel]);

    useEffect(() => {
        setAttachmentsRequest({
            sort: attachmentsSortModel,
            filter: attachmentsFilterModel,
            pagination: attachmentsPaginationModel
        })
    }, [attachmentsFilterModel, attachmentsPaginationModel, attachmentsSortModel]);

    const updateWorkflowId: (workflowId: string | undefined) => void = useCallback((workflowId: string | undefined): void => {
        setWorkflowId(workflowId);
    }, []);

    const updateBlockId: (blockId: string | undefined) => void = useCallback((blockId: string | undefined): void => {
        setBlockId(blockId);
    }, []);

    const updateTemplateId: (templateId: string | undefined) => void = useCallback((templateId: string | undefined): void => {
        setTemplateId(templateId);
    }, []);

    const updateProgramId: (programId: string | undefined) => void = useCallback((programId: string | undefined): void => {
        setProgramId(programId);
    }, []);

    const updateAttachmentId: (attachmentId: string | undefined) => void = useCallback((attachmentId: string | undefined): void => {
        setAttachmentId(attachmentId);
    }, []);

    const onSortModelChange = useCallback((sortModel: GridSortModel, isWorkflow: boolean, isTemplate: boolean, isBlock: boolean, isProgram: boolean, isAttachment: boolean) => {
        if (isWorkflow) {
            setWorkflowsSortModel(sortModel);
        } else if (isBlock) {
            setBlocksSortModel(sortModel);
        } else if (isTemplate) {
            setTemplatesSortModel(sortModel);
        } else if (isProgram) {
            setProgramsSortModel(sortModel);
        } else if (isAttachment) {
            setAttachmentsSortModel(sortModel);
        }
    }, []);

    const onFilterModelChange = useCallback((filterModel: GridFilterModel, isWorkflow: boolean, isTemplate: boolean, isBlock: boolean, isProgram: boolean, isAttachment: boolean) => {
        if (isWorkflow) {
            setWorkflowsFilterModel(filterModel);
        } else if (isBlock) {
            setBlocksFilterModel(filterModel);
        } else if (isTemplate) {
            setTemplatesFilterModel(filterModel);
        } else if (isProgram) {
            setProgramsFilterModel(filterModel);
        } else if (isAttachment) {
            setAttachmentsFilterModel(filterModel);
        }
    }, []);

    const onPaginationModelChange = useCallback((paginationModel: GridPaginationModel, isWorkflow: boolean, isTemplate: boolean, isBlock: boolean, isProgram: boolean, isAttachment: boolean) => {
        if (isWorkflow) {
            setWorkflowsPaginationModel(paginationModel);
        } else if (isBlock) {
            setBlocksPaginationModel(paginationModel);
        } else if (isTemplate) {
            setTemplatesPaginationModel(paginationModel);
        } else if (isProgram) {
            setProgramsPaginationModel(paginationModel);
        } else if (isAttachment) {
            setAttachmentsPaginationModel(paginationModel);
        }
    }, []);

    useWebSocket({workflow: workflow, block: block, template: template});

    return (
        <ConfigContext.Provider
            value={{
                workflows: filteredWorkflows,
                workflow,
                updateWorkflowId,
                blocks: filteredBlocks,
                block,
                updateBlockId,
                templates: filteredTemplates,
                template,
                updateTemplateId,
                programs: filteredPrograms,
                program,
                updateProgramId,
                attachments: filteredAttachments,
                attachment,
                updateAttachmentId,
                onSortModelChange,
                onFilterModelChange,
                onPaginationModelChange,
                workflowsSortModel,
                workflowsFilterModel,
                workflowsPaginationModel,
                blocksSortModel,
                blocksFilterModel,
                blocksPaginationModel,
                templatesSortModel,
                templatesFilterModel,
                templatesPaginationModel,
                programsSortModel,
                programsFilterModel,
                programsPaginationModel,
                attachmentsSortModel,
                attachmentsFilterModel,
                attachmentsPaginationModel,
                jsonError,
                updateJsonError,
                blockMutation: blockMutation,
                blockDeletion: blockDeletion,
                templateMutation: templateMutation,
                templateDeletion: deleteTemplateMutation,
                workflowMutation: workflowMutation,
                programMutation: programMutation,
                deleteProgramMutation: deleteProgramMutation,
                attachmentMutation: attachmentMutation,
                attachmentDeletion: deleteAttachmentMutation,
                templatesRequest: templatesRequest,
                blocksRequest: blocksRequest,
                workflowsRequest: workflowsRequest,
                programsRequest: programsRequest,
                attachmentsRequest: attachmentsRequest,
                workflowDeletion: workflowDeletion
            }}>
            {children}
        </ConfigContext.Provider>
    );
};

export default ConfigProvider;