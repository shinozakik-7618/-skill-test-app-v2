import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

export default function StatsPage() {
  console.log('🎯 StatsPage: 最小バージョンが読み込まれました');
  
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      {/* ヘッダー */}
      <div className="max-w-6xl mx-auto">
        <button
          onClick={() => navigate('/')}
          className="flex items-center text-gray-600 hover:text-gray-900 mb-6"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          ホームに戻る
        </button>

        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          📊 成績管理
        </h1>

        {/* テストメッセージ */}
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <p className="text-xl text-gray-700 mb-4">
            ✅ StatsPage が正常に読み込まれました!
          </p>
          <p className="text-gray-500">
            このメッセージが表示されれば、ルーティングは正常に機能しています。
          </p>
        </div>
      </div>
    </div>
  );
}
