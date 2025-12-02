// ローカルストレージ管理ユーティリティ（データ保護機能付き）

// ========================================
// 型定義
// ========================================

export interface Question {
  id: string;
  category: string;
  question: string;
  options: { id: string; text: string }[];
  correctAnswer: string;
  explanation: string;
}

export interface TestResult {
  questionId: string;
  selectedAnswer: string;
  isCorrect: boolean;
  timestamp: string;
  category: string;
}

export interface SavedTestResult {
  id: string;
  date: string;
  results: TestResult[];
  score: number;
  total: number;
}

export interface UserStats {
  totalTests: number;
  totalQuestions: number;
  correctAnswers: number;
  wrongAnswers: number;
  lastTestDate: string;
}

export interface ReviewNote {
  questionId: string;
  category: string;
  wrongCount: number;
  lastAttempt: string;
}

export interface LearningHistory {
  date: string; // YYYY-MM-DD
  categories: string[];
  questionCount: number;
  correctRate: number;
  correctCount: number; // 正解数を追加
}

// ========================================
// ストレージキー定数
// ========================================

const STORAGE_KEYS = {
  QUESTIONS: 'skillTestQuestions',
  TEST_RESULTS: 'testResults',
  USER_STATS: 'userStats',
  REVIEW_NOTES: 'reviewNotes',
  LEARNING_HISTORY: 'learningHistories',
  BACKUP_PREFIX: 'backup_',
  LAST_BACKUP: 'lastBackupDate',
} as const;

// ========================================
// データ保護機能
// ========================================

/**
 * データのバックアップを作成
 */
const createBackup = (key: string, data: any): void => {
  try {
    const backupKey = `${STORAGE_KEYS.BACKUP_PREFIX}${key}`;
    const backupData = {
      timestamp: new Date().toISOString(),
      data: data,
    };
    localStorage.setItem(backupKey, JSON.stringify(backupData));
    localStorage.setItem(STORAGE_KEYS.LAST_BACKUP, new Date().toISOString());
    console.log('✅ [BACKUP] バックアップ作成:', backupKey);
  } catch (error) {
    console.error('❌ [BACKUP] バックアップ作成失敗:', error);
  }
};

/**
 * バックアップからデータを復元
 */
const restoreFromBackup = (key: string): any | null => {
  try {
    const backupKey = `${STORAGE_KEYS.BACKUP_PREFIX}${key}`;
    const backupStr = localStorage.getItem(backupKey);
    if (!backupStr) return null;

    const backup = JSON.parse(backupStr);
    console.log('🔄 [BACKUP] バックアップから復元:', {
      key: backupKey,
      timestamp: backup.timestamp,
    });
    return backup.data;
  } catch (error) {
    console.error('❌ [BACKUP] バックアップ復元失敗:', error);
    return null;
  }
};

/**
 * データの整合性チェック
 */
const validateData = (key: string, data: any): boolean => {
  try {
    if (!data) return false;

    switch (key) {
      case STORAGE_KEYS.LEARNING_HISTORY:
        if (!Array.isArray(data)) return false;
        return data.every(item => 
          item.date && 
          Array.isArray(item.categories) && 
          typeof item.questionCount === 'number' &&
          typeof item.correctRate === 'number'
        );

      case STORAGE_KEYS.REVIEW_NOTES:
        if (!Array.isArray(data)) return false;
        return data.every(item =>
          item.questionId &&
          item.category &&
          typeof item.wrongCount === 'number'
        );

      case STORAGE_KEYS.TEST_RESULTS:
        if (!Array.isArray(data)) return false;
        return data.every(item =>
          item.id &&
          item.date &&
          Array.isArray(item.results)
        );

      default:
        return true;
    }
  } catch (error) {
    console.error('❌ [VALIDATE] データ検証失敗:', error);
    return false;
  }
};

/**
 * 安全なlocalStorage読み込み
 */
