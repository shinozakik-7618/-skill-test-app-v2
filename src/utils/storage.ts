import { TestResult, UserStats, TestSession } from '../types';

// 復習ノートの型定義
export interface ReviewNote {
  questionId: string;
  category: string;
  wrongCount: number;
  lastAttempt: string;
}

// 学習履歴の型定義
export interface LearningHistory {
  date: string; // YYYY-MM-DD
  categories: string[];
  questionCount: number;
  correctRate: number;
}

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
  
  // 🆕 間違えた問題を復習ノートに追加
  if (!result.isCorrect) {
    addToReviewNote(result.questionId, result.category);
  } else {
    // 正解した場合は復習ノートから削除
    removeFromReviewNote(result.questionId);
  }
  
  // 🆕 学習履歴を記録
  recordLearningHistory(result.category, result.isCorrect);
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

// 🆕 復習ノート機能

// 復習ノートに追加
export const addToReviewNote = (questionId: string, category: string): void => {
  const notes = getReviewNotes();
  const existingNote = notes.find(note => note.questionId === questionId);
  
  if (existingNote) {
    existingNote.wrongCount += 1;
    existingNote.lastAttempt = new Date().toISOString();
  } else {
    notes.push({
      questionId,
      category,
      wrongCount: 1,
      lastAttempt: new Date().toISOString(),
    });
  }
  
  localStorage.setItem('reviewNotes', JSON.stringify(notes));
};

// 復習ノートから削除
export const removeFromReviewNote = (questionId: string): void => {
  const notes = getReviewNotes();
  const filtered = notes.filter(note => note.questionId !== questionId);
  localStorage.setItem('reviewNotes', JSON.stringify(filtered));
};

// 復習ノートを取得
export const getReviewNotes = (): ReviewNote[] => {
  const notes = localStorage.getItem('reviewNotes');
  return notes ? JSON.parse(notes) : [];
};

// カテゴリ別の復習ノートを取得
export const getReviewNotesByCategory = (category: string): ReviewNote[] => {
  return getReviewNotes().filter(note => note.category === category);
};

// 🆕 学習履歴機能

// 学習履歴を記録
export const recordLearningHistory = (category: string, isCorrect: boolean): void => {
  const today = new Date().toISOString().split('T')[0];
  const histories = getLearningHistories();
  
  let todayHistory = histories.find(h => h.date === today);
  
  if (!todayHistory) {
    todayHistory = {
      date: today,
      categories: [],
      questionCount: 0,
      correctRate: 0,
    };
    histories.push(todayHistory);
  }
  
  // カテゴリを追加（重複なし）
  if (!todayHistory.categories.includes(category)) {
    todayHistory.categories.push(category);
  }
  
  // 問題数をカウント
  todayHistory.questionCount += 1;
  
  // 正解率を再計算（その日のテスト結果から）
  const todayResults = getTestResultsByDate(new Date(today));
  const correctCount = todayResults.filter(r => r.isCorrect).length;
  todayHistory.correctRate = (correctCount / todayResults.length) * 100;
  
  localStorage.setItem('learningHistories', JSON.stringify(histories));
};

// 学習履歴を取得
export const getLearningHistories = (): LearningHistory[] => {
  const histories = localStorage.getItem('learningHistories');
  return histories ? JSON.parse(histories) : [];
};

// 特定日の学習履歴を取得
export const getLearningHistoryByDate = (date: Date): LearningHistory | null => {
  const targetDate = date.toISOString().split('T')[0];
  const histories = getLearningHistories();
  return histories.find(h => h.date === targetDate) || null;
};

// 連続学習日数を取得
export const getConsecutiveDays = (): number => {
  const histories = getLearningHistories();
  if (histories.length === 0) return 0;
  
  // 日付順にソート
  const sortedHistories = histories.sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );
  
  let consecutiveDays = 0;
  const today = new Date().toISOString().split('T')[0];
  let currentDate = new Date(today);
  
  for (const history of sortedHistories) {
    const historyDate = history.date;
    const expectedDate = currentDate.toISOString().split('T')[0];
    
    if (historyDate === expectedDate) {
      consecutiveDays += 1;
      currentDate.setDate(currentDate.getDate() - 1);
    } else {
      break;
    }
  }
  
  return consecutiveDays;
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
    
    // 学習履歴も削除
    const histories = getLearningHistories();
    const filteredHistories = histories.filter(h => h.date !== targetDate);
    localStorage.setItem('learningHistories', JSON.stringify(filteredHistories));
    
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
      'すべてのデータを削除してもよろしいですか？\n\n削除対象:\n・全期間のテスト結果\n・カレンダーデータ\n・統計情報\n・復習ノート\n\nこの操作は取り消せません。'
    );
    
    if (!confirmation) {
      return false;
    }
    
    localStorage.removeItem('testResults');
    localStorage.removeItem('userStats');
    localStorage.removeItem('currentTestSession');
    localStorage.removeItem('reviewNotes');
    localStorage.removeItem('learningHistories');
    
    alert('すべてのデータを削除しました。');
    window.location.reload();
    return true;
  } catch (error) {
    console.error('clearAllData: エラー発生', error);
    alert('データの削除中にエラーが発生しました。');
    return false;
  }
};
