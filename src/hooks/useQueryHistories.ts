import { useInfiniteQuery } from '@tanstack/react-query';
import { HistoryService } from '@/services/history.service';
import { IHistoryRespone } from '@/interfaces/history.interface';
import useAuthStore from '@/stores/auth.store';

interface OverviewQueryPayload {
    limit: number;
    cursor?: string;
    start_date?: Date;
    end_date?: Date;
}

type OverviewQueryCallback = (payload: OverviewQueryPayload) => Promise<{ histories: IHistoryRespone[]; hasMore: boolean }>;

export const useHistoryInfinite = (queryKey: any[], callbackFn: OverviewQueryCallback, extraPayload: Omit<OverviewQueryPayload, 'limit' | 'cursor'> = {}, limit = 24) => {
    return useInfiniteQuery({
        queryKey,
        queryFn: async ({ pageParam }: { pageParam?: string | null }) => {
            const response = await callbackFn({
                ...extraPayload,
                limit,
                cursor: pageParam || undefined,
            });
            return response;
        },
        getNextPageParam: (lastPage) => {
            if (lastPage.hasMore) {
                return lastPage.histories[lastPage.histories.length - 1]?._id;
            }
            return undefined;
        },
        initialPageParam: null as string | null, // Explicitly type initialPageParam
    });
};

export const useHistories = () => {
    const { authuser } = useAuthStore();
    return useHistoryInfinite(['histories', 'infinite', authuser], ({ limit, cursor }) =>
        HistoryService.getHistories({
            limit,
            last_id: cursor,
        }),
    );
};