const safeGetItem = <T>(key: string, defaultValue: T): T => {
  try {
    const item = localStorage.getItem(key);
    if (!item) return defaultValue;

    const parsed = JSON.parse(item);
    
    // データ検証
    if (!validateData(key, parsed)) {
      console.warn('⚠️ [STORAGE] データ検証失敗、バックアップから復元を試みます:', key);
      const backup = restoreFromBackup(key);
      if (backup && validateData(key, backup)) {
        // バックアップが有効な場合、それを使用
        localStorage.setItem(key, JSON.stringify(backup));
        return backup;
      }
      return defaultValue;
    }

    return parsed;
  } catch (error) {
    console.error('❌ [STORAGE] 読み込みエラー:', key, error);
    
    // バックアップから復元を試みる
    const backup = restoreFromBackup(key);
    if (backup) {
      localStorage.setItem(key, JSON.stringify(backup));
      return backup;
    }
    
    return defaultValue;
  }
};

/**
 * 安全なlocalStorage書き込み
 */
const safeSetItem = (key: string, value: any): boolean => {
  try {
    // 書き込み前にバックアップを作成
    const currentData = localStorage.getItem(key);
    if (currentData) {
      createBackup(key, JSON.parse(currentData));
    }

    // データ検証
    if (!validateData(key, value)) {
      console.error('❌ [STORAGE] データ検証失敗、書き込み中止:', key);
      return false;
    }

    // 書き込み実行
    localStorage.setItem(key, JSON.stringify(value));
    console.log('✅ [STORAGE] データ保存成功:', key);
    return true;
  } catch (error) {
    console.error('❌ [STORAGE] 書き込みエラー:', key, error);
    
    // エラー時はバックアップから復元
    const backup = restoreFromBackup(key);
    if (backup) {
      try {
        localStorage.setItem(key, JSON.stringify(backup));
        console.log('🔄 [STORAGE] バックアップから復元しました:', key);
      } catch (restoreError) {
        console.error('❌ [STORAGE] バックアップ復元も失敗:', restoreError);
      }
    }
    return false;
  }
};

// ========================================
// 問題データ管理
// ========================================

export const getQuestions = (): Question[] => {
  return safeGetItem<Question[]>(STORAGE_KEYS.QUESTIONS, []);
};

export const saveQuestions = (questions: Question[]): void => {
  safeSetItem(STORAGE_KEYS.QUESTIONS, questions);
};

// ========================================
// テスト結果管理
// ========================================

export const saveTestResult = (results: TestResult[]): SavedTestResult => {
  const testResults = safeGetItem<SavedTestResult[]>(STORAGE_KEYS.TEST_RESULTS, []);
  
  const correctCount = results.filter(r => r.isCorrect).length;
  const newResult: SavedTestResult = {
    id: `test_${Date.now()}`,
    date: new Date().toISOString(),
    results,
    score: correctCount,
    total: results.length,
  };

  testResults.push(newResult);
  safeSetItem(STORAGE_KEYS.TEST_RESULTS, testResults);

  // ユーザー統計を更新
  updateUserStats(results);

  // 復習ノートを更新
  updateReviewNotes(results);

  // 学習履歴を記録
  recordLearningHistory(results);

  console.log('✅ [STORAGE] テスト結果を保存:', newResult.id);
  return newResult;
};

export const getTestResults = (): SavedTestResult[] => {
  return safeGetItem<SavedTestResult[]>(STORAGE_KEYS.TEST_RESULTS, []);
};

export const getTestResultById = (id: string): SavedTestResult | undefined => {
  const results = getTestResults();
  return results.find(r => r.id === id);
};

