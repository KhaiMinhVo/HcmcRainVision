import { Box } from "@/components/ui/box";
import { Center } from "@/components/ui/center";
import { Spinner } from "@/components/ui/spinner";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";
import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import { Alert, Linking, RefreshControl, ScrollView, TouchableOpacity } from "react-native";
import { adminService, CameraHealth, FailedCamera } from "../../services/admin";
import useAppStore from "../../store/useAppStore";

export default function AdminCamerasScreen() {
    const token = useAppStore((s) => s.token);
    const [loading, setLoading] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [failedCameras, setFailedCameras] = useState<{ totalFailed: number; cameras: FailedCamera[] } | null>(null);
    const [healthData, setHealthData] = useState<CameraHealth | null>(null);
    const [error, setError] = useState<string | null>(null);

    const fetchData = async (isRefresh = false) => {
        if (!token) return;
        if (isRefresh) setRefreshing(true);
        else setLoading(true);
        setError(null);

        try {
            const [failedRes, healthRes] = await Promise.all([
                adminService.getFailedCameras(token),
                adminService.getCameraHealth(token),
            ]);

            if (failedRes.success && failedRes.data) {
                setFailedCameras(failedRes.data);
            } else {
                setError(failedRes.error || "Failed to load failed cameras data");
            }

            if (healthRes.success && healthRes.data) {
                setHealthData(healthRes.data);
            } else if (!error) {
                setError(healthRes.error || "Failed to load camera health data");
            }
        } catch (e: any) {
            setError(e.message);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [token]);

    const onRefresh = () => fetchData(true);

    if (loading && !failedCameras && !healthData) {
        return (
            <Center className="flex-1 bg-gray-50">
                <Spinner size="large" />
            </Center>
        );
    }

    const renderHealthSummary = () => {
        if (!healthData) return null;
        const { summary } = healthData;

        return (
            <Box className="bg-white p-4 rounded-xl shadow-sm mb-6 mx-4 mt-4">
                <Text className="text-lg font-bold text-gray-900 mb-3">Health Summary</Text>

                <Box className="flex-row flex-wrap justify-between border-b border-gray-100 pb-3 mb-3">
                    <VStack className="items-center w-1/4">
                        <Text className="text-xl font-bold text-gray-900">{summary.totalCameras}</Text>
                        <Text className="text-xs text-gray-500">Total</Text>
                    </VStack>
                    <VStack className="items-center w-1/4">
                        <Text className="text-xl font-bold text-green-600">{summary.active}</Text>
                        <Text className="text-xs text-green-600">Active</Text>
                    </VStack>
                    <VStack className="items-center w-1/4">
                        <Text className="text-xl font-bold text-red-600">{summary.offline}</Text>
                        <Text className="text-xs text-red-600">Offline</Text>
                    </VStack>
                    <VStack className="items-center w-1/4">
                        <Text className="text-xl font-bold text-orange-500">{summary.maintenance}</Text>
                        <Text className="text-xs text-orange-500">Maint.</Text>
                    </VStack>
                </Box>

                <Text className="text-xs text-gray-400 text-center italic">{summary.note}</Text>
                <Text className="text-xs text-gray-400 text-center mt-1">
                    Last Check: {new Date(summary.checkedAt).toLocaleString()}
                </Text>
            </Box>
        );
    };

    const openStream = (url: string | null) => {
        if (!url) {
            Alert.alert("Error", "No stream URL available.");
            return;
        }
        Linking.openURL(url).catch(() => {
            Alert.alert("Error", "Could not open stream URL.");
        });
    };

    return (
        <ScrollView
            className="flex-1 bg-gray-50"
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        >
            {error && (
                <Box className="bg-red-100 p-4 m-4 rounded-xl">
                    <Text className="text-red-700">{error}</Text>
                </Box>
            )}

            {renderHealthSummary()}

            {failedCameras && failedCameras.cameras.length > 0 && (
                <Box className="px-4 mb-6">
                    <Box className="bg-red-50 border border-red-200 rounded-lg p-3 mb-3 flex-row items-center">
                        <Ionicons name="warning" size={20} color="#DC2626" className="mr-2" />
                        <Text className="text-red-800 font-bold">
                            {failedCameras.totalFailed} cameras are currently failing
                        </Text>
                    </Box>

                    {failedCameras.cameras.map((cam) => (
                        <Box key={cam.id} className="bg-white p-4 rounded-xl shadow-sm mb-3 border-l-4 border-red-500">
                            <Text className="text-sm font-bold text-gray-900 mb-1">{cam.name}</Text>
                            <Text className="text-xs text-gray-500 mb-2">ID: {cam.id}</Text>

                            <Box className="bg-gray-50 p-2 rounded mb-3">
                                <Text className="text-xs text-red-600 font-semibold">{cam.status}</Text>
                            </Box>

                            <TouchableOpacity
                                onPress={() => openStream(cam.streamUrl)}
                                className="flex-row items-center"
                            >
                                <Ionicons name="link" size={16} color="#3B82F6" className="mr-1" />
                                <Text className="text-sm text-blue-600 font-medium">Test Stream URL</Text>
                            </TouchableOpacity>
                        </Box>
                    ))}
                </Box>
            )}

            {(!failedCameras || failedCameras.cameras.length === 0) && (
                <Center className="py-10">
                    <Ionicons name="checkmark-circle-outline" size={48} color="#10B981" />
                    <Text className="text-gray-500 mt-2">All cameras are operating normally.</Text>
                </Center>
            )}
        </ScrollView>
    );
}
