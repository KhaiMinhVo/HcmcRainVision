import { Box } from "@/components/ui/box";
import { Center } from "@/components/ui/center";
import { Input, InputField } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";
import React, { useEffect, useState } from "react";
import { Alert, FlatList, Image, RefreshControl, TouchableOpacity } from "react-native";
import { adminService, AdminUser } from "../../services/admin";
import useAppStore from "../../store/useAppStore";

export default function AdminUsersScreen() {
  const token = useAppStore((s) => s.token);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const pageSize = 20;

  const fetchUsers = async (pageToFetch = 1, searchQuery = search, isRefresh = false) => {
    if (!token) return;

    if (pageToFetch === 1) {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);
    }

    setError(null);

    try {
      const res = await adminService.getUsers(token, pageToFetch, pageSize, searchQuery);
      if (res.success && res.data?.data) {
        if (pageToFetch === 1) {
          setUsers(res.data.data);
        } else {
          setUsers(prev => [...prev, ...(res.data?.data || [])]);
        }

        // If we got exactly the page size, there might be more
        setHasMore((res.data.data.length || 0) === pageSize);
        setPage(pageToFetch);
      } else {
        setError(res.error || "Failed to load users");
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
    fetchUsers(1, search);
  }, [token, search]);

  const onRefresh = () => fetchUsers(1, search, true);

  const loadMore = () => {
    if (!loading && !refreshing && hasMore) {
      fetchUsers(page + 1, search);
    }
  };

  const handleBanToggle = (user: AdminUser) => {
    if (user.role === "Admin") {
      Alert.alert("Action Denied", "Cannot modify an Admin account.");
      return;
    }

    const unban = !user.isActive;
    Alert.alert(
      `${unban ? 'Unban' : 'Ban'} User`,
      `Are you sure you want to ${unban ? 'unban' : 'ban'} ${user.username}?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: unban ? "Unban" : "Ban",
          style: unban ? "default" : "destructive",
          onPress: async () => {
            if (!token) return;
            try {
              const res = await adminService.banUser(user.id, token);
              if (res.success) {
                // Optimistic update
                setUsers(prev => prev.map(u => u.id === user.id ? { ...u, isActive: unban } : u));
                Alert.alert("Success", `User ${user.username} has been ${unban ? 'unbanned' : 'banned'}.`);
              } else {
                Alert.alert("Error", res.error || "Failed to update user status");
              }
            } catch (e: any) {
              Alert.alert("Error", e.message || "Failed to update user status");
            }
          }
        }
      ]
    );
  };

  const renderItem = ({ item }: { item: AdminUser }) => (
    <Box className={`bg - white p - 4 rounded - xl shadow - sm mb - 3 mx - 4 flex - row items - center ${!item.isActive ? "opacity-75" : ""} `}>
      <Center className="w-12 h-12 rounded-full bg-gray-200 overflow-hidden mr-3">
        {item.avatarUrl ? (
          <Image source={{ uri: item.avatarUrl }} className="w-full h-full" />
        ) : (
          <Text className="text-xl font-bold text-gray-500">{item.username.charAt(0).toUpperCase()}</Text>
        )}
      </Center>

      <VStack className="flex-1">
        <Box className="flex-row items-center justify-between">
          <Text className="text-base font-bold text-gray-900" numberOfLines={1}>{item.username}</Text>
          <Box className={`px - 2 py - 0.5 rounded - full ${item.isActive ? "bg-green-100" : "bg-red-100"} `}>
            <Text className={`text - xs font - semibold ${item.isActive ? "text-green-700" : "text-red-700"} `}>
              {item.isActive ? "Active" : "Banned"}
            </Text>
          </Box>
        </Box>

        <Text className="text-sm text-gray-500 mb-1" numberOfLines={1}>{item.email}</Text>

        <Box className="flex-row justify-between items-center mt-1">
          <Text className="text-xs text-gray-400">Role: <Text className="font-semibold text-gray-600">{item.role}</Text></Text>

          {item.role !== "Admin" && (
            <TouchableOpacity
              onPress={() => handleBanToggle(item)}
              className={`px - 3 py - 1 rounded ${item.isActive ? "bg-red-50 border border-red-200" : "bg-blue-50 border border-blue-200"} `}
            >
              <Text className={`text - xs font - semibold ${item.isActive ? "text-red-600" : "text-blue-600"} `}>
                {item.isActive ? "Ban" : "Unban"}
              </Text>
            </TouchableOpacity>
          )}
        </Box>
      </VStack>
    </Box>
  );

  return (
    <Box className="flex-1 bg-gray-50">
      <Box className="px-4 py-3 bg-white border-b border-gray-200 z-10">
        <Input variant="outline" size="md" className="bg-gray-50 border-gray-300 rounded-lg">
          <InputField
            placeholder="Search users..."
            value={search}
            onChangeText={setSearch}
            className="text-gray-800"
          />
        </Input>
      </Box>

      {error && (
        <Box className="bg-red-100 p-4 m-4 rounded-xl">
          <Text className="text-red-700">{error}</Text>
        </Box>
      )}

      {loading && users.length === 0 ? (
        <Center className="flex-1">
          <Spinner size="large" />
        </Center>
      ) : (
        <FlatList
          data={users}
          renderItem={renderItem}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={{ paddingVertical: 16 }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          onEndReached={loadMore}
          onEndReachedThreshold={0.5}
          ListFooterComponent={hasMore && users.length > 0 ? <Spinner size="small" className="my-4" /> : null}
          ListEmptyComponent={
            <Center className="py-10">
              <Text className="text-gray-500">No users found</Text>
            </Center>
          }
        />
      )}
    </Box>
  );
}
