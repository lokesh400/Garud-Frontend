import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  StyleSheet,
  StatusBar,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets,SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";

import { apiFetch } from "../utils/api";
import AppFooter from "../components/AppFooter";

export default function GroupedQuestionsScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const [grouped, setGrouped] = useState({});
  const [expandedQuestionId, setExpandedQuestionId] = useState(null);
  const [attempted, setAttempted] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchQuestions();
  }, []);

  const fetchQuestions = async () => {
    try {
      const res = await apiFetch("/api/questions/today/all");
      const data = await res.json();

      if (res.ok) {
        const groupedByBatch = {};

        data.forEach((q) => {
          const batch = q.batchId;
          const batchId = batch?._id || batch;
          const batchTitle = batch?.title || "Unknown Batch";
          const subject = q.SubjectName || "Unknown";
          const batchKey = `${batchId}||${batchTitle}`;
          if (!groupedByBatch[batchKey]) groupedByBatch[batchKey] = {};
          if (!groupedByBatch[batchKey][subject]) groupedByBatch[batchKey][subject] = [];
          groupedByBatch[batchKey][subject].push(q);
        });

        const attemptsMap = {};
        data.forEach((q) => (attemptsMap[q._id] = false));
        setGrouped(groupedByBatch);
        setAttempted(attemptsMap);
      } else {
        Alert.alert("Error", data.error || "Unable to fetch questions");
      }
    } catch (err) {
      Alert.alert("Network Error", err.message || "Try again later");
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = async (question, selectedIndex) => {
    if (attempted[question._id]) return;

    try {
      const res = await apiFetch("/api/question/answer", {
        method: "POST",
        body: JSON.stringify({
          questionId: question._id,
          answer: String(selectedIndex),
        }),
      });

      const contentType = res.headers.get("content-type");

      if (contentType && contentType.includes("application/json")) {
        const data = await res.json();
        if (res.ok) {
          Alert.alert(data.isCorrect ? "✅ Correct!" : "❌ Wrong Answer");
          setAttempted((prev) => ({ ...prev, [question._id]: true }));
        } else {
          Alert.alert("Error", data.error || "Already answered");
        }
      } else {
        const text = await res.text();
        throw new Error("Server returned non-JSON response");
      }
    } catch (err) {
      Alert.alert("Error", err.message || "Something went wrong");
    }
  };

  const renderOptions = (q) => {
    const options = Array.isArray(q.options) && q.options.length === 4
      ? q.options
      : ["Option A", "Option B", "Option C", "Option D"];
    const isDisabled = attempted[q._id];

    return options.map((opt, idx) => {
      const label = ["A", "B", "C", "D"][idx];
      return (
        <TouchableOpacity
          key={idx}
          onPress={() => handleSelect(q, idx)}
          disabled={isDisabled}
          style={[
            styles.optionButton,
            { backgroundColor: isDisabled ? "#e5e7eb" : "#dbeafe" },
          ]}
        >
          <Text style={styles.optionText}>{label}. {opt}</Text>
        </TouchableOpacity>
      );
    });
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
    <View style={{ flex: 1, backgroundColor: "#fff" }}>

      {/* Fixed Header */}
      <View
        style={[
          styles.header,
          {
            paddingBottom: 14,
          },
        ]}
      >
        <TouchableOpacity onPress={() => router.back()} style={{ paddingRight: 15 }}>
          <Ionicons name="chevron-back" size={24} color="#1e293b" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Today's Questions</Text>
      </View>

      {/* Scrollable Content */}
      {loading ? (
        <ActivityIndicator size="large" style={{ marginTop: 40 }} />
      ) : (
        <ScrollView
          contentContainerStyle={{
            paddingTop: 20,
            paddingBottom: insets.bottom + 90,
            paddingHorizontal: 16,
          }}
        >
          {Object.keys(grouped).length === 0 ? (
            <Text style={styles.noQuestions}>No questions available today.</Text>
          ) : (
            Object.entries(grouped).map(([batchKey, subjects]) => {
              const [batchId, batchTitle] = batchKey.split("||");
              return (
                <View key={batchId} style={styles.batchSection}>
                  <Text style={styles.batchTitle}>Batch: {batchTitle}</Text>
                  {Object.entries(subjects).map(([subjectName, questions]) => (
                    <View key={subjectName} style={styles.subjectSection}>
                      <Text style={styles.subjectTitle}>{subjectName}</Text>
                      {questions.map((q) => (
                        <View key={q._id} style={styles.questionCard}>
                          <TouchableOpacity onPress={() => setExpandedQuestionId(q._id)}>
                            <Image
                              source={{ uri: q.Question || q.questionImageUrl }}
                              style={styles.image}
                            />
                          </TouchableOpacity>
                          {expandedQuestionId === q._id && (
                            <View style={{ marginTop: 10 }}>{renderOptions(q)}</View>
                          )}
                        </View>
                      ))}
                    </View>
                  ))}
                </View>
              );
            })
          )}
        </ScrollView>
      )}

      {/* Footer */}
      <View style={{ paddingBottom: insets.bottom }}>
        <AppFooter />
      </View>
    </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
    backgroundColor: "#fff",
    zIndex: 10,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1e293b",
  },
  noQuestions: {
    fontSize: 16,
    color: "#64748b",
    textAlign: "center",
    marginTop: 40,
  },
  batchSection: {
    marginBottom: 24,
    backgroundColor: "#f0f4ff",
    padding: 14,
    borderRadius: 12,
    borderColor: "#c7d2fe",
    borderWidth: 1,
  },
  batchTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 8,
    color: "#1e3a8a",
  },
  subjectSection: {
    marginBottom: 16,
  },
  subjectTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
    color: "#374151",
  },
  questionCard: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 10,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.07,
    shadowRadius: 3,
    elevation: 2,
    borderColor: "#e5e7eb",
    borderWidth: 1,
  },
  image: {
    width: "100%",
    height: 200,
    borderRadius: 8,
    resizeMode: "contain",
    backgroundColor: "#f1f5f9",
  },
  optionButton: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 8,
    marginBottom: 8,
  },
  optionText: {
    fontSize: 15,
    color: "#1e293b",
    fontWeight: "500",
  },
});
