import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Question } from '../types';

export default function QuestionDetailPage() {
  const location = useLocation();
  const navigate = useNavigate();
  
  const state = location.state as { question: Question; userAnswer: number; isReviewMode?: boolean } | null;
  const question = state?.question;
  const previousUserAnswer = state?.userAnswer ?? -1;
  const isReviewMode = state?.isReviewMode || false;

  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showExplanation, setShowExplanation] = useState(!isReviewMode);

  // データがない場合
  if (!question) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <div className="bg-white rounded-xl shadow-lg p-8 text-center">
            <p className="text-gray-600 mb-4">問題が見つかりませんでした</p>
            <button
              onClick={() => navigate(-1)}
              className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
            >
              ← 戻る
            </button>
          </div>
        </div>
      </div>
    );
  }

  const handleSubmitAnswer = () => {
    setShowExplanation(true);
  };

  const isCorrect = selectedAnswer === question.correctAnswer;
  const wasPreviouslyCorrect = previousUserAnswer === question.correctAnswer;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* ヘッダー */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-2xl font-bold text-gray-900">
              {isReviewMode ? '📚 復習モード' : '問題の詳細'}
            </h1>
            <button
              onClick={() => navigate(-1)}
              className="text-gray-600 hover:text-gray-900 font-medium"
            >
              ← 戻る
            </button>
          </div>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
              {question.category}
            </span>
            {isReviewMode && !showExplanation && (
              <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-medium">
                💪 もう一度挑戦！
              </span>
            )}
            {!isReviewMode && (
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                wasPreviouslyCorrect ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
              }`}>
                {wasPreviouslyCorrect ? '✅ 正解' : '❌ 不正解'}
              </span>
            )}
          </div>
        </div>

        {/* 問題文 */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">📝 問題</h2>
          <p className="text-gray-800 leading-relaxed whitespace-pre-wrap">{question.question}</p>
        </div>

        {/* 選択肢 */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">選択肢</h2>
          <div className="space-y-3">
            {question.options.map((option, index) => {
              const isSelected = selectedAnswer === index;
              const isCorrectAnswer = question.correctAnswer === index;
              const isPreviousAnswer = previousUserAnswer === index;
              
              let bgColor = 'bg-gray-50';
              let borderColor = 'border-gray-200';
              let textColor = 'text-gray-800';
              let icon = '';
              let showPreviousLabel = false;

              if (showExplanation) {
                // 解説表示後
                if (isCorrectAnswer) {
                  bgColor = 'bg-green-50';
                  borderColor = 'border-green-500';
                  textColor = 'text-green-900';
                  icon = '✅ ';
                } else if (isSelected && !isCorrect) {
                  bgColor = 'bg-red-50';
                  borderColor = 'border-red-500';
                  textColor = 'text-red-900';
                  icon = '❌ ';
                } else if (isPreviousAnswer && !wasPreviouslyCorrect && isReviewMode) {
                  bgColor = 'bg-orange-50';
                  borderColor = 'border-orange-300';
                  showPreviousLabel = true;
                }
              } else {
                // 解説表示前
                if (isSelected) {
                  bgColor = 'bg-blue-50';
                  borderColor = 'border-blue-500';
                  textColor = 'text-blue-900';
                }
              }

              return (
                <div
                  key={index}
                  className={`p-4 rounded-lg border-2 ${bgColor} ${borderColor} ${
                    !showExplanation ? 'cursor-pointer hover:bg-blue-50 hover:border-blue-300' : ''
                  } transition-all`}
                  onClick={() => !showExplanation && setSelectedAnswer(index)}
                >
                  <div className={`font-medium ${textColor} flex items-center`}>
                    <span className="font-bold mr-2">{String.fromCharCode(65 + index)}.</span>
                    <span className="flex-grow">{option}</span>
                    {icon && <span className="ml-2">{icon}</span>}
                  </div>
                  {showExplanation && isSelected && !isCorrectAnswer && (
                    <div className="text-sm text-red-600 mt-1">← 今回のあなたの回答</div>
                  )}
                  {showExplanation && isCorrectAnswer && (
                    <div className="text-sm text-green-600 mt-1">← 正解</div>
                  )}
                  {showExplanation && showPreviousLabel && (
                    <div className="text-sm text-orange-600 mt-1">← 前回の誤答</div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* 回答ボタン */}
        {!showExplanation && (
          <div className="flex justify-center mb-6">
            <button
              onClick={handleSubmitAnswer}
              disabled={selectedAnswer === null}
              className={`px-8 py-3 rounded-lg font-bold text-lg shadow-lg transition-all ${
                selectedAnswer === null
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-blue-500 text-white hover:bg-blue-600 hover:shadow-xl'
              }`}
            >
              {selectedAnswer === null ? '選択肢を選んでください' : '📝 回答する'}
            </button>
          </div>
        )}

        {/* 結果表示 */}
        {showExplanation && selectedAnswer !== null && isReviewMode && (
          <div className={`rounded-xl shadow-lg p-6 mb-6 ${
            isCorrect ? 'bg-green-50 border-2 border-green-500' : 'bg-red-50 border-2 border-red-500'
          }`}>
            <div className="text-center">
              <div className="text-4xl mb-2">{isCorrect ? '🎉' : '😢'}</div>
              <div className={`text-2xl font-bold mb-2 ${isCorrect ? 'text-green-700' : 'text-red-700'}`}>
                {isCorrect ? '正解です！' : '不正解です'}
              </div>
              {isCorrect && (
                <p className="text-green-700">素晴らしい！前回の間違いを克服しました！</p>
              )}
              {!isCorrect && (
                <p className="text-red-700">もう一度解説を読んで理解を深めましょう。</p>
              )}
            </div>
          </div>
        )}

        {/* 解説 */}
        {showExplanation && (
          <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">💡 解説</h2>
            <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{question.explanation}</p>
          </div>
        )}

        {/* 戻るボタン */}
        {showExplanation && (
          <div className="flex justify-center">
            <button
              onClick={() => navigate(-1)}
              className="px-8 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 font-medium shadow-lg"
            >
              ← 復習リストに戻る
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
