import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { Question, saveTestResult, TestResult } from '../utils/storage';
import { allQuestions } from '../data/allQuestions';

const TestPage: React.FC = () => {
  const { mode } = useParams<{ mode: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  
  const searchParams = new URLSearchParams(location.search);
  const categoryParam = searchParams.get('category');
  const isReviewMode = location.pathname.includes('review-test');

  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string>('');
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [isAnswerSubmitted, setIsAnswerSubmitted] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);
  const [category, setCategory] = useState<string>('');

  useEffect(() => {
    let loadedQuestions: Question[] = [];
    
    if (isReviewMode) {
      const reviewQuestions = location.state?.questions || [];
      loadedQuestions = reviewQuestions;
      setCategory(location.state?.category || 'AI・DX基礎知識');
    } else {
      const targetCategory = categoryParam || 'AI・DX基礎知識';
      setCategory(targetCategory);
      
      const filteredQuestions = allQuestions.filter(
        q => q.category === targetCategory
      );
      
      const shuffled = [...filteredQuestions].sort(() => Math.random() - 0.5);
      loadedQuestions = shuffled.slice(0, 10);
    }
    
    setQuestions(loadedQuestions);
  }, [mode, categoryParam, isReviewMode, location.state]);

  const currentQuestion = questions[currentQuestionIndex];

  const handleSelectAnswer = (answerId: string) => {
    if (!isAnswerSubmitted) {
      setSelectedAnswer(answerId);
    }
  };

  const handleSubmitAnswer = () => {
    if (!selectedAnswer || !currentQuestion) return;

    const isCorrect = selectedAnswer === currentQuestion.correctAnswer;
    
    const result: TestResult = {
      questionId: currentQuestion.id,
      selectedAnswer,
      isCorrect,
      timestamp: new Date().toISOString(),
      category: currentQuestion.category,
    };

    const updatedResults = [...testResults, result];
    setTestResults(updatedResults);
    setIsAnswerSubmitted(true);

    if (mode === 'learning') {
      setShowExplanation(true);
    } else {
      setTimeout(() => {
        moveToNextQuestion();
      }, 500);
    }
  };

  const moveToNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setSelectedAnswer('');
      setIsAnswerSubmitted(false);
      setShowExplanation(false);
    } else {
      finishTest();
    }
  };

  const finishTest = () => {
    if (testResults.length === 0) {
      alert('回答が記録されていません');
      return;
    }

    const savedResult = saveTestResult(testResults);
    
    navigate('/result', { 
      state: { 
        resultId: savedResult.id,
        questions: questions,
        mode: mode,
        isReviewMode: isReviewMode,
      } 
    });
  };

  const handleBackToHome = () => {
    if (window.confirm('テストを中断しますか？')) {
      navigate('/');
    }
  };

  if (questions.length === 0) {
    return (
      <div className="test-page">
        <div className="loading">問題を読み込んでいます...</div>
      </div>
    );
  }

  if (!currentQuestion) {
    return (
      <div className="test-page">
        <div className="loading">問題が見つかりませんでした</div>
      </div>
    );
  }

  return (
    <div className="test-page">
      <header className="test-header">
        <button onClick={handleBackToHome} className="back-button">
          ← ホームへ
        </button>
        <h1>{isReviewMode ? '復習テスト' : mode === 'learning' ? '学習モード' : '試験モード'}</h1>
        <div className="progress">
          {currentQuestionIndex + 1} / {questions.length}
        </div>
      </header>

      <div className="test-content">
        <div className="question-card">
          <div className="question-category">{currentQuestion.category}</div>
          <div className="question-text">{currentQuestion.question}</div>

          <div className="options">
            {currentQuestion.options.map((option) => {
              const isSelected = selectedAnswer === option.id;
              const isCorrectAnswer = option.id === currentQuestion.correctAnswer;
              
              const showCorrectMark = showExplanation && isCorrectAnswer;
              const showIncorrectMark = showExplanation && isSelected && !isCorrectAnswer;

              let optionClass = 'option';
              if (isSelected) optionClass += ' selected';
              if (showCorrectMark) optionClass += ' correct';
              if (showIncorrectMark) optionClass += ' incorrect';

              return (
                <button
                  key={option.id}
                  className={optionClass}
                  onClick={() => handleSelectAnswer(option.id)}
                  disabled={isAnswerSubmitted}
                >
                  {option.text}
                  {showCorrectMark && <span className="mark"> ✓ 正解</span>}
                  {showIncorrectMark && <span className="mark"> ✗ 不正解</span>}
                </button>
              );
            })}
          </div>

          {showExplanation && mode === 'learning' && (
            <div className="explanation">
              <h3>📖 解説</h3>
              <p>{currentQuestion.explanation}</p>
            </div>
          )}
        </div>

        <div className="test-actions">
          {!isAnswerSubmitted ? (
            <button
              className="submit-button"
              onClick={handleSubmitAnswer}
              disabled={!selectedAnswer}
            >
              回答する
            </button>
          ) : (
            <>
              {mode === 'learning' && (
                <button className="next-button" onClick={moveToNextQuestion}>
                  {currentQuestionIndex < questions.length - 1 ? '次の問題へ' : 'テスト終了'}
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default TestPage;