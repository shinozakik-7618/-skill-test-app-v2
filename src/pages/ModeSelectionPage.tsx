import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, BookOpen, FileText } from 'lucide-react';

export default function ModeSelectionPage() {
  const { category } = useParams<{ category: string }>();
  const navigate = useNavigate();
  const decodedCategory = decodeURIComponent(category || '');

  const startTest = (mode: 'learning' | 'exam') => {
    navigate(`/test/${category}?mode=${mode}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* ヘッダー */}
      <header className="bg-white shadow-md">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <button
            onClick={() => navigate('/')}
            className="flex items-center text-gray-600 hover:text-gray-900 transition-colors mb-2"
          >
            <ArrowLeft className="w-5 h-5 mr-1" />
            <span className="font-semibold">ホームに戻る</span>
          </button>
          <h1 className="text-2xl font-bold text-gray-900">{decodedCategory}</h1>
          <p className="text-sm text-gray-600 mt-1">学習方法を選択してください</p>
        </div>
      </header>

      {/* メインコンテンツ */}
      <main className="max-w-4xl mx-auto px-4 py-12">
        <div className="grid md:grid-cols-2 gap-8">
          {/* 学習モード */}
          <button
            onClick={() => startTest('learning')}
            className="bg-white rounded-2xl shadow-lg p-8 hover:shadow-2xl transition-all transform hover:-translate-y-1 text-left group"
          >
            <div className="flex items-center mb-6">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                <BookOpen className="w-8 h-8 text-blue-600" />
              </div>
              <h2 className="ml-4 text-2xl font-bold text-gray-900">学習モード</h2>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-start">
                <span className="text-2xl mr-3">📖</span>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">1問ごとに解説表示</h3>
                  <p className="text-sm text-gray-600">回答後すぐに正解と解説を確認できます</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <span className="text-2xl mr-3">💡</span>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">じっくり理解</h3>
                  <p className="text-sm text-gray-600">理解を深めながら学習を進められます</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <span className="text-2xl mr-3">🎯</span>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">初めての学習に最適</h3>
                  <p className="text-sm text-gray-600">新しいカテゴリーの学習におすすめ</p>
                </div>
              </div>
            </div>

            <div className="mt-8 bg-blue-50 rounded-lg p-4">
              <p className="text-sm text-blue-800 font-semibold">
                ✨ 記憶が鮮明なうちに解説を読めるため、学習効果が最も高いモードです
              </p>
            </div>
          </button>

          {/* 試験モード */}
          <button
            onClick={() => startTest('exam')}
            className="bg-white rounded-2xl shadow-lg p-8 hover:shadow-2xl transition-all transform hover:-translate-y-1 text-left group"
          >
            <div className="flex items-center mb-6">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center group-hover:bg-purple-200 transition-colors">
                <FileText className="w-8 h-8 text-purple-600" />
              </div>
              <h2 className="ml-4 text-2xl font-bold text-gray-900">試験モード</h2>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-start">
                <span className="text-2xl mr-3">📝</span>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">終了後に解説表示</h3>
                  <p className="text-sm text-gray-600">全問回答後にまとめて解説を確認</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <span className="text-2xl mr-3">⚡</span>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">テンポよく進む</h3>
                  <p className="text-sm text-gray-600">解説に邪魔されず集中して回答</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <span className="text-2xl mr-3">🏆</span>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">本番試験の練習</h3>
                  <p className="text-sm text-gray-600">実際の試験形式に近い環境で実力確認</p>
                </div>
              </div>
            </div>

            <div className="mt-8 bg-purple-50 rounded-lg p-4">
              <p className="text-sm text-purple-800 font-semibold">
                ✨ 復習や実力確認に最適。本番試験の雰囲気を体験できます
              </p>
            </div>
          </button>
        </div>

        {/* 補足説明 */}
        <div className="mt-12 bg-white rounded-xl shadow-md p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">💡 モード選択のヒント</h3>
          <div className="grid md:grid-cols-2 gap-6 text-sm text-gray-700">
            <div>
              <h4 className="font-semibold text-blue-700 mb-2">学習モードがおすすめの場合：</h4>
              <ul className="space-y-1 list-disc list-inside">
                <li>初めて学習するカテゴリー</li>
                <li>苦手なカテゴリーの克服</li>
                <li>じっくり理解を深めたい</li>
                <li>復習ノートの問題を解く</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-purple-700 mb-2">試験モードがおすすめの場合：</h4>
              <ul className="space-y-1 list-disc list-inside">
                <li>すでに学習済みのカテゴリー</li>
                <li>実力を確認したい</li>
                <li>短時間で多くの問題を解きたい</li>
                <li>本番試験前の最終確認</li>
              </ul>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
