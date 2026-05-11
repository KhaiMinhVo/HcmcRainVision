import { Box } from "@/components/ui/box";
import { Center } from "@/components/ui/center";
import { Spinner } from "@/components/ui/spinner";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";
import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import { Alert, FlatList, RefreshControl } from "react-native";
import { adminService, AuditData } from "../../services/admin";
import useAppStore from "../../store/useAppStore";

export default function AdminAuditDataScreen() {
  const token = useAppStore((s) => s.token);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [data, setData] = useState<AuditData[]>([]);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async (isRefresh = false) => {
    if (!token) return;
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    setError(null);

    try {
      const res = await adminService.getAuditData(token);
      if (res.success && res.data) {
        setData(res.data);
      } else {
        setError(res.error || "Failed to load audit data");
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

  const renderItem = ({ item }: { item: AuditData }) => {
    const isMismatch = item.userSaid?.toLowerCase() !== item.aiSaid?.toLowerCase();

    return (
      <Box className={`bg-white p-4 rounded-xl shadow-sm mb-3 mx-4 ${isMismatch ? "border border-orange-300" : ""}`}>
        <Box className="flex-row justify-between items-center mb-2">
          <Text className="text-sm font-bold text-gray-900">Report #{item.reportId}</Text>
          <Text className="text-xs text-gray-500">{new Date(item.reportTime).toLocaleString()}</Text>
        </Box>

        <Box className="flex-row items-center mb-3">
          <Ionicons name="videocam" size={16} color="#4B5563" className="mr-2" />
          <Text className="text-sm text-gray-700 ml-1">{item.cameraId}</Text>
        </Box>

        <Box className="flex-row justify-between bg-gray-50 p-2 rounded-lg">
          <VStack className="flex-1">
            <Text className="text-xs text-gray-500">User Said</Text>
            <Text className={`text-sm font-semibold ${isMismatch ? "text-orange-600" : "text-gray-900"}`}>
              {item.userSaid || "N/A"}
            </Text>
          </VStack>

          <VStack className="flex-1 border-l border-gray-200 pl-2">
            <Text className="text-xs text-gray-500">AI Said ({(item.aiConfidence * 100).toFixed(1)}%)</Text>
            <Text className={`text-sm font-semibold ${isMismatch ? "text-orange-600" : "text-gray-900"}`}>
              {item.aiSaid || "N/A"}
            </Text>
          </VStack>
        </Box>

        {item.note && (
          <Text className="text-xs text-gray-500 mt-2 italic">Note: {item.note}</Text>
        )}

        {item.imageUrl && (
          <Box
            className="mt-3 bg-blue-50 py-1.5 px-3 rounded-md flex-row justify-center items-center"
            onTouchEnd={() => Alert.alert("View Image", "Feature to view image would go here.")}
          >
            <Ionicons name="image" size={16} color="#3B82F6" />
            <Text className="text-sm text-blue-600 ml-2">View Reference Image</Text>
          </Box>
        )}
      </Box>
    );
  };

  if (loading && data.length === 0) {
    return (
      <Center className="flex-1 bg-gray-50">
        <Spinner size="large" />
      </Center>
    );
  }

  return (
    <Box className="flex-1 bg-gray-50">
      {error && (
        <Box className="bg-red-100 p-4 m-4 rounded-xl">
          <Text className="text-red-700">{error}</Text>
        </Box>
      )}

      <FlatList
        data={data}
        renderItem={renderItem}
        keyExtractor={(item) => item.reportId.toString()}
        contentContainerStyle={{ paddingVertical: 16 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        ListEmptyComponent={
          !loading ? (
            <Center className="py-10">
              <Text className="text-gray-500">No audit data available</Text>
            </Center>
          ) : null
        }
      />
    </Box>
  );
}
