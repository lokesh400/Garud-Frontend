import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter, Stack } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  BackHandler,
  Dimensions,
  FlatList,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  PanResponder
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

  // Prevent hardware back button
  useEffect(() => {
    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      () => {
        Alert.alert(
          "Exit Test",
          "Are you sure you want to exit? Your progress will be lost.",
          [
            { text: "Cancel", style: "cancel" },
            { 
              text: "Exit", 
              style: "destructive",
              onPress: () => router.replace("/")
            }
          ]
        );
        return true;
      }
    );

    return () => backHandler.remove();
  }, []);

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

  // Swipe gesture handlers
  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onPanResponderRelease: (evt, gestureState) => {
      if (gestureState.dx < -50) {
        // Swipe left - next question
        handleNextQuestion();
      } else if (gestureState.dx > 50) {
        // Swipe right - previous question
        handlePreviousQuestion();
      }
    },
  });

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

  const handlePreviousQuestion = () => {
    if (currentQIndex > 0) {
      setCurrentQIndex(prev => prev - 1);
    }
  };

  const handleNextQuestion = () => {
    if (currentQIndex < test.questions.length - 1) {
      setCurrentQIndex(prev => prev + 1);
    } else {
      // If on last question, go back to first question
      setCurrentQIndex(0);
    }
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

  if (loading) return <ActivityIndicator style={{ flex: 1, justifyContent: 'center' }} />;
  if (!test) return <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}><Text>Test not found.</Text></View>;

  const question = test.questions[currentQIndex];

  return (
    <View style={{ flex: 1, backgroundColor: '#ffff' }}>
      {/* Custom header */}
      <View style={{ 
        padding: 15, 
        backgroundColor: '#007bff',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop:35
      }}>
        <Text style={{ color: '#ffff', fontWeight: 'bold', fontSize: 18 }}>
          {test.title}
        </Text>
        <Text style={{ color: '#ffff', fontWeight: 'bold' }}>
          Time: {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, "0")}
        </Text>
      </View>

      <ScrollView 
        style={{ flex: 1 }} 
        contentContainerStyle={{ padding: 15 }}
        {...panResponder.panHandlers}
      >
        {/* Question Stats */}
        <View style={{ 
          flexDirection: "row", 
          justifyContent: "space-between", 
          marginBottom: 16,
          backgroundColor: '#f8f9fa',
          padding: 10,
          borderRadius: 5
        }}>
          <Text style={{ fontSize: 14, color: '#495057' }}>Total: {test.questions.length}</Text>
          <Text style={{ fontSize: 14, color: '#28a745' }}>Attempted: {Object.keys(answer).length}</Text>
          <Text style={{ fontSize: 14, color: '#dc3545' }}>
            Skipped: {test.questions.length - Object.keys(answer).length}
          </Text>
        </View>

        {/* Horizontal question navigator */}
        <FlatList
          data={test.questions}
          horizontal
          keyExtractor={(item) => item._id}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingVertical: 5 }}
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
                    ? "#28a745"
                    : "#e9ecef",
                  paddingHorizontal: 14,
                  paddingVertical: 10,
                  borderRadius: 5,
                  marginRight: 8,
                  borderWidth: isCurrent ? 2 : 0,
                  borderColor: isCurrent ? "#0056b3" : "transparent",
                }}
              >
                <Text style={{ 
                  color: isCurrent ? "#fff" : isAttempted ? "#fff" : "#495057", 
                  fontWeight: "bold",
                  fontSize: 14
                }}>
                  {index + 1}
                </Text>
              </TouchableOpacity>
            );
          }}
          style={{ marginBottom: 16 }}
        />

        {/* Question Content */}
        <View style={{ marginBottom: 20 }}>
          <Text style={{ 
            fontWeight: "600", 
            fontSize: 18, 
            marginBottom: 12,
            color: '#212529'
          }}>
            Question {currentQIndex + 1}
          </Text>
          
          <View style={{
            backgroundColor: '#f8f9fa',
            borderRadius: 8,
            padding: 10,
            marginBottom: 15
          }}>
            <Image
              source={question.questionText}
              style={{
                width: screenWidth - 50,
                height: imageHeight,
                borderRadius: 6,
              }}
              contentFit="contain"
              onLoad={handleImageLoad}
            />
          </View>
        </View>

        {/* Options */}
        {question.questionType === "mcq" &&
          question.options.map((opt, idx) => (
            <TouchableOpacity
              key={idx}
              onPress={() => handleOptionSelect(idx)}
              style={{
                backgroundColor: answer[question._id] === idx ? "#d4edda" : "#f8f9fa",
                padding: 16,
                borderRadius: 10,
                marginVertical: 6,
                borderWidth: 1,
                borderColor: answer[question._id] === idx ? "#c3e6cb" : "#dee2e6"
              }}
            >
              <Text style={{ fontSize: 16, color: '#212529' }}>{opt}</Text>
            </TouchableOpacity>
          ))}

        {question.questionType === "numerical" && (
          <TextInput
            keyboardType="numeric"
            placeholder="Enter your answer"
            placeholderTextColor="#6c757d"
            onChangeText={handleNumericalInput}
            value={answer[question._id] || ""}
            style={{
              borderColor: answer[question._id] ? "#28a745" : "#ced4da",
              borderWidth: 1,
              padding: 14,
              marginVertical: 8,
              borderRadius: 8,
              fontSize: 16,
              backgroundColor: '#fff'
            }}
          />
        )}

        {/* Clear Answer Button */}
        {answer[question._id] !== undefined && (
          <TouchableOpacity
            onPress={clearAnswer}
            style={{
              backgroundColor: "#f8f9fa",
              padding: 12,
              borderRadius: 8,
              alignItems: "center",
              marginTop: 10,
              borderWidth: 1,
              borderColor: "#dee2e6"
            }}
          >
            <Text style={{ color: "#dc3545", fontWeight: '500' }}>Clear Answer</Text>
          </TouchableOpacity>
        )}

        {/* Navigation Buttons */}
        <View style={{ 
          flexDirection: "row", 
          justifyContent: "space-between", 
          marginTop: 25,
          marginBottom: 15
        }}>
          <TouchableOpacity
            onPress={handlePreviousQuestion}
            disabled={currentQIndex === 0}
            style={{
              backgroundColor: currentQIndex === 0 ? "#e9ecef" : "#007bff",
              padding: 14,
              borderRadius: 10,
              flex: 1,
              marginRight: 10,
              alignItems: "center",
              opacity: currentQIndex === 0 ? 0.6 : 1
            }}
          >
            <Text style={{ color: currentQIndex === 0 ? "#6c757d" : "#fff", fontWeight: "bold" }}>
              Previous
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleNextQuestion}
            disabled={currentQIndex === test.questions.length - 1 && submitting}
            style={{
              backgroundColor: currentQIndex === test.questions.length - 1 ? "#28a745" : "#007bff",
              padding: 14,
              borderRadius: 10,
              flex: 1,
              marginLeft: 10,
              alignItems: "center"
            }}
          >
            <Text style={{ color: "#ffff", fontWeight: "bold" }}>
              {currentQIndex === test.questions.length - 1 ? "Back to Start" : "Next"}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Submit Button */}
      <TouchableOpacity
        onPress={handleSubmit}
        disabled={submitting}
        style={{
          backgroundColor: submitting ? "#6c757d" : "#007bff",
          padding: 16,
          alignItems: "center",
          justifyContent: 'center',
          flexDirection: 'row'
        }}
      >
        <Text style={{ color: "#fff", fontWeight: "bold", fontSize: 16, marginRight: 10 }}>
          {submitting ? "Submitting..." : "Submit Test"}
        </Text>
      </TouchableOpacity>
    </View>
  );
}