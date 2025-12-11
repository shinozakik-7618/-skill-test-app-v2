import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { clearAllData, deleteDataByDate, exportToCSV, getLearningHistories, getConsecutiveDays } from '../utils/storage';
import QuestionCreator from '../components/QuestionCreator';
import Toast from '../components/Toast';

type TabType = 'stats' | 'data' | 'creator';

interface CategoryStats {
  category: string;
  totalQuestions: number;
  correctAnswers: number;
  correctRate: number;
  testCount: number;
}

interface RecentTest {
  id: string;
  date: string;
  category: string;
  total: number;
  score: number;
  correctRate: number;
}

interface CleanupResult {
  duplicatesFound: number;
  duplicatesRemoved: number;
  testsAfter: number;
}

interface ToastState {
  show: boolean;
  message: string;
  type: 'success' | 'error' | 'info';
}

export default function AdminPage() {
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [activeTab, setActiveTab] = useState<TabType>('stats');
  const [statsData, setStatsData] = useState({ tests: 0, questions: 0, correct: 0, rate: 0 });
  const [categoryStats, setCategoryStats] = useState<CategoryStats[]>([]);
  const [recentTests, setRecentTests] = useState<RecentTest[]>([]);
  const [consecutiveDays, setConsecutiveDays] = useState<number>(0);
  const [cleanupResult, setCleanupResult] = useState<CleanupResult | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false); // 🆕
  const [toast, setToast] = useState<ToastState>({ show: false, message: '', type: 'info' }); // 🆕

  useEffect(() => {
    if (activeTab === 'stats') {
      loadStatsData();
      loadConsecutiveDays();
    }
  }, [activeTab]);

  // 🆕 トースト表示関数
  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToast({ show: true, message, type });
  };

  const loadConsecutiveDays = () => {
    try {
      const days = getConsecutiveDays();
      setConsecutiveDays(days);
    } catch (error) {
      console.error('連続日数の取得エラー:', error);
      setConsecutiveDays(0);
    }
  };

  const loadStatsData = () => {
    setIsLoading(true); // 🆕
    try {
      const rawData = localStorage.getItem('testResults');
      
      if (!rawData) {
        const altData = localStorage.getItem('test_results');
        
        if (altData) {
          processTestResults(JSON.parse(altData));
          return;
        }
      } else {
        processTestResults(JSON.parse(rawData));
        return;
      }
      
      setStatsData({ tests: 0, questions: 0, correct: 0, rate: 0 });
      setCategoryStats([]);
      setRecentTests([]);
      
    } catch (error) {
      console.error('📊 エラー:', error);
      showToast('データの読み込みに失敗しました', 'error'); // 🆕
      setStatsData({ tests: 0, questions: 0, correct: 0, rate: 0 });
      setCategoryStats([]);
      setRecentTests([]);
    } finally {
      setIsLoading(false); // 🆕
    }
  };

  const processTestResults = (results: any[]) => {
    let tests = results.length;
    let questions = 0;
    let correct = 0;
    
    const categoryMap = new Map<string, { total: number; correct: number; testCount: number }>();
    const recent: RecentTest[] = [];
    
    results.forEach((r: any) => {
      const total = r.total || 0;
      const score = r.score || 0;
      questions += total;
      correct += score;
      
      let category = '不明';
      if (r.results && r.results.length > 0) {
        category = r.results[0].category || '不明';
      }
      
      recent.push({
        id: r.id,
        date: r.date,
        category: category,
        total: total,
        score: score,
        correctRate: total > 0 ? Math.round((score / total) * 100) : 0
      });
      
      if (r.results && Array.isArray(r.results)) {
        r.results.forEach((result: any) => {
          const cat = result.category || '不明';
          if (!categoryMap.has(cat)) {
            categoryMap.set(cat, { total: 0, correct: 0, testCount: 0 });
          }
          const stats = categoryMap.get(cat)!;
          stats.total++;
          if (result.isCorrect) {
            stats.correct++;
          }
        });
        
        if (!categoryMap.has(category)) {
          categoryMap.set(category, { total: 0, correct: 0, testCount: 0 });
        }
        categoryMap.get(category)!.testCount++;
      }
    });
    
    const rate = questions > 0 ? Math.round((correct / questions) * 100) : 0;
    
    setStatsData({ tests, questions, correct, rate });
    
    recent.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    setRecentTests(recent.slice(0, 5));
    
    const catStats: CategoryStats[] = Array.from(categoryMap.entries()).map(([category, data]) => ({
      category,
      totalQuestions: data.total,
      correctAnswers: data.correct,
      correctRate: data.total > 0 ? Math.round((data.correct / data.total) * 100) : 0,
      testCount: data.testCount
    }));
    
    catStats.sort((a, b) => b.correctRate - a.correctRate);
    setCategoryStats(catStats);
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const hours = date.getHours();
    const minutes = date.getMinutes();
    return `${month}/${day} ${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  };

  const handleDataCleanup = () => {
    // 🆕 改善された確認ダイアログ
    if (!confirm('🧹 データクリーンアップを実行しますか?\n\n✓ 重複したテスト結果を自動検出して削除します\n✓ この操作は取り消せません\n\n続行しますか?')) {
      return;
    }

    setIsLoading(true); // 🆕
    try {
      const rawData = localStorage.getItem('testResults');
      if (!rawData) {
        showToast('テストデータが見つかりません', 'error'); // 🆕
        return;
      }

      const results = JSON.parse(rawData);
      const originalCount = results.length;
      
      const uniqueTests = new Map<string, any>();
      const duplicates: string[] = [];
      
      results.forEach((test: any) => {
        const date = new Date(test.date);
        const dateKey = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}-${date.getHours()}-${date.getMinutes()}`;
        
        let category = '不明';
        if (test.results && test.results.length > 0) {
          category = test.results[0].category || '不明';
        }
        
        const key = `${dateKey}_${category}_${test.total}`;
        
        if (uniqueTests.has(key)) {
          duplicates.push(test.id);
        } else {
          uniqueTests.set(key, test);
        }
      });

      if (duplicates.length === 0) {
        showToast('重複データは見つかりませんでした。データは正常です!', 'info'); // 🆕
        setCleanupResult({ duplicatesFound: 0, duplicatesRemoved: 0, testsAfter: originalCount });
        return;
      }

      const cleanedResults = results.filter((test: any) => !duplicates.includes(test.id));
      
      localStorage.setItem('testResults', JSON.stringify(cleanedResults));
      localStorage.setItem('backup_testResults', JSON.stringify(cleanedResults));
      
      const result: CleanupResult = {
        duplicatesFound: duplicates.length,
        duplicatesRemoved: duplicates.length,
        testsAfter: cleanedResults.length
      };
      
      setCleanupResult(result);
      showToast(`クリーンアップ完了! ${duplicates.length}件の重複を削除しました`, 'success'); // 🆕
      
      loadStatsData();
      
    } catch (error) {
      console.error('クリーンアップエラー:', error);
      showToast('データクリーンアップに失敗しました', 'error'); // 🆕
    } finally {
      setIsLoading(false); // 🆕
    }
  };

  const getProgressColor = (rate: number) => {
    if (rate >= 80) return 'bg-green-500';
    if (rate >= 60) return 'bg-blue-500';
    if (rate >= 40) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const handleExportCSV = () => {
    try {
      exportToCSV();
      showToast('CSVファイルをダウンロードしました', 'success'); // 🆕
    } catch (error) {
      showToast('エクスポートに失敗しました', 'error'); // 🆕
    }
  };

  const handleDeleteByDate = () => {
    if (!selectedDate) {
      showToast('日付を選択してください', 'error'); // 🆕
      return;
    }
    // 🆕 改善された確認ダイアログ
    if (confirm(`⚠️ ${selectedDate}のデータを削除しますか?\n\nこの操作は取り消せません。`)) {
      deleteDataByDate(selectedDate);
      showToast('削除しました', 'success'); // 🆕
      loadStatsData();
    }
  };

  const handleClearAllData = () => {
    // 🆕 改善された確認ダイアログ
    if (confirm('⚠️ 本当に全データを削除しますか?\n\nこの操作は取り消せません。')) {
      if (confirm('🔴 最終確認: 全データを完全に削除します。\n\n本当によろしいですか?')) {
        clearAllData();
        showToast('全データを削除しました', 'success'); // 🆕
        loadStatsData();
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 🆕 トースト通知 */}
      {toast.show && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast({ ...toast, show: false })}
        />
      )}

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <button
            onClick={() => navigate('/')}
            className="mb-4 text-blue-600 hover:text-blue-800 flex items-center transition-colors"
          >
            ← ホームに戻る
          </button>
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900">成績管理・データ管理</h1>
          </div>
        </div>

        {/* タブナビゲーション */}
        <div className="flex space-x-1 mb-6 border-b">
          <button
            onClick={() => setActiveTab('stats')}
            className={`px-6 py-3 font-semibold transition-all ${activeTab === 'stats' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-600 hover:text-gray-900'}`}
          >
            📈 成績管理
          </button>
          <button
            onClick={() => setActiveTab('data')}
            className={`px-6 py-3 font-semibold transition-all ${activeTab === 'data' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-600 hover:text-gray-900'}`}
          >
            📊 データ管理
          </button>
          <button
            onClick={() => setActiveTab('creator')}
            className={`px-6 py-3 font-semibold transition-all ${activeTab === 'creator' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-600 hover:text-gray-900'}`}
          >
            ✏️ 問題作成
          </button>
        </div>

        {/* 🆕 ローディング表示 */}
        {isLoading && (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            <span className="ml-3 text-gray-600">読み込み中...</span>
          </div>
        )}

        {!isLoading && activeTab === 'stats' && (
          <div className="space-y-6">
            {/* 連続学習日数 */}
            {consecutiveDays > 0 && (
              <div className="bg-gradient-to-r from-orange-400 to-red-500 rounded-lg shadow-lg p-6 text-white animate-fade-in">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm opacity-90 mb-1">学習の継続</div>
                    <div className="text-4xl font-bold">{consecutiveDays}日連続!🔥</div>
                    <div className="text-sm opacity-90 mt-2">素晴らしい継続力です!この調子で頑張りましょう!</div>
                  </div>
                  <div className="text-6xl">📚</div>
                </div>
              </div>
            )}

            {/* 基本統計 */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
                <div className="text-sm text-gray-600 mb-1">テスト実施回数</div>
                <div className="text-3xl font-bold text-blue-600">{statsData.tests}回</div>
              </div>
              <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
                <div className="text-sm text-gray-600 mb-1">解答済み問題数</div>
                <div className="text-3xl font-bold text-green-600">{statsData.questions}問</div>
              </div>
              <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
                <div className="text-sm text-gray-600 mb-1">正解数</div>
                <div className="text-3xl font-bold text-purple-600">{statsData.correct}問</div>
              </div>
              <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
                <div className="text-sm text-gray-600 mb-1">総合正解率</div>
                <div className="text-3xl font-bold text-orange-600">{statsData.rate}%</div>
              </div>
            </div>

            {/* 最近のテスト結果 */}
            {recentTests.length > 0 && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">📝 最近のテスト結果</h2>
                <div className="space-y-3">
                  {recentTests.map((test, index) => (
                    <div key={test.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-all">
                      <div className="flex items-center space-x-4">
                        <div className="flex-shrink-0 w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold">
                          {index + 1}
                        </div>
                        <div>
                          <div className="font-semibold text-gray-900">{test.category}</div>
                          <div className="text-sm text-gray-500">{formatDate(test.date)}</div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className="text-right">
                          <div className="text-sm text-gray-600">正解率</div>
                          <div className={`text-2xl font-bold ${
                            test.correctRate >= 80 ? 'text-green-600' :
                            test.correctRate >= 60 ? 'text-blue-600' :
                            test.correctRate >= 40 ? 'text-yellow-600' :
                            'text-red-600'
                          }`}>
                            {test.correctRate}%
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm text-gray-600">スコア</div>
                          <div className="text-lg font-semibold text-gray-900">
                            {test.score}/{test.total}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* カテゴリ別成績 */}
            {categoryStats.length > 0 && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">📚 カテゴリ別成績</h2>
                <div className="space-y-4">
                  {categoryStats.map((stat, index) => (
                    <div key={index} className="border-b pb-4 last:border-b-0">
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <h3 className="font-semibold text-gray-900">{stat.category}</h3>
                          <div className="text-xs text-gray-500 mt-1">実施回数: {stat.testCount}回</div>
                        </div>
                        <span className="text-lg font-bold text-gray-900">{stat.correctRate}%</span>
                      </div>
                      
                      <div className="w-full bg-gray-200 rounded-full h-3 mb-2">
                        <div
                          className={`h-3 rounded-full transition-all ${getProgressColor(stat.correctRate)}`}
                          style={{ width: `${stat.correctRate}%` }}
                        />
                      </div>
                      
                      <div className="flex items-center justify-between text-sm text-gray-600">
                        <span>正解: {stat.correctAnswers} / {stat.totalQuestions}問</span>
                        <span className={`font-semibold ${
                          stat.correctRate >= 80 ? 'text-green-600' :
                          stat.correctRate >= 60 ? 'text-blue-600' :
                          stat.correctRate >= 40 ? 'text-yellow-600' :
                          'text-red-600'
                        }`}>
                          {stat.correctRate >= 80 ? '優秀' :
                           stat.correctRate >= 60 ? '良好' :
                           stat.correctRate >= 40 ? '要復習' :
                           '要強化'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {statsData.tests === 0 && (
              <div className="bg-white rounded-lg shadow-md p-8 text-center">
                <div className="text-6xl mb-4">📚</div>
                <p className="text-gray-500 text-lg font-semibold">まだテスト履歴がありません</p>
                <p className="text-gray-400 text-sm mt-2">ホームから学習を開始してください</p>
              </div>
            )}
          </div>
        )}

        {!isLoading && activeTab === 'data' && (
          <div className="space-y-6">
            {/* データクリーンアップ */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-bold mb-2 flex items-center">
                🧹 データクリーンアップ
              </h2>
              <p className="text-gray-600 text-sm mb-4">
                重複したテスト結果を自動検出して削除します。同じ日時・カテゴリ・問題数のテストを重複とみなします。
              </p>
              <button 
                onClick={handleDataCleanup} 
                className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors disabled:bg-gray-400"
                disabled={isLoading}
              >
                🧹 重複データをクリーンアップ
              </button>
              
              {cleanupResult && (
                <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg animate-fade-in">
                  <h3 className="font-semibold text-blue-900 mb-2">✅ クリーンアップ結果</h3>
                  <div className="space-y-1 text-sm text-blue-800">
                    <p>• 重複検出: <span className="font-bold">{cleanupResult.duplicatesFound}件</span></p>
                    <p>• 削除完了: <span className="font-bold">{cleanupResult.duplicatesRemoved}件</span></p>
                    <p>• 残りテスト: <span className="font-bold">{cleanupResult.testsAfter}件</span></p>
                  </div>
                </div>
              )}
            </div>

            {/* データエクスポート */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-bold mb-4">📥 データエクスポート</h2>
              <button 
                onClick={handleExportCSV} 
                className="bg-green-500 text-white px-6 py-2 rounded-lg hover:bg-green-600 transition-colors"
              >
                CSVエクスポート
              </button>
            </div>

            {/* 危険な操作 */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-bold mb-4 text-red-600">⚠️ 危険な操作</h2>
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2">特定日付のデータを削除</h3>
                  <div className="flex items-center space-x-4">
                    <input 
                      type="date" 
                      value={selectedDate} 
                      onChange={(e) => setSelectedDate(e.target.value)} 
                      className="border rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none" 
                    />
                    <button 
                      onClick={handleDeleteByDate} 
                      className="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600 transition-colors"
                    >
                      削除
                    </button>
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold mb-2 text-red-600">全データを削除</h3>
                  <button 
                    onClick={handleClearAllData} 
                    className="bg-red-500 text-white px-6 py-2 rounded hover:bg-red-600 transition-colors"
                  >
                    全データ削除
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'creator' && (
          <div className="bg-white rounded-lg shadow p-6">
            <QuestionCreator />
          </div>
        )}
      </div>
    </div>
  );
}
