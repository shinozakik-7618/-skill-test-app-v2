import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { getTestResultById, TestResult, Question } from '../utils/storage';

interface ResultPageState {
  resultId?: string;
  category?: string;
  questions?: Question[];
  answers?: [string, number][];
  totalQuestions?: number;
  totalTime?: number;
  mode?: string;
  isReviewMode?: boolean;
}

const ResultPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state as ResultPageState;

  const [result, setResult] = useState<{
    id: string;
    date: string;
    results: TestResult[];
    score: number;
    total: number;
  } | null>(null);

  const [questions, setQuestions] = useState<Question[]>([]);
  const [mode, setMode] = useState<string>('');

  useEffect(() => {
    // TestPageから直接データが渡された場合
    if (state?.questions && state?.answers) {
      const answersMap = new Map(state.answers);
      const testResults: TestResult[] = state.questions.map(q => {
        const userAnswer = answersMap.get(q.id) ?? -1;
        return {
          id: `result_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          userId: 'default-user',
          category: state.category || '',
          questionId: q.id,
          questionSummary: q.question.substring(0, 50) + '...',
          userAnswer,
          correctAnswer: q.correctAnswer,
          isCorrect: userAnswer === q.correctAnswer,
          timeSpent: 0,
          score: userAnswer === q.correctAnswer ? 10 : 0,
          testDate: new Date().toISOString()
        };
      });
      
      const correctCount = testResults.filter(r => r.isCorrect).length;
      setResult({
        id: `test_${Date.now()}`,
        date: new Date().toISOString(),
        results: testResults,
        score: correctCount,
        total: state.questions.length
      });
      setQuestions(state.questions);
      setMode(state.mode || 'learning');
      console.log('✅ [DEBUG] TestPageからデータを受信:', testResults.length);
      return;
    }

    // 旧形式：resultIdから読み込み
    if (!state?.resultId) {
      alert('結果が見つかりませんでした');
      navigate('/');
      return;
    }

    const loadedResult = getTestResultById(state.resultId);
    if (loadedResult) {
      setResult(loadedResult);
      console.log('🔍 [DEBUG] 結果を読み込み:', loadedResult);
    }

    if (state.questions) {
      setQuestions(state.questions);
    }

    if (state.mode) {
      setMode(state.mode);
    }
  }, [state, navigate]);

  if (!result) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-xl shadow-lg p-8 text-center">
            <div className="text-4xl mb-4">📋</div>
            <div className="text-xl font-bold text-gray-900">結果を読み込んでいます...</div>
          </div>
        </div>
      </div>
    );
  }

  const correctCount = result.results.filter(r => r.isCorrect).length;
  const incorrectCount = result.results.length - correctCount;
  const scorePercentage = Math.round((correctCount / result.results.length) * 100);

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* ヘッダー */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-6">
          <div className="text-center mb-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">📊 テスト結果</h1>
            <p className="text-sm text-gray-600">{new Date(result.date).toLocaleString('ja-JP')}</p>
          </div>

          {/* スコア表示 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-blue-50 rounded-lg p-6 text-center">
              <div className="text-4xl font-bold text-blue-600">{scorePercentage}%</div>
              <div className="text-sm text-gray-600 mt-2">総合スコア</div>
            </div>
            <div className="bg-green-50 rounded-lg p-6 text-center">
              <div className="text-4xl font-bold text-green-600">{correctCount}</div>
              <div className="text-sm text-gray-600 mt-2">正解数</div>
            </div>
            <div className="bg-red-50 rounded-lg p-6 text-center">
              <div className="text-4xl font-bold text-red-600">{incorrectCount}</div>
              <div className="text-sm text-gray-600 mt-2">不正解数</div>
            </div>
          </div>

          {/* アクションボタン */}
          <div className="flex flex-wrap gap-3 justify-center">
            <button
              onClick={() => navigate('/')}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition"
            >
              ホームへ戻る
            </button>
            {incorrectCount > 0 && (
              <button
                onClick={() => navigate('/review-notes')}
                className="px-6 py-3 bg-gray-600 text-white rounded-lg font-semibold hover:bg-gray-700 transition"
              >
                📚 間違えた問題を復習
              </button>
            )}
          </div>
        </div>

        {/* 解説セクション */}
        {questions.length > 0 && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">📖 全問題の解説</h2>
            {questions.map((question, index) => {
              const resultForQuestion = result.results.find(r => r.questionId === question.id);
              const isCorrect = resultForQuestion?.isCorrect || false;
              const userAnswer = resultForQuestion?.userAnswer ?? -1;

              return (
                <div key={question.id} className="bg-white rounded-xl shadow-lg p-6">
                  {/* 問題ヘッダー */}
                  <div className="flex items-start mb-4">
                    <div className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center text-xl mr-4 ${
                      isCorrect ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                    }`}>
                      {isCorrect ? '✓' : '✗'}
                    </div>
                    <div className="flex-grow">
                      <div className="text-sm text-gray-600 mb-1">問題 {index + 1}</div>
                      <h3 className="text-lg font-semibold text-gray-900">{question.question}</h3>
                    </div>
                  </div>

                  {/* 選択肢 */}
                  <div className="space-y-2 mb-4">
                    {question.options.map((option, optIndex) => {
                      const isUserAnswer = userAnswer === optIndex;
                      const isCorrectAnswer = question.correctAnswer === optIndex;
                      
                      return (
                        <div
                          key={optIndex}
                          className={`p-4 rounded-lg border-2 ${
                            isCorrectAnswer
                              ? 'border-green-500 bg-green-50'
                              : isUserAnswer
                              ? 'border-red-500 bg-red-50'
                              : 'border-gray-200 bg-gray-50'
                          }`}
                        >
                          <div className="flex items-center">
                            <span className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center mr-3 font-bold ${
                              isCorrectAnswer
                                ? 'bg-green-500 text-white'
                                : isUserAnswer
                                ? 'bg-red-500 text-white'
                                : 'bg-gray-300 text-gray-700'
                            }`}>
                              {String.fromCharCode(65 + optIndex)}
                            </span>
                            <span className="text-gray-900">{option}</span>
                            {isCorrectAnswer && <span className="ml-auto text-green-600 font-bold">✓ 正解</span>}
                            {isUserAnswer && !isCorrectAnswer && <span className="ml-auto text-red-600 font-bold">✗ あなたの回答</span>}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* 解説 */}
                  <div className="bg-blue-50 rounded-lg p-4">
                    <h4 className="text-md font-bold text-gray-900 mb-2">💡 解説</h4>
                    <p className="text-gray-700 leading-relaxed">{question.explanation}</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default ResultPage;
