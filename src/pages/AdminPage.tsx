import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { clearAllData, deleteDataByDate, exportToCSV } from '../utils/storage';
import QuestionCreator from '../components/QuestionCreator';

type TabType = 'stats' | 'data' | 'creator';

export default function AdminPage() {
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [activeTab, setActiveTab] = useState<TabType>('stats');
  const [statsData, setStatsData] = useState({ tests: 0, questions: 0, correct: 0, rate: 0 });

  useEffect(() => {
    if (activeTab === 'stats') {
      console.log('📊 成績データを読み込み中...');
      const data = localStorage.getItem('test_results');
      console.log('📊 localStorage test_results:', data ? '存在する' : '存在しない');
      
      const results = data ? JSON.parse(data) : [];
      console.log('📊 テスト結果:', results.length, '件');
      
      let tests = results.length;
      let questions = 0;
      let correct = 0;
      results.forEach((r: any) => {
        questions += r.total || 0;
        correct += r.score || 0;
      });
      const rate = questions > 0 ? Math.round((correct / questions) * 100) : 0;
      
      console.log('📊 統計:', { tests, questions, correct, rate });
      setStatsData({ tests, questions, correct, rate });
    }
  }, [activeTab]);

  const handleClearAllData = () => clearAllData();
  const handleDeleteByDate = () => {
    if (!selectedDate) {
      alert('削除する日付を選択してください。');
      return;
    }
    deleteDataByDate(new Date(selectedDate));
  };
  const handleExportCSV = () => {
    try {
      const csvContent = exportToCSV();
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      const dateStr = new Date().toISOString().split('T')[0];
      const fileName = `test-results_${dateStr}.csv`;
      link.setAttribute('href', url);
      link.setAttribute('download', fileName);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      alert(`データをエクスポートしました。\nファイル名: ${fileName}`);
    } catch (error) {
      alert('データのエクスポート中にエラーが発生しました。');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900">成績管理・データ管理</h1>
            <button onClick={() => navigate('/')} className="text-orange-600 hover:text-orange-700">
              ホームに戻る
            </button>
          </div>
          <div className="flex space-x-1 mt-4">
            <button onClick={() => setActiveTab('stats')} className={`px-4 py-2 rounded-t-lg font-medium ${activeTab === 'stats' ? 'bg-orange-500 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}>
              📈 成績管理
            </button>
            <button onClick={() => setActiveTab('data')} className={`px-4 py-2 rounded-t-lg font-medium ${activeTab === 'data' ? 'bg-orange-500 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}>
              📊 データ管理
            </button>
            <button onClick={() => setActiveTab('creator')} className={`px-4 py-2 rounded-t-lg font-medium ${activeTab === 'creator' ? 'bg-orange-500 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}>
              ✏️ 問題作成
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {activeTab === 'stats' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-white rounded-lg shadow-md p-6">
                <p className="text-sm text-gray-600">テスト実施回数</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{statsData.tests}</p>
              </div>
              <div className="bg-white rounded-lg shadow-md p-6">
                <p className="text-sm text-gray-600">解答済み問題数</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{statsData.questions}</p>
              </div>
              <div className="bg-white rounded-lg shadow-md p-6">
                <p className="text-sm text-gray-600">正解数</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{statsData.correct}</p>
              </div>
              <div className="bg-white rounded-lg shadow-md p-6">
                <p className="text-sm text-gray-600">総合正解率</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{statsData.rate}%</p>
              </div>
            </div>
            {statsData.tests === 0 && (
              <div className="bg-white rounded-lg shadow-md p-8 text-center">
                <p className="text-gray-500">まだテスト履歴がありません</p>
                <p className="text-gray-400 text-sm mt-2">ホームから学習を開始してください</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'data' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-bold mb-4">データエクスポート</h2>
              <button onClick={handleExportCSV} className="bg-green-500 text-white px-6 py-2 rounded-lg hover:bg-green-600">
                CSVエクスポート
              </button>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-bold mb-4 text-red-600">危険な操作</h2>
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2">特定日付のデータを削除</h3>
                  <div className="flex items-center space-x-4">
                    <input type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} className="border rounded px-3 py-2" />
                    <button onClick={handleDeleteByDate} className="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600">削除</button>
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold mb-2 text-red-600">全データを削除</h3>
                  <button onClick={handleClearAllData} className="bg-red-500 text-white px-6 py-2 rounded hover:bg-red-600">全データ削除</button>
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
