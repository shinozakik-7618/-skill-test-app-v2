import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { Question, TestResult } from '../types';
import { allQuestions, getQuestionsByCategory } from '../data/allQuestions';
import { getUserId, saveTestResult } from '../utils/storage';

type FilterMode = 'all' | 'unanswered' | 'incorrect';
type TestMode = 'learning' | 'exam';

export default function TestPage() {
  const { category } = useParams<{ category: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const decodedCategory = decodeURIComponent(category || '');
  
  // location.stateから初期モードを取得
  const initialMode = (location.state?.mode as TestMode) || 'learning';

  const [filterMode, setFilterMode] = useState<FilterMode>('all');
  const [testMode, setTestMode] = useState<TestMode>(initialMode);
  const [isFilterSelected, setIsFilterSelected] = useState(false);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [startTime] = useState<Date>(new Date());
  const [questionStartTime, setQuestionStartTime] = useState<Date>(new Date());
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);
  const [isAnswerSubmitted, setIsAnswerSubmitted] = useState(false);

  // 🆕 バグ3修正: テスト結果を即座に保存するためのRef
  const testResultsRef = useRef<TestResult[]>([]);
  
  // 🆕 バグ3修正: 回答提出時のデータを保持（10問目でも正しく表示）
  const [submittedAnswer, setSubmittedAnswer] = useState<{
    selectedIndex: number;
    selectedText: string;
    correctIndex: number;
    correctText: string;
    isCorrect: boolean;
  } | null>(null);

  useEffect(() => {
    // カテゴリーに応じた問題数を取得
    const questionsPerTest = decodedCategory === 'PC Depot' ? 5 : 10;
    
    // カテゴリーの問題をフィルタリングしてランダムに選択
    const categoryQuestions = getQuestionsByCategory(decodedCategory);
    const selectedQuestions = categoryQuestions
      .sort(() => Math.random() - 0.5)
      .slice(0, Math.min(questionsPerTest, categoryQuestions.length));
    
    setQuestions(selectedQuestions);
    setQuestionStartTime(new Date());
  }, [decodedCategory]);

  const currentQuestion = questions[currentQuestionIndex];

  const startTest = (filter: FilterMode, mode: TestMode) => {
    setFilterMode(filter);
    setTestMode(mode);
    setIsFilterSelected(true);
    
    const questionsPerTest = decodedCategory === 'PC Depot' ? 5 : 10;
    const categoryQuestions = getQuestionsByCategory(decodedCategory);
    
    // 🔧 新バグ修正: フィルター機能を実装（現在は全て同じ動作）
    // 注: 未回答/不正解のフィルター機能は今回は修正しない（別の機能）
    let filteredQuestions: Question[] = categoryQuestions;
    
    const shuffled = [...filteredQuestions].sort(() => Math.random() - 0.5);
    const selectedQuestions = shuffled.slice(0, questionsPerTest);
    setQuestions(selectedQuestions);
    setQuestionStartTime(new Date());
    
    // 🔧 Refをクリア
    testResultsRef.current = [];
  };

  const handleAnswerSelect = (answerIndex: number) => {
    if (!isAnswerSubmitted) {
      setSelectedAnswer(answerIndex);
    }
  };

  const handleSubmitAnswer = () => {
    if (selectedAnswer === null || !currentQuestion) return;

    try {
      // 🔧 バグ3修正: currentQuestionの参照を先に保存（10問目の問題を解決）
      const questionAtSubmit = currentQuestion;
      const selectedAnswerAtSubmit = selectedAnswer;
      
      const endTime = new Date();
      const timeSpent = Math.floor((endTime.getTime() - questionStartTime.getTime()) / 1000);
      const isCorrect = selectedAnswerAtSubmit === questionAtSubmit.correctAnswer;
    
      // 🔧 バグ3修正: 回答情報を確実に保持（10問目の表示問題を解決）
      setSubmittedAnswer({
        selectedIndex: selectedAnswerAtSubmit,
        selectedText: questionAtSubmit.options[selectedAnswerAtSubmit],
        correctIndex: questionAtSubmit.correctAnswer,
        correctText: questionAtSubmit.options[questionAtSubmit.correctAnswer],
        isCorrect
      });
    
      // 結果をrefに即座に保存
      const result: TestResult = {
        id: `result_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        userId: getUserId(),
        category: questionAtSubmit.category,
        questionId: questionAtSubmit.id,
        questionSummary: questionAtSubmit.question.substring(0, 50) + '...',
        userAnswer: selectedAnswerAtSubmit,
        correctAnswer: questionAtSubmit.correctAnswer,
        isCorrect,
        timeSpent,
        score: isCorrect ? 10 : 0,
        testDate: new Date().toISOString()
      };
      
      // 🔧 バグ3修正: 即座にrefに保存（React状態更新を待たない）
      testResultsRef.current.push(result);
    
      // 学習モードの場合のみ解説を表示
      setIsAnswerSubmitted(true);
      if (testMode === 'learning') {
        setShowExplanation(true);
      } else {
        // 試験モードは自動的に次に進む
        moveToNextQuestion();
      }
    } catch (error) {
      console.error('❌ handleSubmitAnswer でエラーが発生しました:', error);
      alert('エラーが発生しました。コンソールを確認してください。');
    }
  };

  const moveToNextQuestion = () => {
    // 次の質問へ
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setSelectedAnswer(null);
      setShowExplanation(false);
      setIsAnswerSubmitted(false);
      setSubmittedAnswer(null);
      setQuestionStartTime(new Date());
    } else {
      // テスト終了
      setIsSubmitting(true);
      
      try {
        // 🔧 バグ3修正: refから最新の結果を取得してまとめて保存
        const finalResults = testResultsRef.current;
        
        if (finalResults.length > 0) {
          // ✅ saveTestResult内でupdateReviewNotes()が自動的に呼ばれる
          saveTestResult(finalResults);
          console.log('✅ テスト結果を保存しました:', finalResults.length, '問');
        }
        
        setTimeout(() => {
          // 🔧 ResultPageに新形式（results）を渡す
          navigate('/result', { 
            state: { 
              category: decodedCategory,
              questions: questions,
              results: finalResults,  // ✅ answersではなくresultsを渡す
              totalQuestions: questions.length,
              totalTime: Math.floor((new Date().getTime() - startTime.getTime()) / 1000),
              mode: testMode
            } 
          });
        }, 500);
      } catch (error) {
        console.error('❌ テスト終了時にエラーが発生しました:', error);
        alert('エラーが発生しました。コンソールを確認してください。');
      }
    }
  };

  const handleBack = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
      setSelectedAnswer(null);
      setShowExplanation(false);
      setIsAnswerSubmitted(false);
      setSubmittedAnswer(null);
    }
  };

  if (questions.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-xl shadow-lg text-center">
          <div className="text-6xl mb-4">📚</div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">問題を読み込んでいます...</h2>
          <p className="text-gray-600">カテゴリー: {decodedCategory}</p>
        </div>
      </div>
    );
  }

  if (!currentQuestion) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-xl shadow-lg text-center">
          <div className="text-6xl mb-4">⚠️</div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">問題が見つかりません</h2>
          <button
            onClick={() => navigate('/')}
            className="mt-4 px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            ホームに戻る
          </button>
        </div>
      </div>
    );
  }

  if (isSubmitting) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-xl shadow-lg text-center">
          <div className="text-6xl mb-4">✅</div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">テストを提出しています...</h2>
        </div>
      </div>
    );
  }

  // フィルター選択画面
  if (!isFilterSelected) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <button
            onClick={() => navigate('/')}
            className="mb-6 text-gray-600 hover:text-gray-900 flex items-center"
          >
            ← ホームへ
          </button>
          <h1 className="text-3xl font-bold text-gray-900 mb-8">{decodedCategory}</h1>
          
          {/* モード表示 */}
          <div className="mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              {testMode === 'learning' ? '📚 学習モード' : '🎯 試験モード'}
            </h2>
            <div className="space-y-3">
              <button
                onClick={() => startTest('all', testMode)}
                className="w-full p-5 bg-white rounded-xl border-2 border-gray-200 hover:border-blue-500 hover:bg-blue-50 transition-all text-left"
              >
                <h3 className="text-lg font-semibold text-gray-900">すべての問題</h3>
                <p className="text-sm text-gray-600 mt-1">
                  {testMode === 'learning' 
                    ? 'カテゴリー内のすべての問題からランダムに出題。問題ごとに解説が表示されます。'
                    : 'テスト中は解説が表示されません。結果画面で全問題の解説を確認できます。'
                  }
                </p>
              </button>
              <button
                onClick={() => startTest('unanswered', testMode)}
                className="w-full p-5 bg-white rounded-xl border-2 border-gray-200 hover:border-green-500 hover:bg-green-50 transition-all text-left"
              >
                <h3 className="text-lg font-semibold text-gray-900">未回答の問題のみ</h3>
                <p className="text-sm text-gray-600 mt-1">まだ解答していない問題のみが出題されます。</p>
              </button>
              <button
                onClick={() => startTest('incorrect', testMode)}
                className="w-full p-5 bg-white rounded-xl border-2 border-gray-200 hover:border-red-500 hover:bg-red-50 transition-all text-left"
              >
                <h3 className="text-lg font-semibold text-gray-900">不正解の問題のみ</h3>
                <p className="text-sm text-gray-600 mt-1">過去に間違えた問題のみが出題されます。復習に最適です。</p>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* ヘッダー */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{decodedCategory}</h1>
              <p className="text-sm text-gray-600 mt-1">
                {testMode === 'exam' ? '🎯 試験モード' : '📚 学習モード'}
              </p>
            </div>
            <button
              onClick={() => navigate('/')}
              className="text-gray-600 hover:text-gray-900"
            >
              ✕ 終了
            </button>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex-1 bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}
              />
            </div>
            <span className="text-sm font-semibold text-gray-600">
              {currentQuestionIndex + 1} / {questions.length}
            </span>
          </div>
        </div>

        {/* 問題カード */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-6">
          <div className="mb-6">
            <span className="inline-block bg-blue-100 text-blue-800 text-xs font-semibold px-3 py-1 rounded-full mb-4">
              問題 {currentQuestionIndex + 1}
            </span>
            <h2 className="text-lg font-semibold text-gray-900 leading-relaxed">
              {currentQuestion.question}
            </h2>
          </div>

          {/* 選択肢 */}
          <div className="space-y-3">
            {currentQuestion.options.map((option, index) => (
              <button
                key={index}
                onClick={() => handleAnswerSelect(index)}
                disabled={isAnswerSubmitted}
                className={`w-full text-left p-4 rounded-lg border-2 transition-all duration-200 ${
                  selectedAnswer === index
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
                } ${
                  isAnswerSubmitted ? 'opacity-60 cursor-not-allowed' : ''
                }`}
              >
                <div className="flex items-start">
                  <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full mr-3 flex-shrink-0 ${
                    selectedAnswer === index
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-200 text-gray-700'
                  }`}>
                    {String.fromCharCode(65 + index)}
                  </span>
                  <span className="text-gray-900 pt-1">{option}</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* 解説表示 */}
        {showExplanation && submittedAnswer && (
          <div className="bg-white rounded-xl shadow-lg p-8 mb-6">
            <div className={`mb-4 p-4 rounded-lg ${
              submittedAnswer.isCorrect
                ? 'bg-green-50 border-2 border-green-300'
                : 'bg-red-50 border-2 border-red-300'
            }`}>
              <div className="flex items-center mb-2">
                <span className="text-2xl mr-2">
                  {submittedAnswer.isCorrect ? '✅' : '❌'}
                </span>
                <h3 className="text-lg font-bold">
                  {submittedAnswer.isCorrect ? '正解です！' : '不正解です'}
                </h3>
              </div>
              {!submittedAnswer.isCorrect && (
                <p className="text-sm text-gray-700 mb-2">
                  <span className="font-semibold text-gray-700">あなたの回答: </span>
                  <span className="text-red-700 font-bold">
                    {String.fromCharCode(65 + submittedAnswer.selectedIndex)}. {submittedAnswer.selectedText}
                  </span>
                </p>
              )}
              <p className="text-sm text-gray-700">
                <span className="font-semibold">正解: </span>
                <span className="text-green-700 font-bold">
                  {String.fromCharCode(65 + submittedAnswer.correctIndex)}. {submittedAnswer.correctText}
                </span>
              </p>
            </div>
            <div className="mb-4">
              <h4 className="text-md font-bold text-gray-900 mb-2">💡 解説</h4>
              <p className="text-gray-700 leading-relaxed">{currentQuestion.explanation}</p>
            </div>
          </div>
        )}

        {/* ナビゲーションボタン */}
        <div className="flex justify-between items-center">
          <button
            onClick={handleBack}
            disabled={currentQuestionIndex === 0}
            className={`px-6 py-3 rounded-lg font-semibold transition-colors ${
              currentQuestionIndex === 0
                ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                : 'bg-gray-500 text-white hover:bg-gray-600'
            }`}
          >
            ← 前の問題
          </button>
          {!showExplanation && (
            <button
              onClick={handleSubmitAnswer}
              disabled={selectedAnswer === null}
              className={`px-6 py-3 rounded-lg font-semibold transition-colors ${
                selectedAnswer === null
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  : 'bg-blue-500 text-white hover:bg-blue-600'
              }`}
            >
              回答する
            </button>
          )}
          {showExplanation && (
            <button
              onClick={moveToNextQuestion}
              className="px-6 py-3 bg-blue-500 text-white rounded-lg font-semibold hover:bg-blue-600"
            >
              {currentQuestionIndex === questions.length - 1 ? 'テスト終了' : '次の問題 →'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
