import {keepPreviousData, QueryClient, QueryClientProvider} from "@tanstack/react-query";
import {Fragment, ReactNode} from "react";

interface IProps {
    children: ReactNode;
}

const queryClient: QueryClient = new QueryClient({
    defaultOptions: {
        queries: {
            placeholderData: keepPreviousData,
            staleTime: 5000,
            gcTime: 100000,
            refetchOnMount: true,
            refetchOnReconnect: true,
            refetchOnWindowFocus: true,
            retryDelay: 3000,
            retry: 3
        }
    }
});

const Query: ({children}: IProps) => ReactNode = ({children}: IProps): ReactNode => {

    return (
        <Fragment>
            <QueryClientProvider client={queryClient}>
                {children}
            </QueryClientProvider>
        </Fragment>
    )
}

export default Query;