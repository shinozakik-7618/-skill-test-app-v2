import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { ArrowLeft, BookOpen, Trash2 } from 'lucide-react';
import { getReviewNotes, getReviewNotesByCategory, removeFromReviewNote, ReviewNote } from '../utils/storage';
import { allQuestions as importedQuestions } from '../data/allQuestions';

// 配列であることを保証
const allQuestions = Array.isArray(importedQuestions) ? importedQuestions : [];

export default function ReviewNotePage() {
  const navigate = useNavigate();
  const [reviewNotes, setReviewNotes] = useState<ReviewNote[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  useEffect(() => {
    loadReviewNotes();
    
    // ページが表示されるたびにデータを再読み込み
    const handleFocus = () => {
      loadReviewNotes();
    };
    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [selectedCategory]);

  const loadReviewNotes = () => {
    const notes = selectedCategory === 'all' ? getReviewNotes() : getReviewNotesByCategory(selectedCategory);
    
    // カテゴリー別にグループ化して表示
    const grouped = notes.reduce((acc, note) => {
      if (!acc[note.category]) {
        acc[note.category] = [];
      }
      acc[note.category].push(note);
      return acc;
    }, {} as Record<string, ReviewNote[]>);
    
    
    setReviewNotes(notes);
  };

  const handleDelete = (questionId: string) => {
    if (window.confirm('この問題を復習ノートから削除しますか？')) {
      removeFromReviewNote(questionId);
      loadReviewNotes();
    }
  };

  const startReview = (category?: string) => {
    if (category) {
      // 特定カテゴリーの復習
      navigate(`/review-test/${encodeURIComponent(category)}`);
    } else {
      // 全カテゴリーの復習
      navigate('/review-test/all');
    }
  };

  // 問題IDから問題文を取得
  const getQuestionText = (questionId: string): string => {
    
    if (!Array.isArray(allQuestions)) {
      console.error('❌ allQuestions is not an array!', allQuestions);
      return '問題が見つかりません（データエラー）';
    }
    
    const question = allQuestions.find(q => q.id === questionId);
    return question ? question.question : '問題が見つかりません';
  };

  // カテゴリー別にグループ化
  const groupedNotes = reviewNotes.reduce((acc, note) => {
    if (!acc[note.category]) {
      acc[note.category] = [];
    }
    acc[note.category].push(note);
    return acc;
  }, {} as Record<string, ReviewNote[]>);

  const categories = Object.keys(groupedNotes);
  const totalNotes = reviewNotes.length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* ヘッダー */}
      <header className="bg-white shadow-md">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <button
            onClick={() => navigate('/')}
            className="flex items-center text-gray-600 hover:text-gray-900 transition-colors mb-2"
          >
            <ArrowLeft className="w-5 h-5 mr-1" />
            <span className="font-semibold">ホームに戻る</span>
          </button>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center">
                <BookOpen className="w-7 h-7 mr-2 text-orange-500" />
                復習ノート
              </h1>
              <p className="text-sm text-gray-600 mt-1">間違えた問題をもう一度チャレンジ</p>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-orange-600">{totalNotes}</div>
              <div className="text-sm text-gray-600">問</div>
            </div>
          </div>
        </div>
      </header>

      {/* メインコンテンツ */}
      <main className="max-w-6xl mx-auto px-4 py-8">
        {totalNotes === 0 ? (
          /* 空の状態 */
          <div className="bg-white rounded-xl shadow-lg p-12 text-center">
            <div className="text-6xl mb-4">🎉</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">素晴らしい！</h2>
            <h3 className="text-xl font-semibold text-gray-700 mb-4">現在、復習する問題はありません。</h3>
            <p className="text-gray-600 mb-6">
              間違えた問題は自動的にここに追加されます。<br />
              新しい問題に挑戦しましょう！
            </p>
            <button
              onClick={() => navigate('/')}
              className="bg-indigo-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-indigo-700 shadow-md hover:shadow-lg transition-all"
            >
              新しい問題に挑戦する
            </button>
          </div>
        ) : (
          <>
            {/* アクションボタン */}
            <div className="bg-white rounded-xl shadow-md p-6 mb-6">
              <div className="flex flex-wrap gap-4">
                <button
                  onClick={() => startReview()}
                  className="flex-1 bg-gradient-to-r from-orange-500 to-red-500 text-white px-6 py-4 rounded-lg font-semibold hover:shadow-lg transition-all"
                >
                  📚 すべての問題を復習する ({totalNotes}問)
                </button>
                <button
                  onClick={() => {
                    if (window.confirm('復習ノートをすべてクリアしますか？')) {
                      reviewNotes.forEach(note => removeFromReviewNote(note.questionId));
                      loadReviewNotes();
                    }
                  }}
                  className="bg-gray-200 text-gray-700 px-6 py-4 rounded-lg font-semibold hover:bg-gray-300 transition-all"
                >
                  🗑️ すべてクリア
                </button>
              </div>
            </div>

            {/* カテゴリー別表示 */}
            <div className="space-y-6">
              {categories.map(category => {
                const categoryNotes = groupedNotes[category];
                const sortedNotes = categoryNotes.sort((a, b) => 
                  new Date(b.lastAttempt).getTime() - new Date(a.lastAttempt).getTime()
                );

                return (
                  <div key={category} className="bg-white rounded-xl shadow-md overflow-hidden">
                    {/* カテゴリーヘッダー */}
                    <div className="bg-gradient-to-r from-orange-500 to-red-500 px-6 py-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h2 className="text-xl font-bold text-white">{category}</h2>
                          <p className="text-sm text-orange-100">{categoryNotes.length}問</p>
                        </div>
                        <button
                          onClick={() => startReview(category)}
                          className="bg-white text-orange-600 px-6 py-2 rounded-lg font-semibold hover:shadow-md transition-all"
                        >
                          このカテゴリーを復習
                        </button>
                      </div>
                    </div>

                    {/* 問題一覧 */}
                    <div className="divide-y divide-gray-200">
                      {sortedNotes.map((note, index) => {
                        const questionText = getQuestionText(note.questionId);
                        const lastAttemptDate = new Date(note.lastAttempt);
                        const isValidDate = !isNaN(lastAttemptDate.getTime());
                        
                        return (
                          <div key={`${note.questionId}-${index}`} className="p-6 hover:bg-gray-50 transition-colors">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center mb-2">
                                  <span className="inline-block bg-red-100 text-red-700 px-3 py-1 rounded-full text-xs font-semibold mr-3">
                                    {note.wrongCount}回間違い
                                  </span>
                                  {isValidDate && (
                                    <span className="text-xs text-gray-500">
                                      最終: {lastAttemptDate.toLocaleDateString('ja-JP')}
                                    </span>
                                  )}
                                </div>
                                <p className="text-gray-800 leading-relaxed">{questionText}</p>
                              </div>
                              <button
                                onClick={() => handleDelete(note.questionId)}
                                className="ml-4 p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                                title="削除"
                              >
                                <Trash2 className="w-5 h-5" />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </main>
    </div>
  );
}
