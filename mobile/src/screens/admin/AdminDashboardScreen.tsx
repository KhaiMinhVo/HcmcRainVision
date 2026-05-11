import { Box } from "@/components/ui/box";
import { Center } from "@/components/ui/center";
import { Spinner } from "@/components/ui/spinner";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";
import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import { RefreshControl, ScrollView, TouchableOpacity } from "react-native";
import { adminService, AdminStats, RainFrequency } from "../../services/admin";
import useAppStore from "../../store/useAppStore";

export default function AdminDashboardScreen({ navigation }: any) {
    const token = useAppStore((s) => s.token);
    const [loading, setLoading] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [stats, setStats] = useState<AdminStats | null>(null);
    const [rainFreq, setRainFreq] = useState<RainFrequency[]>([]);
    const [error, setError] = useState<string | null>(null);

    const fetchData = async (isRefresh = false) => {
        if (!token) return;
        if (isRefresh) setRefreshing(true);
        else setLoading(true);
        setError(null);

        try {
            const [statsRes, freqRes] = await Promise.all([
                adminService.getStats(token),
                adminService.getRainFrequency(token),
            ]);

            if (statsRes.success && statsRes.data) {
                setStats(statsRes.data);
            } else {
                setError(statsRes.error || "Failed to load stats");
            }

            if (freqRes.success && freqRes.data) {
                setRainFreq(freqRes.data);
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

    if (loading && !stats) {
        return (
            <Center className="flex-1 bg-gray-50">
                <Spinner size="large" />
            </Center>
        );
    }

    // Find max count for the bar chart scaling
    const maxFreq = rainFreq.length > 0 ? Math.max(...rainFreq.map((r) => r.count)) : 1;

    const renderCard = (title: string, value: string | number, icon: string, color: string) => (
        <Box className="bg-white p-4 rounded-xl shadow-sm flex-1 mx-1 mb-2 items-center">
            <Ionicons name={icon as any} size={28} color={color} className="mb-2" />
            <Text className="text-2xl font-bold text-gray-900 mb-1">{value}</Text>
            <Text className="text-xs text-gray-500 text-center">{title}</Text>
        </Box>
    );

    const renderNavButton = (title: string, icon: string, route: string) => (
        <TouchableOpacity onPress={() => navigation.navigate(route)}>
            <Box className="bg-white p-4 rounded-xl shadow-sm mb-3 flex-row items-center justify-between">
                <Box className="flex-row items-center">
                    <Ionicons name={icon as any} size={24} color="#374151" className="mr-3" />
                    <Text className="text-base text-gray-900 ml-3">{title}</Text>
                </Box>
                <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
            </Box>
        </TouchableOpacity>
    );

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

            {/* System Stats Summary */}
            <Box className="px-3 pt-4">
                <Text className="text-lg font-bold text-gray-900 mb-3 ml-1">System Overview</Text>
                <Box className="flex-row flex-wrap justify-between">
                    {renderCard("Cameras", stats?.totalCameras || 0, "videocam", "#3B82F6")}
                    {renderCard("Weather Logs", stats?.totalWeatherLogs || 0, "cloud", "#10B981")}
                </Box>
                <Box className="flex-row flex-wrap justify-between mt-1">
                    {renderCard("User Reports", stats?.totalUserReports || 0, "flag", "#F59E0B")}
                    {renderCard("Status", stats?.systemStatus || "Unknown", "pulse", stats?.systemStatus === "Running" ? "#10B981" : "#EF4444")}
                </Box>
            </Box>

            {/* Rain Frequency Chart */}
            {rainFreq.length > 0 && (
                <Box className="px-4 mt-6">
                    <Text className="text-lg font-bold text-gray-900 mb-3">Rain Frequency (Last 7 Days)</Text>
                    <Box className="bg-white p-4 rounded-xl shadow-sm">
                        <Text className="text-xs text-center text-gray-500 mb-4">Frequency by Hour</Text>
                        <Box className="flex-row justify-between items-end h-40 pt-4 border-b border-gray-200">
                            {rainFreq.map((item) => {
                                const barHeight = Math.max((item.count / maxFreq) * 100, 5); // min 5%
                                return (
                                    <VStack key={item.hour} className="items-center justify-end flex-1" style={{ height: "100%" }}>
                                        <Text className="text-xs text-gray-500 mb-1">{item.count}</Text>
                                        <Box className="bg-blue-500 w-full max-w-[20px] rounded-t-sm" style={{ height: `${barHeight}%` }} />
                                        <Text className="text-xs text-gray-400 mt-2 h-4">{item.hour}h</Text>
                                    </VStack>
                                );
                            })}
                        </Box>
                    </Box>
                </Box>
            )}

            {/* Admin Modules Navigation */}
            <Box className="px-4 mt-6 mb-8">
                <Text className="text-lg font-bold text-gray-900 mb-3">Manage System</Text>
                {renderNavButton("Audit Data", "document-text", "AdminAuditData")}
                {renderNavButton("Users & Access", "people", "AdminUsers")}
                {renderNavButton("Camera Health", "warning", "AdminCameras")}
                {renderNavButton("Ingestion Jobs", "list", "AdminJobs")}
            </Box>
        </ScrollView>
    );
}
