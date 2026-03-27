import {keepPreviousData, QueryClient, useMutation, UseMutationResult, useQuery, useQueryClient, UseQueryResult} from "@tanstack/react-query";
import {ProgramDetail, ProgramPagingModelListing} from "@webis/proof-config-manager-client";
import {v4 as uuidv4} from "uuid";
import {ENTITY_TYPES, INVALIDATION_KEYS, PROGRAMS_KEY} from "../../utils/constants.ts";
import {useContext, useEffect, useMemo} from "react";
import ProgramService from "../../services/ProgramService.ts";
import {AuthContextProps, useAuth} from "react-oidc-context";
import {IProgramService} from "../../services/interfaces/IProgramService.ts";
import {AxiosError} from "axios";
import {useTranslation} from "react-i18next";
import {getErrorMessage} from "../../utils/error.ts";
import {IAppContext} from "../../provider/AppProvider.tsx";
import {AppContext} from "../../provider/AppContext.tsx";

export type UsePrograms = [ProgramDetail[] | undefined, ProgramPagingModelListing | undefined, ProgramDetail | undefined, UseMutationResult<ProgramDetail, AxiosError, ProgramDetail, void>, UseMutationResult<boolean, AxiosError, string, void>];

interface IOptions {
    filter: boolean;
    programId?: string;
    request?: any;
}

const usePrograms: ({request, programId}: IOptions) => UsePrograms = ({
                                                                          request,
                                                                          programId,
                                                                          filter
                                                                      }: IOptions): UsePrograms => {

    const queryClient: QueryClient = useQueryClient();
    const {user}: AuthContextProps = useAuth();
    const {t}: any = useTranslation();
    const {updateError, sessionKey, settings}: IAppContext = useContext<IAppContext>(AppContext);
    const programService: IProgramService = useMemo((): IProgramService => new ProgramService(settings.configBasePath, user?.access_token), [settings.configBasePath, user?.access_token]);

    const {data: program, error: programError}: UseQueryResult<ProgramDetail, AxiosError> = useQuery({
        queryKey: [PROGRAMS_KEY, programId],
        enabled: !!programId,
        refetchOnWindowFocus: true,
        retry: 2,
        queryFn: async ({queryKey, signal}: any): Promise<ProgramDetail> => {
            return await programService.getProgram(queryKey[1], signal);
        }
    });

    const {data: programs, error: programsError}: UseQueryResult<ProgramDetail[], AxiosError> = useQuery({
        queryKey: [PROGRAMS_KEY],
        refetchOnWindowFocus: true,
        retry: 2,
        queryFn: async ({signal}: any): Promise<ProgramDetail[]> => {
            return await programService.getPrograms(signal);
        }
    });

    const {
        data: filteredPrograms,
        error: filteredProgramsError
    }: UseQueryResult<ProgramPagingModelListing, AxiosError> = useQuery({
        queryKey: [PROGRAMS_KEY, request],
        refetchOnWindowFocus: true,
        retry: 2,
        enabled: filter && !!request,
        placeholderData: keepPreviousData,
        queryFn: async ({queryKey, signal}: any): Promise<ProgramPagingModelListing> => {
            return await programService.searchPrograms(signal, queryKey[1]);
        }
    });

    const mutation: UseMutationResult<ProgramDetail, AxiosError, ProgramDetail, any> = useMutation({
        retry: false,
        mutationFn: async (program: ProgramDetail): Promise<ProgramDetail> => {
            if (program.id) return await programService.updateProgram(program.id, program, undefined, sessionKey);
            else return await programService.saveProgram({...program, id: uuidv4()}, undefined, sessionKey);
        },
        onMutate: async (): Promise<void> => {
            return await queryClient.cancelQueries({queryKey: [PROGRAMS_KEY]});
        },
        onSuccess: async (result: ProgramDetail): Promise<void> => {
            for (const queryKey of INVALIDATION_KEYS[PROGRAMS_KEY]) await queryClient.invalidateQueries({
                queryKey: [queryKey],
                exact: false
            });
            await queryClient.setQueryData([PROGRAMS_KEY, result.id], result);
        },
        onError: (error: AxiosError): void => {
            updateError(getErrorMessage(error, ENTITY_TYPES[PROGRAMS_KEY], t));
        }
    });

    const deletion: UseMutationResult<boolean, AxiosError, string, void> = useMutation({
        retry: false,
        mutationFn: async (programId: string): Promise<boolean> => {
            return await programService.deleteProgram(programId, undefined, sessionKey);
        },
        onSuccess: async (): Promise<void> => {
            for (const queryKey of INVALIDATION_KEYS[PROGRAMS_KEY]) await queryClient.invalidateQueries({
                queryKey: [queryKey],
                exact: false
            });
        },
        onError: (error: AxiosError): void => {
            updateError(getErrorMessage(error, ENTITY_TYPES[PROGRAMS_KEY], t));
        }
    });

    useEffect((): void => {
        if (programError) updateError(getErrorMessage(programError, ENTITY_TYPES[PROGRAMS_KEY], t));
        if (programsError) updateError(getErrorMessage(programsError, PROGRAMS_KEY, t));
        if (filteredProgramsError) updateError(getErrorMessage(filteredProgramsError, PROGRAMS_KEY, t));
    }, [filteredProgramsError, programError, programsError, updateError, t]);

    return [programs, filteredPrograms, program, mutation, deletion];

};

export {usePrograms};
