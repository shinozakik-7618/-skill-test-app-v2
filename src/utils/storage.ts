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

// データのクリア（管理者用）
export const clearAllData = (): void => {
  if (confirm('すべてのデータを削除してもよろしいですか？この操作は取り消せません。')) {
    Object.values(STORAGE_KEYS).forEach(key => {
      localStorage.removeItem(key);
    });
    alert('すべてのデータを削除しました。');
    window.location.reload();
  }
};
