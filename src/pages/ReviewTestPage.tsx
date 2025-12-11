import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { ArrowLeft, Clock, BookOpen } from 'lucide-react';
import { getQuestionsByCategory } from '../data/allQuestions';
import { getReviewNotes, getReviewNotesByCategory } from '../utils/storage';
import { Question, TestResult } from '../types';
import { getUserId, addToReviewNote, removeFromReviewNote, recordLearningHistory } from '../utils/storage';

export default function ReviewTestPage() {
  const { category } = useParams<{ category: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const decodedCategory = category === 'all' ? 'all' : decodeURIComponent(category || '');
  
  // URLパラメータからモードを取得（復習テストは常に学習モード）
  const searchParams = new URLSearchParams(location.search);
  const testMode = (searchParams.get('mode') as 'learning' | 'exam') || 'learning';

  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [questionStartTime, setQuestionStartTime] = useState<Date>(new Date());
  const [testStartTime] = useState<Date>(new Date());
  const [showExplanation, setShowExplanation] = useState(false);
  const [isAnswerSubmitted, setIsAnswerSubmitted] = useState(false);
  
  // 🆕 テスト結果を保持する配列（最後にまとめて保存）
  const [testResults, setTestResults] = useState<TestResult[]>([]);

  useEffect(() => {
    loadReviewQuestions();
  }, [decodedCategory]);

  const loadReviewQuestions = () => {
    // 復習ノートから問題IDを取得
    const reviewNotes = decodedCategory === 'all' 
      ? getReviewNotes() 
      : getReviewNotesByCategory(decodedCategory);

    if (reviewNotes.length === 0) {
      alert('復習する問題がありません');
      navigate('/review-note');
      return;
    }

    // 問題IDから実際の問題データを取得
    const questionIds = reviewNotes.map(note => note.questionId);
    
    const allQuestions = decodedCategory === 'all'
      ? getAllQuestionsFromAllCategories()
      : getQuestionsByCategory(decodedCategory);
    
    if (!Array.isArray(allQuestions)) {
      console.error('❌ allQuestionsが配列ではありません!');
      alert('問題データの読み込みに失敗しました');
      navigate('/review-note');
      return;
    }
    
    let reviewQuestions: Question[] = [];
    try {
      reviewQuestions = allQuestions.filter(q => questionIds.includes(q.id));
    } catch (error) {
      console.error('❌ filterエラー:', error);
      alert('問題のフィルタリングに失敗しました');
      navigate('/review-note');
      return;
    }
    
    if (reviewQuestions.length === 0) {
      alert('復習問題の読み込みに失敗しました');
      navigate('/review-note');
      return;
    }

    setQuestions(reviewQuestions);
  };

  const getAllQuestionsFromAllCategories = (): Question[] => {
    const categories = [
      '財務会計・経理',
      '法務・コンプライアンス',
      'ガバナンス・内部統制',
      '人事・労務管理',
      '経営戦略・企画',
      '業務プロセス・効率化',
      '組織マネジメント',
      '情報セキュリティ・IT管理',
      'リスクマネジメント',
      '社会的責任・倫理',
      'マーケティング・販売戦略',
      'AI・DX基礎知識',
    ];
    
    let allQuestions: Question[] = [];
    categories.forEach(cat => {
      const categoryQuestions = getQuestionsByCategory(cat);
      if (Array.isArray(categoryQuestions)) {
        allQuestions = allQuestions.concat(categoryQuestions);
      }
    });
    
    return allQuestions;
  };

  const currentQuestion = questions[currentQuestionIndex];
  const progress = questions.length > 0 ? ((currentQuestionIndex + 1) / questions.length) * 100 : 0;
  const isCorrect = selectedAnswer !== null && selectedAnswer === currentQuestion?.correctAnswer;

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

    try {
      const endTime = new Date();
      const timeSpent = Math.floor((endTime.getTime() - questionStartTime.getTime()) / 1000);
      const isCorrect = selectedAnswer === currentQuestion.correctAnswer;
    
      // 🆕 結果を配列に追加（まだ保存しない）
      const result: TestResult = {
        id: `result_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        userId: getUserId(),
        category: currentQuestion.category,
        questionId: currentQuestion.id,
        questionSummary: currentQuestion.question.substring(0, 50) + '...',
        userAnswer: selectedAnswer,
        correctAnswer: currentQuestion.correctAnswer,
        isCorrect,
        timeSpent,
        score: isCorrect ? 10 : 0,
        testDate: new Date().toISOString()
      };
      
      setTestResults(prev => [...prev, result]);
      console.log('✅ 結果を一時保存:', result);
    
      // 復習ノートの更新
      if (!isCorrect) {
        addToReviewNote(currentQuestion.id, currentQuestion.category, currentQuestion.question);
        console.log('✅ 復習ノートに追加:', currentQuestion.id);
      } else {
        removeFromReviewNote(currentQuestion.id);
        console.log('✅ 復習ノートから削除:', currentQuestion.id);
      }
    
      setIsAnswerSubmitted(true);
      setShowExplanation(true);
    } catch (error) {
      console.error('❌ handleSubmitAnswer でエラーが発生しました:', error);
      alert('エラーが発生しました。コンソールを確認してください。');
      setIsAnswerSubmitted(true);
      setShowExplanation(true);
    }
  };

  const moveToNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      // 次の問題へ
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setSelectedAnswer(null);
      setQuestionStartTime(new Date());
      setShowExplanation(false);
      setIsAnswerSubmitted(false);
    } else {
      // 🆕 テスト終了 - ここで学習履歴を保存
      const categoryForHistory = decodedCategory === 'all' ? '復習テスト（全カテゴリー）' : decodedCategory;
      const correctCount = testResults.filter(r => r.isCorrect).length;
      const correctRate = Math.round((correctCount / questions.length) * 100);
      
      try {
        recordLearningHistory(
          categoryForHistory,
          questions.length,
          correctRate
        );
        console.log('✅ 学習履歴を保存:', { category: categoryForHistory, questions: questions.length, correctRate });
      } catch (error) {
        console.error('❌ 学習履歴の保存に失敗:', error);
      }
      
      const totalTime = Math.floor((new Date().getTime() - testStartTime.getTime()) / 1000);
      navigate('/result', {
        state: {
          category: categoryForHistory,
          totalQuestions: questions.length,
          totalTime,
          mode: 'learning'
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

  // 選択肢が配列でない場合のエラーチェック
  if (!Array.isArray(currentQuestion.options)) {
    console.error('❌ currentQuestion.options is not an array:', currentQuestion);
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">問題データにエラーがあります</h2>
          <button
            onClick={() => navigate('/review-note')}
            className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            復習ノートに戻る
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-100">
      {/* ヘッダー */}
      <header className="bg-white shadow-md sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-3">
            <button
              onClick={() => navigate('/review-note')}
              className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="w-5 h-5 mr-1" />
              <span className="font-semibold">復習ノートに戻る</span>
            </button>
            <div className="flex items-center space-x-4">
              <div className="px-3 py-1 rounded-full text-sm font-semibold bg-orange-100 text-orange-700">
                📖 復習モード
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
              className="bg-gradient-to-r from-orange-500 to-red-500 h-2.5 rounded-full transition-all duration-300"
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
            <span className="inline-block bg-orange-100 text-orange-800 px-4 py-2 rounded-lg text-sm font-semibold">
              {currentQuestion.category}
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
                      ? 'border-orange-500 bg-orange-50 shadow-md'
                      : 'border-gray-200 hover:border-orange-300 hover:bg-gray-50'
                  } ${isAnswerSubmitted ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'}`}
                >
                  <div className="flex items-start">
                    <span className="flex-shrink-0 w-8 h-8 rounded-full bg-orange-100 text-orange-700 flex items-center justify-center font-bold mr-4">
                      {getAnswerLabel(index)}
                    </span>
                    <span className="text-gray-800 flex-1 pt-1">{option}</span>
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* 解説表示 */}
          {showExplanation && currentQuestion && Array.isArray(currentQuestion.options) && selectedAnswer !== null && (
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
                    {isCorrect ? '正解です！復習ノートから削除されました' : '不正解です。もう一度復習しましょう'}
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
                    ? 'bg-orange-600 text-white hover:bg-orange-700 shadow-md hover:shadow-lg'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                回答する
              </button>
            )}
            {showExplanation && (
              <button
                onClick={moveToNextQuestion}
                className="px-8 py-3 bg-orange-600 text-white rounded-lg font-semibold hover:bg-orange-700 shadow-md hover:shadow-lg transition-all"
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
