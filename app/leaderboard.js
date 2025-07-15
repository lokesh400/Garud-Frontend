import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Alert,
  StatusBar,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import AppFooter from "../components/AppFooter";
import { apiFetch } from "../utils/api";

export default function LeaderboardScreen() {
  const insets = useSafeAreaInsets();
  const [leaderboards, setLeaderboards] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLeaderboard();
  }, []);

  const loadLeaderboard = async () => {
    try {
      const res = await apiFetch("/api/leaderboard");
      const data = await res.json();

      if (res.ok) {
        setLeaderboards(data);
      } else {
        Alert.alert("Error", data.error || "Could not load leaderboard.");
      }
    } catch (e) {
      Alert.alert("Network Error", e.message || "Try again later.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.centered}>
        <ActivityIndicator size="large" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      <View
        style={[
          styles.header,
          { paddingBottom: 14 },
        ]}
      >
        <Text style={styles.headerTitle}>🏆 Weekly Leaderboard</Text>
      </View>

      <ScrollView
        contentContainerStyle={{
          paddingTop: 16,
          paddingBottom: insets.bottom + 80,
          paddingHorizontal: 16,
        }}
        showsVerticalScrollIndicator={false}
      >
        {leaderboards.length === 0 ? (
          <Text style={styles.noData}>No leaderboard data available.</Text>
        ) : (
          leaderboards.map((lb) => (
            <View key={lb.batchId} style={styles.batchSection}>
              <Text style={styles.batchTitle}>{lb.batchName}</Text>

              <View style={styles.tableHeader}>
                <Text style={styles.rankCol}>Rank</Text>
                <Text style={styles.nameCol}>Name</Text>
                <Text style={styles.pointsCol}>Points</Text>
              </View>

              {lb.top10.map((s, index) => (
                <View
                  key={s.userId || s.username}
                  style={[
                    styles.row,
                    index === 0 && styles.firstPlace,
                    index === 1 && styles.secondPlace,
                    index === 2 && styles.thirdPlace,
                  ]}
                >
                  <Text style={styles.rankCol}>{index + 1}</Text>
                  <Text style={styles.nameCol}>{s.username}</Text>
                  <Text style={styles.pointsCol}>{s.points}</Text>
                </View>
              ))}

              {lb.myRank && lb.myRank > 10 && lb.myData && (
                <>
                  <View style={styles.dottedLine} />
                  <View style={[styles.row, styles.highlightRow]}>
                    <Text style={styles.rankCol}>{lb.myRank}</Text>
                    <Text style={styles.nameCol}>{lb.myData.username}</Text>
                    <Text style={styles.pointsCol}>{lb.myData.points}</Text>
                  </View>
                </>
              )}
            </View>
          ))
        )}
      </ScrollView>

    <View style={{ paddingBottom: insets.bottom }}>
            <AppFooter />
          </View>
        </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  header: {
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
    backgroundColor: "#fff",
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#1e293b",
  },
  noData: {
    fontSize: 16,
    color: "#64748b",
    textAlign: "center",
    marginTop: 40,
  },
  batchSection: {
    marginBottom: 30,
    backgroundColor: "#f8fafc",
    padding: 16,
    borderRadius: 12,
    borderColor: "#e2e8f0",
    borderWidth: 1,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  batchTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 12,
    color: "#1e3a8a",
  },
  tableHeader: {
    flexDirection: "row",
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#cbd5e1",
    marginBottom: 8,
  },
  row: {
    flexDirection: "row",
    paddingVertical: 8,
    borderBottomWidth: 0.5,
    borderBottomColor: "#e2e8f0",
  },
  rankCol: {
    width: 50,
    fontWeight: "600",
  },
  nameCol: {
    flex: 1,
    color: "#1e293b",
  },
  pointsCol: {
    width: 60,
    textAlign: "right",
    fontWeight: "600",
    color: "#1e293b",
  },
  highlightRow: {
    backgroundColor: "#dbeafe",
    borderRadius: 6,
    overflow: "hidden",
  },
  dottedLine: {
    borderBottomWidth: 1,
    borderBottomColor: "#94a3b8",
    borderStyle: "dashed",
    marginVertical: 10,
  },
});
