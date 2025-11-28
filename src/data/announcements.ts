// 更新情報・お知らせデータ
import { Announcement } from '../types';

export const announcements: Announcement[] = [
  // 最新のシステム更新
  {
    id: 'ann-007',
    type: 'system',
    title: '日付指定削除機能を追加',
    content: '管理画面から特定の日付のテスト結果を削除できる機能を追加しました。誤って入力したデータや特定日のデータのみを削除できます。統計情報は自動的に再計算されます。',
    date: '2025-01-18T15:00:00+09:00',
    isRead: false
  },
  {
    id: 'ann-008',
    type: 'system',
    title: 'CSVエクスポート機能を改善',
    content: '管理画面からワンクリックでテスト結果をCSVファイルとしてダウンロードできるようになりました。ファイル名には日付が自動的に付与され、Excelやスプレッドシートで簡単に分析できます。',
    date: '2025-01-18T14:00:00+09:00',
    isRead: false
  },
  
  // 過去の問題更新
  {
    id: 'ann-001',
    type: 'question',
    title: 'PC Depotカテゴリー Day 21-30 (25問) 追加',
    content: 'IT・DX推進とESG・サステナビリティに関する25問を追加しました。デジタルトランスフォーメーション、クラウド、RPA、5G技術、カーボンニュートラル、ダイバーシティなど最新のテーマを網羅しています。',
    category: 'PC Depot',
    date: '2025-01-15T10:00:00+09:00',
    isRead: false
  },
  {
    id: 'ann-002',
    type: 'question',
    title: 'PC Depotカテゴリー Day 11-20 (25問) 追加',
    content: '競合戦略・差別化と財務分析・KPIに関する25問を追加しました。大手量販店との差別化戦略、NCS会員継続率の分析、ストック型収益の財務的意義など、経営戦略と財務の視点から学習できます。',
    category: 'PC Depot',
    date: '2025-01-15T09:00:00+09:00',
    isRead: false
  },
  {
    id: 'ann-003',
    type: 'question',
    title: '総務・一般管理カテゴリー (40問) 完成',
    content: '株主総会運営、登記実務、文書管理、契約管理、BCP策定など、総務部門に必要な21のテーマをカバーする40問が完成しました。',
    category: '総務・一般管理',
    date: '2025-01-14T15:00:00+09:00',
    isRead: false
  },
  
  // 過去のシステム更新
  {
    id: 'ann-004',
    type: 'system',
    title: '掲示板機能を追加',
    content: '更新情報やお知らせを確認できる掲示板機能を追加しました。新しい問題の追加や機能追加の情報をリアルタイムで確認できます。',
    date: '2025-01-15T12:00:00+09:00',
    isRead: false
  },
  {
    id: 'ann-006',
    type: 'system',
    title: 'CSV出力機能の基盤を実装',
    content: 'テスト結果をCSV形式でエクスポートする機能の基盤を実装しました。学習履歴の記録管理にご活用ください。',
    date: '2025-01-10T10:00:00+09:00',
    isRead: false
  },
  
  // 重要なお知らせ
  {
    id: 'ann-005',
    type: 'important',
    title: 'システム完成: 全550問が利用可能になりました',
    content: '一般10カテゴリー(400問)とPC Depotカテゴリー(150問)の合計550問が完成し、すべての問題が利用可能になりました。管理職に必要な幅広い知識を学習できます。',
    date: '2025-01-15T08:00:00+09:00',
    isRead: false
  }
];

// お知らせを日付順(新しい順)に取得
export const getAnnouncements = (): Announcement[] => {
  return [...announcements].sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );
};

// タイプ別にお知らせを取得
export const getAnnouncementsByType = (type: 'question' | 'system' | 'important'): Announcement[] => {
  return getAnnouncements().filter(ann => ann.type === type);
};

// 未読のお知らせを取得
export const getUnreadAnnouncements = (): Announcement[] => {
  const readIds = getReadAnnouncementIds();
  return announcements.filter(ann => !readIds.includes(ann.id));
};

// 未読件数を取得
export const getUnreadCount = (): number => {
  return getUnreadAnnouncements().length;
};

// タイプ別の未読件数を取得
export const getUnreadCountByType = (type: 'question' | 'system' | 'important'): number => {
  const readIds = getReadAnnouncementIds();
  return announcements.filter(ann => ann.type === type && !readIds.includes(ann.id)).length;
};

// 既読IDを取得
export const getReadAnnouncementIds = (): string[] => {
  const stored = localStorage.getItem('readAnnouncements');
  return stored ? JSON.parse(stored) : [];
};

// お知らせを既読にする
export const markAsRead = (announcementId: string): void => {
  const readIds = getReadAnnouncementIds();
  if (!readIds.includes(announcementId)) {
    readIds.push(announcementId);
    localStorage.setItem('readAnnouncements', JSON.stringify(readIds));
  }
};

// すべてを既読にする
export const markAllAsRead = (): void => {
  const allIds = announcements.map(ann => ann.id);
  localStorage.setItem('readAnnouncements', JSON.stringify(allIds));
};

// タイプ別のアイコンを取得
export const getTypeIcon = (type: string): string => {
  switch (type) {
    case 'question': return '📝';
    case 'system': return '⚙️';
    case 'important': return '📢';
    default: return '📌';
  }
};

// タイプ別の表示名を取得
export const getTypeName = (type: string): string => {
  switch (type) {
    case 'question': return '問題更新';
    case 'system': return 'システム更新';
    case 'important': return '重要なお知らせ';
    default: return 'お知らせ';
  }
};

// タイプ別の色を取得
export const getTypeColor = (type: string): string => {
  switch (type) {
    case 'question': return 'bg-blue-100 text-blue-800';
    case 'system': return 'bg-green-100 text-green-800';
    case 'important': return 'bg-red-100 text-red-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};
