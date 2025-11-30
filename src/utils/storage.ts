import { TestResult, UserStats, TestSession } from '../types';

// ユーザーIDの取得/生成
export const getUserId = (): string => {
  let userId = localStorage.getItem('userId');
  if (!userId) {
    userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem('userId', userId);
  }
  return userId;
};

// テスト結果の保存
export const saveTestResult = (result: TestResult): void => {
  const results = getTestResults();
  results.push(result);
  localStorage.setItem('testResults', JSON.stringify(results));
  updateUserStats(result);
};

// すべてのテスト結果の取得
export const getTestResults = (): TestResult[] => {
  const results = localStorage.getItem('testResults');
  return results ? JSON.parse(results) : [];
};

// 日付別のテスト結果取得
export const getTestResultsByDate = (date: Date): TestResult[] => {
  const results = getTestResults();
  const targetDate = date.toISOString().split('T')[0];
  return results.filter(result => {
    const resultDate = new Date(result.testDate).toISOString().split('T')[0];
    return resultDate === targetDate;
  });
};

// カテゴリ別のテスト結果取得
export const getTestResultsByCategory = (category: string): TestResult[] => {
  return getTestResults().filter(result => result.category === category);
};

// 不正解だった問題IDの取得
export const getIncorrectQuestionIds = (category: string): string[] => {
  const results = getTestResultsByCategory(category);
  return results
    .filter(result => !result.isCorrect)
    .map(result => result.questionId);
};

// ユーザー統計の更新
const updateUserStats = (result: TestResult): void => {
  const stats = getUserStats();
  stats.totalTests += 1;
  stats.totalQuestions += 1;
  if (result.isCorrect) {
    stats.correctAnswers += 1;
  }
  stats.overallAccuracy = (stats.correctAnswers / stats.totalQuestions) * 100;
  
  // カテゴリ別統計の更新
  if (!stats.categoryStats) {
    stats.categoryStats = {};
  }
  if (!stats.categoryStats[result.category]) {
    stats.categoryStats[result.category] = {
      totalQuestions: 0,
      correctAnswers: 0,
      accuracy: 0,
    };
  }
  const categoryStats = stats.categoryStats[result.category];
  categoryStats.totalQuestions += 1;
  if (result.isCorrect) {
    categoryStats.correctAnswers += 1;
  }
  categoryStats.accuracy = (categoryStats.correctAnswers / categoryStats.totalQuestions) * 100;
  
  stats.lastTestDate = result.testDate;
  localStorage.setItem('userStats', JSON.stringify(stats));
};

// ユーザー統計の取得
export const getUserStats = (): UserStats => {
  const stats = localStorage.getItem('userStats');
  if (stats) {
    return JSON.parse(stats);
  }
  return {
    userId: getUserId(),
    totalTests: 0,
    totalQuestions: 0,
    correctAnswers: 0,
    overallAccuracy: 0,
    categoryStats: {},
  };
};

// テストセッションの保存
export const saveTestSession = (session: TestSession): void => {
  localStorage.setItem('currentTestSession', JSON.stringify(session));
};

// テストセッションの取得
export const getTestSession = (): TestSession | null => {
  const session = localStorage.getItem('currentTestSession');
  return session ? JSON.parse(session) : null;
};

// テストセッションのクリア
export const clearTestSession = (): void => {
  localStorage.removeItem('currentTestSession');
};

// CSVエクスポート用のデータ取得
export const exportToCSV = (): string => {
  const results = getTestResults();
  const headers = ['テスト日時', 'カテゴリ', '問題', 'ユーザー回答', '正解', '正誤', '所要時間(秒)', 'スコア'];
  const rows = results.map(result => [
    new Date(result.testDate).toLocaleString('ja-JP'),
    result.category,
    result.questionSummary,
    result.userAnswer,
    result.correctAnswer,
    result.isCorrect ? '正解' : '不正解',
    result.timeSpent.toString(),
    result.score.toString()
  ]);
  
  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
  ].join('\n');
  
  return csvContent;
};

