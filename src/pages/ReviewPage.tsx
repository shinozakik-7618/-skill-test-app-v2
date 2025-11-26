import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getIncorrectQuestionIds, getTestResults } from '../utils/storage';
import { sampleQuestions } from '../data/sampleQuestions';
import { Question } from '../types';

export default function ReviewPage() {
  const navigate = useNavigate();
  const [incorrectQuestions, setIncorrectQuestions] = useState<Question[]>([]);
  const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(null);
  const [showAnswer, setShowAnswer] = useState(false);

  useEffect(() => {
    const incorrectIds = getIncorrectQuestionIds();
    const questions = sampleQuestions.filter(q => incorrectIds.includes(q.id));
    setIncorrectQuestions(questions);
  }, []);

  const handleQuestionClick = (question: Question) => {
    setSelectedQuestion(question);
    setShowAnswer(false);
  };

  const handleShowAnswer = () => {
    setShowAnswer(true);
  };

  const handleNextQuestion = () => {
    if (!selectedQuestion) return;
    const currentIndex = incorrectQuestions.findIndex(q => q.id === selectedQuestion.id);
    if (currentIndex < incorrectQuestions.length - 1) {
      setSelectedQuestion(incorrectQuestions[currentIndex + 1]);
      setShowAnswer(false);
    }
  };

  const handlePreviousQuestion = () => {
    if (!selectedQuestion) return;
    const currentIndex = incorrectQuestions.findIndex(q => q.id === selectedQuestion.id);
    if (currentIndex > 0) {
      setSelectedQuestion(incorrectQuestions[currentIndex - 1]);
      setShowAnswer(false);
    }
  };

  // カテゴリー別に集計
  const questionsByCategory = incorrectQuestions.reduce((acc, q) => {
    if (!acc[q.category]) {
      acc[q.category] = [];
    }
    acc[q.category].push(q);
    return acc;
  }, {} as Record<string, Question[]>);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* ヘッダー */}
      <header className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">復習モード</h1>
              <p className="text-sm text-gray-600 mt-1">
                間違えた問題: {incorrectQuestions.length}問
              </p>
            </div>
            <button
              onClick={() => navigate('/')}
              className="text-gray-600 hover:text-gray-900"
            >
              ← 戻る
            </button>
          </div>
        </div>
      </header>

      {/* メインコンテンツ */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {incorrectQuestions.length === 0 ? (
          <div className="bg-white rounded-xl shadow-lg p-8 text-center">
            <div className="text-6xl mb-4">🎉</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              素晴らしい！
            </h2>
            <p className="text-gray-600 mb-6">
              現在、復習する問題はありません。
            </p>
            <button
              onClick={() => navigate('/')}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
            >
              新しい問題に挑戦する
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* 左側: 問題リスト */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">
                  📚 カテゴリー別
                </h3>
                <div className="space-y-4">
                  {Object.entries(questionsByCategory).map(([category, questions]) => (
                    <div key={category} className="border-l-4 border-red-400 pl-4">
                      <div className="font-semibold text-gray-900 mb-2">
                        {category}
                      </div>
                      <div className="text-sm text-gray-600 mb-2">
                        {questions.length}問
                      </div>
                      <div className="space-y-2">
                        {questions.map((q, index) => (
                          <button
                            key={q.id}
                            onClick={() => handleQuestionClick(q)}
                            className={`w-full text-left p-2 rounded text-sm transition-all ${
                              selectedQuestion?.id === q.id
                                ? 'bg-blue-100 border-2 border-blue-500'
                                : 'bg-gray-50 hover:bg-gray-100'
                            }`}
                          >
                            {index + 1}. {q.questionText.substring(0, 30)}...
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* 右側: 問題詳細 */}
            <div className="lg:col-span-2">
              {selectedQuestion ? (
                <div className="bg-white rounded-xl shadow-lg p-6">
                  <div className="mb-6">
                    <div className="inline-block bg-red-100 text-red-800 text-xs font-semibold px-3 py-1 rounded-full mb-4">
                      {selectedQuestion.category}
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-4">
                      問題
                    </h3>
                    <p className="text-gray-900 leading-relaxed whitespace-pre-wrap">
                      {selectedQuestion.questionText}
                    </p>
                  </div>

                  {/* 選択肢 */}
                  <div className="space-y-3 mb-6">
                    {(['A', 'B', 'C', 'D'] as const).map((option) => (
                      <div
                        key={option}
                        className={`p-4 rounded-lg border-2 ${
                          showAnswer && option === selectedQuestion.correctAnswer
                            ? 'border-green-500 bg-green-50'
                            : 'border-gray-300 bg-white'
                        }`}
                      >
                        <div className="flex items-start">
                          <span className={`inline-block w-8 h-8 rounded-full text-center leading-8 font-bold mr-3 flex-shrink-0 ${
                            showAnswer && option === selectedQuestion.correctAnswer
                              ? 'bg-green-500 text-white'
                              : 'bg-gray-200 text-gray-700'
                          }`}>
                            {option}
                          </span>
                          <span className="text-sm text-gray-900">
                            {selectedQuestion[`option${option}` as keyof Question] as string}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* 解答・解説 */}
                  {showAnswer ? (
                    <div className="bg-green-50 border-2 border-green-300 rounded-lg p-6 mb-6">
                      <h4 className="font-bold text-green-900 mb-2 flex items-center">
                        <span className="text-2xl mr-2">✓</span>
                        正解: {selectedQuestion.correctAnswer}
                      </h4>
                      <p className="text-gray-900 leading-relaxed">
                        {selectedQuestion.explanation}
                      </p>
                    </div>
                  ) : (
                    <button
                      onClick={handleShowAnswer}
                      className="w-full bg-blue-600 text-white py-4 rounded-lg font-semibold hover:bg-blue-700 mb-6"
                    >
                      解答を表示
                    </button>
                  )}

                  {/* ナビゲーション */}
                  <div className="flex justify-between">
                    <button
                      onClick={handlePreviousQuestion}
                      disabled={incorrectQuestions.findIndex(q => q.id === selectedQuestion.id) === 0}
                      className="px-6 py-3 rounded-lg border-2 border-gray-300 text-gray-700 font-semibold hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      ← 前の問題
                    </button>
                    <button
                      onClick={handleNextQuestion}
                      disabled={incorrectQuestions.findIndex(q => q.id === selectedQuestion.id) === incorrectQuestions.length - 1}
                      className="px-6 py-3 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      次の問題 →
                    </button>
                  </div>
                </div>
              ) : (
                <div className="bg-white rounded-xl shadow-lg p-8 text-center">
                  <div className="text-6xl mb-4">👈</div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    問題を選択してください
                  </h3>
                  <p className="text-gray-600">
                    左側のリストから復習したい問題を選んでください
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
