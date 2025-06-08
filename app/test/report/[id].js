import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { AntDesign, MaterialIcons } from '@expo/vector-icons';
import { apiFetch } from '../../../utils/api';

export default function TestReportScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchReport = async () => {
      try {
        const response = await apiFetch(`/api/tests/report/${id}`);
        const data = await response.json();
        if (response.ok) {
          setReport(data);
        } else {
          setError(data.error || 'Failed to load report');
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchReport();
  }, [id]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6C63FF" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <AntDesign name="arrowleft" size={24} color="#6C63FF" />
          <Text style={styles.backText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!report) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>No report data available</Text>
      </View>
    );
  }

  const renderQuestionItem = (item, index) => {
    const isCorrect = item.isCorrect === "yes";
    const isSkipped = item.isCorrect === "not";
    
    return (
      <View key={index} style={styles.questionCard}>
        <View style={styles.questionHeader}>
          <Text style={styles.questionNumber}>Q{index + 1}</Text>
          <View style={[
            styles.statusBadge,
            isCorrect ? styles.correctBadge : isSkipped ? styles.skippedBadge : styles.incorrectBadge
          ]}>
            <Text style={styles.statusText}>
              {isCorrect ? "Correct" : isSkipped ? "Skipped" : "Incorrect"}
            </Text>
          </View>
        </View>
        
        <Text style={styles.questionText}>{item.questionText}</Text>
        
        <View style={styles.optionsContainer}>
          {item.options.map((option, i) => (
            <View 
              key={i} 
              style={[
                styles.option,
                i === item.correctOption && styles.correctOption,
                i === item.selectedOption && i !== item.correctOption && styles.incorrectOption
              ]}
            >
              <Text style={styles.optionText}>{option}</Text>
              {i === item.correctOption && (
                <MaterialIcons name="check-circle" size={20} color="#4CAF50" style={styles.optionIcon} />
              )}
              {i === item.selectedOption && i !== item.correctOption && (
                <MaterialIcons name="cancel" size={20} color="#F44336" style={styles.optionIcon} />
              )}
            </View>
          ))}
        </View>
        
        {!isCorrect && !isSkipped && item.explanation && (
          <View style={styles.explanationContainer}>
            <Text style={styles.explanationTitle}>Explanation:</Text>
            <Text style={styles.explanationText}>{item.explanation}</Text>
          </View>
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {/* Test Summary */}
        <View style={styles.summaryCard}>
          <Text style={styles.testName}>{report.testName}</Text>
          <Text style={styles.testDescription}>{report.testDescription}</Text>
          
          <View style={styles.scoreContainer}>
            <Text style={styles.scoreText}>
              {report.score}/{report.totalMarks}
            </Text>
            <Text style={styles.scoreLabel}>Total Score</Text>
          </View>
          
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={[styles.statNumber, styles.correctText]}>{report.correct}</Text>
              <Text style={styles.statLabel}>Correct</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={[styles.statNumber, styles.incorrectText]}>{report.incorrect}</Text>
              <Text style={styles.statLabel}>Incorrect</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={[styles.statNumber, styles.skippedText]}>{report.skipped}</Text>
              <Text style={styles.statLabel}>Skipped</Text>
            </View>
          </View>
        </View>
        
        {/* Questions Analysis */}
        <Text style={styles.sectionTitle}>Question-wise Analysis</Text>
        
        {report.answers.map((answer, index) => {
          return renderQuestionItem({
            ...answer,
            questionText: question?.text || 'Question not found',
            options: question?.options || [],
            correctOption: question?.correctOption,
            explanation: question?.explanation
          }, index);
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  scrollContainer: {
    padding: 16,
    paddingBottom: 32,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#F44336',
    marginBottom: 20,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
  },
  backText: {
    marginLeft: 5,
    color: '#6C63FF',
  },
  summaryCard: {
    backgroundColor: '#6C63FF',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    elevation: 3,
    shadowColor: '#6C63FF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  testName: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  testDescription: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 14,
    marginBottom: 16,
  },
  scoreContainer: {
    alignItems: 'center',
    marginVertical: 16,
  },
  scoreText: {
    color: 'white',
    fontSize: 36,
    fontWeight: 'bold',
  },
  scoreLabel: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 14,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 16,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  statLabel: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 14,
    marginTop: 4,
  },
  correctText: {
    color: '#4CAF50',
  },
  incorrectText: {
    color: '#F44336',
  },
  skippedText: {
    color: '#FFC107',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2D3748',
    marginBottom: 16,
  },
  questionCard: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  questionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  questionNumber: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#6C63FF',
  },
  statusBadge: {
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 12,
  },
  correctBadge: {
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
  },
  incorrectBadge: {
    backgroundColor: 'rgba(244, 67, 54, 0.1)',
  },
  skippedBadge: {
    backgroundColor: 'rgba(255, 193, 7, 0.1)',
  },
  statusText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  correctText: {
    color: '#4CAF50',
  },
  incorrectText: {
    color: '#F44336',
  },
  skippedText: {
    color: '#FFC107',
  },
  questionText: {
    fontSize: 16,
    color: '#2D3748',
    marginBottom: 16,
    lineHeight: 24,
  },
  optionsContainer: {
    marginBottom: 12,
  },
  option: {
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  optionText: {
    fontSize: 15,
    color: '#2D3748',
    flex: 1,
  },
  optionIcon: {
    marginLeft: 8,
  },
  correctOption: {
    backgroundColor: 'rgba(76, 175, 80, 0.05)',
    borderColor: '#4CAF50',
  },
  incorrectOption: {
    backgroundColor: 'rgba(244, 67, 54, 0.05)',
    borderColor: '#F44336',
  },
  explanationContainer: {
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    padding: 12,
    marginTop: 8,
  },
  explanationTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#2D3748',
    marginBottom: 4,
  },
  explanationText: {
    fontSize: 14,
    color: '#4A5568',
    lineHeight: 20,
  },
});