// 統計情報を全テスト結果から再計算
const recalculateUserStats = (): void => {
  const results = getTestResults();
  const userId = getUserId();
  
  if (results.length === 0) {
    // テスト結果がない場合は統計をリセット
    const emptyStats: UserStats = {
      userId,
      totalTests: 0,
      totalQuestions: 0,
      correctAnswers: 0,
      overallAccuracy: 0,
      categoryStats: {},
    };
    localStorage.setItem('userStats', JSON.stringify(emptyStats));
    return;
  }
  
  const stats: UserStats = {
    userId,
    totalTests: 0,
    totalQuestions: results.length,
    correctAnswers: 0,
    overallAccuracy: 0,
    categoryStats: {},
  };
  
  // カテゴリごとにグループ化
  const categoryMap: { [key: string]: TestResult[] } = {};
  
  results.forEach(result => {
    if (result.isCorrect) {
      stats.correctAnswers += 1;
    }
    
    if (!categoryMap[result.category]) {
      categoryMap[result.category] = [];
    }
    categoryMap[result.category].push(result);
  });
  
  // カテゴリ別統計を計算
  Object.keys(categoryMap).forEach(category => {
    const categoryResults = categoryMap[category];
    const correctCount = categoryResults.filter(r => r.isCorrect).length;
    
    stats.categoryStats[category] = {
      totalQuestions: categoryResults.length,
      correctAnswers: correctCount,
      accuracy: (correctCount / categoryResults.length) * 100,
    };
  });
  
  stats.overallAccuracy = stats.totalQuestions > 0 
    ? (stats.correctAnswers / stats.totalQuestions) * 100 
    : 0;
  
  stats.totalTests = Object.keys(categoryMap).length;
  stats.lastTestDate = results[results.length - 1]?.testDate;
  
  localStorage.setItem('userStats', JSON.stringify(stats));
};

// 指定日のデータを削除
export const deleteDataByDate = (date: Date): boolean => {
  try {
    const targetDate = date.toISOString().split('T')[0];
    const formattedDate = new Date(targetDate).toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    
    const confirmation = window.confirm(
      `${formattedDate}のデータを削除してもよろしいですか？\n\n削除対象:\n・テスト結果\n・カレンダーデータ\n・統計情報（再計算されます）`
    );
    
    if (!confirmation) {
      return false;
    }
    
    // 指定日以外のテスト結果を取得
    const allResults = getTestResults();
    const filteredResults = allResults.filter(result => {
      const resultDate = new Date(result.testDate).toISOString().split('T')[0];
      return resultDate !== targetDate;
    });
    
    // 削除された件数を確認
    const deletedCount = allResults.length - filteredResults.length;
    
    if (deletedCount === 0) {
      alert(`${formattedDate}のデータは見つかりませんでした。`);
      return false;
    }
    
    // フィルタ後のデータを保存
    localStorage.setItem('testResults', JSON.stringify(filteredResults));
    
    // 統計情報を再計算
    recalculateUserStats();
    
    alert(`${formattedDate}のデータを削除しました。\n削除件数: ${deletedCount}件`);
    window.location.reload();
    return true;
  } catch (error) {
    console.error('deleteDataByDate: エラー発生', error);
    alert('データの削除中にエラーが発生しました。');
    return false;
  }
};

// すべてのデータをクリア
export const clearAllData = (): boolean => {
  try {
    const confirmation = window.confirm(
      'すべてのデータを削除してもよろしいですか？\n\n削除対象:\n・全期間のテスト結果\n・カレンダーデータ\n・統計情報\n\nこの操作は取り消せません。'
    );
    
    if (!confirmation) {
      return false;
    }
    
    localStorage.removeItem('testResults');
    localStorage.removeItem('userStats');
    localStorage.removeItem('currentTestSession');
    localStorage.removeItem('reviewNotes'); // 🆕 復習ノートも削除
    localStorage.removeItem('learningHistory'); // 🆕 学習履歴も削除
    
    alert('すべてのデータを削除しました。');
    window.location.reload();
    return true;
  } catch (error) {
    console.error('clearAllData: エラー発生', error);
    alert('データの削除中にエラーが発生しました。');
    return false;
  }
};

