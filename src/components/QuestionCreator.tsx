import { useState } from 'react';
import { Question } from '../types';

interface GeneratedQuestion {
  id: string;
  category: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

export default function QuestionCreator() {
  const [urls, setUrls] = useState<string[]>(['', '', '']);
  const [category, setCategory] = useState('AI・DX基礎知識');
  const [questionCount, setQuestionCount] = useState(10);
  const [generatedQuestions, setGeneratedQuestions] = useState<GeneratedQuestion[]>([]);
  const [importText, setImportText] = useState('');
  const [activeStep, setActiveStep] = useState(1);

  // URLを追加
  const addUrl = () => {
    setUrls([...urls, '']);
  };

  // URLを削除
  const removeUrl = (index: number) => {
    setUrls(urls.filter((_, i) => i !== index));
  };

  // URLを更新
  const updateUrl = (index: number, value: string) => {
    const newUrls = [...urls];
    newUrls[index] = value;
    setUrls(newUrls);
  };

  // 問題生成依頼テキストを作成
  const createRequestText = () => {
    const validUrls = urls.filter(url => url.trim() !== '');
    if (validUrls.length === 0) {
      alert('少なくとも1つのURLを入力してください。');
      return;
    }

    const requestText = `以下のURLから、PCデポのデジタルライフプランナー向けの4択問題を${questionCount}問作成してください。

【対象URL】
${validUrls.map((url, i) => `${i + 1}. ${url}`).join('\n')}

【問題形式】
カテゴリー: ${category}
問題数: ${questionCount}問
形式: 4択問題（選択肢A-D）

【出力形式】
以下のTypeScript配列形式で出力してください：

\`\`\`typescript
[
  {
    id: '${category === 'AI・DX基礎知識' ? 'AIDX' : 'PCDEPOT'}001',
    category: '${category}',
    question: '問題文をここに記載',
    options: [
      '選択肢A',
      '選択肢B',
      '選択肢C',
      '選択肢D'
    ],
    correctAnswer: 0,  // 0=A, 1=B, 2=C, 3=D
    explanation: '正解の理由と補足説明（150-250文字）'
  },
  // ... 残りの問題
]
\`\`\`

【要件】
- 記事の重要なポイントを問題化
- 選択肢は明確で、1つだけが正解
- 解説は教育的で分かりやすく
- 経営者・管理職が知っておくべき内容
- 問題IDは連番（${category === 'AI・DX基礎知識' ? 'AIDX' : 'PCDEPOT'}001, ${category === 'AI・DX基礎知識' ? 'AIDX' : 'PCDEPOT'}002...）`;

    return requestText;
  };

  // 依頼テキストをコピー
  const copyRequestText = () => {
    const text = createRequestText();
    if (!text) return;

    navigator.clipboard.writeText(text).then(() => {
      alert('問題生成依頼をコピーしました！\nAIアシスタントに送信してください。');
      setActiveStep(2);
    }).catch(() => {
      alert('コピーに失敗しました。テキストを手動でコピーしてください。');
    });
  };

  // 生成された問題をインポート
  const importQuestions = () => {
    try {
      // TypeScript配列形式からJSONを抽出
      let jsonText = importText.trim();
      
      // コードブロックを削除
      jsonText = jsonText.replace(/```typescript\n?/g, '').replace(/```\n?/g, '');
      
      // 配列部分のみを抽出（export const ... = の部分を削除）
      const arrayMatch = jsonText.match(/\[[\s\S]*\]/);
      if (arrayMatch) {
        jsonText = arrayMatch[0];
      }

      const parsed = JSON.parse(jsonText);
      
      if (!Array.isArray(parsed)) {
        throw new Error('配列形式ではありません');
      }

      setGeneratedQuestions(parsed);
      setActiveStep(3);
      alert(`${parsed.length}問の問題をインポートしました！`);
    } catch (error) {
      alert('問題のインポートに失敗しました。\n形式が正しいか確認してください。\n\nエラー: ' + (error as Error).message);
    }
  };

  // 問題を編集
  const updateQuestion = (index: number, field: keyof GeneratedQuestion, value: any) => {
    const newQuestions = [...generatedQuestions];
    newQuestions[index] = { ...newQuestions[index], [field]: value };
    setGeneratedQuestions(newQuestions);
  };

  // 選択肢を編集
  const updateOption = (questionIndex: number, optionIndex: number, value: string) => {
    const newQuestions = [...generatedQuestions];
    newQuestions[questionIndex].options[optionIndex] = value;
    setGeneratedQuestions(newQuestions);
  };

  // 問題を削除
  const deleteQuestion = (index: number) => {
    if (confirm('この問題を削除しますか？')) {
      setGeneratedQuestions(generatedQuestions.filter((_, i) => i !== index));
    }
  };

  // TypeScriptファイルをエクスポート
  const exportQuestions = () => {
    if (generatedQuestions.length === 0) {
      alert('エクスポートする問題がありません。');
      return;
    }

    const categoryFileMap: { [key: string]: string } = {
      'AI・DX基礎知識': 'aidx',
      'PC Depot': 'pcdepot',
      '財務会計・経理': 'finance',
      '法務・コンプライアンス': 'legal',
      'ガバナンス・内部統制': 'governance',
      '人事・労務管理': 'hr',
      '経営戦略・企画': 'strategy',
      '業務プロセス・効率化': 'process',
      '組織マネジメント': 'organization',
      '情報システム・IT管理': 'it',
      '総務・一般管理': 'general',
      'コミュニケーション・報告': 'communication'
    };

    const fileName = categoryFileMap[category] || 'custom';
    const variableName = fileName === 'aidx' ? 'aidxQuestions' : 
                         fileName === 'pcdepot' ? 'questionsPCDepot' : 
                         `${fileName}Questions`;

    const fileContent = `import { Question } from '../types';

export const ${variableName}: Question[] = [
${generatedQuestions.map(q => `  {
    id: '${q.id}',
    category: '${q.category}',
    question: '${q.question.replace(/'/g, "\\'")}',
    options: [
      '${q.options[0].replace(/'/g, "\\'")}',
      '${q.options[1].replace(/'/g, "\\'")}',
      '${q.options[2].replace(/'/g, "\\'")}',
      '${q.options[3].replace(/'/g, "\\'")}'
    ],
    correctAnswer: ${q.correctAnswer},
    explanation: '${q.explanation.replace(/'/g, "\\'")}'
  }`).join(',\n')}
];
`;

    // ファイルをダウンロード
    const blob = new Blob([fileContent], { type: 'text/typescript;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', `questions-${fileName}.ts`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    alert(`ファイルをダウンロードしました！\n\nファイル名: questions-${fileName}.ts\n問題数: ${generatedQuestions.length}問\n\n次のステップ:\n1. GitHubで既存の questions-${fileName}.ts を削除\n2. 新しいファイルをアップロード\n3. allQuestions.ts を更新（必要な場合）`);
  };

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-purple-50 to-pink-50 border-2 border-purple-300 rounded-xl p-6">
        <h3 className="text-xl font-bold text-purple-900 mb-2">✨ 問題作成アシスタント</h3>
        <p className="text-sm text-purple-800">
          ニュース記事のURLから自動的に4択問題を作成できます。作成した問題は全スタッフが利用できます。
        </p>
      </div>

      {/* ステップインジケーター */}
      <div className="flex items-center justify-between mb-8">
        {[
          { step: 1, label: 'URL入力' },
          { step: 2, label: 'AI生成' },
          { step: 3, label: '編集・確認' },
          { step: 4, label: 'エクスポート' }
        ].map((item, index) => (
          <div key={item.step} className="flex items-center flex-1">
            <div className={`flex items-center justify-center w-10 h-10 rounded-full font-bold ${
              activeStep >= item.step 
                ? 'bg-purple-600 text-white' 
                : 'bg-gray-200 text-gray-500'
            }`}>
              {item.step}
            </div>
            <div className="ml-3 flex-1">
              <p className={`font-semibold ${
                activeStep >= item.step ? 'text-purple-900' : 'text-gray-500'
              }`}>
                {item.label}
              </p>
            </div>
            {index < 3 && (
              <div className={`flex-1 h-1 mx-4 ${
                activeStep > item.step ? 'bg-purple-600' : 'bg-gray-200'
              }`} />
            )}
          </div>
        ))}
      </div>

      {/* ステップ1: URL入力 */}
      <div className="bg-white border-2 border-gray-200 rounded-xl p-6">
        <h4 className="font-bold text-gray-900 mb-4">📎 ステップ1: ニュース記事のURLを入力</h4>
        
        <div className="mb-4">
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            カテゴリー
          </label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full border-2 border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:border-purple-500"
          >
            <option>AI・DX基礎知識</option>
            <option>PC Depot</option>
            <option>財務会計・経理</option>
            <option>法務・コンプライアンス</option>
            <option>その他</option>
          </select>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            生成する問題数
          </label>
          <select
            value={questionCount}
            onChange={(e) => setQuestionCount(Number(e.target.value))}
            className="w-full border-2 border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:border-purple-500"
          >
            <option value={5}>5問</option>
            <option value={10}>10問</option>
            <option value={15}>15問</option>
            <option value={20}>20問</option>
          </select>
        </div>

        <div className="space-y-3 mb-4">
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            記事URL（3-10件推奨）
          </label>
          {urls.map((url, index) => (
            <div key={index} className="flex items-center gap-2">
              <input
                type="url"
                value={url}
                onChange={(e) => updateUrl(index, e.target.value)}
                placeholder={`URL ${index + 1}: https://...`}
                className="flex-1 border-2 border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:border-purple-500"
              />
              {urls.length > 1 && (
                <button
                  onClick={() => removeUrl(index)}
                  className="text-red-600 hover:text-red-800 px-3 py-2"
                >
                  ✕
                </button>
              )}
            </div>
          ))}
          <button
            onClick={addUrl}
            className="text-purple-600 hover:text-purple-800 font-semibold text-sm"
          >
            ＋ URLを追加
          </button>
        </div>

        <button
          onClick={copyRequestText}
          className="w-full bg-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-purple-700"
        >
          📋 問題生成依頼をコピー
        </button>
      </div>

      {/* ステップ2: AI生成 */}
      {activeStep >= 2 && (
        <div className="bg-blue-50 border-2 border-blue-300 rounded-xl p-6">
          <h4 className="font-bold text-blue-900 mb-4">🤖 ステップ2: AIアシスタントで問題を生成</h4>
          <div className="bg-white rounded-lg p-4 mb-4">
            <p className="text-sm text-gray-700 mb-3">
              以下の手順で問題を生成してください:
            </p>
            <ol className="list-decimal list-inside space-y-2 text-sm text-gray-700">
              <li>上記の「問題生成依頼をコピー」をクリック（完了済み✓）</li>
              <li>AIアシスタント（このチャット）に依頼テキストを送信</li>
              <li>生成された問題（TypeScript配列）をコピー</li>
              <li>下の入力欄にペーストして「インポート」をクリック</li>
            </ol>
          </div>

          <label className="block text-sm font-semibold text-gray-700 mb-2">
            生成された問題をペースト
          </label>
          <textarea
            value={importText}
            onChange={(e) => setImportText(e.target.value)}
            placeholder="AIが生成した問題（TypeScript配列形式）をここにペーストしてください..."
            className="w-full h-48 border-2 border-blue-300 rounded-lg px-4 py-2 focus:outline-none focus:border-blue-500 font-mono text-sm"
          />
          <button
            onClick={importQuestions}
            className="w-full mt-4 bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700"
          >
            📥 問題をインポート
          </button>
        </div>
      )}

      {/* ステップ3: 問題プレビュー・編集 */}
      {activeStep >= 3 && generatedQuestions.length > 0 && (
        <div className="bg-green-50 border-2 border-green-300 rounded-xl p-6">
          <h4 className="font-bold text-green-900 mb-4">
            ✏️ ステップ3: 問題の確認・編集（{generatedQuestions.length}問）
          </h4>
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {generatedQuestions.map((q, qIndex) => (
              <div key={qIndex} className="bg-white rounded-lg p-4 border-2 border-gray-200">
                <div className="flex justify-between items-start mb-3">
                  <span className="bg-green-600 text-white px-3 py-1 rounded-full text-xs font-semibold">
                    問題 {qIndex + 1}
                  </span>
                  <button
                    onClick={() => deleteQuestion(qIndex)}
                    className="text-red-600 hover:text-red-800 text-sm"
                  >
                    🗑️ 削除
                  </button>
                </div>
                
                <div className="space-y-3">
                  <div>
                    <label className="text-xs text-gray-600">問題ID</label>
                    <input
                      type="text"
                      value={q.id}
                      onChange={(e) => updateQuestion(qIndex, 'id', e.target.value)}
                      className="w-full text-sm border border-gray-300 rounded px-2 py-1"
                    />
                  </div>
                  
                  <div>
                    <label className="text-xs text-gray-600">問題文</label>
                    <textarea
                      value={q.question}
                      onChange={(e) => updateQuestion(qIndex, 'question', e.target.value)}
                      className="w-full text-sm border border-gray-300 rounded px-2 py-1"
                      rows={2}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    {q.options.map((opt, oIndex) => (
                      <div key={oIndex}>
                        <label className="text-xs text-gray-600">
                          選択肢 {String.fromCharCode(65 + oIndex)}
                        </label>
                        <input
                          type="text"
                          value={opt}
                          onChange={(e) => updateOption(qIndex, oIndex, e.target.value)}
                          className="w-full text-sm border border-gray-300 rounded px-2 py-1"
                        />
                      </div>
                    ))}
                  </div>

                  <div>
                    <label className="text-xs text-gray-600">正解</label>
                    <select
                      value={q.correctAnswer}
                      onChange={(e) => updateQuestion(qIndex, 'correctAnswer', Number(e.target.value))}
                      className="w-full text-sm border border-gray-300 rounded px-2 py-1"
                    >
                      <option value={0}>A</option>
                      <option value={1}>B</option>
                      <option value={2}>C</option>
                      <option value={3}>D</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs text-gray-600">解説</label>
                    <textarea
                      value={q.explanation}
                      onChange={(e) => updateQuestion(qIndex, 'explanation', e.target.value)}
                      className="w-full text-sm border border-gray-300 rounded px-2 py-1"
                      rows={2}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={() => setActiveStep(4)}
            className="w-full mt-4 bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700"
          >
            次へ: エクスポート →
          </button>
        </div>
      )}

      {/* ステップ4: エクスポート */}
      {activeStep >= 4 && generatedQuestions.length > 0 && (
        <div className="bg-orange-50 border-2 border-orange-300 rounded-xl p-6">
          <h4 className="font-bold text-orange-900 mb-4">💾 ステップ4: ファイルをエクスポート</h4>
          
          <div className="bg-white rounded-lg p-4 mb-4">
            <h5 className="font-semibold text-gray-900 mb-2">📁 エクスポート後の手順</h5>
            <ol className="list-decimal list-inside space-y-2 text-sm text-gray-700">
              <li>「ファイルをダウンロード」をクリック</li>
              <li>GitHubで該当するカテゴリーファイルを削除</li>
              <li>ダウンロードしたファイルをGitHubにアップロード</li>
              <li>Vercelの自動デプロイを待つ（2-3分）</li>
              <li>✅ 全スタッフが新しい問題でテスト可能！</li>
            </ol>
          </div>

          <div className="bg-yellow-50 border border-yellow-300 rounded-lg p-3 mb-4">
            <p className="text-sm text-yellow-800">
              ⚠️ <strong>重要:</strong> allQuestions.ts の問題数も更新してください。<br/>
              例: questionCount を {generatedQuestions.length}問 増やす
            </p>
          </div>

          <button
            onClick={exportQuestions}
            className="w-full bg-orange-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-orange-700"
          >
            📥 TypeScriptファイルをダウンロード
          </button>
        </div>
      )}
    </div>
  );
}
