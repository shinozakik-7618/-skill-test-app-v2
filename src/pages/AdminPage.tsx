import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { clearAllData, deleteDataByDate, exportToCSV } from '../utils/storage';
import QuestionCreator from '../components/QuestionCreator';

type TabType = 'data' | 'questions' | 'creator' | 'system';

export default function AdminPage() {
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [activeTab, setActiveTab] = useState<TabType>('data');

  const handleClearAllData = () => {
    clearAllData();
  };

  const handleDeleteByDate = () => {
    if (!selectedDate) {
      alert('削除する日付を選択してください。');
      return;
    }
    const date = new Date(selectedDate);
    deleteDataByDate(date);
  };

  const handleExportCSV = () => {
    try {
      const csvContent = exportToCSV();
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      
      const now = new Date();
      const dateStr = now.toISOString().split('T')[0];
      const fileName = `test-results_${dateStr}.csv`;
      
      link.setAttribute('href', url);
      link.setAttribute('download', fileName);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      alert(`データをエクスポートしました。\\nファイル名: ${fileName}`);
    } catch (error) {
      console.error('CSV export error:', error);
      alert('データのエクスポート中にエラーが発生しました。');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* ヘッダー */}
      <header className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900">管理機能</h1>
            <button
              onClick={() => navigate('/')}
              className="text-gray-600 hover:text-gray-900"
            >
              ← 戻る
            </button>
          </div>
        </div>
      </header>

      {/* タブナビゲーション */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4">
          <nav className="flex space-x-8">
            <button
              onClick={() => setActiveTab('data')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'data'
                  ? 'border-purple-600 text-purple-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              📊 データ管理
            </button>
            <button
              onClick={() => setActiveTab('creator')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'creator'
                  ? 'border-purple-600 text-purple-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              ✨ 問題作成
            </button>
            <button
              onClick={() => setActiveTab('questions')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'questions'
                  ? 'border-purple-600 text-purple-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              📝 問題管理
            </button>
            <button
              onClick={() => setActiveTab('system')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'system'
                  ? 'border-purple-600 text-purple-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              ⚙️ システム情報
            </button>
          </nav>
        </div>
      </div>

      {/* メインコンテンツ */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* データ管理タブ */}
        {activeTab === 'data' && (
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">📊 データ管理</h2>
            
            <div className="space-y-4">
              {/* データエクスポート */}
              <div className="bg-green-50 border-2 border-green-300 rounded-lg p-4">
                <h4 className="font-semibold text-green-900 mb-2">📥 データエクスポート</h4>
                <p className="text-sm text-green-800 mb-4">
                  すべてのテスト結果をCSVファイルでダウンロードします。Excel等で開いて分析できます。
                </p>
                <button
                  onClick={handleExportCSV}
                  className="bg-green-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-green-700"
                >
                  CSVファイルをダウンロード
                </button>
              </div>

              {/* 日付指定削除 */}
              <div className="bg-blue-50 border-2 border-blue-300 rounded-lg p-4">
                <h4 className="font-semibold text-blue-900 mb-2">📅 日付指定削除</h4>
                <p className="text-sm text-blue-800 mb-4">
                  指定した日付のテスト結果、カレンダーデータ、統計情報を削除します。
                </p>
                <div className="flex items-center gap-3">
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="border-2 border-blue-300 rounded-lg px-4 py-2 focus:outline-none focus:border-blue-500"
                  />
                  <button
                    onClick={handleDeleteByDate}
                    className="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700"
                  >
                    指定日を削除
                  </button>
                </div>
              </div>

              {/* 全削除 */}
              <div className="bg-yellow-50 border-2 border-yellow-300 rounded-lg p-4">
                <h4 className="font-semibold text-yellow-900 mb-2">⚠️ 全データ削除</h4>
                <p className="text-sm text-yellow-800 mb-4">
                  全期間のテスト結果、カレンダーデータ、統計情報を削除します。この操作は取り消すことができません。
                </p>
                <button
                  onClick={handleClearAllData}
                  className="bg-red-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-red-700"
                >
                  すべてのデータを削除
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 問題作成タブ */}
        {activeTab === 'creator' && (
          <div className="bg-white rounded-xl shadow-lg p-6">
            <QuestionCreator />
          </div>
        )}

        {/* 問題管理タブ */}
        {activeTab === 'questions' && (
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">📝 問題管理ガイド</h2>
            
            <div className="space-y-6">
              <div className="bg-purple-50 border-2 border-purple-300 rounded-lg p-4">
                <h4 className="font-semibold text-purple-900 mb-3">🆕 新機能: 問題作成アシスタント</h4>
                <p className="text-sm text-purple-800 mb-3">
                  「✨ 問題作成」タブから、ニュース記事のURLを入力するだけで自動的に4択問題を作成できます。
                </p>
                <ul className="list-disc list-inside space-y-1 text-sm text-purple-800">
                  <li>URLから自動で問題生成</li>
                  <li>問題の編集・プレビュー機能</li>
                  <li>TypeScriptファイルで直接エクスポート</li>
                  <li>全スタッフが即座に利用可能</li>
                </ul>
              </div>

              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-semibold text-blue-900 mb-2">📝 手動で問題を追加する方法</h4>
                <ol className="list-decimal list-inside space-y-2 text-sm">
                  <li>GitHubリポジトリの src/data/ フォルダにアクセス</li>
                  <li>該当カテゴリーのファイル (例: questions-finance.ts) を開く</li>
                  <li>新しい問題オブジェクトを配列に追加</li>
                  <li>問題ID、カテゴリー、難易度などを正しく設定</li>
                  <li>コミットして保存（Vercelが自動デプロイ）</li>
                </ol>
              </div>

              <div className="bg-green-50 p-4 rounded-lg">
                <h4 className="font-semibold text-green-900 mb-2">🔄 問題の更新方針</h4>
                <ol className="list-decimal list-inside space-y-2 text-sm">
                  <li><strong>AI・DX基礎知識:</strong> 随時、最新ニュースから問題を追加（問題作成アシスタント推奨）</li>
                  <li><strong>PCデポカテゴリー:</strong> 月1回、最新の決算情報やニュースから問題を作成</li>
                  <li><strong>一般カテゴリー:</strong> 必要に応じて問題を追加・更新</li>
                </ol>
              </div>

              <div className="bg-orange-50 p-4 rounded-lg">
                <h4 className="font-semibold text-orange-900 mb-2">⚡ 問題更新後の流れ</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <span className="bg-orange-600 text-white px-2 py-1 rounded text-xs font-semibold">1</span>
                    <span>問題ファイルをGitHubにアップロード</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="bg-orange-600 text-white px-2 py-1 rounded text-xs font-semibold">2</span>
                    <span>Vercelが自動的にビルド・デプロイ（2-3分）</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="bg-orange-600 text-white px-2 py-1 rounded text-xs font-semibold">3</span>
                    <span>全スタッフがブラウザ再読み込みで最新問題を利用可能</span>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 border border-gray-300 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 mb-2">📋 問題形式のテンプレート</h4>
                <pre className="text-xs bg-white p-3 rounded border border-gray-200 overflow-x-auto">
{`{
  id: 'AIDX001',
  category: 'AI・DX基礎知識',
  question: '問題文をここに記載',
  options: [
    '選択肢A',
    '選択肢B',
    '選択肢C',
    '選択肢D'
  ],
  correctAnswer: 0,  // 0=A, 1=B, 2=C, 3=D
  explanation: '正解の理由と補足説明'
}`}
                </pre>
              </div>
            </div>
          </div>
        )}

        {/* システム情報タブ */}
        {activeTab === 'system' && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">⚙️ システム情報</h2>
              <div className="bg-gray-50 p-4 rounded-lg">
                <dl className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <dt className="text-gray-600">バージョン:</dt>
                    <dd className="font-semibold">1.1.0</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-gray-600">最終更新:</dt>
                    <dd className="font-semibold">2025-11-28</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-gray-600">ストレージ:</dt>
                    <dd className="font-semibold">LocalStorage</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-gray-600">新機能:</dt>
                    <dd className="font-semibold">問題作成アシスタント</dd>
                  </div>
                </dl>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">🔧 技術仕様</h2>
              <div className="space-y-4 text-sm text-gray-700">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">フロントエンド</h4>
                  <ul className="list-disc list-inside space-y-1 ml-4">
                    <li>React 18 + TypeScript</li>
                    <li>React Router (ページ遷移)</li>
                    <li>Tailwind CSS (スタイリング)</li>
                    <li>date-fns (日付処理)</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">データ管理</h4>
                  <ul className="list-disc list-inside space-y-1 ml-4">
                    <li>LocalStorage (ブラウザ内保存)</li>
                    <li>CSVエクスポート機能</li>
                    <li>日付指定削除機能</li>
                    <li>統計情報の自動再計算</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">問題管理</h4>
                  <ul className="list-disc list-inside space-y-1 ml-4">
                    <li>URLから自動問題生成（問題作成アシスタント）</li>
                    <li>TypeScript形式エクスポート</li>
                    <li>リアルタイム編集・プレビュー</li>
                    <li>GitHub連携（手動アップロード）</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">デプロイ</h4>
                  <ul className="list-disc list-inside space-y-1 ml-4">
                    <li>GitHub リポジトリ管理</li>
                    <li>Vercel 自動デプロイ</li>
                    <li>静的サイト生成</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
