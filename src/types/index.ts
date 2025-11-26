export interface Question {
  id: string;
  category: string;
  question: string;  // 問題文
  options: string[]; // 選択肢配列 [選択肢1, 選択肢2, 選択肢3, 選択肢4]
  correctAnswer: number; // 正解のインデックス (0-3)
  explanation: string;
}

export interface TestResult {
  id: string;
  userId: string;
  category: string;
  questionId: string;
  questionSummary: string;
  userAnswer: number; // 回答のインデックス (0-3)
  correctAnswer: number; // 正解のインデックス (0-3)
  isCorrect: boolean;
  timeSpent: number; // seconds
  score: number;
  testDate: string;
}

export interface TestSession {
  id: string;
  userId: string;
  category: string;
  questions: Question[];
  answers: Map<string, number>; // questionId -> 回答インデックス (0-3)
  startTime: string;
  endTime?: string;
  totalScore?: number;
}

export interface UserStats {
  userId: string;
  totalTests: number;
  totalQuestions: number;
  correctAnswers: number;
  overallAccuracy: number;
  categoryStats: Record<string, {
    total: number;
    correct: number;
    accuracy: number;
  }>;
  lastTestDate?: string;
}

export type Category = 
  | '財務会計・経理'
  | '法務・コンプライアンス'
  | 'ガバナンス・内部統制'
  | '人事・労務管理'
  | '経営戦略・企画'
  | '業務プロセス・効率化'
  | '組織マネジメント'
  | '情報システム・IT管理'
  | '総務・一般管理'
  | 'コミュニケーション・報告'
  | 'PCデポ'
  | 'AI・DXニュース';

// 掲示板のお知らせ型
export interface Announcement {
  id: string;
  type: 'new' | 'update' | 'feature' | 'important'; // 🆕新着 📝更新 🔧機能 ⚠️重要
  title: string;
  content: string;
  category?: string; // 関連カテゴリー
  date: string; // ISO 8601形式
  isRead?: boolean; // 既読フラグ
}
