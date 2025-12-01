import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { getTestResultById, TestResult, Question } from '../utils/storage';
import '../styles/ResultPage.css';

interface ResultPageState {
  resultId: string;
  questions?: Question[];  // 試験モード用：全問題の解説を表示
  mode?: string;
  isReviewMode?: boolean;
}

const ResultPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state as ResultPageState;

  const [result, setResult] = useState<{
    id: string;
    date: string;
    results: TestResult[];
    score: number;
    total: number;
  } | null>(null);

  const [questions, setQuestions] = useState<Question[]>([]);
  const [mode, setMode] = useState<string>('');

  useEffect(() => {
    if (!state?.resultId) {
      alert('結果が見つかりませんでした');
      navigate('/');
      return;
    }

    const loadedResult = getTestResultById(state.resultId);
    if (loadedResult) {
      setResult(loadedResult);
      console.log('🔍 [DEBUG] 結果を読み込み:', loadedResult);
    }

    // 試験モードの場合、questions を設定
    if (state.questions) {
      setQuestions(state.questions);
      console.log('🔍 [DEBUG] 試験モード - 全問題を受信:', state.questions.length);
    }

    if (state.mode) {
      setMode(state.mode);
    }
  }, [state, navigate]);

  if (!result) {
    return (
      <div className="result-page">
        <div className="loading">結果を読み込んでいます...</div>
      </div>
    );
  }

  const correctCount = result.results.filter(r => r.isCorrect).length;
  const incorrectCount = result.results.length - correctCount;
  const scorePercentage = Math.round((correctCount / result.results.length) * 100);

  return (
    <div className="result-page">
      <header className="result-header">
        <h1>📊 テスト結果</h1>
        <div className="result-date">{new Date(result.date).toLocaleString('ja-JP')}</div>
      </header>

      <div className="result-summary">
        <div className="score-card">
          <div className="score-main">{scorePercentage}%</div>
          <div className="score-detail">
            正解: {correctCount}問 / 全{result.results.length}問
          </div>
        </div>

        <div className="result-stats">
          <div className="stat-item correct">
            <div className="stat-label">✓ 正解</div>
            <div className="stat-value">{correctCount}問</div>
          </div>
          <div className="stat-item incorrect">
            <div className="stat-label">✗ 不正解</div>
            <div className="stat-value">{incorrectCount}問</div>
          </div>
        </div>
      </div>

      {/* 試験モード：全問題の解説を表示 */}
      {mode === 'exam' && questions.length > 0 && (
        <div className="all-explanations">
          <h2>📖 全問題の解説</h2>
          {questions.map((question, index) => {
            const resultForQuestion = result.results.find(
              r => r.questionId === question.id
            );
            
            const isCorrect = resultForQuestion?.isCorrect || false;
            const selectedAnswer = resultForQuestion?.selectedAnswer || '';

            return (
              <div key={question.id} className={`explanation-card ${isCorrect ? 'correct-card' : 'incorrect-card'}`}>
                <div className="explanation-header">
                  <span className="question-number">問題 {index + 1}</span>
                  <span className={`result-badge ${isCorrect ? 'correct-badge' : 'incorrect-badge'}`}>
                    {isCorrect ? '✓ 正解' : '✗ 不正解'}
                  </span>
                </div>

                <div className="question-text">{question.question}</div>

                <div className="answer-section">
                  <div className="correct-answer">
                    <strong>正解:</strong> {question.options.find(o => o.id === question.correctAnswer)?.text}
                  </div>
                  {!isCorrect && (
                    <div className="your-answer">
                      <strong>あなたの回答:</strong> {question.options.find(o => o.id === selectedAnswer)?.text}
                    </div>
                  )}
                </div>

                <div className="explanation-text">
                  <h4>📖 解説</h4>
                  <p>{question.explanation}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div className="result-actions">
        <button className="primary-button" onClick={() => navigate('/')}>
          ホームへ戻る
        </button>
        
        {incorrectCount > 0 && (
          <button 
            className="secondary-button"
            onClick={() => navigate('/review-notes')}
          >
            📚 間違えた問題を復習
          </button>
        )}

        <button 
          className="secondary-button"
          onClick={() => navigate('/calendar')}
        >
          📅 学習履歴を確認
        </button>
      </div>
    </div>
  );
};

export default ResultPage;