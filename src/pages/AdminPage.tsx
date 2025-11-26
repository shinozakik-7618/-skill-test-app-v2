import { useNavigate } from 'react-router-dom';
import { clearAllData } from '../utils/storage';

export default function AdminPage() {
  const navigate = useNavigate();

  const handleClearData = () => {
    clearAllData();
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

      {/* メインコンテンツ */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6">⚙️ システム設定</h2>
          
          <div className="space-y-6">
            {/* データ管理 */}
            <div className="border-b pb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">データ管理</h3>
              <div className="space-y-4">
                <div className="bg-yellow-50 border-2 border-yellow-300 rounded-lg p-4">
                  <h4 className="font-semibold text-yellow-900 mb-2">⚠️ 注意</h4>
                  <p className="text-sm text-yellow-800 mb-4">
                    以下の操作は取り消すことができません。実行前に必ずデータをエクスポートしてください。
                  </p>
                  <button
                    onClick={handleClearData}
                    className="bg-red-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-red-700"
                  >
                    すべてのデータを削除
                  </button>
                </div>
              </div>
            </div>

            {/* 問題管理 */}
            <div className="border-b pb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">問題管理</h3>
              <div className="space-y-3 text-sm text-gray-700">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-blue-900 mb-2">📝 問題の追加方法</h4>
                  <ol className="list-decimal list-inside space-y-2">
                    <li>src/data/sampleQuestions.ts ファイルを開く</li>
                    <li>新しい問題オブジェクトを配列に追加</li>
                    <li>問題ID、カテゴリー、難易度などを正しく設定</li>
                    <li>保存して再ビルド</li>
                  </ol>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-green-900 mb-2">🔄 問題の更新方法</h4>
                  <ol className="list-decimal list-inside space-y-2">
                    <li>PCデポカテゴリー: 月1回、最新の決算情報やニュースから問題を作成</li>
                    <li>AI・DXニュース: 毎日、最新ニュースから自動生成（今後実装予定）</li>
                    <li>一般カテゴリー: 必要に応じて問題を追加・更新</li>
                  </ol>
                </div>
              </div>
            </div>

            {/* システム情報 */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">システム情報</h3>
              <div className="bg-gray-50 p-4 rounded-lg">
                <dl className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <dt className="text-gray-600">バージョン:</dt>
                    <dd className="font-semibold">1.0.0</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-gray-600">最終更新:</dt>
                    <dd className="font-semibold">2025-01-18</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-gray-600">ストレージ:</dt>
                    <dd className="font-semibold">LocalStorage</dd>
                  </div>
                </dl>
              </div>
            </div>
          </div>
        </div>

        {/* 技術情報 */}
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
                <li>CSV エクスポート機能</li>
                <li>将来的にFirebase/Supabase対応可能</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">デプロイ</h4>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>GitHub Pages 対応</li>
                <li>Vercel 対応</li>
                <li>静的サイト生成</li>
              </ul>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
