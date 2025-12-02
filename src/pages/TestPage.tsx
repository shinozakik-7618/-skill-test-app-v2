import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Question, TestResult } from '../types';
import { allQuestions, getQuestionsByCategory } from '../data/allQuestions';
import { getUserId } from '../utils/storage';

export default function TestPage() {
  const { category } = useParams<{ category: string }>();
  const navigate = useNavigate();
  const decodedCategory = decodeURIComponent(category || '');

  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [answers, setAnswers] = useState<Map<string, number>>(new Map());
  const [startTime] = useState<Date>(new Date());
  const [questionStartTime, setQuestionStartTime] = useState<Date>(new Date());
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);
  const [isAnswerSubmitted, setIsAnswerSubmitted] = useState(false);

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

  const handleAnswerSelect = (answerIndex: number) => {
    setSelectedAnswer(answerIndex);
  };

  const handleSubmitAnswer = () => {
    if (selectedAnswer === null || !currentQuestion) return;

    // 回答を保存
    const newAnswers = new Map(answers);
    newAnswers.set(currentQuestion.id, selectedAnswer);
    setAnswers(newAnswers);

    // 学習モードの場合は解説を表示
    setIsAnswerSubmitted(true);
    setShowExplanation(true);
  };

  const moveToNextQuestion = () => {
    // 次の質問へ
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setSelectedAnswer(null);
      setShowExplanation(false);
      setIsAnswerSubmitted(false);
      setQuestionStartTime(new Date());
    } else {
      // テスト終了
      setIsSubmitting(true);
      setTimeout(() => {
        navigate('/result', { 
          state: { 
            category: decodedCategory,
            totalQuestions: questions.length,
            totalTime: Math.floor((new Date().getTime() - startTime.getTime()) / 1000)
          } 
        });
      }, 500);
    }
  };

  const handleBack = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
      const previousAnswer = answers.get(questions[currentQuestionIndex - 1].id);
      setSelectedAnswer(previousAnswer !== undefined ? previousAnswer : null);
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

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* ヘッダー */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-2xl font-bold text-gray-900">{decodedCategory}</h1>
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
        {showExplanation && (
          <div className="bg-white rounded-xl shadow-lg p-8 mb-6">
            <div className={`mb-4 p-4 rounded-lg ${
              selectedAnswer === currentQuestion.correctAnswer
                ? 'bg-green-50 border-2 border-green-300'
                : 'bg-red-50 border-2 border-red-300'
            }`}>
              <div className="flex items-center mb-2">
                <span className="text-2xl mr-2">
                  {selectedAnswer === currentQuestion.correctAnswer ? '✅' : '❌'}
                </span>
                <h3 className="text-lg font-bold">
                  {selectedAnswer === currentQuestion.correctAnswer ? '正解です！' : '不正解です'}
                </h3>
              </div>
              <p className="text-sm text-gray-700">
                <span className="font-semibold">正解: </span>
                <span className="text-green-700 font-bold">
                  {String.fromCharCode(65 + currentQuestion.correctAnswer)}. {currentQuestion.options[currentQuestion.correctAnswer]}
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
