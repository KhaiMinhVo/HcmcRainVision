import { Box } from "@/components/ui/box";
import { Center } from "@/components/ui/center";
import { Spinner } from "@/components/ui/spinner";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";
import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import { FlatList, RefreshControl, TouchableOpacity } from "react-native";
import { adminService, IngestionJob, IngestionStats } from "../../services/admin";
import useAppStore from "../../store/useAppStore";

export default function AdminJobsScreen({ navigation }: any) {
    const token = useAppStore((s) => s.token);
    const [loading, setLoading] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [jobs, setJobs] = useState<IngestionJob[]>([]);
    const [stats, setStats] = useState<IngestionStats | null>(null);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const pageSize = 20;

    const fetchJobs = async (pageToFetch = 1, isRefresh = false) => {
        if (!token) return;

        if (pageToFetch === 1) {
            if (isRefresh) setRefreshing(true);
            else setLoading(true);

            // Fetch stats only on initial load or refresh
            try {
                const statsRes = await adminService.getIngestionStats(token, 7);
                if (statsRes.success && statsRes.data) {
                    setStats(statsRes.data);
                }
            } catch (e) {
                console.warn("Failed to fetch ingestion stats", e);
            }
        }

        setError(null);

        try {
            const res = await adminService.getIngestionJobs(token, pageToFetch, pageSize);
            if (res.success && res.data) {
                // the response might have jobs array or data array depending on the backend wrapping
                const newJobs = res.data.jobs || res.data.data || [];

                if (pageToFetch === 1) {
                    setJobs(newJobs);
                } else {
                    setJobs(prev => [...prev, ...newJobs]);
                }

                setHasMore((res.data.totalPages && pageToFetch < res.data.totalPages) || newJobs.length === pageSize);
                setPage(pageToFetch);
            } else {
                setError(res.error || "Failed to load jobs");
            }
        } catch (e: any) {
            setError(e.message);
        } finally {
            if (pageToFetch === 1) {
                setLoading(false);
                setRefreshing(false);
            }
        }
    };

    useEffect(() => {
        fetchJobs(1);
    }, [token]);

    const onRefresh = () => fetchJobs(1, true);

    const loadMore = () => {
        if (!loading && !refreshing && hasMore) {
            fetchJobs(page + 1);
        }
    };

    const renderStats = () => {
        if (!stats) return null;
        return (
            <Box className="bg-white p-4 mx-4 mt-4 rounded-xl shadow-sm mb-4">
                <Text className="text-lg font-bold text-gray-900 mb-2">Last 7 Days</Text>
                <Box className="flex-row justify-between mb-4">
                    <VStack className="items-center flex-1">
                        <Text className="text-2xl font-bold text-gray-900">{stats.jobs.total}</Text>
                        <Text className="text-xs text-gray-500">Total Jobs</Text>
                    </VStack>
                    <VStack className="items-center flex-1">
                        <Text className="text-2xl font-bold text-green-600">{stats.jobs.completed}</Text>
                        <Text className="text-xs text-green-600">Completed</Text>
                    </VStack>
                    <VStack className="items-center flex-1">
                        <Text className="text-2xl font-bold text-red-600">{stats.jobs.failed}</Text>
                        <Text className="text-xs text-red-600">Failed</Text>
                    </VStack>
                </Box>
                <Box className="bg-gray-50 p-2 rounded items-center">
                    <Text className="text-sm font-semibold text-gray-700">Success Rate: {stats.jobs.successRate}%</Text>
                </Box>
            </Box>
        );
    };

    const renderItem = ({ item }: { item: IngestionJob }) => {
        const isError = item.status === "Failed" || item.status === "Error";
        const statusColor = isError ? "text-red-600" : (item.status === "Completed" ? "text-green-600" : "text-blue-600");
        const bgColor = isError ? "bg-red-50" : (item.status === "Completed" ? "bg-green-50" : "bg-blue-50");

        return (
            <TouchableOpacity onPress={() => navigation.navigate("AdminJobDetail", { jobId: item.jobId })}>
                <Box className="bg-white p-4 rounded-xl shadow-sm mb-3 mx-4">
                    <Box className="flex-row justify-between items-center mb-2">
                        <Box className="flex-row items-center">
                            <Ionicons name="server" size={16} color="#4B5563" className="mr-2" />
                            <Text className="text-sm font-bold text-gray-900">Job {item.jobId.slice(0, 8)}...</Text>
                        </Box>
                        <Box className={`px-2 py-0.5 rounded ${bgColor}`}>
                            <Text className={`text-xs font-bold ${statusColor}`}>{item.status}</Text>
                        </Box>
                    </Box>

                    <Box className="mb-2">
                        <Text className="text-xs text-gray-500 mb-1">Started: {new Date(item.startedAt).toLocaleString()}</Text>
                        <Text className="text-xs text-gray-500">Duration: {(item.duration || 0).toFixed(2)}s</Text>
                    </Box>

                    <Box className="flex-row border-t border-gray-100 pt-2 mt-2">
                        <VStack className="flex-1 items-center">
                            <Text className="text-xs font-bold text-gray-700">{item.totalAttempts}</Text>
                            <Text className="text-xs text-gray-400">Attempts</Text>
                        </VStack>
                        <VStack className="flex-1 items-center border-l border-r border-gray-100">
                            <Text className="text-xs font-bold text-green-600">{item.successfulAttempts}</Text>
                            <Text className="text-xs text-gray-400">Success</Text>
                        </VStack>
                        <VStack className="flex-1 items-center">
                            <Text className="text-xs font-bold text-red-600">{item.failedAttempts}</Text>
                            <Text className="text-xs text-gray-400">Failed</Text>
                        </VStack>
                    </Box>
                </Box>
            </TouchableOpacity>
        );
    };

    return (
        <Box className="flex-1 bg-gray-50">
            {error && (
                <Box className="bg-red-100 p-4 m-4 rounded-xl">
                    <Text className="text-red-700">{error}</Text>
                </Box>
            )}

            {loading && jobs.length === 0 ? (
                <Center className="flex-1">
                    <Spinner size="large" />
                </Center>
            ) : (
                <FlatList
                    data={jobs}
                    renderItem={renderItem}
                    keyExtractor={(item) => item.jobId}
                    ListHeaderComponent={renderStats}
                    contentContainerStyle={{ paddingBottom: 16 }}
                    refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
                    onEndReached={loadMore}
                    onEndReachedThreshold={0.5}
                    ListFooterComponent={hasMore && jobs.length > 0 ? <Spinner size="small" className="my-4" /> : null}
                    ListEmptyComponent={
                        <Center className="py-10">
                            <Text className="text-gray-500">No jobs found</Text>
                        </Center>
                    }
                />
            )}
        </Box>
    );
}