export const getTestResultsByDate = (date: string): TestResult[] => {
  const allResults = getTestResults();
  const targetDate = new Date(date).toISOString().split('T')[0];
  
  const dayResults = allResults
    .filter(result => {
      const resultDate = new Date(result.date).toISOString().split('T')[0];
      return resultDate === targetDate;
    })
    .flatMap(result => result.results);

  console.log('🔍 [DEBUG] getTestResultsByDate:', {
    targetDate,
    foundResults: dayResults.length,
  });

  return dayResults;
};

// ========================================
// ユーザー統計管理
// ========================================

const updateUserStats = (results: TestResult[]): void => {
  const stats = safeGetItem<UserStats>(STORAGE_KEYS.USER_STATS, {
    totalTests: 0,
    totalQuestions: 0,
    correctAnswers: 0,
    wrongAnswers: 0,
    lastTestDate: '',
  });

  const correctCount = results.filter(r => r.isCorrect).length;
  const wrongCount = results.length - correctCount;

  stats.totalTests += 1;
  stats.totalQuestions += results.length;
  stats.correctAnswers += correctCount;
  stats.wrongAnswers += wrongCount;
  stats.lastTestDate = new Date().toISOString();

  safeSetItem(STORAGE_KEYS.USER_STATS, stats);
};

export const getUserStats = (): UserStats => {
  return safeGetItem<UserStats>(STORAGE_KEYS.USER_STATS, {
    totalTests: 0,
    totalQuestions: 0,
    correctAnswers: 0,
    wrongAnswers: 0,
    lastTestDate: '',
  });
};

// ========================================
// 復習ノート管理
// ========================================

const updateReviewNotes = (results: TestResult[]): void => {
  const reviewNotes = safeGetItem<ReviewNote[]>(STORAGE_KEYS.REVIEW_NOTES, []);

  results.forEach(result => {
    const existingNote = reviewNotes.find(note => note.questionId === result.questionId);

    if (!result.isCorrect) {
      // 不正解の場合、復習ノートに追加または更新
      if (existingNote) {
        existingNote.wrongCount += 1;
        existingNote.lastAttempt = result.timestamp;
      } else {
        reviewNotes.push({
          questionId: result.questionId,
          category: result.category,
          wrongCount: 1,
          lastAttempt: result.timestamp,
        });
      }
    } else {
      // 正解の場合、復習ノートから削除
      const index = reviewNotes.findIndex(note => note.questionId === result.questionId);
      if (index !== -1) {
        reviewNotes.splice(index, 1);
      }
    }
  });

  safeSetItem(STORAGE_KEYS.REVIEW_NOTES, reviewNotes);
  console.log('✅ [STORAGE] 復習ノートを更新:', reviewNotes.length);
};

export const getReviewNotes = (): ReviewNote[] => {
  return safeGetItem<ReviewNote[]>(STORAGE_KEYS.REVIEW_NOTES, []);
};

export const deleteReviewNote = (questionId: string): void => {
  const reviewNotes = getReviewNotes();
  const updatedNotes = reviewNotes.filter(note => note.questionId !== questionId);
  safeSetItem(STORAGE_KEYS.REVIEW_NOTES, updatedNotes);
};

// ========================================
// 学習履歴管理
// ========================================

const recordLearningHistory = (results: TestResult[]): void => {
  const histories = safeGetItem<LearningHistory[]>(STORAGE_KEYS.LEARNING_HISTORY, []);
  const today = new Date().toISOString().split('T')[0];

  console.log('🔍 [DEBUG] recordLearningHistory 開始:', {
    today,
    resultsCount: results.length,
  });

  let todayHistory = histories.find(h => h.date === today);

  if (!todayHistory) {
    todayHistory = {
      date: today,
      categories: [],
      questionCount: 0,
      correctRate: 0,
      correctCount: 0,
    };
    histories.push(todayHistory);
  }

  // カテゴリーを追加（重複なし）
  results.forEach(result => {
    if (!todayHistory!.categories.includes(result.category)) {
      todayHistory!.categories.push(result.category);
    }
  });

  // その日のすべてのテスト結果を取得して再計算
  const todayResults = getTestResultsByDate(today);
  todayHistory.questionCount = todayResults.length;
  todayHistory.correctCount = todayResults.filter(r => r.isCorrect).length;
  todayHistory.correctRate = todayHistory.questionCount > 0
    ? Math.round((todayHistory.correctCount / todayHistory.questionCount) * 100)
    : 0;

  console.log('🔍 [DEBUG] 学習履歴を更新:', todayHistory);

  safeSetItem(STORAGE_KEYS.LEARNING_HISTORY, histories);
};

