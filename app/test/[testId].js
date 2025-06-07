import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  FlatList,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { apiFetch } from "../../utils/api";

export default function TestAttemptScreen() {
  const screenWidth = Dimensions.get("window").width;
  const { testId } = useLocalSearchParams();
  const router = useRouter();

  const [test, setTest] = useState(null);
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [answer, setAnswer] = useState({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [imageHeight, setImageHeight] = useState(200);

  const handleImageLoad = ({ source }) => {
    if (source.width && source.height) {
      const ratio = source.height / source.width;
      setImageHeight(screenWidth * ratio);
    }
  };

  useEffect(() => {
    apiFetch(`/api/tests/${testId}`)
      .then(res => res.json())
      .then(data => {
        setTest(data);
        setTimeLeft(data.time * 60);
      })
      .catch(err => {
        console.error(err);
        Alert.alert("Error", "Failed to load test.");
      })
      .finally(() => setLoading(false));
  }, [testId]);

  useEffect(() => {
    if (!test) return;
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          handleAutoSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [test]);

  const handleOptionSelect = (index) => {
    const questionId = test.questions[currentQIndex]._id;
    setAnswer(prev => ({ ...prev, [questionId]: index }));
  };

  const handleNumericalInput = (text) => {
    const questionId = test.questions[currentQIndex]._id;
    setAnswer(prev => ({ ...prev, [questionId]: text }));
  };

  const clearAnswer = () => {
    const questionId = test.questions[currentQIndex]._id;
    setAnswer(prev => {
      const updated = { ...prev };
      delete updated[questionId];
      return updated;
    });
  };

  const handleSubmit = async () => {
    if (submitting) return;

    Alert.alert("Submit Test", "Are you sure you want to submit?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Submit",
        style: "destructive",
        onPress: async () => {
          setSubmitting(true);
          try {
            const payload = {
              answer,
              totalQuestions: test.questions.length,
              attemptedQuestions: Object.keys(answer).length,
            };

            const res = await apiFetch(`/api/tests/${testId}/submit`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(payload),
            });

            if (!res.ok) throw new Error("Submission failed");

            Alert.alert("Success", "Test submitted successfully!");
            router.replace("/");
          } catch (err) {
            console.error(err);
            Alert.alert("Error", "Could not submit the test.");
          } finally {
            setSubmitting(false);
          }
        },
      },
    ]);
  };

  const handleAutoSubmit = async () => {
    try {
      const payload = {
        answer,
        totalQuestions: test.questions.length,
        attemptedQuestions: Object.keys(answer).length,
        autoSubmitted: true,
      };

      await apiFetch(`/api/tests/${testId}/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      Alert.alert("Time's up", "Test auto-submitted.");
      router.replace("/");
    } catch (err) {
      console.error("Auto-submit failed", err);
    }
  };

  if (loading) return <ActivityIndicator style={{ marginTop: 50 }} />;
  if (!test) return <Text style={{ padding: 20 }}>Test not found.</Text>;

  const question = test.questions[currentQIndex];

  return (
    <ScrollView style={{ backgroundColor: "#fff", padding: 20 }}>
      <Text style={{ fontSize: 20, fontWeight: "bold", marginBottom: 10 }}>
        {test.title}
      </Text>

      <Text style={{ marginBottom: 10 }}>
        Time Left: {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, "0")}
      </Text>

      {/* Question Stats */}
      <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 16 }}>
        <Text style={{ fontSize: 16 }}>Total: {test.questions.length}</Text>
        <Text style={{ fontSize: 16 }}>Attempted: {Object.keys(answer).length}</Text>
        <Text style={{ fontSize: 16 }}>
          Skipped: {test.questions.length - Object.keys(answer).length}
        </Text>
      </View>

      {/* Horizontal question navigator */}
      <FlatList
        data={test.questions}
        horizontal
        keyExtractor={(item) => item._id}
        showsHorizontalScrollIndicator={false}
        renderItem={({ item, index }) => {
          const isAttempted = answer.hasOwnProperty(item._id);
          const isCurrent = index === currentQIndex;

          return (
            <TouchableOpacity
              onPress={() => setCurrentQIndex(index)}
              style={{
                backgroundColor: isCurrent
                  ? "#007bff"
                  : isAttempted
                  ? "rgba(135, 206, 235, 0.5)" // Transparent sky blue
                  : "#eee",
                paddingHorizontal: 14,
                paddingVertical: 10,
                borderRadius: 20,
                marginRight: 8,
                borderWidth: isCurrent ? 2 : 0,
                borderColor: isCurrent ? "#0056b3" : "transparent",
              }}
            >
              <Text style={{ color: isCurrent ? "#fff" : "#333", fontWeight: "bold" }}>
                Q{index + 1}
              </Text>
            </TouchableOpacity>
          );
        }}
        style={{ marginBottom: 16 }}
      />

      <View style={{ marginBottom: 12 }}>
        <Text style={{ fontWeight: "600", fontSize: 16, marginBottom: 8 }}>
          Question {currentQIndex + 1}
        </Text>
        <Image
          source={question.questionText}
          style={{
            width: screenWidth - 40,
            height: imageHeight,
            borderRadius: 6,
            backgroundColor: "#fff",
          }}
          contentFit="contain"
          onLoad={handleImageLoad}
        />
      </View>

      {question.questionType === "mcq" &&
        question.options.map((opt, idx) => (
          <TouchableOpacity
            key={idx}
            onPress={() => handleOptionSelect(idx)}
            style={{
              backgroundColor: answer[question._id] === idx ? "#d0f0c0" : "#eee",
              padding: 16,
              borderRadius: 10,
              marginVertical: 6,
            }}
          >
            <Text style={{ fontSize: 16 }}>{opt}</Text>
          </TouchableOpacity>
        ))}

      {question.questionType === "numerical" && (
        <TextInput
          keyboardType="numeric"
          placeholder="Enter number"
          onChangeText={handleNumericalInput}
          value={answer[question._id] || ""}
          style={{
            borderColor: "#ccc",
            borderWidth: 1,
            padding: 12,
            marginVertical: 10,
            borderRadius: 8,
            fontSize: 16,
          }}
        />
      )}

      {/* Clear Answer Button */}
      {answer[question._id] !== undefined && (
        <View style={{ marginTop: 10 }}>
          <TouchableOpacity
            onPress={clearAnswer}
            style={{
              backgroundColor: "#ccc",
              padding: 12,
              borderRadius: 8,
              alignItems: "center",
            }}
          >
            <Text style={{ color: "#333" }}>Clear Answer</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Navigation Buttons */}
      <View style={{ flexDirection: "row", justifyContent: "space-between", marginTop: 20 }}>
        <TouchableOpacity
          onPress={() => setCurrentQIndex(prev => prev - 1)}
          disabled={currentQIndex === 0}
          style={{
            backgroundColor: currentQIndex === 0 ? "#ccc" : "#007bff",
            padding: 14,
            borderRadius: 10,
            flex: 1,
            marginRight: 10,
            alignItems: "center",
          }}
        >
          <Text style={{ color: "#fff", fontWeight: "bold" }}>Previous</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setCurrentQIndex(prev => prev + 1)}
          disabled={currentQIndex === test.questions.length - 1}
          style={{
            backgroundColor:
              currentQIndex === test.questions.length - 1 ? "#ccc" : "#007bff",
            padding: 14,
            borderRadius: 10,
            flex: 1,
            marginLeft: 10,
            alignItems: "center",
          }}
        >
          <Text style={{ color: "#fff", fontWeight: "bold" }}>Next</Text>
        </TouchableOpacity>
      </View>

      {/* Submit Button */}
      <View style={{ marginTop: 30, marginBottom:30 }}>
        <TouchableOpacity
          onPress={handleSubmit}
          disabled={submitting}
          style={{
            backgroundColor: submitting ? "#aaa" : "red",
            padding: 16,
            borderRadius: 12,
            alignItems: "center",
          }}
        >
          <Text style={{ color: "#fff", fontWeight: "bold", fontSize: 16 }}>
            {submitting ? "Submitting..." : "Submit Test"}
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}