// ========================================
// 🆕 復習ノート機能
// ========================================

export interface ReviewNote {
  questionId: string;
  category: string;
  question: string;
  wrongCount: number;
  lastAttemptDate: string;
  addedDate: string;
}

// 復習ノートに追加
export const addToReviewNote = (questionId: string, category: string, question: string): void => {
  const notes = getReviewNotes();
  const existing = notes.find(note => note.questionId === questionId);
  
  if (existing) {
    // 既存の場合は間違えた回数を増やす
    existing.wrongCount += 1;
    existing.lastAttemptDate = new Date().toISOString();
  } else {
    // 新規追加
    notes.push({
      questionId,
      category,
      question,
      wrongCount: 1,
      lastAttemptDate: new Date().toISOString(),
      addedDate: new Date().toISOString()
    });
  }
  
  localStorage.setItem('reviewNotes', JSON.stringify(notes));
};

// 復習ノートから削除（正解したとき）
export const removeFromReviewNote = (questionId: string): void => {
  const notes = getReviewNotes();
  const filtered = notes.filter(note => note.questionId !== questionId);
  localStorage.setItem('reviewNotes', JSON.stringify(filtered));
};

// すべての復習ノートを取得
export const getReviewNotes = (): ReviewNote[] => {
  const notes = localStorage.getItem('reviewNotes');
  return notes ? JSON.parse(notes) : [];
};

// カテゴリー別の復習ノートを取得
export const getReviewNotesByCategory = (category: string): ReviewNote[] => {
  return getReviewNotes().filter(note => note.category === category);
};

// 復習ノートの問題ID一覧を取得
export const getReviewNoteQuestionIds = (): string[] => {
  return getReviewNotes().map(note => note.questionId);
};

// ========================================
// 🆕 学習履歴機能
// ========================================

export interface LearningHistory {
  date: string; // 'YYYY-MM-DD'
  categories: string[];
  questionCount: number;
  correctCount: number;
  correctRate: number;
}

// 学習履歴を記録
export const recordLearningHistory = (category: string, questionCount: number, correctCount: number): void => {
  const history = getLearningHistory();
  const today = new Date().toISOString().split('T')[0];
  
  const existing = history.find(h => h.date === today);
  
  if (existing) {
    // 今日の記録がある場合は更新
    if (!existing.categories.includes(category)) {
      existing.categories.push(category);
    }
    existing.questionCount += questionCount;
    existing.correctCount += correctCount;
    existing.correctRate = (existing.correctCount / existing.questionCount) * 100;
  } else {
    // 新規追加
    history.push({
      date: today,
      categories: [category],
      questionCount,
      correctCount,
      correctRate: (correctCount / questionCount) * 100
    });
  }
  
  localStorage.setItem('learningHistory', JSON.stringify(history));
};

// 学習履歴を取得
export const getLearningHistory = (): LearningHistory[] => {
  const history = localStorage.getItem('learningHistory');
  return history ? JSON.parse(history) : [];
};

// 特定日の学習履歴を取得
export const getLearningHistoryByDate = (date: string): LearningHistory | undefined => {
  return getLearningHistory().find(h => h.date === date);
};

// 連続学習日数を取得
export const getConsecutiveLearningDays = (): number => {
  const history = getLearningHistory();
  if (history.length === 0) return 0;
  
  // 日付でソート（降順）
  const sorted = history.sort((a, b) => b.date.localeCompare(a.date));
  
  let count = 0;
  let currentDate = new Date();
  
  for (const record of sorted) {
    const recordDate = new Date(record.date);
    const diffDays = Math.floor((currentDate.getTime() - recordDate.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays === count) {
      count++;
    } else {
      break;
    }
  }
  
  return count;
};
