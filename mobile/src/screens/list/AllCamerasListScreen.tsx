import { Badge, BadgeText } from "@/components/ui/badge";
import { Box } from "@/components/ui/box";
import { Heading } from "@/components/ui/heading";
import { HStack } from "@/components/ui/hstack";
import { Input, InputField } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";
import { StatusBar } from "expo-status-bar";
import { ChevronLeft, MapPin, SortAsc, SortDesc } from "lucide-react-native";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  FlatList,
  RefreshControl,
  ScrollView,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import CameraStreamPreview from "../../components/map/CameraStreamPreview";
import { cameraService } from "../../services/cameras";
import { locationService } from "../../services/location";
import useAppStore from "../../store/useAppStore";
import { Camera } from "../../types/camera";

type SortField = "name" | "status" | "id";
type SortDir = "asc" | "desc";

export default function AllCamerasListScreen({ navigation }: any) {
  const [cameras, setCameras] = useState<Camera[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState(0);

  const user = useAppStore((s: any) => s.user);
  const token = useAppStore((s) => s.token);
  const isAdmin = user?.role === "Admin";

  // District (Cụm) filter
  const [districts, setDistricts] = useState<string[]>([]);
  const [selectedDistrict, setSelectedDistrict] = useState<string>("ALL");
  const [wardToDistrict, setWardToDistrict] = useState<Record<string, string>>(
    {},
  );

  // Pagination
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const loadingMore = useRef(false);

  // Search & sort
  const [searchQuery, setSearchQuery] = useState("");
  const [sortField, setSortField] = useState<SortField>("name");
  const [sortDir, setSortDir] = useState<SortDir>("asc");

  const PAGE_SIZE = 10;

  const loadDistrictWardMap = useCallback(async () => {
    if (!token) return;
    const [districtRes, wardsRes] = await Promise.all([
      locationService.getDistricts(token || undefined),
      locationService.getWards(token || undefined),
    ]);

    if (districtRes.success && districtRes.data) {
      setDistricts(districtRes.data);
    }

    if (wardsRes.success && wardsRes.data) {
      const map: Record<string, string> = {};
      wardsRes.data.forEach((w: any) => {
        if (w.wardId && w.districtName) {
          map[String(w.wardId)] = String(w.districtName);
        }
      });
      setWardToDistrict(map);
    }
  }, [token]);

  const fetchCameras = useCallback(
    async (pageNum: number, refresh = false) => {
      if (loadingMore.current && !refresh) return;
      loadingMore.current = true;

      try {
        setError(null);
        const result = await cameraService.getCameras({
          page: pageNum,
          pageSize: PAGE_SIZE,
          search: searchQuery.trim() || undefined,
          sortBy: sortField,
        });

        if (!result.success || !result.data) {
          setError(result.error ?? "Failed to load cameras");
          return;
        }

        const { data, total: totalCount } = result.data;

        if (refresh || pageNum === 1) {
          setCameras(data);
        } else {
          setCameras((prev) => [...prev, ...data]);
        }

        setTotal(totalCount);
        setHasMore(pageNum * PAGE_SIZE < totalCount);
        setPage(pageNum);
      } catch (err: any) {
        setError(err.message ?? "An unexpected error occurred");
      } finally {
        setLoading(false);
        setRefreshing(false);
        loadingMore.current = false;
      }
    },
    [searchQuery, sortField],
  );

  // Initial load + reload when search/sort changes
  useEffect(() => {
    setLoading(true);
    setCameras([]);
    setPage(1);
    setHasMore(true);
    fetchCameras(1, true);
  }, [fetchCameras]);

  useEffect(() => {
    loadDistrictWardMap();
  }, [loadDistrictWardMap]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchCameras(1, true);
  }, [fetchCameras]);

  const onLoadMore = useCallback(() => {
    if (!loading && !refreshing && hasMore) {
      fetchCameras(page + 1);
    }
  }, [loading, refreshing, hasMore, page, fetchCameras]);

  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDir("asc");
    }
  };

  const districtFilteredCameras = useMemo(() => {
    if (selectedDistrict === "ALL") return cameras;
    return cameras.filter((cam) => {
      const d = wardToDistrict[String(cam.wardId)];
      return d === selectedDistrict;
    });
  }, [cameras, selectedDistrict, wardToDistrict]);

  const handleCameraPress = (camera: Camera) => {
    navigation.navigate("MapStack", {
      screen: "CameraDetailMap",
      params: { camera },
    });
  };

  const renderSortBtn = (field: SortField, label: string) => {
    const active = sortField === field;
    return (
      <TouchableOpacity
        onPress={() => toggleSort(field)}
        className={`flex-row items-center gap-1 px-3 py-1.5 rounded-full border ${active ? "bg-blue-600 border-blue-600" : "border-gray-300 bg-white"
          }`}
      >
        <Text
          className={`text-xs font-medium ${active ? "text-white" : "text-gray-600"}`}
        >
          {label}
        </Text>
        {active &&
          (sortDir === "asc" ? (
            <SortAsc size={12} color="#fff" />
          ) : (
            <SortDesc size={12} color="#fff" />
          ))}
      </TouchableOpacity>
    );
  };

  const renderCamera = ({ item }: { item: Camera }) => {
    const isOnline = item.status === "Active";
    return (
      <TouchableOpacity
        onPress={() => handleCameraPress(item)}
        activeOpacity={0.7}
      >
        <Box className="bg-white rounded-xl border border-gray-200 mb-3 mx-4 overflow-hidden">
          {/* Stream preview thumbnail */}
          <View style={{ height: 130 }}>
            <CameraStreamPreview
              streamUrl={item.streamUrl}
              status={item.status}
              name={item.name}
            />
          </View>
          <View className="p-4">
            <HStack className="items-start justify-between mb-2">
              <VStack className="flex-1 mr-2">
                <Heading size="sm" className="text-gray-900 font-semibold mb-1">
                  {item.name}
                </Heading>
                <Text className="text-xs text-gray-500 mb-1">
                  ID: {item.id}
                </Text>
                {item.ward && (
                  <Text className="text-xs text-gray-500 mb-1">
                    {[
                      item.ward.name,
                      item.ward.district?.name,
                      item.ward.district?.city?.name,
                    ]
                      .filter(Boolean)
                      .join(", ")}
                  </Text>
                )}
                <HStack className="items-center gap-1">
                  <MapPin size={12} color="#6B7280" />
                  <Text className="text-xs text-gray-600">
                    {item.latitude.toFixed(5)}, {item.longitude.toFixed(5)}
                  </Text>
                </HStack>
              </VStack>
              <Badge
                className={`${isOnline ? "bg-green-600" : "bg-gray-500"} rounded-md`}
              >
                <BadgeText className="text-white font-semibold text-xs">
                  {item.status ?? "UNKNOWN"}
                </BadgeText>
              </Badge>
            </HStack>
            <HStack className="items-center gap-2 pt-2 border-t border-gray-100">
              <Box
                className={`w-2 h-2 rounded-full ${isOnline ? "bg-green-500" : "bg-gray-400"}`}
              />
              <Text className="text-xs text-gray-600">
                {isOnline ? "Online" : "Offline"}
              </Text>
            </HStack>
          </View>
        </Box>
      </TouchableOpacity>
    );
  };

  if (loading && cameras.length === 0) {
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
              All Cameras
            </Heading>
          </HStack>
        </SafeAreaView>
        <View className="flex-1 items-center justify-center">
          <Spinner size="large" />
          <Text className="text-gray-600 mt-4">Loading cameras...</Text>
        </View>
      </View>
    );
  }

  if (error && cameras.length === 0) {
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
              All Cameras
            </Heading>
          </HStack>
        </SafeAreaView>
        <View className="flex-1 items-center justify-center px-8">
          <Text className="text-4xl mb-4">⚠️</Text>
          <Heading
            size="lg"
            className="text-gray-900 font-bold text-center mb-2"
          >
            Failed to load cameras
          </Heading>
          <Text className="text-sm text-gray-600 text-center mb-4">
            {error}
          </Text>
          <TouchableOpacity
            onPress={() => fetchCameras(1, true)}
            className="bg-blue-600 px-6 py-3 rounded-lg"
          >
            <Text className="text-white font-medium">Retry</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

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
            All Cameras
          </Heading>
          <HStack className="items-center gap-3">
            <Text className="text-sm text-gray-600">{total} total</Text>
            {isAdmin && (
              <TouchableOpacity onPress={() => navigation.navigate("CameraForm", { mode: "create" })}>
                <Text className="text-blue-600 font-semibold px-2">Add</Text>
              </TouchableOpacity>
            )}
          </HStack>
        </HStack>
      </SafeAreaView>

      {/* Search */}
      <Box className="px-4 pt-3 pb-2 bg-white border-b border-gray-100">
        <Input
          variant="outline"
          size="md"
          className="border-gray-300 rounded-lg"
        >
          <InputField
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search by name or ID..."
            returnKeyType="search"
          />
        </Input>



        {/* District (Cụm) filter */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingVertical: 10 }}
        >
          <HStack className="gap-2">
            <TouchableOpacity
              onPress={() => setSelectedDistrict("ALL")}
              className={`px-3 py-1.5 rounded-full border ${selectedDistrict === "ALL"
                ? "bg-gray-900 border-gray-900"
                : "bg-white border-gray-300"
                }`}
            >
              <Text
                className={`text-xs font-medium ${selectedDistrict === "ALL" ? "text-white" : "text-gray-700"
                  }`}
              >
                Tất cả
              </Text>
            </TouchableOpacity>

            {districts.map((d) => (
              <TouchableOpacity
                key={d}
                onPress={() => setSelectedDistrict(d)}
                className={`px-3 py-1.5 rounded-full border ${selectedDistrict === d
                  ? "bg-gray-900 border-gray-900"
                  : "bg-white border-gray-300"
                  }`}
              >
                <Text
                  className={`text-xs font-medium ${selectedDistrict === d ? "text-white" : "text-gray-700"
                    }`}
                >
                  {d}
                </Text>
              </TouchableOpacity>
            ))}
          </HStack>
        </ScrollView>
      </Box>

      <FlatList
        data={districtFilteredCameras}
        keyExtractor={(item) => String(item.id)}
        renderItem={renderCamera}
        contentContainerStyle={{ paddingVertical: 12 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        onEndReached={onLoadMore}
        onEndReachedThreshold={0.3}
        ListFooterComponent={
          hasMore && !refreshing ? (
            <View className="py-4 items-center">
              <Spinner size="small" />
            </View>
          ) : null
        }
        ListEmptyComponent={
          <View className="items-center justify-center px-8 py-16">
            <Text className="text-5xl mb-4">📹</Text>
            <Heading
              size="lg"
              className="text-gray-900 font-bold text-center mb-2"
            >
              No Cameras Found
            </Heading>
            <Text className="text-sm text-gray-600 text-center">
              {searchQuery
                ? "Try a different search term"
                : "No cameras available"}
            </Text>
          </View>
        }
      />
    </View>
  );
}
