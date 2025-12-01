import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { ArrowLeft, Clock, Filter, BookOpen } from 'lucide-react';
import { getQuestionsByCategory } from '../data/allQuestions';
import { Question } from '../types';
import { saveTestResult, getUserId, getTestResultsByCategory } from '../utils/storage';

type FilterMode = 'all' | 'unanswered' | 'incorrect';
type TestMode = 'learning' | 'exam'; // 🆕 学習モード or 試験モード

export default function TestPage() {
  const { category } = useParams<{ category: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const decodedCategory = decodeURIComponent(category || '');
  
  // URLパラメータからモードを取得（デフォルトは試験モード）
  const searchParams = new URLSearchParams(location.search);
  const testMode: TestMode = (searchParams.get('mode') as TestMode) || 'exam';

  const [filterMode, setFilterMode] = useState<FilterMode>('all');
  const [isFilterSelected, setIsFilterSelected] = useState(false);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [questionStartTime, setQuestionStartTime] = useState<Date>(new Date());
  const [testStartTime] = useState<Date>(new Date());
  const [showExplanation, setShowExplanation] = useState(false); // 🆕 解説表示フラグ
  const [isAnswerSubmitted, setIsAnswerSubmitted] = useState(false); // 🆕 回答済みフラグ

  useEffect(() => {
    if (!decodedCategory) {
      navigate('/');
      return;
    }

    let categoryQuestions = getQuestionsByCategory(decodedCategory);
    const questionsPerTest = decodedCategory === 'PC Depot' ? 10 : 5;
    
    // ランダムに問題を選択
    const shuffled = [...categoryQuestions].sort(() => Math.random() - 0.5);
    const selected = shuffled.slice(0, questionsPerTest);
    
    setQuestions(selected);
  }, [decodedCategory, navigate]);

  const currentQuestion = questions[currentQuestionIndex];

  const handleAnswerSelect = (answerIndex: number) => {
    if (!isAnswerSubmitted) {
      setSelectedAnswer(answerIndex);
    }
  };

  const handleSubmitAnswer = () => {
    if (selectedAnswer === null) {
      alert('回答を選択してください');
      return;
    }

    const endTime = new Date();
    const timeSpent = Math.floor((endTime.getTime() - questionStartTime.getTime()) / 1000);
    const isCorrect = selectedAnswer === currentQuestion.correctAnswer;
    
    const result = {
      id: `result_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId: getUserId(),
      category: decodedCategory,
      questionId: currentQuestion.id,
      questionSummary: currentQuestion.question.substring(0, 50) + '...',
      userAnswer: selectedAnswer,
      correctAnswer: currentQuestion.correctAnswer,
      isCorrect,
      timeSpent,
      score: isCorrect ? 10 : 0,
      testDate: new Date().toISOString()
    };

    saveTestResult(result);
    
    // 復習ノート・学習履歴の記録はsaveTestResult内で自動的に行われます
    
    setIsAnswerSubmitted(true);

    // 学習モードの場合は即座に解説を表示
    if (testMode === 'learning') {
      setShowExplanation(true);
    } else {
      // 試験モードの場合も解説を表示
      setShowExplanation(true);
    }
  };

  const moveToNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setSelectedAnswer(null);
      setQuestionStartTime(new Date());
      setShowExplanation(false);
      setIsAnswerSubmitted(false);
    } else {
      // テスト終了 - 結果画面へ遷移
      // 学習履歴の記録はsaveTestResult内で自動的に行われます
      const totalTime = Math.floor((new Date().getTime() - testStartTime.getTime()) / 1000);
      
      navigate('/result', {
        state: {
          category: decodedCategory,
          totalQuestions: questions.length,
          totalTime,
          mode: testMode // 🆕 モード情報を渡す
        }
      });
    }
  };

  const getAnswerLabel = (index: number): string => {
    const labels = ['A', 'B', 'C', 'D'];
    return labels[index] || String(index);
  };

  if (!currentQuestion) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">📚</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">問題を読み込み中...</h2>
        </div>
      </div>
    );
  }

  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;
  const isCorrect = selectedAnswer === currentQuestion.correctAnswer;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* ヘッダー */}
      <header className="bg-white shadow-md sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-3">
            <button
              onClick={() => navigate('/')}
              className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="w-5 h-5 mr-1" />
              <span className="font-semibold">戻る</span>
            </button>
            <div className="flex items-center space-x-4">
              {/* モード表示 */}
              <div className={`px-3 py-1 rounded-full text-sm font-semibold ${
                testMode === 'learning' 
                  ? 'bg-blue-100 text-blue-700' 
                  : 'bg-purple-100 text-purple-700'
              }`}>
                {testMode === 'learning' ? '📚 学習モード' : '📝 試験モード'}
              </div>
              <div className="flex items-center text-gray-600">
                <Clock className="w-5 h-5 mr-1" />
                <span className="font-semibold">{currentQuestionIndex + 1} / {questions.length}</span>
              </div>
            </div>
          </div>
          
          {/* プログレスバー */}
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div
              className="bg-gradient-to-r from-blue-500 to-indigo-600 h-2.5 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>
      </header>

      {/* メインコンテンツ */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-xl shadow-lg p-8">
          {/* カテゴリー表示 */}
          <div className="mb-6">
            <span className="inline-block bg-indigo-100 text-indigo-800 px-4 py-2 rounded-lg text-sm font-semibold">
              {decodedCategory}
            </span>
          </div>

          {/* 問題文 */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 leading-relaxed">
              {currentQuestion.question}
            </h2>
          </div>

          {/* 選択肢 */}
          {!showExplanation && (
            <div className="space-y-4 mb-8">
              {currentQuestion.options.map((option, index) => (
                <button
                  key={index}
                  onClick={() => handleAnswerSelect(index)}
                  disabled={isAnswerSubmitted}
                  className={`w-full text-left p-5 rounded-xl border-2 transition-all ${
                    selectedAnswer === index
                      ? 'border-indigo-500 bg-indigo-50 shadow-md'
                      : 'border-gray-200 hover:border-indigo-300 hover:bg-gray-50'
                  } ${isAnswerSubmitted ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'}`}
                >
                  <div className="flex items-start">
                    <span className="flex-shrink-0 w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold mr-4">
                      {getAnswerLabel(index)}
                    </span>
                    <span className="text-gray-800 flex-1 pt-1">{option}</span>
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* 解説表示（学習モード） */}
          {showExplanation && (
            <div className="mb-8">
              {/* 結果表示 */}
              <div className={`p-6 rounded-xl mb-6 ${
                isCorrect 
                  ? 'bg-green-50 border-2 border-green-300' 
                  : 'bg-red-50 border-2 border-red-300'
              }`}>
                <div className="flex items-center mb-3">
                  <span className="text-3xl mr-3">{isCorrect ? '✅' : '❌'}</span>
                  <h3 className="text-xl font-bold text-gray-900">
                    {isCorrect ? '正解です！' : '不正解です'}
                  </h3>
                </div>
                <div className="space-y-2 text-sm">
                  <p>
                    <span className="font-semibold text-gray-700">あなたの回答: </span>
                    <span className={isCorrect ? 'text-green-700 font-bold' : 'text-red-700 font-bold'}>
                      {getAnswerLabel(selectedAnswer!)}. {currentQuestion.options[selectedAnswer!]}
                    </span>
                  </p>
                  {!isCorrect && (
                    <p>
                      <span className="font-semibold text-gray-700">正解: </span>
                      <span className="text-green-700 font-bold">
                        {getAnswerLabel(currentQuestion.correctAnswer)}. {currentQuestion.options[currentQuestion.correctAnswer]}
                      </span>
                    </p>
                  )}
                </div>
              </div>

              {/* 解説 */}
              <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-6">
                <div className="flex items-center mb-3">
                  <BookOpen className="w-6 h-6 text-blue-600 mr-2" />
                  <h3 className="text-lg font-bold text-gray-900">解説</h3>
                </div>
                <p className="text-gray-800 leading-relaxed">
                  {currentQuestion.explanation}
                </p>
              </div>
            </div>
          )}

          {/* アクションボタン */}
          <div className="flex justify-end">
            {!showExplanation && !isAnswerSubmitted && (
              <button
                onClick={handleSubmitAnswer}
                disabled={selectedAnswer === null}
                className={`px-8 py-3 rounded-lg font-semibold transition-all ${
                  selectedAnswer !== null
                    ? 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-md hover:shadow-lg'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                回答する
              </button>
            )}
            {showExplanation && (
              <button
                onClick={moveToNextQuestion}
                className="px-8 py-3 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 shadow-md hover:shadow-lg transition-all"
              >
                {currentQuestionIndex < questions.length - 1 ? '次の問題へ →' : 'テスト終了'}
              </button>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
