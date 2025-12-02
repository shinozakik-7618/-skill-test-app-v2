import { useParams, useNavigate } from 'react-router-dom';

export default function ModeSelectPage() {
  const { category } = useParams<{ category: string }>();
  const navigate = useNavigate();
  const decodedCategory = decodeURIComponent(category || '');

  const handleModeSelect = (mode: 'learning' | 'exam') => {
    navigate(`/test/${encodeURIComponent(decodedCategory)}`, {
      state: { mode }
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <button
          onClick={() => navigate('/')}
          className="mb-6 text-gray-600 hover:text-gray-900 flex items-center"
        >
          ← ホームへ
        </button>

        <h1 className="text-3xl font-bold text-gray-900 mb-2">{decodedCategory}</h1>
        <p className="text-gray-600 mb-8">学習モードまたは試験モードを選択してください</p>

        <div className="space-y-6">
          {/* 学習モード */}
          <button
            onClick={() => handleModeSelect('learning')}
            className="w-full bg-white rounded-xl shadow-lg p-8 hover:shadow-xl transition-all border-2 border-transparent hover:border-blue-500"
          >
            <div className="flex items-center mb-4">
              <div className="text-5xl mr-4">📚</div>
              <div className="text-left">
                <h2 className="text-2xl font-bold text-gray-900">学習モード</h2>
                <p className="text-sm text-gray-600 mt-1">1問ごとに解説が表示されます</p>
              </div>
            </div>
            <div className="bg-blue-50 rounded-lg p-4 text-left">
              <h3 className="font-semibold text-gray-900 mb-2">特徴</h3>
              <ul className="text-sm text-gray-700 space-y-1">
                <li>• 回答後、すぐに正解と解説が表示されます</li>
                <li>• じっくり学習したい方におすすめ</li>
                <li>• 理解を深めながら進められます</li>
              </ul>
            </div>
          </button>

          {/* 試験モード */}
          <button
            onClick={() => handleModeSelect('exam')}
            className="w-full bg-white rounded-xl shadow-lg p-8 hover:shadow-xl transition-all border-2 border-transparent hover:border-purple-500"
          >
            <div className="flex items-center mb-4">
              <div className="text-5xl mr-4">🎯</div>
              <div className="text-left">
                <h2 className="text-2xl font-bold text-gray-900">試験モード</h2>
                <p className="text-sm text-gray-600 mt-1">全問回答後に解説を確認できます</p>
              </div>
            </div>
            <div className="bg-purple-50 rounded-lg p-4 text-left">
              <h3 className="font-semibold text-gray-900 mb-2">特徴</h3>
              <ul className="text-sm text-gray-700 space-y-1">
                <li>• テスト中は解説が表示されません</li>
                <li>• 結果画面で全問題の解説を確認できます</li>
                <li>• 本番試験のような緊張感で挑戦できます</li>
              </ul>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}
