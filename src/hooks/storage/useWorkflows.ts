import {keepPreviousData, QueryClient, useMutation, UseMutationResult, useQuery, useQueryClient, UseQueryResult} from "@tanstack/react-query";
import {WorkflowDetail, WorkflowPagingModelListing} from "@kit-iai-proof/proof-config-manager-client";
import {v4 as uuidv4} from "uuid";
import {ENTITY_TYPES, INVALIDATION_KEYS, WORKFLOWS_KEY} from "../../utils/constants.ts";
import {useContext, useEffect, useMemo} from "react";
import WorkflowService from "../../services/WorkflowService.ts";
import {AuthContextProps, useAuth} from "react-oidc-context";
import {IWorkflowService} from "../../services/interfaces/IWorkflowService.ts";
import {AxiosError} from "axios";
import {useTranslation} from "react-i18next";
import {getErrorMessage} from "../../utils/error.ts";
import {IAppContext} from "../../provider/AppProvider.tsx";
import {AppContext} from "../../provider/AppContext.tsx";

export type UseWorkflows = [WorkflowDetail[] | undefined, WorkflowPagingModelListing | undefined, WorkflowDetail | undefined, UseMutationResult<WorkflowDetail, AxiosError, WorkflowDetail, void>, UseMutationResult<boolean, AxiosError, string, void>];

interface IOptions {
    filter: boolean;
    workflowId?: string;
    request?: any;
}

const useWorkflows: ({request, workflowId}: IOptions) => UseWorkflows = ({
                                                                             request,
                                                                             workflowId,
                                                                             filter
                                                                         }: IOptions): UseWorkflows => {

    const queryClient: QueryClient = useQueryClient();
    const {user}: AuthContextProps = useAuth();
    const {t}: any = useTranslation();
    const {updateError, sessionKey, settings}: IAppContext = useContext<IAppContext>(AppContext);
    const workflowService: IWorkflowService = useMemo((): IWorkflowService => new WorkflowService(settings.configBasePath, user?.access_token), [settings.configBasePath, user?.access_token]);

    const {data: workflow, error: workflowError}: UseQueryResult<WorkflowDetail, AxiosError> = useQuery({
        queryKey: [WORKFLOWS_KEY, workflowId],
        enabled: !!workflowId,
        refetchOnWindowFocus: true,
        retry: 2,
        queryFn: async ({queryKey, signal}: any): Promise<WorkflowDetail> => {
            return await workflowService.getWorkflow(queryKey[1], signal);
        }
    });

    const {data: workflows, error: workflowsError}: UseQueryResult<WorkflowDetail[], AxiosError> = useQuery({
        queryKey: [WORKFLOWS_KEY],
        refetchOnWindowFocus: true,
        retry: 2,
        queryFn: async ({signal}: any): Promise<WorkflowDetail[]> => {
            return await workflowService.getWorkflows(signal);
        }
    });

    const {
        data: filteredWorkflows,
        error: filteredWorkflowsError
    }: UseQueryResult<WorkflowPagingModelListing, AxiosError> = useQuery({
        queryKey: [WORKFLOWS_KEY, request],
        refetchOnWindowFocus: true,
        retry: 2,
        enabled: filter && !!request,
        placeholderData: keepPreviousData,
        queryFn: async ({queryKey, signal}: any): Promise<WorkflowPagingModelListing> => {
            return await workflowService.searchWorkflows(signal, queryKey[1]);
        }
    });

    const mutation: UseMutationResult<WorkflowDetail, AxiosError, WorkflowDetail, any> = useMutation({
        retry: false,
        mutationFn: async (workflow: WorkflowDetail): Promise<WorkflowDetail> => {
            if (workflow.id) return await workflowService.updateWorkflow(workflow.id, workflow, undefined, sessionKey);
            else return await workflowService.saveWorkflow({...workflow, id: uuidv4()}, undefined, sessionKey);
        },
        onMutate: async (): Promise<void> => {
            return await queryClient.cancelQueries({queryKey: [WORKFLOWS_KEY]});
        },
        onSuccess: async (result: WorkflowDetail): Promise<void> => {
            for (const queryKey of INVALIDATION_KEYS[WORKFLOWS_KEY]) await queryClient.invalidateQueries({
                queryKey: [queryKey],
                exact: false
            });
            await queryClient.setQueryData([WORKFLOWS_KEY, result.id], result);
        },
        onError: (error: AxiosError): void => {
            updateError(getErrorMessage(error, ENTITY_TYPES[WORKFLOWS_KEY], t));
        }
    });

    const deletion: UseMutationResult<boolean, AxiosError, string, void> = useMutation({
        retry: false,
        mutationFn: async (workflowId: string): Promise<boolean> => {
            return await workflowService.deleteWorkflow(workflowId, undefined, sessionKey);
        },
        onSuccess: async (): Promise<void> => {
            for (const queryKey of INVALIDATION_KEYS[WORKFLOWS_KEY]) await queryClient.invalidateQueries({
                queryKey: [queryKey],
                exact: false
            });
        },
        onError: (error: AxiosError): void => {
            updateError(getErrorMessage(error, ENTITY_TYPES[WORKFLOWS_KEY], t));
        }
    });

    useEffect((): void => {
        if (workflowError) updateError(getErrorMessage(workflowError, ENTITY_TYPES[WORKFLOWS_KEY], t));
        if (workflowsError) updateError(getErrorMessage(workflowsError, WORKFLOWS_KEY, t));
        if (filteredWorkflowsError) updateError(getErrorMessage(filteredWorkflowsError, WORKFLOWS_KEY, t));
    }, [filteredWorkflowsError, workflowError, workflowsError, updateError, t]);

    return [workflows, filteredWorkflows, workflow, mutation, deletion];

};

export {useWorkflows};
