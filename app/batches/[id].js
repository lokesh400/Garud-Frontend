import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  SafeAreaView,
  StatusBar,
  Platform,
} from "react-native";
import * as FileSystem from 'expo-file-system';
import * as IntentLauncher from 'expo-intent-launcher';
import * as Linking from 'expo-linking';
import { apiFetch } from "../../utils/api";

export default function BatchDetails() {
  const { id } = useLocalSearchParams();
  const router = useRouter();

  const [batch, setBatch] = useState(null);
  const [activeTab, setActiveTab] = useState("tests");
  const [announcements, setAnnouncements] = useState([]);
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [downloadStatus, setDownloadStatus] = useState({}); // downloading/downloading/open

  useEffect(() => {
    apiFetch(`/api/batches/${id}`)
      .then((res) => res.json())
      .then(setBatch)
      .catch(() => Alert.alert("Error", "Failed to load batch."))
      .finally(() => setLoading(false));
  }, [id]);

  const fetchAnnouncements = async () => {
    try {
      const res = await apiFetch(`/batch/${id}/announcements`);
      const data = await res.json();
      setAnnouncements(data);
    } catch {
      Alert.alert("Error", "Unable to load announcements.");
    }
  };

  const fetchResources = async () => {
    try {
      const res = await apiFetch(`/api/batches/${id}/resource`);
      const data = await res.json();
      setResources(data);

      // Check local files
      const statusMap = {};
      for (let item of data) {
        const fileName = getFileName(item.zenodoLink, item._id);
        const localUri = `${FileSystem.documentDirectory}${fileName}`;
        const fileInfo = await FileSystem.getInfoAsync(localUri);
        if (fileInfo.exists) {
          statusMap[item._id] = "downloaded";
        }
      }
      setDownloadStatus(statusMap);
    } catch {
      Alert.alert("Error", "Unable to load resources.");
    }
  };

  const getFileName = (url, id) => {
    const name = url.split("/").pop()?.split("?")[0] || `document_${Date.now()}.pdf`;
    return `${id}_${name}`;
  };

  const downloadOrOpen = async (item) => {
    const fileName = getFileName(item.zenodoLink, item._id);
    const localUri = `${FileSystem.documentDirectory}${fileName}`;

    const fileInfo = await FileSystem.getInfoAsync(localUri);
    if (fileInfo.exists) {
      openFile(localUri);
      return;
    }

    setDownloadStatus((prev) => ({ ...prev, [item._id]: "downloading" }));

    try {
      const downloadResumable = FileSystem.createDownloadResumable(
        item.zenodoLink,
        localUri,
        {},
        (progress) => {
          const percent = (progress.totalBytesWritten / progress.totalBytesExpectedToWrite) * 100;
          console.log(`Download ${item._id}: ${percent.toFixed(2)}%`);
        }
      );

      await downloadResumable.downloadAsync();
      setDownloadStatus((prev) => ({ ...prev, [item._id]: "downloaded" }));
      openFile(localUri);
    } catch (err) {
      Alert.alert("Download Failed", "Could not download the file.");
      setDownloadStatus((prev) => ({ ...prev, [item._id]: undefined }));
    }
  };

const openFile = async (uri) => {
  try {
    await IntentLauncher.startActivityAsync('android.intent.action.VIEW', {
      data: localUri,
      flags: 1,
      type: 'application/pdf',
    });
  } catch (err) {
    console.error("Failed to open PDF:", err);
  }
};


  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{batch.title}</Text>
      </View>

      {/* Tabs */}
      <View style={styles.tabContainer}>
        {["class", "tests", "announcements", "resources"].map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[styles.tabButton, activeTab === tab && styles.activeTabButton]}
            onPress={() => {
              setActiveTab(tab);
              if (tab === "announcements") fetchAnnouncements();
              if (tab === "resources") fetchResources();
            }}
          >
            <Text style={[styles.tabText, activeTab === tab && styles.activeTabText]}>
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Content */}
      <View style={styles.contentContainer}>
        {activeTab === "announcements" ? (
          announcements.length > 0 ? (
            <FlatList
              data={announcements}
              keyExtractor={(item, index) => index.toString()}
              renderItem={({ item }) => (
                <View style={styles.card}>
                  <Text style={styles.announcementText}>• {item}</Text>
                </View>
              )}
            />
          ) : (
            <View style={styles.empty}>
              <Text style={styles.emptyText}>No announcements available</Text>
            </View>
          )
        ) : activeTab === "resources" ? (
          <FlatList
            data={resources}
            keyExtractor={(item, index) => index.toString()}
            renderItem={({ item }) => {
              const status = downloadStatus[item._id];
              const fileName = getFileName(item.zenodoLink, item._id);
              return (
                <View style={styles.resourceItem}>
                  <Text style={styles.fileName}>{fileName}</Text>
                  <TouchableOpacity
                    onPress={() => downloadOrOpen(item)}
                    style={styles.resourceBtn}
                  >
                    <Text style={styles.downloadButtonText}>
                      {status === "downloading"
                        ? "Downloading..."
                        : status === "downloaded"
                        ? "Open PDF"
                        : "Download PDF"}
                    </Text>
                  </TouchableOpacity>
                </View>
              );
            }}
          />
        ) : activeTab === "tests" && batch.tests?.length > 0 ? (
          <FlatList
            data={batch.tests}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <View style={styles.card}>
                <Text style={styles.testTitle}>{item.title}</Text>
                <View style={styles.buttonRow}>
                  <TouchableOpacity
                    style={styles.secondaryButton}
                    onPress={() => router.push(`/test/report/${item.id}`)}
                  >
                    <Text style={styles.buttonText}>View Result</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.primaryButton}
                    onPress={() => router.push(`/test/${item.id}`)}
                  >
                    <Text style={styles.buttonText}>Attempt Test</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          />
        ) : (
          <View style={styles.empty}>
            <Text style={styles.emptyText}>No tests available</Text>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#ffffff" },
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#ffffff" },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
    backgroundColor: "#ffffff",
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#1e293b",
  },
  tabContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
    backgroundColor: "#ffffff",
  },
  tabButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  activeTabButton: {
    backgroundColor: "#6b28ad",
    borderRadius: 4,
  },
  tabText: {
    fontSize: 13,
    color: "#666",
    fontWeight: "600",
  },
  activeTabText: {
    color: "#ffffff",
  },
  contentContainer: {
    flex: 1,
    padding: 16,
  },
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
  },
  announcementText: {
    fontSize: 15,
    color: "#444",
    lineHeight: 22,
  },
  testTitle: {
    fontSize: 17,
    fontWeight: "600",
    color: "#333",
    marginBottom: 10,
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 12,
  },
  primaryButton: {
    backgroundColor: "#6b28ad",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  secondaryButton: {
    backgroundColor: "#e0d6eb",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  buttonText: {
    color: "#ffffff",
    fontWeight: "600",
  },
  resourceItem: {
    padding: 12,
    backgroundColor: "#f1f5f9",
    borderRadius: 8,
    marginBottom: 10,
  },
  resourceBtn: {
    backgroundColor: "#dbeafe",
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  fileName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1e293b',
    marginBottom: 6,
  },
  downloadButtonText: {
    color: "#1e3a8a",
    fontSize: 14,
    fontWeight: "600",
  },
  empty: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyText: {
    fontSize: 16,
    color: "#888",
  },
});
