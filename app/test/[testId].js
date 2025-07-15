import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState, useRef } from "react";
import {
  ActivityIndicator,
  Alert,
  BackHandler,
  FlatList,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  StatusBar,
  Platform,
  Dimensions,
  PanResponder,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { apiFetch } from "../../utils/api";

export default function TestAttemptScreen() {
  const { testId } = useLocalSearchParams();
  const router = useRouter();
  const screenWidth = Dimensions.get('window').width;
  const insets = useSafeAreaInsets();

  const [test, setTest] = useState(null);
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [answer, setAnswer] = useState({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [imageHeight, setImageHeight] = useState(200);

  useEffect(() => {
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      Alert.alert("Exit Test", "Are you sure you want to exit? Your progress will be lost.", [
        { text: "Cancel", style: "cancel" },
        { text: "Exit", style: "destructive", onPress: () => router.replace("/") }
      ]);
      return true;
    });
    return () => backHandler.remove();
  }, []);

  useEffect(() => {
    apiFetch(`/api/tests/${testId}`)
      .then(res => res.json())
      .then(data => {
        setTest(data);
        setTimeLeft(data.time * 60);
      })
      .catch(() => Alert.alert("Error", "Failed to load test."))
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

  const handleImageLoad = ({ source }) => {
    if (source.width && source.height) {
      const ratio = source.height / source.width;
      setImageHeight(screenWidth * ratio);
    }
  };

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderRelease: (_, gesture) => {
        if (gesture.dx < -50) handleNextQuestion();
        else if (gesture.dx > 50) handlePreviousQuestion();
      },
    })
  ).current;

  const handleOptionSelect = (index) => {
    const qid = test.questions[currentQIndex]._id;
    setAnswer(prev => ({ ...prev, [qid]: index }));
  };

  const handleNumericalInput = (text) => {
    const qid = test.questions[currentQIndex]._id;
    setAnswer(prev => ({ ...prev, [qid]: text }));
  };

  const clearAnswer = () => {
    const qid = test.questions[currentQIndex]._id;
    setAnswer(prev => {
      const updated = { ...prev };
      delete updated[qid];
      return updated;
    });
  };

  const handlePreviousQuestion = () => {
    if (currentQIndex > 0) setCurrentQIndex(prev => prev - 1);
  };

  const handleNextQuestion = () => {
    if (currentQIndex < test.questions.length - 1) setCurrentQIndex(prev => prev + 1);
    else setCurrentQIndex(0);
  };

  const handleSubmit = async () => {
    if (submitting) return;
    Alert.alert("Submit Test", "Are you sure you want to submit?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Submit", style: "destructive", onPress: async () => {
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
            if (!res.ok) throw new Error();
            Alert.alert("Success", "Test submitted successfully!");
            router.replace("/");
          } catch {
            Alert.alert("Error", "Could not submit the test.");
          } finally {
            setSubmitting(false);
          }
        }
      }
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
    } catch {}
  };

  if (loading) return <ActivityIndicator style={{ flex: 1, justifyContent: 'center' }} />;
  if (!test) return <View style={styles.center}><Text>Test not found.</Text></View>;

  const question = test.questions[currentQIndex];

  return (
    <SafeAreaView style={[styles.container]}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{test.title}</Text>
        <Text style={styles.headerTimer}>
          {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, "0")}
        </Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} {...panResponder.panHandlers}>
        <View style={styles.statsBox}>
          <Text>Total: {test.questions.length}</Text>
          <Text>Attempted: {Object.keys(answer).length}</Text>
          <Text>Skipped: {test.questions.length - Object.keys(answer).length}</Text>
        </View>

        <FlatList
          data={test.questions}
          horizontal
          keyExtractor={(item) => item._id}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.questionNav}
          renderItem={({ item, index }) => {
            const isAttempted = answer.hasOwnProperty(item._id);
            const isCurrent = index === currentQIndex;
            return (
              <TouchableOpacity
                onPress={() => setCurrentQIndex(index)}
                style={[
                  styles.questionNavItem,
                  isCurrent ? styles.activeNav : isAttempted ? styles.attemptedNav : styles.defaultNav,
                ]}
              >
                <Text style={styles.questionNavText}>{index + 1}</Text>
              </TouchableOpacity>
            );
          }}
        />

        <Text style={styles.questionTitle}>Question {currentQIndex + 1}</Text>
        <View style={styles.questionContainer}>
          <Image
            source={question.questionText}
            style={[styles.image, { height: imageHeight }]}
            contentFit="contain"
            onLoad={handleImageLoad}
          />
        </View>

        {question.questionType === "mcq" &&
          question.options.map((opt, idx) => (
            <TouchableOpacity
              key={idx}
              onPress={() => handleOptionSelect(idx)}
              style={[styles.option, answer[question._id] === idx && styles.selectedOption]}
            >
              <Text style={styles.optionText}>{opt}</Text>
            </TouchableOpacity>
          ))}

        {question.questionType === "numerical" && (
          <TextInput
            keyboardType="numeric"
            placeholder="Enter your answer"
            onChangeText={handleNumericalInput}
            value={answer[question._id] || ""}
            style={styles.input}
          />
        )}

        {answer[question._id] !== undefined && (
          <TouchableOpacity onPress={clearAnswer} style={styles.clearBtn}>
            <Text style={styles.clearText}>Clear Answer</Text>
          </TouchableOpacity>
        )}

        <View style={styles.navBtns}>
          <TouchableOpacity onPress={handlePreviousQuestion} disabled={currentQIndex === 0} style={[
            styles.navBtn,
            { backgroundColor: currentQIndex === 0 ? '#ccc' : '#007bff' }
          ]}>
            <Text style={styles.navBtnText}>Previous</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={handleNextQuestion} style={[styles.navBtn, { backgroundColor: '#28a745' }]}>
            <Text style={styles.navBtnText}>
              {currentQIndex === test.questions.length - 1 ? "Back to Start" : "Next"}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <TouchableOpacity onPress={handleSubmit} disabled={submitting} style={styles.submitBtn}>
        <Text style={styles.submitText}>{submitting ? "Submitting..." : "Submit Test"}</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: {
    paddingHorizontal: 15,
    paddingVertical: 10,
    backgroundColor: '#fff',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: Platform.OS === 'android' ? 0 : 0,
  },
  headerTitle: { color: '#000', fontWeight: 'bold', fontSize: 18 },
  headerTimer: { color: '#000', fontWeight: 'bold' },
  scrollContent: { paddingHorizontal: 15, paddingBottom: 10 },
  statsBox: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#f1f3f5',
    padding: 10,
    borderRadius: 6,
    marginBottom: 12,
  },
  questionNav: { paddingBottom: 10 },
  questionNavItem: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 5,
    marginRight: 8,
  },
  questionNavText: { fontWeight: 'bold', fontSize: 14 },
  defaultNav: { backgroundColor: '#fff', borderWidth: 0.1, borderColor: 'black' },
  attemptedNav: { backgroundColor: '#28a745' },
  activeNav: { backgroundColor: '#007bff', borderWidth: 2, borderColor: '#0056b3' },
  questionTitle: { fontWeight: '600', fontSize: 18, marginBottom: 10 },
  questionContainer: { backgroundColor: '#fff', borderRadius: 8, marginBottom: 15 },
  image: { width: '100%', borderRadius: 6 },
  option: {
    backgroundColor: '#fff',
    padding: 14,
    borderRadius: 8,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#dee2e6',
  },
  selectedOption: { backgroundColor: '#d4edda', borderColor: '#c3e6cb' },
  optionText: { fontSize: 16 },
  input: {
    borderColor: '#ced4da',
    borderWidth: 1,
    padding: 14,
    borderRadius: 8,
    fontSize: 16,
    backgroundColor: '#fff',
    marginBottom: 10,
  },
  clearBtn: {
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#dee2e6',
    marginBottom: 15,
  },
  clearText: { color: '#dc3545', fontWeight: '500' },
  navBtns: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
  navBtn: {
    padding: 14,
    borderRadius: 10,
    flex: 1,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  navBtnText: { color: '#fff', fontWeight: 'bold' },
  submitBtn: {
    backgroundColor: '#007bff',
    padding: 16,
    alignItems: 'center',
  },
  submitText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
});
