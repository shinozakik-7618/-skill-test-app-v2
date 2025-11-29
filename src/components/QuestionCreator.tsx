import React, { useState } from 'react';
import { Upload, Download, FileText, Sparkles, Copy, CheckCircle, Link, AlertCircle } from 'lucide-react';

interface Question {
  id: string;
  category: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

export default function QuestionCreator() {
  const [urls, setUrls] = useState<string>('');
  const [category, setCategory] = useState<string>('AI・DX基礎知識');
  const [questionCount, setQuestionCount] = useState<number>(5);
  const [generatedRequest, setGeneratedRequest] = useState<string>('');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [jsonInput, setJsonInput] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);

  // カテゴリー名からexport名を生成する関数（日本語を含むすべての非ASCII文字を削除）
  const getCategoryExportName = (categoryName: string): string => {
    // 英数字のみを残す（日本語、記号などをすべて削除）
    return categoryName.toLowerCase().replace(/[^a-z0-9]/g, '');
  };
  const [importSuccess, setImportSuccess] = useState<boolean>(false);

  // 依頼文を生成
  const generateRequest = () => {
    if (!urls.trim()) {
      alert('URLを入力してください');
      return;
    }

    const urlList = urls.split('\n').filter(url => url.trim());
    
    if (urlList.length === 0) {
      alert('有効なURLを入力してください');
      return;
    }

    const requestText = `以下のURLから、PCデポのデジタルライフプランナー向けの4択問題を${questionCount}問作成してください。

【対象URL】
${urlList.map((url, index) => `${index + 1}. ${url.trim()}`).join('\n')}

【問題形式】
カテゴリー: ${category}
問題数: ${questionCount}問
形式: 4択問題（選択肢A-D）

【出力形式】
以下のJSON配列形式で出力してください（コードブロックは不要、JSONのみ）：

[
  {
    "id": "AIDX001",
    "category": "${category}",
    "question": "問題文をここに記載",
    "options": [
      "選択肢A",
      "選択肢B",
      "選択肢C",
      "選択肢D"
    ],
    "correctAnswer": 0,
    "explanation": "正解の理由と補足説明（150-250文字）"
  }
]

【要件】
- 記事の重要なポイントを問題化
- 選択肢は明確で、1つだけが正解
- 解説は教育的で分かりやすく
- 経営者・管理職が知っておくべき内容
- 問題IDは連番（AIDX001, AIDX002...）
- 必ずJSON形式で出力（TypeScriptの\`\`\`記号は不要）`;

    setGeneratedRequest(requestText);
  };

  // クリップボードにコピー
  const copyToClipboard = async () => {
    if (!generatedRequest) {
      alert('まず「依頼文を生成」ボタンをクリックしてください');
      return;
    }

    try {
      await navigator.clipboard.writeText(generatedRequest);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    } catch (err) {
      alert('コピーに失敗しました。手動でコピーしてください。');
    }
  };

  // JSONインポート
  const handleImport = () => {
    try {
      // JSONをパース
      const parsed = JSON.parse(jsonInput);
      
      if (!Array.isArray(parsed)) {
        throw new Error('JSON配列形式である必要があります');
      }

      // 各問題の検証
      const validQuestions: Question[] = parsed.map((q, index) => {
        if (!q.id || !q.category || !q.question || !Array.isArray(q.options) || 
            typeof q.correctAnswer !== 'number' || !q.explanation) {
          throw new Error(`問題${index + 1}のフォーマットが正しくありません`);
        }
        
        if (q.options.length !== 4) {
          throw new Error(`問題${index + 1}の選択肢は4つ必要です`);
        }

        return {
          id: q.id,
          category: q.category,
          question: q.question,
          options: q.options,
          correctAnswer: q.correctAnswer,
          explanation: q.explanation
        };
      });

      setQuestions(validQuestions);
      setImportSuccess(true);
      setTimeout(() => setImportSuccess(false), 3000);
      alert(`${validQuestions.length}問をインポートしました！`);
    } catch (error) {
      alert(`インポートエラー: ${error instanceof Error ? error.message : '不明なエラー'}`);
    }
  };

  // 問題削除
  const deleteQuestion = (index: number) => {
    const newQuestions = questions.filter((_, i) => i !== index);
    setQuestions(newQuestions);
  };

  // 問題編集
  const editQuestion = (index: number, field: keyof Question, value: any) => {
    const newQuestions = [...questions];
    (newQuestions[index] as any)[field] = value;
    setQuestions(newQuestions);
  };

