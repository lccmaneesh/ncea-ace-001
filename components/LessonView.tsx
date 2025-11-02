import React, { useState, useEffect, useCallback } from 'react';
import { Subject, Topic, Question, Feedback, MathFeedback, SessionData, Report } from '../types';
import * as geminiService from '../services/geminiService';
import * as reportService from '../services/reportService';
import * as pdfService from '../services/pdfService';
import * as userService from '../services/userService';
import QuestionCard from './QuestionCard';
import FeedbackPanel from './FeedbackPanel';
import LoadingSpinner from './LoadingSpinner';
import ProgressBar from './ProgressBar';

interface LessonViewProps {
  subject: Subject;
  topic: Topic;
  onComplete: () => void;
}

const LessonView: React.FC<LessonViewProps> = ({ subject, topic, onComplete }) => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<string[]>([]);
  const [feedback, setFeedback] = useState<Feedback | MathFeedback | null>(null);
  const [hint, setHint] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isGettingFeedback, setIsGettingFeedback] = useState(false);
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isComplete, setIsComplete] = useState(false);
  const [sessionHistory, setSessionHistory] = useState<SessionData[]>([]);
  const [isReportSaved, setIsReportSaved] = useState(false);


  const fetchQuiz = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      setSessionHistory([]);
      setIsReportSaved(false);
      
      const profile = userService.getUserProfile();
      const progress = profile[topic.id];
      
      const quizQuestions = await geminiService.generateQuiz(subject, topic, progress);
      setQuestions(quizQuestions);
      setUserAnswers(new Array(quizQuestions.length).fill(''));
    } catch (e) {
      console.error(e);
      setError('Failed to generate quiz. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [subject, topic]);

  useEffect(() => {
    fetchQuiz();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [topic.id]);

  const handleCompletion = useCallback(async () => {
    setIsSummarizing(true);
    try {
        const summary = await geminiService.summarizeSessionPerformance(sessionHistory, subject);
        userService.updateProfileAfterSession(topic.id, summary);
    } catch(e) {
        console.error("Failed to summarize session:", e);
        // Fail silently, user can still proceed
    } finally {
        setIsSummarizing(false);
        setIsComplete(true);
    }
  }, [sessionHistory, subject, topic.id]);

  const handleAnswerSubmit = async (answer: string) => {
    const newAnswers = [...userAnswers];
    newAnswers[currentQuestionIndex] = answer;
    setUserAnswers(newAnswers);
    setIsGettingFeedback(true);
    setFeedback(null);
    setHint(null);

    try {
      let fb: Feedback | MathFeedback;
      if (subject === Subject.English) {
        fb = await geminiService.getEnglishFeedback(questions[currentQuestionIndex].questionText, answer, topic);
      } else {
        fb = await geminiService.getMathFeedback(questions[currentQuestionIndex].questionText, answer);
      }
      setFeedback(fb);
      setSessionHistory(prev => [...prev, {
        question: questions[currentQuestionIndex],
        answer,
        feedback: fb
      }]);
    } catch (e) {
      console.error(e);
      setError('Could not get feedback. Please proceed to the next question.');
    } finally {
      setIsGettingFeedback(false);
    }
  };
  
  const handleGetHint = async () => {
    if (isGettingFeedback) return;
    setIsGettingFeedback(true);
    try {
        const newHint = await geminiService.getMathHint(questions[currentQuestionIndex].questionText);
        setHint(newHint);
    } catch (e) {
        console.error(e);
        setHint('Sorry, could not fetch a hint right now.');
    } finally {
        setIsGettingFeedback(false);
    }
  };

  const handleNextQuestion = () => {
    setFeedback(null);
    setHint(null);
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      handleCompletion();
    }
  };
  
  const handleSaveReport = () => {
      reportService.saveReport({
        subject,
        topicName: topic.name,
        sessionData: sessionHistory,
      });
      setIsReportSaved(true);
  };
  
  const handleDownloadPdf = () => {
    const report: Omit<Report, 'id' | 'date'> = {
        subject,
        topicName: topic.name,
        sessionData: sessionHistory,
    };
    pdfService.generatePdfReport(report);
  };


  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-8 bg-white rounded-lg shadow-sm">
        <LoadingSpinner />
        <p className="mt-4 text-slate-600">Generating your adaptive quiz...</p>
      </div>
    );
  }

  if (error) {
    return <div className="text-center p-8 bg-red-50 text-red-700 rounded-lg">{error}</div>;
  }
  
  if (isSummarizing) {
    return (
      <div className="flex flex-col items-center justify-center p-8 bg-white rounded-lg shadow-sm">
        <LoadingSpinner />
        <p className="mt-4 text-slate-600">Analyzing your performance...</p>
      </div>
    );
  }

  if (isComplete) {
    return (
        <div className="text-center p-8 bg-white rounded-lg shadow-lg space-y-4">
            <h2 className="text-2xl font-bold text-teal-600">Lesson Complete!</h2>
            <p className="text-slate-600">Great work! Your learning profile has been updated.</p>
            <div className="flex flex-col sm:flex-row gap-3 pt-4">
                 <button
                    onClick={handleSaveReport}
                    disabled={isReportSaved}
                    className="w-full bg-slate-800 text-white font-bold py-3 px-4 rounded-lg hover:bg-slate-900 transition-colors focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-opacity-50 disabled:bg-slate-400 disabled:cursor-not-allowed"
                >
                    {isReportSaved ? 'Report Saved ✓' : 'Save Report to Review Later'}
                </button>
                 <button
                    onClick={handleDownloadPdf}
                    className="w-full bg-teal-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-teal-700 transition-colors focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-opacity-50"
                >
                    Download PDF Report
                </button>
            </div>
             <button
                onClick={onComplete}
                className="w-full text-slate-700 font-bold py-3 px-4 rounded-lg hover:bg-slate-100 transition-colors focus:outline-none focus:ring-2 focus:ring-slate-400"
            >
                Back to Topics
            </button>
        </div>
    );
  }

  if (questions.length === 0) {
    return <div className="text-center p-8 bg-white rounded-lg shadow-sm">No questions available for this topic.</div>;
  }
  
  const currentQuestion = questions[currentQuestionIndex];

  return (
    <div className="space-y-6">
      <ProgressBar current={currentQuestionIndex + 1} total={questions.length} />
      <QuestionCard
        question={currentQuestion}
        questionNumber={currentQuestionIndex + 1}
        onSubmit={handleAnswerSubmit}
        onGetHint={subject === Subject.Mathematics ? handleGetHint : undefined}
        isLoading={isGettingFeedback}
        isSubmitted={!!feedback}
      />
      
      {isGettingFeedback && !hint && (
        <div className="flex items-center justify-center p-4">
          <LoadingSpinner />
          <p className="ml-3 text-slate-500">Thinking...</p>
        </div>
      )}

      {hint && !feedback && (
          <div className="p-4 bg-amber-50 border-l-4 border-amber-400 text-amber-800 rounded-r-lg">
              <p className="font-semibold">Hint</p>
              <p>{hint}</p>
          </div>
      )}

      {feedback && (
        <>
            <FeedbackPanel subject={subject} feedback={feedback} />
            <button
                onClick={handleNextQuestion}
                className="w-full bg-teal-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-teal-700 transition-colors focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-opacity-50"
            >
                {currentQuestionIndex === questions.length - 1 ? 'Finish Lesson' : 'Next Question'}
            </button>
        </>
      )}
    </div>
  );
};

export default LessonView;
