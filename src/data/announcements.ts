// 更新情報・お知らせデータ
import { Announcement } from '../types';

export const announcements: Announcement[] = [
  // 重要なお知らせ（バグ修正、削除機能など）
  {
    id: 'ann-007',
    type: 'important',
    title: '日付指定削除機能を追加',
    content: '管理画面から特定の日付のテスト結果を削除できる機能を追加しました。誤って入力したデータや特定日のデータのみを削除できます。統計情報は自動的に再計算されます。',
    date: '2025-11-28T15:00:00+09:00',
    isRead: false
  },
  {
    id: 'ann-005',
    type: 'important',
    title: 'システム完成: 全558問が利用可能になりました',
    content: '一般11カテゴリー(408問)とPC Depotカテゴリー(150問)の合計558問が完成し、すべての問題が利用可能になりました。最新のAI・DX基礎知識カテゴリーも追加され、管理職に必要な幅広い知識を学習できます。',
    date: '2025-11-25T08:00:00+09:00',
    isRead: false
  },
  
  // 更新（問題・機能の修正・改善）
  {
    id: 'ann-008',
    type: 'update',
    title: 'CSVエクスポート機能を改善',
    content: '管理画面からワンクリックでテスト結果をCSVファイルとしてダウンロードできるようになりました。ファイル名には日付が自動的に付与され、Excelやスプレッドシートで簡単に分析できます。',
    date: '2025-11-28T14:00:00+09:00',
    isRead: false
  },
  
  // 追加（新カテゴリ、新機能の追加）
  {
    id: 'ann-011',
    type: 'addition',
    title: 'AI・DX基礎知識 3問追加',
    content: 'AI・DX基礎知識カテゴリーに3問を追加し、合計8問になりました。日本新聞協会のAI基本計画意見書に関する最新の問題を追加。AI事業者の情報公開要請、報道コンテンツ無断利用の影響、企業の責任ある姿勢など、2025年11月の最新トピックから実践的な内容を学習できます。',
    category: 'AI・DX基礎知識',
    date: '2025-11-28T20:00:00+09:00',
    isRead: false
  },
  {
    id: 'ann-010',
    type: 'addition',
    title: '🆕 AI・DX基礎知識 カテゴリー (5問) 追加',
    content: '2025年11月最新のAI技術とデジタルトランスフォーメーション（DX）に関する新カテゴリーを追加しました。日本新聞協会のAI意見書、りそな銀行のAI融資審査、企業のAI導入課題、生成AIと知的財産、デジタルライフプランナーの提案視点など、実務に直結する最新トピックを学習できます。',
    category: 'AI・DX基礎知識',
    date: '2025-11-28T17:00:00+09:00',
    isRead: false
  },
  {
    id: 'ann-001',
    type: 'addition',
    title: 'PC Depotカテゴリー Day 21-30 (25問) 追加',
    content: 'IT・DX推進とESG・サステナビリティに関する25問を追加しました。デジタルトランスフォーメーション、クラウド、RPA、5G技術、カーボンニュートラル、ダイバーシティなど最新のテーマを網羅しています。',
    category: 'PC Depot',
    date: '2025-11-28T10:00:00+09:00',
    isRead: false
  },
  {
    id: 'ann-002',
    type: 'addition',
    title: 'PC Depotカテゴリー Day 11-20 (25問) 追加',
    content: '競合戦略・差別化と財務分析・KPIに関する25問を追加しました。大手量販店との差別化戦略、NCS会員継続率の分析、ストック型収益の財務的意義など、経営戦略と財務の視点から学習できます。',
    category: 'PC Depot',
    date: '2025-11-25T09:00:00+09:00',
    isRead: false
  },
  {
    id: 'ann-004',
    type: 'addition',
    title: '総務・一般管理カテゴリー (40問) 完成',
    content: '総務・一般管理カテゴリーの40問が完成しました。オフィス管理、施設管理、文書管理、リスクマネジメント、株主総会運営など、総務部門に必要な幅広い知識を習得できます。',
    category: '総務・一般管理',
    date: '2025-11-25T12:00:00+09:00',
    isRead: false
  },
  {
    id: 'ann-003',
    type: 'addition',
    title: '掲示板機能を追加',
    content: 'お知らせや更新情報を確認できる掲示板機能を追加しました。新しい問題の追加や機能改善などの情報をタイムリーにお届けします。',
    date: '2025-11-24T15:00:00+09:00',
    isRead: false
  },
  {
    id: 'ann-006',
    type: 'addition',
    title: 'CSV出力機能を追加',
    content: 'テスト結果をCSV形式で出力する機能を追加しました。テスト履歴をExcelやスプレッドシートで詳細に分析できます。',
    date: '2025-11-20T10:00:00+09:00',
    isRead: false
  }
];

// お知らせを日付順（新しい順）にソート
export const getAnnouncements = (): Announcement[] => {
  return [...announcements].sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );
};

// 未読のお知らせを取得
export const getUnreadAnnouncements = (): Announcement[] => {
  return getAnnouncements().filter(a => !a.isRead);
};

// 今週のお知らせを取得
export const getThisWeekAnnouncements = (): Announcement[] => {
  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
  
  return getAnnouncements().filter(a => 
    new Date(a.date) >= oneWeekAgo
  );
};

// タイプ別にお知らせを取得
export const getAnnouncementsByType = (type: 'update' | 'addition' | 'important'): Announcement[] => {
  return getAnnouncements().filter(a => a.type === type);
};

// 未読件数を取得
export const getUnreadCount = (): number => {
  const readIds = getReadAnnouncementIds();
  return announcements.filter(a => !readIds.includes(a.id)).length;
};

// 今週の未読件数を取得
export const getThisWeekUnreadCount = (): number => {
  const readIds = getReadAnnouncementIds();
  return getThisWeekAnnouncements().filter(a => !readIds.includes(a.id)).length;
};

// タイプ別の未読件数を取得
export const getUnreadCountByType = (type: 'update' | 'addition' | 'important'): number => {
  const readIds = getReadAnnouncementIds();
  return getAnnouncementsByType(type).filter(a => !readIds.includes(a.id)).length;
};

// 既読としてマーク
export const markAsRead = (announcementId: string): void => {
  const readIds = getReadAnnouncementIds();
  if (!readIds.includes(announcementId)) {
    readIds.push(announcementId);
    localStorage.setItem('readAnnouncements', JSON.stringify(readIds));
  }
};

// すべて既読としてマーク
export const markAllAsRead = (): void => {
  const allIds = announcements.map(a => a.id);
  localStorage.setItem('readAnnouncements', JSON.stringify(allIds));
};

// 既読のお知らせIDを取得
export const getReadAnnouncementIds = (): string[] => {
  const stored = localStorage.getItem('readAnnouncements');
  return stored ? JSON.parse(stored) : [];
};

// タイプのアイコンを取得
export const getTypeIcon = (type: string): string => {
  switch (type) {
    case 'update':
      return '🔄';
    case 'addition':
      return '✨';
    case 'important':
      return '⚠️';
    default:
      return '📌';
  }
};

// タイプのラベルを取得
export const getTypeLabel = (type: string): string => {
  switch (type) {
    case 'update':
      return '更新';
    case 'addition':
      return '追加';
    case 'important':
      return '重要';
    default:
      return 'お知らせ';
  }
};

// タイプの色を取得
export const getTypeColor = (type: string): string => {
  switch (type) {
    case 'update':
      return 'bg-blue-100 text-blue-800';
    case 'addition':
      return 'bg-green-100 text-green-800';
    case 'important':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};
