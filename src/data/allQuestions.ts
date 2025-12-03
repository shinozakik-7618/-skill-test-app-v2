// 全問題データの統合ファイル
// 全11カテゴリー + PC Depot = 560問

import { Question } from '../types';
import { financeQuestions } from './questions-finance';
import { legalQuestions } from './questions-legal';
import { governanceQuestions } from './questions-governance';
import { hrQuestions } from './questions-hr';
import { strategyQuestions } from './questions-strategy';
import { processQuestions } from './questions-process';
import { organizationQuestions } from './questions-organization';
import { itQuestions } from './questions-it';
import { questionsGeneral } from './questions-general';
import { questionsCommunication } from './questions-communication';
import { aidxQuestions } from './questions-aidx';
import { questionsPCDepot } from './questions-pcdepot';

// 全問題を統合
const _allQuestionsArray: Question[] = [
  ...financeQuestions,         // カテゴリー1: 財務会計・経理 (40問)
  ...legalQuestions,          // カテゴリー2: 法務・コンプライアンス (40問)
  ...governanceQuestions,     // カテゴリー3: ガバナンス・内部統制 (40問)
  ...hrQuestions,             // カテゴリー4: 人事・労務管理 (40問)
  ...strategyQuestions,       // カテゴリー5: 経営戦略・企画 (40問)
  ...processQuestions,        // カテゴリー6: 業務プロセス・効率化 (40問)
  ...organizationQuestions,   // カテゴリー7: 組織マネジメント (40問)
  ...itQuestions,             // カテゴリー8: 情報システム・IT管理 (40問)
  ...questionsGeneral,        // カテゴリー9: 総務・一般管理 (40問)
  ...questionsCommunication,  // カテゴリー10: コミュニケーション・報告 (40問)
  ...aidxQuestions,           // カテゴリー11: AI・DX基礎知識 (10問) 🆕
  ...questionsPCDepot         // PC Depotカテゴリー (150問)
];

// 配列であることを保証してエクスポート
export const allQuestions: Question[] = Array.isArray(_allQuestionsArray) 
  ? _allQuestionsArray 
  : [];

// デバッグログ
console.log('✅ allQuestions initialized:', {
  isArray: Array.isArray(allQuestions),
  length: allQuestions.length,
  type: typeof allQuestions
});

// カテゴリーIDから日本語名へのマッピング
const categoryIdToName: { [key: string]: string } = {
  'finance': '財務会計・経理',
  'legal': '法務・コンプライアンス',
  'governance': 'ガバナンス・内部統制',
  'hr': '人事・労務管理',
  'strategy': '経営戦略・企画',
  'process': '業務プロセス・効率化',
  'organization': '組織マネジメント',
  'it': '情報システム・IT管理',
  'general': '総務・一般管理',
  'communication': 'コミュニケーション・報告',
  'aidx': 'AI・DX基礎知識', // 🆕
  'pcdepot': 'PC Depot'
};

// カテゴリー別に問題を取得
export const getQuestionsByCategory = (category: string): Question[] => {
  // 配列チェック
  if (!Array.isArray(allQuestions)) {
    console.error('❌ allQuestions is not an array in getQuestionsByCategory!', allQuestions);
    return [];
  }
  
  // カテゴリーIDが渡された場合は日本語名に変換
  const categoryName = categoryIdToName[category] || category;
  return allQuestions.filter(q => q.category === categoryName);
};

// カテゴリー一覧
export const categories = [
  { id: 'finance', name: '財務会計・経理', questionCount: 40 },
  { id: 'legal', name: '法務・コンプライアンス', questionCount: 40 },
  { id: 'governance', name: 'ガバナンス・内部統制', questionCount: 40 },
  { id: 'hr', name: '人事・労務管理', questionCount: 40 },
  { id: 'strategy', name: '経営戦略・企画', questionCount: 40 },
  { id: 'process', name: '業務プロセス・効率化', questionCount: 40 },
  { id: 'organization', name: '組織マネジメント', questionCount: 40 },
  { id: 'it', name: '情報システム・IT管理', questionCount: 40 },
  { id: 'general', name: '総務・一般管理', questionCount: 40 },
  { id: 'communication', name: 'コミュニケーション・報告', questionCount: 40 },
  { id: 'aidx', name: 'AI・DX基礎知識', questionCount: 10 }, // 🆕 10問に更新
  { id: 'pcdepot', name: 'PC Depot', questionCount: 150 }
];

// ランダムに指定数の問題を取得
export const getRandomQuestions = (count: number, category?: string): Question[] => {
  const sourceQuestions = category 
    ? getQuestionsByCategory(category)
    : allQuestions;
  
  const shuffled = [...sourceQuestions].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, Math.min(count, sourceQuestions.length));
};

// 統計情報
export const getStatistics = () => {
  return {
    totalQuestions: allQuestions.length,
    categoriesCount: categories.length,
    averageQuestionsPerCategory: Math.round(allQuestions.length / categories.length)
  };
};

// カテゴリー別の統計
export const getCategoryStatistics = () => {
  return categories.map(cat => ({
    ...cat,
    actualCount: getQuestionsByCategory(cat.id).length // IDを使用して取得
  }));
};