import {keepPreviousData, QueryClient, useMutation, UseMutationResult, useQuery, useQueryClient, UseQueryResult} from "@tanstack/react-query";
import {ExecutionDetail, ExecutionPagingModelListing} from "@kit-iai-proof/proof-config-manager-client";
import {v4 as uuidv4} from "uuid";
import {ENTITY_TYPES, EXECUTIONS_KEY, INVALIDATION_KEYS} from "../../utils/constants.ts";
import {useContext, useEffect, useMemo} from "react";
import ExecutionService from "../../services/ExecutionService.ts";
import {AuthContextProps, useAuth} from "react-oidc-context";
import {IExecutionService} from "../../services/interfaces/IExecutionService.ts";
import {AxiosError} from "axios";
import {useTranslation} from "react-i18next";
import {getErrorMessage} from "../../utils/error.ts";
import {IAppContext} from "../../provider/AppProvider.tsx";
import {AppContext} from "../../provider/AppContext.tsx";

export type UseExecutions = [ExecutionDetail[] | undefined, ExecutionPagingModelListing | undefined, ExecutionDetail | undefined, UseMutationResult<ExecutionDetail, AxiosError, ExecutionDetail, void>, UseMutationResult<boolean, AxiosError, string, void>];

interface IOptions {
    filter: boolean;
    executionId?: string;
    request?: any;
}

const useExecutions: ({request, executionId}: IOptions) => UseExecutions = ({
                                                                                request,
                                                                                executionId,
                                                                                filter
                                                                            }: IOptions): UseExecutions => {

    const queryClient: QueryClient = useQueryClient();
    const {user}: AuthContextProps = useAuth();
    const {t}: any = useTranslation();
    const {updateError, sessionKey, settings}: IAppContext = useContext<IAppContext>(AppContext);
    const executionService: IExecutionService = useMemo((): IExecutionService => new ExecutionService(settings.configBasePath, user?.access_token), [settings.configBasePath, user?.access_token]);

    const {data: execution, error: executionError}: UseQueryResult<ExecutionDetail, AxiosError> = useQuery({
        queryKey: [EXECUTIONS_KEY, executionId],
        enabled: !!executionId,
        retry: 2,
        queryFn: async ({queryKey, signal}: any): Promise<ExecutionDetail> => {
            return await executionService.getExecution(queryKey[1], signal);
        }
    });

    const {data: executions, error: executionsError}: UseQueryResult<ExecutionDetail[], AxiosError> = useQuery({
        queryKey: [EXECUTIONS_KEY],
        retry: 2,
        queryFn: async ({signal}: any): Promise<ExecutionDetail[]> => {
            return await executionService.getExecutions(signal);
        }
    });

    const {
        data: filteredExecutions,
        error: filteredExecutionsError
    }: UseQueryResult<ExecutionPagingModelListing, AxiosError> = useQuery({
        queryKey: [EXECUTIONS_KEY, request],
        retry: 2,
        enabled: filter && !!request,
        placeholderData: keepPreviousData,
        queryFn: async ({queryKey, signal}: any): Promise<ExecutionPagingModelListing> => {
            return await executionService.searchExecutions(signal, queryKey[1]);
        }
    });

    const mutation: UseMutationResult<ExecutionDetail, AxiosError, ExecutionDetail, any> = useMutation({
        retry: false,
        mutationFn: async (execution: ExecutionDetail): Promise<ExecutionDetail> => {
            if (execution.id) return await executionService.updateExecution(execution.id, execution, undefined, sessionKey);
            else return await executionService.saveExecution({...execution, id: uuidv4()}, undefined, sessionKey);
        },
        onMutate: async (): Promise<void> => {
            return await queryClient.cancelQueries({queryKey: [EXECUTIONS_KEY]});
        },
        onSuccess: async (result: ExecutionDetail): Promise<void> => {
            for (const queryKey of INVALIDATION_KEYS[EXECUTIONS_KEY]) await queryClient.invalidateQueries({
                queryKey: [queryKey],
                exact: false
            });
            await queryClient.setQueryData([EXECUTIONS_KEY, result.id], result);
        },
        onError: (error: AxiosError): void => {
            getErrorMessage(error, ENTITY_TYPES[EXECUTIONS_KEY], t)
        }
    });

    const deletion: UseMutationResult<boolean, AxiosError, string, void> = useMutation({
        retry: false,
        mutationFn: async (executionId: string): Promise<boolean> => {
            return await executionService.deleteExecution(executionId, undefined, sessionKey);
        },
        onSuccess: async (): Promise<void> => {
            for (const queryKey of INVALIDATION_KEYS[EXECUTIONS_KEY]) await queryClient.invalidateQueries({
                queryKey: [queryKey],
                exact: false
            });
        },
        onError: (error: AxiosError): void => {
            getErrorMessage(error, ENTITY_TYPES[EXECUTIONS_KEY], t)
        }
    });

    useEffect((): void => {
        if (executionError) updateError(getErrorMessage(executionError, ENTITY_TYPES[EXECUTIONS_KEY], t));
        if (executionsError) updateError(getErrorMessage(executionsError, EXECUTIONS_KEY, t));
        if (filteredExecutionsError) updateError(getErrorMessage(filteredExecutionsError, EXECUTIONS_KEY, t));
    }, [filteredExecutionsError, executionError, executionsError, updateError, t]);

    return [executions, filteredExecutions, execution, mutation, deletion];

};

export {useExecutions};
