# PC Depot Digital Life Planner - 管理職向けスキルアップテストシステム

## 📋 プロジェクト概要

PC Depot「Digital Life Planner」の管理職を対象とした、包括的なスキル評価・学習支援システムです。

### 主な特徴
- ✅ **550問の高品質問題**: 一般10カテゴリー(400問) + PC Depot特化(150問)
- ✅ **8つの機能画面**: ホーム、テスト、結果、カレンダー、復習、統計、管理、掲示板
- ✅ **難易度**: 全問上級レベル、中堅社員の正答率50%を目標
- ✅ **iPhone最適化**: レスポンシブデザイン対応
- ✅ **学習履歴管理**: LocalStorageによる永続化
- ✅ **掲示板機能**: 更新情報・お知らせの管理

---

## 🎯 対象ユーザー

- **管理職**: 新卒から20年ベテランまで
- **対象スキル**: 財務、法務、ガバナンス、人事、経営戦略、業務効率化、組織管理、IT、総務、コミュニケーション

---

## 📚 カテゴリー構成

### 一般カテゴリー (400問)
1. 財務会計・経理 (40問)
2. 法務・コンプライアンス (40問)
3. ガバナンス・内部統制 (40問)
4. 人事・労務管理 (40問)
5. 経営戦略・企画 (40問)
6. 業務プロセス・効率化 (40問)
7. 組織マネジメント (40問)
8. 情報システム・IT管理 (40問)
9. 総務・一般管理 (40問)
10. コミュニケーション・報告 (40問)

### PC Depot特化カテゴリー (150問)
- Day 1-10: 企業概要・ビジョン、財務業績、サービス戦略 (50問)
- Day 11-20: 競合戦略・差別化、財務分析・KPI (50問)
- Day 21-30: IT・DX推進、ESG・サステナビリティ (50問)

---

## 🚀 技術スタック

- **フレームワーク**: React 18 + TypeScript
- **ビルドツール**: Vite
- **UI/スタイリング**: Tailwind CSS
- **アイコン**: Lucide React
- **ルーティング**: React Router v6
- **状態管理**: React Hooks (useState, useEffect)
- **データ永続化**: LocalStorage

---

## 🛠️ セットアップ

### 前提条件
- Node.js 18.x 以上
- npm または yarn

### インストール

```bash
# リポジトリのクローン
git clone https://github.com/YOUR_USERNAME/skill-test-app.git
cd skill-test-app

# 依存関係のインストール
npm install

# 開発サーバーの起動
npm run dev
```

### ビルド

```bash
# 本番用ビルド
npm run build

# ビルド結果のプレビュー
npm run preview
```

---

## 📱 画面構成

### 1. ホーム画面 (`/`)
- カテゴリー選択
- ナビゲーション(お知らせ、実施履歴、復習、統計、管理)
- 使い方ガイド

### 2. お知らせ掲示板 (`/announcements`)
- 更新情報の一覧表示
- 未読/既読管理
- タイプ別フィルター(新着、更新、機能追加、重要)

### 3. テスト実行画面 (`/test/:category`)
- 4択問題形式
- 出題数選択 (10/20/30/40/150問)
- 進捗表示

### 4. 結果表示画面 (`/result`)
- スコア表示
- 正答・誤答の詳細
- 解説表示

### 5. 学習履歴カレンダー (`/calendar`)
- 月次カレンダー表示
- 日別学習記録
- 正答率のビジュアル化

### 6. 復習モード (`/review`)
- 誤答問題の再挑戦
- カテゴリー別フィルタ

### 7. 統計画面 (`/stats`)
- カテゴリー別正答率
- 学習履歴グラフ
- CSV出力機能

### 8. 管理画面 (`/admin`)
- 問題データ追加
- JSON形式インポート
- データリセット

---

## 📊 問題フォーマット

```typescript
interface Question {
  id: string;              // 例: "FIN001", "PCD001"
  category: string;        // カテゴリー名
  question: string;        // 問題文 (200-400文字)
  options: string[];       // 選択肢配列 (4つ)
  correctAnswer: number;   // 正解のindex (0-3)
  explanation: string;     // 解説 (100-200文字)
  difficulty: 'advanced';  // 固定値
  tags: string[];          // タグ配列
}
```

---

## 🔔 掲示板機能

### お知らせのタイプ
- 🆕 **新着**: 新問題追加
- 📝 **更新**: 既存問題の更新
- 🔧 **機能追加**: 新機能リリース
- ⚠️ **重要**: 重要なお知らせ

### 新しいお知らせの追加方法

`src/data/announcements.ts` を編集:

```typescript
export const announcements: Announcement[] = [
  {
    id: 'ann-XXX',
    type: 'new', // new/update/feature/important
    title: 'タイトル',
    content: '内容...',
    category: 'カテゴリー名', // オプション
    date: '2025-01-16T10:00:00+09:00',
    isRead: false
  },
  // 既存のお知らせ...
];
```

---

## 📦 プロジェクト構造

```
skill-test-app/
├── src/
│   ├── data/              # 問題データ
│   │   ├── questions-*.ts # カテゴリー別問題
│   │   ├── allQuestions.ts # 全問題統合
│   │   └── announcements.ts # お知らせデータ
│   ├── pages/             # 画面コンポーネント
│   │   ├── Home.tsx
│   │   ├── TestPage.tsx
│   │   ├── ResultPage.tsx
│   │   ├── CalendarPage.tsx
│   │   ├── ReviewPage.tsx
│   │   ├── StatsPage.tsx
│   │   ├── AdminPage.tsx
│   │   └── AnnouncementsPage.tsx
│   ├── types/             # TypeScript型定義
│   ├── utils/             # ユーティリティ関数
│   ├── App.tsx            # メインアプリ
│   └── main.tsx           # エントリーポイント
├── public/                # 静的ファイル
├── package.json
├── vite.config.ts
└── README.md
```

---

## 🎨 デザイン

- **カラースキーム**: 青・インディゴを基調
- **レスポンシブ**: モバイル、タブレット、デスクトップ対応
- **アクセシビリティ**: 大きな文字、明瞭なコントラスト

---

## 📈 今後の拡張予定

- [ ] AI/DXニュース自動生成機能
- [ ] ユーザー管理機能
- [ ] チーム・組織別統計
- [ ] スペースドリピティション学習
- [ ] プッシュ通知機能

---

## 📄 ライセンス

このプロジェクトはPC Depot株式会社の所有物です。

---

## 👥 開発

**プロジェクト名**: Digital Life Planner スキルアップテストシステム  
**バージョン**: 1.0.0  
**作成日**: 2025年1月  
**対象**: PC Depot管理職  

---

## 🙏 謝辞

このシステムは、PC Depotの「Digital Life Planner」ビジョンと、SDSLプロジェクト20K(2万人のデジタルサポート人材育成)の理念に基づいて開発されました。
