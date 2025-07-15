import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from "react-native";
import { apiFetch } from "../utils/api";
import AppFooter from "../components/AppFooter";

export default function LeaderboardScreen() {
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

  if (loading) return <ActivityIndicator size="large" style={{ marginTop: 40 }} />;

  return (
    <View style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <Text style={styles.pageTitle}>🏆 Weekly Leaderboard</Text>

        {leaderboards.length === 0 ? (
          <Text>No leaderboard data available.</Text>
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
                <View key={s.userId || s.username} style={styles.row}>
                  <Text style={styles.rankCol}>{index + 1}</Text>
                  <Text style={styles.nameCol}>{s.username}</Text>
                  <Text style={styles.pointsCol}>{s.points}</Text>
                </View>
              ))}

              {lb.myRank && lb.myRank > 10 && lb.myData && (
                <>
                  <View style={styles.dottedLine} />
                  <View style={[styles.row, { backgroundColor: "#e3f3ff" }]}>
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

      <AppFooter />
    </View>
  );
}

const styles = StyleSheet.create({
  pageTitle: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 12,
    textAlign: "center",
  },
  batchSection: {
    marginBottom: 30,
    backgroundColor: "#f9f9f9",
    padding: 14,
    borderRadius: 10,
    shadowColor: "#000",
    elevation: 2,
  },
  batchTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 12,
    color: "#333",
  },
  tableHeader: {
    flexDirection: "row",
    paddingBottom: 6,
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
    marginBottom: 6,
  },
  row: {
    flexDirection: "row",
    paddingVertical: 6,
    borderBottomWidth: 0.5,
    borderBottomColor: "#eee",
  },
  rankCol: {
    width: 50,
    fontWeight: "bold",
    color: "#444",
  },
  nameCol: {
    flex: 1,
    color: "#444",
  },
  pointsCol: {
    width: 60,
    textAlign: "right",
    color: "#444",
    fontWeight: "600",
  },
  dottedLine: {
    borderBottomWidth: 1,
    borderBottomColor: "#999",
    borderStyle: "dashed",
    marginVertical: 6,
  },
});
