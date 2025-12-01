import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { Question, getQuestions, saveTestResult, TestResult } from '../utils/storage';
import '../styles/TestPage.css';

// 問題選択肢のインターフェース
interface Option {
  id: string;
  text: string;
}

const TestPage: React.FC = () => {
  const { mode } = useParams<{ mode: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  
  // URLパラメータから取得
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

  // 問題読み込み
  useEffect(() => {
    let loadedQuestions: Question[] = [];
    
    if (isReviewMode) {
      // 復習モード: ReviewTestPage から渡された questions を使用
      const reviewQuestions = location.state?.questions || [];
      loadedQuestions = reviewQuestions;
      setCategory(location.state?.category || 'AI・DX基礎知識');
    } else {
      // 通常モード
      const allQuestions = getQuestions();
      const targetCategory = categoryParam || 'AI・DX基礎知識';
      setCategory(targetCategory);
      
      // カテゴリーでフィルタリング
      const filteredQuestions = allQuestions.filter(
        q => q.category === targetCategory
      );
      
      // シャッフル
      const shuffled = [...filteredQuestions].sort(() => Math.random() - 0.5);
      loadedQuestions = shuffled.slice(0, 10); // 10問に制限
    }
    
    setQuestions(loadedQuestions);
  }, [mode, categoryParam, isReviewMode, location.state]);

  const currentQuestion = questions[currentQuestionIndex];

  // 回答を選択
  const handleSelectAnswer = (answerId: string) => {
    if (!isAnswerSubmitted) {
      setSelectedAnswer(answerId);
    }
  };

  // 回答を送信
  const handleSubmitAnswer = () => {
    if (!selectedAnswer || !currentQuestion) return;

    const isCorrect = selectedAnswer === currentQuestion.correctAnswer;
    
    // テスト結果を記録
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

    // 学習モードの場合のみ解説を即座に表示
    if (mode === 'learning') {
      setShowExplanation(true);
    } else {
      // 試験モードの場合は次の問題へ自動遷移
      setTimeout(() => {
        moveToNextQuestion();
      }, 500);
    }
  };

  // 次の問題へ
  const moveToNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setSelectedAnswer('');
      setIsAnswerSubmitted(false);
      setShowExplanation(false);
    } else {
      // テスト終了
      finishTest();
    }
  };

  // テスト終了処理
  const finishTest = () => {
    if (testResults.length === 0) {
      alert('回答が記録されていません');
      return;
    }

    // テスト結果を保存 (復習ノート・学習履歴の記録は saveTestResult 内で自動実行)
    const savedResult = saveTestResult(testResults);
    
    console.log('🔍 [DEBUG] テスト終了:', {
      mode,
      isReviewMode,
      resultsCount: testResults.length,
      savedResultId: savedResult.id,
    });

    // 結果画面へ遷移（全問題の解説を表示するため questions も渡す）
    navigate('/result', { 
      state: { 
        resultId: savedResult.id,
        questions: questions,  // 試験モードで全問題の解説を表示するために必要
        mode: mode,
        isReviewMode: isReviewMode,
      } 
    });
  };

  // ホームへ戻る
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
              
              // 試験モードでは正誤表示なし
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

          {/* 学習モードのみ解説を表示 */}
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