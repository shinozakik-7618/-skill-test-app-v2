import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Category } from '../types';
import { getUnreadCount } from '../data/announcements';

const categories: { name: Category; icon: string; questionsCount: number }[] = [
  { name: '財務会計・経理', icon: '💰', questionsCount: 40 },
  { name: '法務・コンプライアンス', icon: '⚖️', questionsCount: 40 },
  { name: 'ガバナンス・内部統制', icon: '🏛️', questionsCount: 40 },
  { name: '人事・労務管理', icon: '👥', questionsCount: 40 },
  { name: '経営戦略・企画', icon: '📊', questionsCount: 40 },
  { name: '業務プロセス・効率化', icon: '⚙️', questionsCount: 40 },
  { name: '組織マネジメント', icon: '🎯', questionsCount: 40 },
  { name: '情報システム・IT管理', icon: '💻', questionsCount: 40 },
  { name: '総務・一般管理', icon: '📋', questionsCount: 40 },
  { name: 'コミュニケーション・報告', icon: '💬', questionsCount: 40 },
  { name: 'PCデポ', icon: '🏪', questionsCount: 150 },
  { name: 'AI・DXニュース', icon: '🤖', questionsCount: 0 },
];

export default function Home() {
  const navigate = useNavigate();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    setUnreadCount(getUnreadCount());
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* ヘッダー */}
      <header className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
            経営管理責任者スキルアップテスト
          </h1>
          <p className="text-sm text-gray-600 mt-2">
            デジタルライフプランナー向け継続学習システム
          </p>
        </div>
      </header>

      {/* メインコンテンツ */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* ナビゲーションカード */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          <button
            onClick={() => navigate('/announcements')}
            className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow relative"
          >
            <div className="text-4xl mb-2">🔔</div>
            <div className="text-sm font-semibold text-gray-700">お知らせ</div>
            {unreadCount > 0 && (
              <div className="absolute top-2 right-2 bg-red-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center">
                {unreadCount}
              </div>
            )}
          </button>
          <button
            onClick={() => navigate('/calendar')}
            className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow"
          >
            <div className="text-4xl mb-2">📅</div>
            <div className="text-sm font-semibold text-gray-700">実施履歴</div>
          </button>
          <button
            onClick={() => navigate('/review')}
            className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow"
          >
            <div className="text-4xl mb-2">📝</div>
            <div className="text-sm font-semibold text-gray-700">復習モード</div>
          </button>
          <button
            onClick={() => navigate('/stats')}
            className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow"
          >
            <div className="text-4xl mb-2">📈</div>
            <div className="text-sm font-semibold text-gray-700">成績管理</div>
          </button>
          <button
            onClick={() => navigate('/admin')}
            className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow"
          >
            <div className="text-4xl mb-2">⚙️</div>
            <div className="text-sm font-semibold text-gray-700">管理機能</div>
          </button>
        </div>

        {/* カテゴリー選択 */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            カテゴリーを選択してください
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {categories.map((category) => (
              <button
                key={category.name}
                onClick={() => navigate(`/test/${encodeURIComponent(category.name)}`)}
                className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white p-6 rounded-lg shadow-md hover:shadow-xl transform hover:scale-105 transition-all duration-200"
                disabled={category.questionsCount === 0}
              >
                <div className="text-4xl mb-3">{category.icon}</div>
                <div className="font-semibold text-left mb-2">{category.name}</div>
                <div className="text-sm text-blue-100 text-left">
                  {category.questionsCount > 0 
                    ? `問題数: ${category.questionsCount}問` 
                    : '準備中'}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* 使い方ガイド */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">📖 使い方</h3>
          <ul className="space-y-3 text-sm text-gray-700">
            <li className="flex items-start">
              <span className="inline-block w-6 h-6 bg-blue-500 text-white rounded-full text-center mr-3 flex-shrink-0">1</span>
              <span>学習したいカテゴリーを選択します</span>
            </li>
            <li className="flex items-start">
              <span className="inline-block w-6 h-6 bg-blue-500 text-white rounded-full text-center mr-3 flex-shrink-0">2</span>
              <span>10問の4択問題に回答します（PCデポは5問）</span>
            </li>
            <li className="flex items-start">
              <span className="inline-block w-6 h-6 bg-blue-500 text-white rounded-full text-center mr-3 flex-shrink-0">3</span>
              <span>結果と詳しい解説を確認できます</span>
            </li>
            <li className="flex items-start">
              <span className="inline-block w-6 h-6 bg-blue-500 text-white rounded-full text-center mr-3 flex-shrink-0">4</span>
              <span>カレンダーで学習履歴を振り返ることができます</span>
            </li>
            <li className="flex items-start">
              <span className="inline-block w-6 h-6 bg-blue-500 text-white rounded-full text-center mr-3 flex-shrink-0">5</span>
              <span>間違えた問題だけを復習できます</span>
            </li>
          </ul>
        </div>
      </main>

      {/* フッター */}
      <footer className="bg-white border-t mt-12">
        <div className="max-w-7xl mx-auto px-4 py-6 text-center text-sm text-gray-600">
          <p>&copy; 2025 PCデポコーポレーション. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
