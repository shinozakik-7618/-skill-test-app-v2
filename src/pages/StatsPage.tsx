import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, TrendingUp, Award, Target, Clock } from 'lucide-react';
import { 
  getUserStats, 
  getTestResults, 
  getLearningHistories,
  SavedTestResult,
  LearningHistory 
} from '../utils/storage';

interface CategoryStats {
  category: string;
  totalTests: number;
  correctCount: number;
  totalQuestions: number;
  correctRate: number;
}

export default function StatsPage() {
  console.log('📊 StatsPage: コンポーネントが読み込まれました！');
  
  const navigate = useNavigate();
  const [userStats, setUserStats] = useState<any>(null);
  const [recentTests, setRecentTests] = useState<SavedTestResult[]>([]);
  const [categoryStats, setCategoryStats] = useState<CategoryStats[]>([]);
  const [learningHistories, setLearningHistories] = useState<LearningHistory[]>([]);

  useEffect(() => {
    console.log('📊 StatsPage: useEffect 実行');
    loadStats();
  }, []);

  const loadStats = () => {
    console.log('📊 StatsPage: データ読み込み開始');
    
    // ユーザー統計を取得
    const stats = getUserStats();
    console.log('📊 ユーザー統計:', stats);
    setUserStats(stats);

    // テスト結果を取得（最新10件）
    const allResults = getTestResults();
    console.log('📊 全テスト結果数:', allResults.length);
    const recent = allResults
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 10);
    setRecentTests(recent);

    // カテゴリー別統計を計算
    const categoryMap = new Map<string, CategoryStats>();
    
    allResults.forEach(test => {
      test.results.forEach(result => {
        const category = result.category;
        if (!categoryMap.has(category)) {
          categoryMap.set(category, {
            category,
            totalTests: 0,
            correctCount: 0,
            totalQuestions: 0,
            correctRate: 0
          });
        }
        
        const catStats = categoryMap.get(category)!;
        catStats.totalTests++;
        catStats.totalQuestions++;
        if (result.isCorrect) {
          catStats.correctCount++;
        }
      });
    });

    // 正答率を計算
    const categories = Array.from(categoryMap.values()).map(cat => ({
      ...cat,
      correctRate: cat.totalQuestions > 0 
        ? Math.round((cat.correctCount / cat.totalQuestions) * 100) 
        : 0
    }));

    // 正答率でソート
    categories.sort((a, b) => b.correctRate - a.correctRate);
    console.log('📊 カテゴリー別統計:', categories);
    setCategoryStats(categories);

    // 学習履歴を取得
    const histories = getLearningHistories();
    console.log('📊 学習履歴数:', histories.length);
    setLearningHistories(histories);
  };

  if (!userStats) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">📊</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">データを読み込み中...</h2>
        </div>
      </div>
    );
  }

  const totalTests = recentTests.length;
  const totalQuestions = userStats.totalQuestions || 0;
  const correctCount = userStats.correctCount || 0;
  const overallCorrectRate = totalQuestions > 0 
    ? Math.round((correctCount / totalQuestions) * 100) 
    : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100">
      {/* ヘッダー */}
      <header className="bg-white shadow-md sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigate('/')}
              className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="w-5 h-5 mr-1" />
              <span className="font-semibold">ホームに戻る</span>
            </button>
            <h1 className="text-2xl font-bold text-gray-900">📈 成績管理</h1>
            <div className="w-24"></div> {/* スペーサー */}
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* サマリーカード */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {/* 総テスト数 */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between mb-2">
              <div className="text-3xl">📝</div>
              <Target className="w-8 h-8 text-blue-500" />
            </div>
            <div className="text-2xl font-bold text-gray-900">{totalTests}</div>
            <div className="text-sm text-gray-600">総テスト数</div>
          </div>

          {/* 総問題数 */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between mb-2">
              <div className="text-3xl">📚</div>
              <Award className="w-8 h-8 text-green-500" />
            </div>
            <div className="text-2xl font-bold text-gray-900">{totalQuestions}</div>
            <div className="text-sm text-gray-600">総問題数</div>
          </div>

          {/* 正解数 */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between mb-2">
              <div className="text-3xl">✅</div>
              <TrendingUp className="w-8 h-8 text-purple-500" />
            </div>
            <div className="text-2xl font-bold text-gray-900">{correctCount}</div>
            <div className="text-sm text-gray-600">正解数</div>
          </div>

          {/* 総合正答率 */}
          <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl shadow-md p-6 text-white">
            <div className="flex items-center justify-between mb-2">
              <div className="text-3xl">🎯</div>
              <Clock className="w-8 h-8" />
            </div>
            <div className="text-2xl font-bold">{overallCorrectRate}%</div>
            <div className="text-sm opacity-90">総合正答率</div>
          </div>
        </div>

        {/* カテゴリー別成績 */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
            <span className="text-2xl mr-2">📊</span>
            カテゴリー別成績
          </h2>
          
          {categoryStats.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <div className="text-4xl mb-2">📭</div>
              <p>まだテストデータがありません</p>
              <p className="text-sm mt-2">テストを受けると、ここに統計が表示されます</p>
            </div>
          ) : (
            <div className="space-y-4">
              {categoryStats.map((cat, index) => (
                <div key={cat.category} className="border-b border-gray-200 pb-4 last:border-b-0">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center">
                      <span className="text-lg font-semibold text-gray-900 mr-2">
                        {index + 1}. {cat.category}
                      </span>
                      <span className="text-sm text-gray-600">
                        ({cat.totalQuestions}問)
                      </span>
                    </div>
                    <div className="flex items-center">
                      <span className={`text-lg font-bold mr-2 ${
                        cat.correctRate >= 80 ? 'text-green-600' :
                        cat.correctRate >= 60 ? 'text-yellow-600' :
                        'text-red-600'
                      }`}>
                        {cat.correctRate}%
                      </span>
                      <span className="text-sm text-gray-600">
                        ({cat.correctCount}/{cat.totalQuestions}問正解)
                      </span>
                    </div>
                  </div>
                  
                  {/* プログレスバー */}
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all ${
                        cat.correctRate >= 80 ? 'bg-green-500' :
                        cat.correctRate >= 60 ? 'bg-yellow-500' :
                        'bg-red-500'
                      }`}
                      style={{ width: `${cat.correctRate}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 最近のテスト結果 */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
            <span className="text-2xl mr-2">🕐</span>
            最近のテスト結果
          </h2>
          
          {recentTests.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <div className="text-4xl mb-2">📭</div>
              <p>まだテスト結果がありません</p>
            </div>
          ) : (
            <div className="space-y-3">
              {recentTests.map((test) => (
                <div
                  key={test.id}
                  className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-semibold text-gray-900">
                        {new Date(test.date).toLocaleDateString('ja-JP', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </div>
                      <div className="text-sm text-gray-600 mt-1">
                        {test.results[0]?.category || '不明なカテゴリー'}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`text-2xl font-bold ${
                        (test.score / test.total * 100) >= 80 ? 'text-green-600' :
                        (test.score / test.total * 100) >= 60 ? 'text-yellow-600' :
                        'text-red-600'
                      }`}>
                        {Math.round((test.score / test.total) * 100)}%
                      </div>
                      <div className="text-sm text-gray-600">
                        {test.score}/{test.total}問正解
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
