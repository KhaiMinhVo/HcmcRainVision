import { Box } from "@/components/ui/box";
import { Center } from "@/components/ui/center";
import { Heading } from "@/components/ui/heading";
import { HStack } from "@/components/ui/hstack";
import { Input, InputField } from "@/components/ui/input";
import { Text } from "@/components/ui/text";
import { StatusBar } from "expo-status-bar";
import { ChevronLeft } from "lucide-react-native";
import { useEffect, useMemo, useState } from "react";
import { FlatList, RefreshControl, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { locationService } from "../../services/location";
import useAppStore from "../../store/useAppStore";
import type { Ward } from "../../types";

export default function AllAreasScreen({ navigation }: any) {
  const [searchQuery, setSearchQuery] = useState("");
  const token = useAppStore((s) => s.token);
  const [wards, setWards] = useState<Ward[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const filteredWards = useMemo(() => {
    if (!searchQuery.trim()) return wards;
    const q = searchQuery.toLowerCase();
    return wards.filter((w: any) => {
      const wardId = String(w.wardId || "").toLowerCase();
      const wardName = String(w.wardName || "").toLowerCase();
      const districtName = String(w.districtName || "").toLowerCase();
      const alias = String((w as any).alias || "").toLowerCase();
      return (
        wardId.includes(q) ||
        wardName.includes(q) ||
        districtName.includes(q) ||
        alias.includes(q)
      );
    });
  }, [wards, searchQuery]);

  const loadWards = async (isRefresh = false) => {
    if (!token) return;
    try {
      if (!isRefresh) setLoading(true);
      setError(null);
      const result = await locationService.getWards(token || undefined);
      if (!result.success) {
        setError(result.error || "Failed to load wards");
        setWards([]);
        return;
      }
      setWards(result.data || []);
    } catch (e: any) {
      setError(e?.message || "Failed to load wards");
      setWards([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (!token) return;
    loadWards(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const onRefresh = () => {
    setRefreshing(true);
    loadWards(true);
  };

  const EmptyComponent = () => (
    <Center className="flex-1 px-8 py-16">
      <Text className="text-6xl mb-6">🗺️</Text>
      <Heading size="xl" className="text-gray-900 font-bold mb-3 text-center">
        No Wards Found
      </Heading>
      <Text className="text-base text-gray-600 text-center leading-6">
        {searchQuery ? "Try a different search term" : "No wards available"}
      </Text>
    </Center>
  );

  return (
    <View className="flex-1 bg-gray-50">
      <StatusBar style="dark" />
      <SafeAreaView edges={["top"]}>
        <HStack className="items-center px-4 py-3 bg-white border-b border-gray-200">
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            className="mr-3 p-1"
          >
            <ChevronLeft size={24} color="#111827" />
          </TouchableOpacity>
          <Heading size="lg" className="text-gray-900 font-bold flex-1">
            All Areas
          </Heading>
          <Text className="text-sm text-gray-600">
            {wards.length} wards
          </Text>
        </HStack>
      </SafeAreaView>

      <Box className="px-4 py-3">
        <Input
          variant="outline"
          size="lg"
          className="border-gray-300 rounded-lg"
        >
          <InputField
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search wards..."
          />
        </Input>
      </Box>

      <FlatList
        data={filteredWards}
        keyExtractor={(item) => item.wardId}
        renderItem={({ item }) => (
          <Box className="bg-white rounded-xl p-4 border border-gray-200 mb-3">
            <Text className="text-base font-semibold text-gray-900">
              {item.wardName}
            </Text>
            <Text className="text-sm text-gray-600 mt-0.5">
              {item.districtName}
            </Text>
            <Text className="text-xs text-gray-500 mt-1">
              Ward ID: {item.wardId}
            </Text>
            {!!(item as any).alias && (
              <Text className="text-xs text-gray-500 mt-1">
                Alias: {(item as any).alias}
              </Text>
            )}
          </Box>
        )}
        contentContainerStyle={{ padding: 16, paddingTop: 8 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          loading ? (
            <Center className="flex-1 px-8 py-16">
              <Text className="text-sm text-gray-600">Loading wards...</Text>
            </Center>
          ) : error ? (
            <Center className="flex-1 px-8 py-16">
              <Text className="text-sm text-gray-600">{error}</Text>
              <TouchableOpacity
                onPress={() => loadWards(false)}
                className="mt-4 bg-blue-600 px-5 py-2.5 rounded-lg"
              >
                <Text className="text-white font-medium">Retry</Text>
              </TouchableOpacity>
            </Center>
          ) : (
            <EmptyComponent />
          )
        }
      />
    </View>
  );
}