export const getLearningHistories = (): LearningHistory[] => {
  return safeGetItem<LearningHistory[]>(STORAGE_KEYS.LEARNING_HISTORY, []);
};

export const getLearningHistoryByDate = (date: string): LearningHistory | undefined => {
  const histories = getLearningHistories();
  return histories.find(h => h.date === date);
};

export const getConsecutiveDays = (): number => {
  const histories = getLearningHistories();
  if (histories.length === 0) return 0;

  // 日付順にソート（新しい順）
  const sortedHistories = [...histories].sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  const today = new Date().toISOString().split('T')[0];
  let consecutiveDays = 0;
  let currentDate = new Date(today);

  // 今日から過去に向かって連続日数をカウント
  for (const history of sortedHistories) {
    const historyDate = new Date(history.date).toISOString().split('T')[0];
    const checkDate = currentDate.toISOString().split('T')[0];

    if (historyDate === checkDate) {
      consecutiveDays++;
      currentDate.setDate(currentDate.getDate() - 1);
    } else {
      break;
    }
  }

  return consecutiveDays;
};

// ========================================
// データメンテナンス機能
// ========================================

/**
 * すべてのバックアップを表示
 */
export const listBackups = (): void => {
  console.log('📋 [BACKUP] バックアップ一覧:');
  Object.keys(localStorage)
    .filter(key => key.startsWith(STORAGE_KEYS.BACKUP_PREFIX))
    .forEach(key => {
      try {
        const backup = JSON.parse(localStorage.getItem(key) || '{}');
        console.log(`  - ${key}: ${backup.timestamp}`);
      } catch (error) {
        console.error(`  - ${key}: 読み込みエラー`);
      }
    });
};

/**
 * データ整合性チェック
 */
export const checkDataIntegrity = (): void => {
  console.log('🔍 [CHECK] データ整合性チェック開始');
  
  const checks = [
    { key: STORAGE_KEYS.LEARNING_HISTORY, name: '学習履歴' },
    { key: STORAGE_KEYS.REVIEW_NOTES, name: '復習ノート' },
    { key: STORAGE_KEYS.TEST_RESULTS, name: 'テスト結果' },
  ];

  checks.forEach(({ key, name }) => {
    const data = localStorage.getItem(key);
    if (!data) {
      console.warn(`⚠️ [CHECK] ${name} が存在しません`);
      return;
    }

    try {
      const parsed = JSON.parse(data);
      const isValid = validateData(key, parsed);
      console.log(`${isValid ? '✅' : '❌'} [CHECK] ${name}: ${isValid ? '正常' : '異常'}`);
    } catch (error) {
      console.error(`❌ [CHECK] ${name}: パースエラー`);
    }
  });
};
/**
 * 間違えた問題のIDリストを取得
 * ReviewPage.tsx で使用
 */
export const getIncorrectQuestionIds = (): string[] => {
  const reviewNotes = getReviewNotes();
  return reviewNotes.map(note => note.questionId);
};
export default {
  getQuestions,
  saveQuestions,
  saveTestResult,
  getTestResults,
  getTestResultById,
  getUserStats,
  getReviewNotes,
  deleteReviewNote,
  getLearningHistories,
  getLearningHistoryByDate,
  getConsecutiveDays,
  getIncorrectQuestionIds,
  checkDataIntegrity,
  listBackups,
};