  // ファイルダウンロード
  const downloadFile = () => {
    if (questions.length === 0) {
      alert('問題がありません');
      return;
    }

    const exportName = getCategoryExportName(category);
    const fileContent = `import { Question } from '../types';

export const ${exportName}Questions: Question[] = ${JSON.stringify(questions, null, 2)};
`;

    const blob = new Blob([fileContent], { type: 'text/typescript' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `questions-${getCategoryExportName(category)}.ts`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* ステップ1: URL入力と依頼文生成 */}
      <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-6 border-2 border-purple-200">
        <div className="flex items-center gap-2 mb-4">
          <Link className="w-6 h-6 text-purple-600" />
          <h3 className="text-lg font-bold text-gray-800">ステップ1: URL入力と依頼文生成</h3>
        </div>

        <div className="space-y-4">
          {/* URL入力 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              📎 ニュース記事のURL（1行に1つ、3-10件推奨）
            </label>
            <textarea
              value={urls}
              onChange={(e) => setUrls(e.target.value)}
              placeholder="https://example.com/news/article1&#x0a;https://example.com/news/article2&#x0a;https://example.com/news/article3"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent font-mono text-sm"
              rows={6}
            />
          </div>

          {/* カテゴリーと問題数 */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                📚 カテゴリー
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              >
                <option value="AI・DX基礎知識">AI・DX基礎知識</option>
                <option value="財務会計・経理">財務会計・経理</option>
                <option value="法務・コンプライアンス">法務・コンプライアンス</option>
                <option value="経営戦略・企画">経営戦略・企画</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                🔢 問題数
              </label>
              <input
                type="number"
                value={questionCount}
                onChange={(e) => setQuestionCount(parseInt(e.target.value) || 5)}
                min="1"
                max="20"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>

          {/* 依頼文生成ボタン */}
          <button
            onClick={generateRequest}
            className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium"
          >
            <Sparkles className="w-5 h-5" />
            依頼文を生成
          </button>

          {/* 生成された依頼文 */}
          {generatedRequest && (
            <div className="space-y-3">
              <div className="bg-white rounded-lg p-4 border-2 border-purple-300">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">✨ 生成された依頼文</span>
                  <span className="text-xs text-gray-500">この文章をチャットにコピー&ペーストしてください</span>
                </div>
                <pre className="text-xs text-gray-600 whitespace-pre-wrap bg-gray-50 p-3 rounded max-h-40 overflow-y-auto font-mono">
                  {generatedRequest}
                </pre>
              </div>

              {/* コピーボタン */}
              <button
                onClick={copyToClipboard}
                className={`w-full flex items-center justify-center gap-2 px-6 py-3 rounded-lg transition-all font-medium ${
                  copied
                    ? 'bg-green-600 text-white'
                    : 'bg-purple-600 text-white hover:bg-purple-700'
                }`}
              >
                {copied ? (
                  <>
                    <CheckCircle className="w-5 h-5" />
                    コピーしました！このチャットに貼り付けてください
                  </>
                ) : (
                  <>
                    <Copy className="w-5 h-5" />
                    📋 依頼文をコピー
                  </>
                )}
              </button>

              {/* 使い方ガイド */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-blue-800">
                    <p className="font-medium mb-2">📝 次の手順：</p>
                    <ol className="list-decimal list-inside space-y-1 text-xs">
                      <li>上の「📋 依頼文をコピー」ボタンをクリック</li>
                      <li>このチャット（画面下部の入力欄）に貼り付けて送信</li>
                      <li>AIが生成した問題（JSON形式）をコピー</li>
                      <li>下の「ステップ2」の入力欄に貼り付け→「📥 問題をインポート」をクリック</li>
                    </ol>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ステップ2: 問題インポート */}
      <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg p-6 border-2 border-blue-200">
        <div className="flex items-center gap-2 mb-4">
          <Upload className="w-6 h-6 text-blue-600" />
          <h3 className="text-lg font-bold text-gray-800">ステップ2: AI生成問題のインポート</h3>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              🤖 AIが生成した問題（JSON形式）をここに貼り付け
            </label>
            <textarea
              value={jsonInput}
              onChange={(e) => setJsonInput(e.target.value)}
              placeholder='[&#x0a;  {&#x0a;    "id": "AIDX001",&#x0a;    "category": "AI・DX基礎知識",&#x0a;    "question": "問題文...",&#x0a;    "options": ["選択肢A", "選択肢B", "選択肢C", "選択肢D"],&#x0a;    "correctAnswer": 0,&#x0a;    "explanation": "解説..."&#x0a;  }&#x0a;]'
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
              rows={12}
            />
          </div>

          <button
            onClick={handleImport}
            className={`w-full flex items-center justify-center gap-2 px-6 py-3 rounded-lg transition-all font-medium ${
              importSuccess
                ? 'bg-green-600 text-white'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            {importSuccess ? (
              <>
                <CheckCircle className="w-5 h-5" />
                インポート成功！
              </>
            ) : (
              <>
                <Upload className="w-5 h-5" />
                📥 問題をインポート
              </>
            )}
          </button>
        </div>
      </div>

      {/* ステップ3: 問題確認・編集 */}
      {questions.length > 0 && (
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-6 border-2 border-green-200">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <FileText className="w-6 h-6 text-green-600" />
              <h3 className="text-lg font-bold text-gray-800">
                ステップ3: 問題確認・編集（{questions.length}問）
              </h3>
            </div>
            <button
              onClick={downloadFile}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
            >
              <Download className="w-5 h-5" />
              💾 ファイルをダウンロード
            </button>
          </div>

          <div className="space-y-4">
            {questions.map((q, index) => (
              <div key={index} className="bg-white rounded-lg p-4 border border-green-300">
                <div className="flex items-center justify-between mb-3">
                  <span className="font-bold text-green-700">問題 {index + 1}: {q.id}</span>
                  <button
                    onClick={() => deleteQuestion(index)}
                    className="text-red-600 hover:text-red-800 text-sm font-medium"
                  >
                    削除
                  </button>
                </div>

                <div className="space-y-3 text-sm">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">問題文:</label>
                    <textarea
                      value={q.question}
                      onChange={(e) => editQuestion(index, 'question', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                      rows={2}
                    />
                  </div>

                  {q.options.map((opt, optIndex) => (
                    <div key={optIndex}>
                      <label className="block text-xs font-medium text-gray-600 mb-1">
                        選択肢{String.fromCharCode(65 + optIndex)}:
                        {q.correctAnswer === optIndex && (
                          <span className="ml-2 text-green-600 font-bold">✓ 正解</span>
                        )}
                      </label>
                      <input
                        value={opt}
                        onChange={(e) => {
                          const newOptions = [...q.options];
                          newOptions[optIndex] = e.target.value;
                          editQuestion(index, 'options', newOptions);
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                      />
                    </div>
                  ))}

                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">解説:</label>
                    <textarea
                      value={q.explanation}
                      onChange={(e) => editQuestion(index, 'explanation', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                      rows={3}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
