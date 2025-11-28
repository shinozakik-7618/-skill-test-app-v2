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

// すべてのデータをクリア
export const clearAllData = (): void => {
  console.log('clearAllData: 開始');
  try {
    const confirmation = window.confirm('すべてのデータを削除してもよろしいですか?');
    if (confirmation) {
      console.log('clearAllData: ユーザー確認OK');
      localStorage.removeItem('testResults');
      localStorage.removeItem('userStats');
      localStorage.removeItem('currentTestSession');
      console.log('clearAllData: localStorage削除完了');
      alert('すべてのデータを削除しました。');
      window.location.reload();
    } else {
      console.log('clearAllData: ユーザーキャンセル');
    }
  } catch (error) {
    console.error('clearAllData: エラー発生', error);
    alert('データの削除中にエラーが発生しました。');
  }
};
