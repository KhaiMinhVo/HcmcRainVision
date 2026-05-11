import { Box } from "@/components/ui/box";
import { Center } from "@/components/ui/center";
import { Spinner } from "@/components/ui/spinner";
import { Text } from "@/components/ui/text";
import React, { useEffect, useState } from "react";
import { FlatList, RefreshControl } from "react-native";
import { adminService, IngestionJob, IngestionJobAttempt } from "../../services/admin";
import useAppStore from "../../store/useAppStore";

export default function AdminJobDetailScreen({ route }: any) {
    const { jobId } = route.params;
    const token = useAppStore((s) => s.token);
    const [loading, setLoading] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [job, setJob] = useState<IngestionJob | null>(null);
    const [error, setError] = useState<string | null>(null);

    const fetchJob = async (isRefresh = false) => {
        if (!token || !jobId) return;
        if (isRefresh) setRefreshing(true);
        else setLoading(true);
        setError(null);

        try {
            const res = await adminService.getIngestionJobDetails(jobId, token);
            if (res.success && res.data) {
                setJob(res.data);
            } else {
                setError(res.error || "Failed to load job details");
            }
        } catch (e: any) {
            setError(e.message);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchJob();
    }, [token, jobId]);

    const onRefresh = () => fetchJob(true);

    if (loading && !job) {
        return (
            <Center className="flex-1 bg-gray-50">
                <Spinner size="large" />
            </Center>
        );
    }

    if (!job) {
        return (
            <Center className="flex-1 bg-gray-50">
                <Text className="text-gray-500">Job not found</Text>
            </Center>
        );
    }

    const renderAttempt = ({ item }: { item: IngestionJobAttempt }) => {
        const isError = item.status === "Error" || item.status === "Failed";

        return (
            <Box className={`bg-white p-4 rounded-xl shadow-sm mb-3 mx-4 border-l-4 ${isError ? "border-red-500" : "border-green-500"}`}>
                <Box className="flex-row justify-between items-center mb-1">
                    <Text className="text-sm font-bold text-gray-900">{item.cameraId}</Text>
                    <Text className={`text-xs font-bold ${isError ? "text-red-600" : "text-green-600"}`}>{item.status}</Text>
                </Box>

                <Box className="flex-row justify-between mt-1">
                    <Text className="text-xs text-gray-500">Latency: {item.latencyMs}ms</Text>
                    <Text className="text-xs text-gray-500">HTTP {item.httpStatus}</Text>
                </Box>

                {item.errorMessage && (
                    <Box className="mt-2 bg-red-50 p-2 rounded">
                        <Text className="text-xs text-red-600">{item.errorMessage}</Text>
                    </Box>
                )}
            </Box>
        );
    };

    return (
        <Box className="flex-1 bg-gray-50">
            <Box className="bg-white p-5 shadow-sm z-10">
                <Text className="text-lg font-bold text-gray-900 mb-1">Job Details</Text>
                <Text className="text-xs text-gray-500 mb-4">{job.jobId}</Text>

                <Box className="flex-row justify-between mb-2">
                    <Text className="text-sm text-gray-500">Status</Text>
                    <Text className={`text-sm font-bold ${job.status === "Completed" ? "text-green-600" : "text-red-600"}`}>{job.status}</Text>
                </Box>
                <Box className="flex-row justify-between mb-2">
                    <Text className="text-sm text-gray-500">Started</Text>
                    <Text className="text-sm text-gray-900">{new Date(job.startedAt).toLocaleString()}</Text>
                </Box>
                <Box className="flex-row justify-between mb-2">
                    <Text className="text-sm text-gray-500">Duration</Text>
                    <Text className="text-sm text-gray-900">{(job.duration || 0).toFixed(2)}s</Text>
                </Box>
                <Box className="bg-gray-50 p-2 mt-2 rounded">
                    <Text className="text-xs text-gray-600 italic">{job.notes}</Text>
                </Box>
            </Box>

            {error ? (
                <Box className="bg-red-100 p-4 m-4 rounded-xl">
                    <Text className="text-red-700">{error}</Text>
                </Box>
            ) : (
                <FlatList
                    data={job.attempts || []}
                    renderItem={renderAttempt}
                    keyExtractor={(item) => item.attemptId}
                    contentContainerStyle={{ paddingTop: 16, paddingBottom: 16 }}
                    refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
                    ListEmptyComponent={
                        <Center className="py-10">
                            <Text className="text-gray-500">No attempts logged for this job.</Text>
                        </Center>
                    }
                />
            )}
        </Box>
    );
}
