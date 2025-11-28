import { TestResult, UserStats, TestSession } from '../types';

const STORAGE_KEYS = {
  TEST_RESULTS: 'skillTest_results',
  USER_STATS: 'skillTest_stats',
  CURRENT_SESSION: 'skillTest_session',
  USER_ID: 'skillTest_userId'
};

// ユーザーID取得または生成
export const getUserId = (): string => {
  let userId = localStorage.getItem(STORAGE_KEYS.USER_ID);
  if (!userId) {
    userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem(STORAGE_KEYS.USER_ID, userId);
  }
  return userId;
};

// テスト結果の保存
export const saveTestResult = (result: TestResult): void => {
  const results = getTestResults();
  results.push(result);
  localStorage.setItem(STORAGE_KEYS.TEST_RESULTS, JSON.stringify(results));
  updateUserStats(result);
};

// テスト結果の取得
export const getTestResults = (): TestResult[] => {
  const data = localStorage.getItem(STORAGE_KEYS.TEST_RESULTS);
  return data ? JSON.parse(data) : [];
};

// 特定日のテスト結果取得
export const getTestResultsByDate = (date: string): TestResult[] => {
  const results = getTestResults();
  return results.filter(r => r.testDate.startsWith(date));
};

// カテゴリー別テスト結果取得
export const getTestResultsByCategory = (category: string): TestResult[] => {
  const results = getTestResults();
  return results.filter(r => r.category === category);
};

// 間違えた問題のID取得
export const getIncorrectQuestionIds = (): string[] => {
  const results = getTestResults();
  return results.filter(r => !r.isCorrect).map(r => r.questionId);
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
  stats.lastTestDate = result.testDate;

  // カテゴリー別統計更新
  if (!stats.categoryStats[result.category]) {
    stats.categoryStats[result.category] = { total: 0, correct: 0, accuracy: 0 };
  }
  stats.categoryStats[result.category].total += 1;
  if (result.isCorrect) {
    stats.categoryStats[result.category].correct += 1;
  }
  stats.categoryStats[result.category].accuracy = 
    (stats.categoryStats[result.category].correct / stats.categoryStats[result.category].total) * 100;

  localStorage.setItem(STORAGE_KEYS.USER_STATS, JSON.stringify(stats));
};

// ユーザー統計の取得
export const getUserStats = (): UserStats => {
  const data = localStorage.getItem(STORAGE_KEYS.USER_STATS);
  if (data) {
    return JSON.parse(data);
  }
  return {
    userId: getUserId(),
    totalTests: 0,
    totalQuestions: 0,
    correctAnswers: 0,
    overallAccuracy: 0,
    categoryStats: {}
  };
};

// テストセッションの保存
export const saveTestSession = (session: TestSession): void => {
  localStorage.setItem(STORAGE_KEYS.CURRENT_SESSION, JSON.stringify(session));
};

// テストセッションの取得
export const getTestSession = (): TestSession | null => {
  const data = localStorage.getItem(STORAGE_KEYS.CURRENT_SESSION);
  return data ? JSON.parse(data) : null;
};

// テストセッションのクリア
export const clearTestSession = (): void => {
  localStorage.removeItem(STORAGE_KEYS.CURRENT_SESSION);
};

// CSVエクスポート
export const exportToCSV = (): string => {
  const results = getTestResults();
  const headers = [
    'ユーザーID',
    '実施日時',
    'カテゴリー',
    '問題ID',
    '問題文要約',
    '正解',
    '回答',
    '正誤',
    '所要時間（秒）',
    '得点',
    '累積正答率'
  ];

  const stats = getUserStats();
  const csvRows = [headers.join(',')];

  results.forEach(result => {
    const row = [
      result.userId,
      result.testDate,
      result.category,
      result.questionId,
      `"${result.questionSummary}"`,
      result.correctAnswer,
      result.userAnswer,
      result.isCorrect ? '○' : '×',
      result.timeSpent.toString(),
      result.score.toString(),
      `${stats.overallAccuracy.toFixed(1)}%`
    ];
    csvRows.push(row.join(','));
  });

  return csvRows.join('\n');
};

// データのクリア（管理者用）- 改善版
export const clearAllData = (): void => {
  try {
    // 削除前のデータ数を確認
    const beforeCount = getTestResults().length;
    console.log('削除前のデータ数:', beforeCount);
    
    if (!confirm('すべてのデータを削除してもよろしいですか？この操作は取り消せません。')) {
      console.log('削除がキャンセルされました');
      return;
    }
    
    // データ削除実行
    Object.values(STORAGE_KEYS).forEach(key => {
      localStorage.removeItem(key);
      console.log('削除:', key);
    });
    
    // 削除後の確認
    const afterCount = getTestResults().length;
    console.log('削除後のデータ数:', afterCount);
    
    alert(`すべてのデータを削除しました。\n削除されたデータ数: ${beforeCount}件`);
    
    // ページリロード
    window.location.reload();
  } catch (error) {
    console.error('データ削除エラー:', error);
    alert('データ削除中にエラーが発生しました。ブラウザの設定を確認してください。');
  }
};

// 選択的データ削除機能（新規追加）
export const clearSelectedData = (options: {
  clearResults?: boolean;
  clearStats?: boolean;
  clearSession?: boolean;
  clearUserId?: boolean;
}): void => {
  try {
    let deletedCount = 0;
    const deletedItems: string[] = [];

    if (options.clearResults) {
      const count = getTestResults().length;
      localStorage.removeItem(STORAGE_KEYS.TEST_RESULTS);
      deletedCount += count;
      deletedItems.push(`テスト結果(${count}件)`);
    }

    if (options.clearStats) {
      localStorage.removeItem(STORAGE_KEYS.USER_STATS);
      deletedItems.push('統計情報');
    }

    if (options.clearSession) {
      localStorage.removeItem(STORAGE_KEYS.CURRENT_SESSION);
      deletedItems.push('セッション');
    }

    if (options.clearUserId) {
      localStorage.removeItem(STORAGE_KEYS.USER_ID);
      deletedItems.push('ユーザーID');
    }

    if (deletedItems.length > 0) {
      alert(`以下のデータを削除しました:\n${deletedItems.join('\n')}`);
      window.location.reload();
    } else {
      alert('削除するデータが選択されていません。');
    }
  } catch (error) {
    console.error('選択的削除エラー:', error);
    alert('データ削除中にエラーが発生しました。');
  }
};
