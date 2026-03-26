import {keepPreviousData, QueryClient, useMutation, UseMutationResult, useQuery, useQueryClient, UseQueryResult} from "@tanstack/react-query";
import {AttachmentDetail, AttachmentPagingModelListing} from "@webis/proof-config-manager-client";
import {v4 as uuidv4} from "uuid";
import {ATTACHMENTS_KEY, ENTITY_TYPES, INVALIDATION_KEYS} from "../../utils/constants.ts";
import {useContext, useEffect, useMemo} from "react";
import AttachmentService from "../../services/AttachmentService.ts";
import {AuthContextProps, useAuth} from "react-oidc-context";
import {IAttachmentService} from "../../services/interfaces/IAttachmentService.ts";
import {AxiosError} from "axios";
import {useTranslation} from "react-i18next";
import {getErrorMessage} from "../../utils/error.ts";
import {IAppContext} from "../../provider/AppProvider.tsx";
import {AppContext} from "../../provider/AppContext.tsx";

export type UseAttachments = [AttachmentDetail[] | undefined, AttachmentPagingModelListing | undefined, AttachmentDetail | undefined, UseMutationResult<AttachmentDetail, AxiosError, {
    attachment: AttachmentDetail,
    file: File | undefined
}, void>, UseMutationResult<boolean, AxiosError, string, void>];

interface IOptions {
    filter: boolean;
    attachmentId?: string;
    request?: any;
}

const useAttachments: ({request, attachmentId}: IOptions) => UseAttachments = ({
                                                                                   request,
                                                                                   attachmentId,
                                                                                   filter
                                                                               }: IOptions): UseAttachments => {

    const queryClient: QueryClient = useQueryClient();
    const {user}: AuthContextProps = useAuth();
    const {t}: any = useTranslation();
    const {updateError, sessionKey, settings}: IAppContext = useContext<IAppContext>(AppContext);
    const attachmentService: IAttachmentService = useMemo((): IAttachmentService => new AttachmentService(settings.configBasePath, user?.access_token), [settings.configBasePath, user?.access_token]);

    const {data: attachment, error: attachmentError}: UseQueryResult<AttachmentDetail, AxiosError> = useQuery({
        queryKey: [ATTACHMENTS_KEY, attachmentId],
        enabled: !!attachmentId,
        refetchOnWindowFocus: true,
        retry: 2,
        queryFn: async ({queryKey, signal}: any): Promise<AttachmentDetail> => {
            return await attachmentService.getAttachment(queryKey[1], signal);
        }
    });

    const {data: attachments, error: attachmentsError}: UseQueryResult<AttachmentDetail[], AxiosError> = useQuery({
        queryKey: [ATTACHMENTS_KEY],
        refetchOnWindowFocus: true,
        retry: 2,
        queryFn: async ({signal}: any): Promise<AttachmentDetail[]> => {
            return await attachmentService.getAttachments(signal);
        }
    });

    const {data: filteredAttachments, error: filteredAttachmentsError}: UseQueryResult<AttachmentPagingModelListing, AxiosError> = useQuery({
        queryKey: [ATTACHMENTS_KEY, request],
        refetchOnWindowFocus: true,
        retry: 2,
        enabled: filter && !!request,
        placeholderData: keepPreviousData,
        queryFn: async ({queryKey, signal}: any): Promise<AttachmentPagingModelListing> => {
            return await attachmentService.searchAttachment(signal, queryKey[1]);
        }
    });

    const mutation: UseMutationResult<AttachmentDetail, AxiosError, { attachment: AttachmentDetail, file: File | undefined }, any> = useMutation({
        retry: false,
        mutationFn: async ({attachment, file}): Promise<AttachmentDetail> => {
            if (attachment.id) return await attachmentService.updateAttachmentWithFile(attachment.id, attachment, file, undefined, sessionKey);
            else return await attachmentService.createAttachmentWithFile({...attachment, id: uuidv4()}, file, undefined, sessionKey);
        },
        onMutate: async (): Promise<void> => {
            return await queryClient.cancelQueries({queryKey: [ATTACHMENTS_KEY]});
        },
        onSuccess: async (result: AttachmentDetail): Promise<void> => {
            for (const queryKey of INVALIDATION_KEYS[ATTACHMENTS_KEY]) await queryClient.invalidateQueries({
                queryKey: [queryKey],
                exact: false
            });
            await queryClient.setQueryData([ATTACHMENTS_KEY, result.id], result);
        },
        onError: (error: AxiosError): void => {
            updateError(getErrorMessage(error, ENTITY_TYPES[ATTACHMENTS_KEY], t))
        }
    });

    const deletion: UseMutationResult<boolean, AxiosError, string, void> = useMutation({
        retry: false,
        mutationFn: async (attachmentId: string): Promise<boolean> => {
            return await attachmentService.deleteAttachment(attachmentId, undefined, sessionKey);
        },
        onSuccess: async (): Promise<void> => {
            for (const queryKey of INVALIDATION_KEYS[ATTACHMENTS_KEY]) await queryClient.invalidateQueries({
                queryKey: [queryKey],
                exact: false
            });
        },
        onError: (error: AxiosError): void => {
            updateError(getErrorMessage(error, ENTITY_TYPES[ATTACHMENTS_KEY], t))
        }
    });

    useEffect((): void => {
        if (attachmentError) updateError(getErrorMessage(attachmentError, ENTITY_TYPES[ATTACHMENTS_KEY], t));
        if (attachmentsError) updateError(getErrorMessage(attachmentsError, ATTACHMENTS_KEY, t));
        if (filteredAttachmentsError) updateError(getErrorMessage(filteredAttachmentsError, ATTACHMENTS_KEY, t));
    }, [filteredAttachmentsError, attachmentError, attachmentsError, updateError, t]);

    return [attachments, filteredAttachments, attachment, mutation, deletion];

};

export {useAttachments};
