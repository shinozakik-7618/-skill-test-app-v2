import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Question, TestResult } from '../types';
import { allQuestions, getQuestionsByCategory } from '../data/allQuestions';
import { saveTestResult } from '../utils/storage';

type FilterMode = 'all' | 'unanswered' | 'incorrect';

export default function TestPage() {
  const { category } = useParams<{ category: string }>();
  const navigate = useNavigate();
  const decodedCategory = decodeURIComponent(category || '');

  const [filterMode, setFilterMode] = useState<FilterMode>('all');
  const [isFilterSelected, setIsFilterSelected] = useState(false);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [answers, setAnswers] = useState<Map<string, number>>(new Map());
  const [startTime] = useState<Date>(new Date());
  const [questionStartTime, setQuestionStartTime] = useState<Date>(new Date());
  const [isSubmitting, setIsSubmitting] = useState(false);

  const startTest = (mode: FilterMode) => {
    setFilterMode(mode);
    setIsFilterSelected(true);
    
    // カテゴリーに応じた問題数を取得
    const questionsPerTest = decodedCategory === 'PC Depot' ? 5 : 10;
    
    // カテゴリーの全問題を取得
    const categoryQuestions = getQuestionsByCategory(decodedCategory);
    
    // 過去の回答履歴を取得（フィルター機能用）
    const answeredQuestionIds = new Set<string>();
    const incorrectQuestionIds = new Set<string>();
    
    let filteredQuestions: Question[] = [];
    
    switch (mode) {
      case 'unanswered':
        // 未回答の問題のみ
        filteredQuestions = categoryQuestions.filter(q => !answeredQuestionIds.has(q.id));
        break;
      case 'incorrect':
        // 不正解だった問題のみ
        filteredQuestions = categoryQuestions.filter(q => incorrectQuestionIds.has(q.id));
        break;
      case 'all':
      default:
        filteredQuestions = categoryQuestions;
        break;
    }
    
    // ランダムに選択
    const selectedQuestions = filteredQuestions
      .sort(() => Math.random() - 0.5)
      .slice(0, Math.min(questionsPerTest, filteredQuestions.length));
    
    setQuestions(selectedQuestions);
    setQuestionStartTime(new Date());
  };

  const currentQuestion = questions[currentQuestionIndex];

  const handleAnswerSelect = (answerIndex: number) => {
    setSelectedAnswer(answerIndex);
  };

  const handleNext = () => {
    if (selectedAnswer === null || !currentQuestion) return;

    // 回答を保存
    const newAnswers = new Map(answers);
    newAnswers.set(currentQuestion.id, selectedAnswer);
    setAnswers(newAnswers);

    // 結果を保存
    const timeSpent = Math.floor((new Date().getTime() - questionStartTime.getTime()) / 1000);
    const isCorrect = selectedAnswer === currentQuestion.correctAnswer;
    
    const result: TestResult = {
      id: `result_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId: 'default-user',
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

    // 次の質問へ
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setSelectedAnswer(null);
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

  // フィルター選択画面
  if (!isFilterSelected) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-2xl mx-auto px-4">
          <div className="bg-white rounded-xl shadow-lg p-8">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-2xl font-bold text-gray-900">{decodedCategory}</h1>
              <button
                onClick={() => navigate('/')}
                className="text-gray-600 hover:text-gray-900"
              >
                ✕ 閉じる
              </button>
            </div>

            <div className="mb-8">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                出題範囲を選択してください
              </h2>
              <p className="text-gray-600 text-sm mb-6">
                テストで出題される問題の範囲を選択できます。
              </p>
            </div>

            <div className="space-y-4">
              {/* すべて */}
              <button
                onClick={() => startTest('all')}
                className="w-full p-6 rounded-xl border-2 border-gray-200 hover:border-blue-500 hover:bg-blue-50 transition-all duration-200 text-left"
              >
                <div className="flex items-start">
                  <span className="text-3xl mr-4">📚</span>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">
                      すべての問題
                    </h3>
                    <p className="text-sm text-gray-600">
                      カテゴリー内のすべての問題からランダムに出題されます。
                    </p>
                  </div>
                </div>
              </button>

              {/* 未回答のみ */}
              <button
                onClick={() => startTest('unanswered')}
                className="w-full p-6 rounded-xl border-2 border-gray-200 hover:border-green-500 hover:bg-green-50 transition-all duration-200 text-left"
              >
                <div className="flex items-start">
                  <span className="text-3xl mr-4">✨</span>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">
                      未回答の問題のみ
                    </h3>
                    <p className="text-sm text-gray-600">
                      まだ一度も回答していない問題のみが出題されます。
                    </p>
                  </div>
                </div>
              </button>

              {/* 不正解のみ */}
              <button
                onClick={() => startTest('incorrect')}
                className="w-full p-6 rounded-xl border-2 border-gray-200 hover:border-orange-500 hover:bg-orange-50 transition-all duration-200 text-left"
              >
                <div className="flex items-start">
                  <span className="text-3xl mr-4">🎯</span>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">
                      不正解だった問題のみ
                    </h3>
                    <p className="text-sm text-gray-600">
                      過去に間違えた問題のみが出題されます。復習に最適です。
                    </p>
                  </div>
                </div>
              </button>
            </div>

            <div className="mt-6 pt-6 border-t border-gray-200">
              <p className="text-xs text-gray-500 text-center">
                💡 ヒント: 未回答の問題がない場合や不正解の問題がない場合は、該当する問題が出題されません。
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 問題読み込み中
  if (questions.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-xl shadow-lg text-center">
          <div className="text-6xl mb-4">📚</div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">問題を読み込んでいます...</h2>
          <p className="text-gray-600">カテゴリー: {decodedCategory}</p>
          <p className="text-sm text-gray-500 mt-2">
            フィルター: {filterMode === 'all' ? 'すべて' : filterMode === 'unanswered' ? '未回答のみ' : '不正解のみ'}
          </p>
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
          <p className="text-gray-600 mb-4">
            選択した条件に該当する問題がありません。
          </p>
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
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{decodedCategory}</h1>
              <p className="text-sm text-gray-500 mt-1">
                {filterMode === 'all' ? 'すべての問題' : filterMode === 'unanswered' ? '未回答の問題のみ' : '不正解だった問題のみ'}
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
                className={`w-full text-left p-4 rounded-lg border-2 transition-all duration-200 ${
                  selectedAnswer === index
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
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
          <button
            onClick={handleNext}
            disabled={selectedAnswer === null}
            className={`px-6 py-3 rounded-lg font-semibold transition-colors ${
              selectedAnswer === null
                ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                : 'bg-blue-500 text-white hover:bg-blue-600'
            }`}
          >
            {currentQuestionIndex === questions.length - 1 ? '提出する' : '次の問題 →'}
          </button>
        </div>
      </div>
    </div>
  );
}
