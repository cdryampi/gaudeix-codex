import { jsx as _jsx } from "react/jsx-runtime";
import { QueryClient, QueryClientProvider as TanStackQueryProvider, } from "@tanstack/react-query";
// Create a client
const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            refetchOnWindowFocus: false,
            retry: 1,
            staleTime: 5 * 60 * 1000, // 5 minutes
        },
    },
});
export function QueryProvider({ children }) {
    return (_jsx(TanStackQueryProvider, { client: queryClient, children: children }));
}
