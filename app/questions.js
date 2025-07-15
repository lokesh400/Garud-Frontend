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
} from "react-native";
import { apiFetch } from "../utils/api";
import AppFooter from "../components/AppFooter";

export default function GroupedQuestionsScreen() {
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
        console.log("⚠️ Response is not JSON:", text);
        throw new Error("Server returned non-JSON response");
      }
    } catch (err) {
      console.error("Answer error:", err);
      Alert.alert("Error", err.message || "Something went wrong");
    }
  };

  const renderOptions = (q) => {
    const fallbackOptions = ["Option A", "Option B", "Option C", "Option D"];
    const options = Array.isArray(q.options) && q.options.length === 4 ? q.options : fallbackOptions;
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
            { backgroundColor: isDisabled ? "#ccc" : "#dfe9ff" },
          ]}
        >
          <Text style={styles.optionText}>{label}. {opt}</Text>
        </TouchableOpacity>
      );
    });
  };

  if (loading) return <ActivityIndicator size="large" style={{ marginTop: 40 }} />;

  return (
    <View style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <Text style={styles.heading}>📅 Today's Questions</Text>

        {Object.keys(grouped).length === 0 ? (
          <Text>No questions available today.</Text>
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

      <AppFooter />
    </View>
  );
}

const styles = StyleSheet.create({
  heading: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 12,
  },
  batchSection: {
    marginBottom: 24,
    backgroundColor: "#f0f4ff",
    padding: 12,
    borderRadius: 10,
  },
  batchTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 8,
    color: "#333",
  },
  subjectSection: {
    marginBottom: 12,
  },
  subjectTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
    color: "#4a4a4a",
  },
  questionCard: {
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 10,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  image: {
    width: "100%",
    height: 200,
    resizeMode: "contain",
    borderRadius: 6,
  },
  optionButton: {
    padding: 10,
    borderRadius: 6,
    marginTop: 6,
  },
  optionText: {
    fontSize: 15,
    color: "#333",
  },
});
