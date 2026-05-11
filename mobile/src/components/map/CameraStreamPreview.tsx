import React, { useState } from "react";
import { ActivityIndicator, Image, StyleSheet, Text, View } from "react-native";
import { WebView } from "react-native-webview";

interface CameraStreamPreviewProps {
  streamUrl: string | null | undefined;
  /** camera status, e.g. "Active" | "Offline" */
  status: string;
  name?: string;
}

function isValidHttpUrl(url: string | null | undefined): boolean {
  if (!url) return false;
  try {
    const parsed = new URL(url);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}

export default function CameraStreamPreview({
  streamUrl,
  status,
  name,
}: CameraStreamPreviewProps) {
  const [loading, setLoading] = useState(true);
  const [mode, setMode] = useState<"image" | "webview" | "error">("image");

  const isOnline = status === "Active";
  const validUrl = isValidHttpUrl(streamUrl);

  if (!isOnline) {
    return (
      <View style={[styles.fill, styles.centered, styles.bgOffline]}>
        <Text style={styles.emoji}>📴</Text>
        <Text style={styles.label}>Camera offline</Text>
      </View>
    );
  }

  if (!validUrl) {
    return (
      <View style={[styles.fill, styles.centered, styles.bgGray]}>
        <Text style={styles.emoji}>⚠️</Text>
        <Text style={styles.label}>Không thể tải camera</Text>
      </View>
    );
  }

  if (streamUrl === "TEST_MODE") {
    return (
      <View style={[styles.fill, styles.centered, styles.bgTestMode]}>
        <Text style={styles.emoji}>🧪</Text>
        <Text style={[styles.label, styles.labelTest]}>Camera test mode</Text>
      </View>
    );
  }

  if (mode === "error") {
    return (
      <View style={[styles.fill, styles.centered, styles.bgGray]}>
        <Text style={styles.emoji}>⚠️</Text>
        <Text style={styles.label}>Không thể tải camera</Text>
      </View>
    );
  }

  if (mode === "webview") {
    return (
      <View style={styles.fill}>
        <WebView
          source={{ uri: streamUrl }}
          style={StyleSheet.absoluteFillObject}
          startInLoadingState
          onLoadStart={() => setLoading(true)}
          onLoadEnd={() => setLoading(false)}
          onError={() => {
            setLoading(false);
            setMode("error");
          }}
          onHttpError={() => {
            setLoading(false);
            setMode("error");
          }}
          renderLoading={() => (
            <View
              style={[StyleSheet.absoluteFill, styles.centered, styles.bgGray]}
            >
              <ActivityIndicator size="small" color="#6B7280" />
              <Text style={[styles.label, { marginTop: 6 }]}>Đang tải...</Text>
            </View>
          )}
        />
      </View>
    );
  }

  return (
    <View style={styles.fill}>
      <Image
        source={{ uri: streamUrl }}
        style={StyleSheet.absoluteFill}
        resizeMode="cover"
        accessibilityLabel={name ?? "camera-preview"}
        onLoadStart={() => setLoading(true)}
        onLoad={() => setLoading(false)}
        onError={() => {
          setLoading(false);
          setMode("webview");
        }}
      />
      {loading && (
        <View style={[StyleSheet.absoluteFill, styles.centered, styles.bgGray]}>
          <ActivityIndicator size="small" color="#6B7280" />
          <Text style={[styles.label, { marginTop: 6 }]}>Đang tải...</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  fill: {
    flex: 1,
    overflow: "hidden",
  },
  centered: {
    alignItems: "center",
    justifyContent: "center",
  },
  bgGray: {
    backgroundColor: "#E5E7EB",
  },
  bgOffline: {
    backgroundColor: "#F3F4F6",
  },
  bgTestMode: {
    backgroundColor: "#FEFCE8",
    borderWidth: 1,
    borderColor: "#FDE68A",
  },
  emoji: {
    fontSize: 24,
    marginBottom: 4,
  },
  label: {
    fontSize: 11,
    color: "#6B7280",
    textAlign: "center",
  },
  labelTest: {
    color: "#92400E",
    fontWeight: "600",
  },
});
