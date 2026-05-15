import {keepPreviousData, QueryClient, useMutation, UseMutationResult, useQuery, useQueryClient, UseQueryResult} from "@tanstack/react-query";
import {TemplateDetail, TemplatePagingModelListing} from "@kit-iai-proof/proof-config-manager-client";
import {v4 as uuidv4} from "uuid";
import {ENTITY_TYPES, INVALIDATION_KEYS, TEMPLATES_KEY} from "../../utils/constants.ts";
import {useContext, useEffect, useMemo} from "react";
import TemplateService from "../../services/TemplateService.ts";
import {AuthContextProps, useAuth} from "react-oidc-context";
import {ITemplateService} from "../../services/interfaces/ITemplateService.ts";
import {AxiosError} from "axios";
import {useTranslation} from "react-i18next";
import {getErrorMessage} from "../../utils/error.ts";
import {IAppContext} from "../../provider/AppProvider.tsx";
import {AppContext} from "../../provider/AppContext.tsx";

export type UseTemplates = [TemplateDetail[] | undefined, TemplatePagingModelListing | undefined, TemplateDetail | undefined, UseMutationResult<TemplateDetail, AxiosError, TemplateDetail, void>, UseMutationResult<boolean, AxiosError, string, void>];

interface IOptions {
    filter: boolean;
    templateId?: string;
    templateIds?: string[];
    request?: any;
}

const useTemplates: ({request, templateId, templateIds}: IOptions) => UseTemplates = ({
                                                                                          request,
                                                                                          templateId,
                                                                                          filter
                                                                                      }: IOptions): UseTemplates => {

    const queryClient: QueryClient = useQueryClient();
    const {user}: AuthContextProps = useAuth();
    const {t}: any = useTranslation();
    const {updateError, sessionKey, settings}: IAppContext = useContext<IAppContext>(AppContext);
    const templateService: ITemplateService = useMemo((): ITemplateService => new TemplateService(settings.configBasePath, user?.access_token), [settings.configBasePath, user?.access_token]);

    const {data: template, error: templateError}: UseQueryResult<TemplateDetail, AxiosError> = useQuery({
        queryKey: [TEMPLATES_KEY, templateId],
        enabled: !!templateId,
        refetchOnWindowFocus: true,
        retry: 2,
        queryFn: async ({queryKey, signal}: any): Promise<TemplateDetail> => {
            return await templateService.getTemplate(queryKey[1], signal);
        }
    });

    const {data: templates, error: templatesError}: UseQueryResult<TemplateDetail[], AxiosError> = useQuery({
        queryKey: [TEMPLATES_KEY],
        refetchOnWindowFocus: true,
        retry: 2,
        queryFn: async ({signal}: any): Promise<TemplateDetail[]> => {
            return await templateService.getTemplates(signal);
        }
    });

    const {
        data: filteredTemplates,
        error: filteredTemplatesError
    }: UseQueryResult<TemplatePagingModelListing, AxiosError> = useQuery({
        queryKey: [TEMPLATES_KEY, request],
        refetchOnWindowFocus: true,
        retry: 2,
        enabled: filter && !!request,
        placeholderData: keepPreviousData,
        queryFn: async ({queryKey, signal}: any): Promise<TemplatePagingModelListing> => {
            return await templateService.searchTemplates(signal, queryKey[1]);
        }
    });

    const mutation: UseMutationResult<TemplateDetail, AxiosError, TemplateDetail, any> = useMutation({
        retry: false,
        mutationFn: async (template: TemplateDetail): Promise<TemplateDetail> => {
            if (template.id) return await templateService.updateTemplate(template.id, template, undefined, sessionKey);
            else return await templateService.saveTemplate({...template, id: uuidv4()}, undefined, sessionKey);
        },
        onMutate: async (): Promise<void> => {
            return await queryClient.cancelQueries({queryKey: [TEMPLATES_KEY]});
        },
        onSuccess: async (result: TemplateDetail): Promise<void> => {
            for (const queryKey of INVALIDATION_KEYS[TEMPLATES_KEY]) await queryClient.invalidateQueries({
                queryKey: [queryKey],
                exact: false
            });
            await queryClient.setQueryData([TEMPLATES_KEY, result.id], result);
        },
        onError: (error: AxiosError): void => {
            updateError(getErrorMessage(error, ENTITY_TYPES[TEMPLATES_KEY], t));
        }
    });

    const deletion: UseMutationResult<boolean, AxiosError, string, void> = useMutation({
        retry: false,
        mutationFn: async (templateId: string): Promise<boolean> => {
            return await templateService.deleteTemplate(templateId, undefined, sessionKey);
        },
        onSuccess: async (): Promise<void> => {
            for (const queryKey of INVALIDATION_KEYS[TEMPLATES_KEY]) await queryClient.invalidateQueries({
                queryKey: [queryKey],
                exact: false
            });
        },
        onError: (error: AxiosError): void => {
            updateError(getErrorMessage(error, ENTITY_TYPES[TEMPLATES_KEY], t));
        }
    });

    useEffect((): void => {
        if (templateError) updateError(getErrorMessage(templateError, ENTITY_TYPES[TEMPLATES_KEY], t));
        if (templatesError) updateError(getErrorMessage(templatesError, TEMPLATES_KEY, t));
        if (filteredTemplatesError) updateError(getErrorMessage(filteredTemplatesError, TEMPLATES_KEY, t));
    }, [filteredTemplatesError, templateError, templatesError, updateError, t]);

    return [templates, filteredTemplates, template, mutation, deletion];

};

export {useTemplates};
