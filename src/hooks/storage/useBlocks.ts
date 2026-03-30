import {keepPreviousData, QueryClient, useMutation, UseMutationResult, useQuery, useQueryClient, UseQueryResult} from "@tanstack/react-query";
import {BlockDetail, BlockPagingModelListing} from "@webis/proof-config-manager-client";
import {v4 as uuidv4} from "uuid";
import {BLOCKS_KEY, ENTITY_TYPES, INVALIDATION_KEYS} from "../../utils/constants.ts";
import {useContext, useEffect, useMemo} from "react";
import BlockService from "../../services/BlockService.ts";
import {AuthContextProps, useAuth} from "react-oidc-context";
import {IBlockService} from "../../services/interfaces/IBlockService.ts";
import {AxiosError} from "axios";
import {useTranslation} from "react-i18next";
import {getErrorMessage} from "../../utils/error.ts";
import {IAppContext} from "../../provider/AppProvider.tsx";
import {AppContext} from "../../provider/AppContext.tsx";

export type UseBlocks = [BlockDetail[] | undefined, BlockPagingModelListing | undefined, BlockDetail | undefined, UseMutationResult<BlockDetail, AxiosError, BlockDetail, void>, UseMutationResult<boolean, AxiosError, string, void>];

interface IOptions {
    filter: boolean;
    blockId?: string;
    request?: any;
}

const useBlocks: ({request, blockId}: IOptions) => UseBlocks = ({
                                                                    request,
                                                                    blockId,
                                                                    filter
                                                                }: IOptions): UseBlocks => {

    const queryClient: QueryClient = useQueryClient();
    const {user}: AuthContextProps = useAuth();
    const {t}: any = useTranslation();
    const {updateError, sessionKey, settings}: IAppContext = useContext<IAppContext>(AppContext);
    const blockService: IBlockService = useMemo((): IBlockService => new BlockService(settings.configBasePath, user?.access_token), [settings.configBasePath, user?.access_token]);

    const {data: block, error: blockError}: UseQueryResult<BlockDetail, AxiosError> = useQuery({
        queryKey: [BLOCKS_KEY, blockId],
        enabled: !!blockId,
        refetchOnWindowFocus: true,
        retry: 2,
        queryFn: async ({queryKey, signal}: any): Promise<BlockDetail> => {
            return await blockService.getBlock(queryKey[1], signal);
        }
    });

    const {data: blocks, error: blocksError}: UseQueryResult<BlockDetail[], AxiosError> = useQuery({
        queryKey: [BLOCKS_KEY],
        refetchOnWindowFocus: true,
        retry: 2,
        queryFn: async ({signal}: any): Promise<BlockDetail[]> => {
            return await blockService.getBlocks(signal);
        }
    });

    const {
        data: filteredBlocks,
        error: filteredBlocksError
    }: UseQueryResult<BlockPagingModelListing, AxiosError> = useQuery({
        queryKey: [BLOCKS_KEY, request],
        refetchOnWindowFocus: true,
        retry: 2,
        enabled: filter && !!request,
        placeholderData: keepPreviousData,
        queryFn: async ({queryKey, signal}: any): Promise<BlockPagingModelListing> => {
            return await blockService.searchBlocks(signal, queryKey[1]);
        }
    });

    const mutation: UseMutationResult<BlockDetail, AxiosError, BlockDetail, any> = useMutation({
        retry: false,
        mutationFn: async (block: BlockDetail): Promise<BlockDetail> => {
            if (block.id) return await blockService.updateBlock(block.id, block, undefined, sessionKey);
            else return await blockService.saveBlock({...block, id: uuidv4()}, undefined, sessionKey);
        },
        onMutate: async (): Promise<void> => {
            return await queryClient.cancelQueries({queryKey: [BLOCKS_KEY]});
        },
        onSuccess: async (result: BlockDetail): Promise<void> => {
            for (const queryKey of INVALIDATION_KEYS[BLOCKS_KEY]) await queryClient.invalidateQueries({
                queryKey: [queryKey],
                exact: false
            });
            await queryClient.setQueryData([BLOCKS_KEY, result.id], result);
        },
        onError: (error: AxiosError): void => {
            updateError(getErrorMessage(error, ENTITY_TYPES[BLOCKS_KEY], t));
        }
    });

    const deletion: UseMutationResult<boolean, AxiosError, string, void> = useMutation({
        retry: false,
        mutationFn: async (blockId: string): Promise<boolean> => {
            return await blockService.deleteBlock(blockId, undefined, sessionKey);
        },
        onSuccess: async (): Promise<void> => {
            for (const queryKey of INVALIDATION_KEYS[BLOCKS_KEY]) await queryClient.invalidateQueries({
                queryKey: [queryKey],
                exact: false
            });
        },
        onError: (error: AxiosError): void => {
            updateError(getErrorMessage(error, ENTITY_TYPES[BLOCKS_KEY], t));
        }
    });

    useEffect((): void => {
        if (blockError) updateError(getErrorMessage(blockError, ENTITY_TYPES[BLOCKS_KEY], t));
        if (blocksError) updateError(getErrorMessage(blocksError, BLOCKS_KEY, t));
        if (filteredBlocksError) updateError(getErrorMessage(filteredBlocksError, BLOCKS_KEY, t));
    }, [filteredBlocksError, blockError, blocksError, updateError, t]);

    return [blocks, filteredBlocks, block, mutation, deletion];

};

export {useBlocks};
