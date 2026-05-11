import { Box } from "@/components/ui/box";
import { Center } from "@/components/ui/center";
import { Heading } from "@/components/ui/heading";
import { HStack } from "@/components/ui/hstack";
import { Input, InputField } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";
import { StatusBar } from "expo-status-bar";
import { ChevronLeft, Send } from "lucide-react-native";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { FlatList, KeyboardAvoidingView, Platform, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { chatbotService } from "../../services/chatbot";
import useAppStore from "../../store/useAppStore";

type ChatRole = "user" | "bot" | "system";

type ChatMessage = {
  id: string;
  role: ChatRole;
  text: string;
  createdAt: number;
};

const nowId = () => `${Date.now()}_${Math.random().toString(16).slice(2)}`;

export default function ChatbotScreen({ navigation }: any) {
  const token = useAppStore((s) => s.token);

  const listRef = useRef<FlatList<ChatMessage>>(null);
  const [loadingContext, setLoadingContext] = useState(false);
  const [sending, setSending] = useState(false);
  const [input, setInput] = useState("");

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: nowId(),
      role: "system",
      text: "Bạn có thể hỏi tình trạng mưa theo cụm/khu vực. Ví dụ: “cụm 1 có khu vực nào mưa không?”",
      createdAt: Date.now(),
    },
  ]);

  const sortedMessages = useMemo(
    () => [...messages].sort((a, b) => a.createdAt - b.createdAt),
    [messages],
  );

  const append = useCallback((m: Omit<ChatMessage, "id" | "createdAt">) => {
    setMessages((prev) => [
      ...prev,
      { ...m, id: nowId(), createdAt: Date.now() },
    ]);
  }, []);

  const loadDebugContext = useCallback(async () => {
    if (!token) return;
    try {
      setLoadingContext(true);
      const res = await chatbotService.debug(token || undefined);
      if (res.success && res.data?.context) {
        append({ role: "system", text: res.data.context });
      }
    } finally {
      setLoadingContext(false);
    }
  }, [append, token]);

  useEffect(() => {
    loadDebugContext();
  }, [loadDebugContext]);

  useEffect(() => {
    // auto scroll to bottom when messages change
    const t = setTimeout(() => {
      listRef.current?.scrollToEnd({ animated: true });
    }, 50);
    return () => clearTimeout(t);
  }, [sortedMessages.length]);

  const send = useCallback(async () => {
    const text = input.trim();
    if (!text || sending) return;
    if (!token) {
      append({ role: "system", text: "Bạn cần đăng nhập để dùng chatbot." });
      return;
    }

    setInput("");
    append({ role: "user", text });

    try {
      setSending(true);
      const res = await chatbotService.sendMessage({ message: text }, token || undefined);
      if (res.success && res.data?.reply) {
        append({ role: "bot", text: res.data.reply });
      } else {
        append({
          role: "bot",
          text: res.error || "Không thể kết nối với trợ lý AI lúc này. Vui lòng thử lại sau.",
        });
      }
    } catch (e: any) {
      append({
        role: "bot",
        text: e?.message || "Không thể kết nối với trợ lý AI lúc này. Vui lòng thử lại sau.",
      });
    } finally {
      setSending(false);
    }
  }, [append, input, sending, token]);

  const renderItem = ({ item }: { item: ChatMessage }) => {
    const isUser = item.role === "user";
    const isSystem = item.role === "system";
    const bubbleClass = isSystem
      ? "bg-gray-100 border border-gray-200"
      : isUser
        ? "bg-blue-600"
        : "bg-white border border-gray-200";
    const textClass = isSystem
      ? "text-gray-700"
      : isUser
        ? "text-white"
        : "text-gray-900";
    const alignClass = isSystem ? "items-center" : isUser ? "items-end" : "items-start";

    return (
      <VStack className={`mb-2 ${alignClass}`}>
        <Box className={`rounded-2xl px-4 py-3 max-w-[90%] ${bubbleClass}`}>
          <Text className={`text-sm leading-5 ${textClass}`}>{item.text}</Text>
        </Box>
      </VStack>
    );
  };

  return (
    <View className="flex-1 bg-gray-50">
      <StatusBar style="dark" />
      <SafeAreaView edges={["top"]}>
        <HStack className="items-center px-4 py-3 bg-white border-b border-gray-200">
          <TouchableOpacity onPress={() => navigation.goBack()} className="mr-3 p-1">
            <ChevronLeft size={24} color="#111827" />
          </TouchableOpacity>
          <Heading size="lg" className="text-gray-900 font-bold flex-1">
            Chatbot
          </Heading>
          {(loadingContext || sending) && <Spinner size="small" />}
        </HStack>
      </SafeAreaView>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
      >
        <FlatList
          ref={listRef}
          data={sortedMessages}
          keyExtractor={(m) => m.id}
          renderItem={renderItem}
          contentContainerStyle={{ padding: 16, paddingBottom: 12 }}
          ListEmptyComponent={
            <Center className="flex-1 px-8 py-16">
              <Text className="text-sm text-gray-600">Chưa có tin nhắn.</Text>
            </Center>
          }
        />

        <Box className="bg-white border-t border-gray-200 px-3 py-3">
          <HStack className="items-center gap-2">
            <Input className="flex-1 bg-gray-50 border-gray-200">
              <InputField
                value={input}
                onChangeText={setInput}
                placeholder="Nhập câu hỏi..."
                returnKeyType="send"
                onSubmitEditing={send}
                editable={!sending}
              />
            </Input>
            <TouchableOpacity
              onPress={send}
              disabled={sending || !input.trim()}
              className={`w-11 h-11 rounded-xl items-center justify-center ${
                sending || !input.trim() ? "bg-gray-300" : "bg-blue-600"
              }`}
            >
              <Send size={18} color="white" />
            </TouchableOpacity>
          </HStack>
        </Box>
      </KeyboardAvoidingView>
    </View>
  );
}

