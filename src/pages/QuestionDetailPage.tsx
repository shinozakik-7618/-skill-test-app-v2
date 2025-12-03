import { useLocation, useNavigate } from 'react-router-dom';
import { Question } from '../types';

export default function QuestionDetailPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { question, userAnswer } = location.state as { question: Question; userAnswer: number };

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
              戻る
            </button>
          </div>
        </div>
      </div>
    );
  }

  const isCorrect = userAnswer === question.correctAnswer;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* ヘッダー */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-2xl font-bold text-gray-900">問題の詳細</h1>
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
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
              isCorrect ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
            }`}>
              {isCorrect ? '✅ 正解' : '❌ 不正解'}
            </span>
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
              const isUserAnswer = userAnswer === index;
              const isCorrectAnswer = question.correctAnswer === index;
              
              let bgColor = 'bg-gray-50';
              let borderColor = 'border-gray-200';
              let textColor = 'text-gray-800';
              let icon = '';

              if (isCorrectAnswer) {
                bgColor = 'bg-green-50';
                borderColor = 'border-green-500';
                textColor = 'text-green-900';
                icon = '✅ ';
              } else if (isUserAnswer && !isCorrect) {
                bgColor = 'bg-red-50';
                borderColor = 'border-red-500';
                textColor = 'text-red-900';
                icon = '❌ ';
              }

              return (
                <div
                  key={index}
                  className={`p-4 rounded-lg border-2 ${bgColor} ${borderColor}`}
                >
                  <div className={`font-medium ${textColor}`}>
                    {icon}{String.fromCharCode(65 + index)}. {option}
                  </div>
                  {isUserAnswer && !isCorrectAnswer && (
                    <div className="text-sm text-red-600 mt-1">← あなたの回答</div>
                  )}
                  {isCorrectAnswer && (
                    <div className="text-sm text-green-600 mt-1">← 正解</div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* 解説 */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">💡 解説</h2>
          <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{question.explanation}</p>
        </div>

        {/* 戻るボタン */}
        <div className="flex justify-center">
          <button
            onClick={() => navigate(-1)}
            className="px-8 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 font-medium shadow-lg"
          >
            ← 結果画面に戻る
          </button>
        </div>
      </div>
    </div>
  );
}
