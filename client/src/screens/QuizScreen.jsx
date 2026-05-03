import { useState, useEffect, useRef } from 'react';
import { useResponsive } from '../hooks/useResponsive';

const CAT_COLOR = { IPL: '#f59e0b', INTL: '#38bdf8' };
const CAT_LABEL = { IPL: 'IPL', INTL: 'International' };

const OPTION_LETTERS = ['A', 'B', 'C', 'D'];

export default function QuizScreen({
  theme: t,
  question      = null,   // { qIdx, total, q, opts, cat, timeLimit }
  myName        = '',
  oppName       = '',
  scores        = [],     // [{ socketId, name, score }]
  mySocketId    = '',
  myAnswerIdx   = null,   // locked-in answer (or null)
  roundResult   = null,   // { correctIdx, iGotIt, iWon, winnerName, scores }
  totalQuestions= 10,
  phase         = 'question', // 'question' | 'result' | 'waiting'
  onAnswer      = null,   // (answerIdx) => void
}) {
  const { isMobile } = useResponsive();
  const [timeLeft, setTimeLeft] = useState(15);
  const timerRef  = useRef(null);
  const prevQIdx  = useRef(-1);

  // Reset + start countdown when a new question arrives
  useEffect(() => {
    if (!question) return;
    if (question.qIdx === prevQIdx.current) return;
    prevQIdx.current = question.qIdx;

    setTimeLeft(question.timeLimit || 15);
    if (timerRef.current) clearInterval(timerRef.current);

    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) { clearInterval(timerRef.current); return 0; }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timerRef.current);
  }, [question?.qIdx]); // eslint-disable-line react-hooks/exhaustive-deps

  // Stop timer once answer is locked or result received
  useEffect(() => {
    if (myAnswerIdx !== null || roundResult) {
      clearInterval(timerRef.current);
    }
  }, [myAnswerIdx, roundResult]);

  const myScore  = scores.find(s => s.socketId === mySocketId)?.score ?? 0;
  const oppScore = scores.find(s => s.socketId !== mySocketId)?.score ?? 0;
  const catColor = CAT_COLOR[question?.cat] || t.accent;
  const timerPct = ((question?.timeLimit || 15) > 0)
    ? (timeLeft / (question?.timeLimit || 15)) * 100 : 0;
  const timerColor = timeLeft > 8 ? t.success : timeLeft > 4 ? '#f59e0b' : t.danger;

  // ── Waiting for first question ───────────────────────────────────────────────
  if (phase === 'waiting' || !question) {
    return (
      <div style={{ minHeight: 'calc(100vh - 52px)', background: t.bg,
        display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 42, marginBottom: 12 }}>🧠</div>
          <div style={{ fontSize: 16, color: t.textMute, fontFamily: t.fontMono }}>
            Loading questions…
          </div>
        </div>
      </div>
    );
  }

  const qNum = (question?.qIdx ?? 0) + 1;

  // ── Shared answer grid ────────────────────────────────────────────────────────
  const locked = myAnswerIdx !== null || !!roundResult;

  const AnswerGrid = () => (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: isMobile ? 8 : 10 }}>
      {question.opts.map((opt, i) => {
        const isMyAnswer  = myAnswerIdx === i;
        const isCorrect   = roundResult && i === roundResult.correctIdx;
        const isWrong     = roundResult && isMyAnswer && !isCorrect;
        let borderColor   = t.borderSoft;
        let bgColor       = t.surface;
        let textColor     = t.text;

        if (isCorrect) {
          borderColor = t.success;
          bgColor     = `${t.success}22`;
          textColor   = t.success;
        } else if (isWrong) {
          borderColor = t.danger;
          bgColor     = `${t.danger}18`;
          textColor   = t.danger;
        } else if (isMyAnswer) {
          borderColor = catColor;
          bgColor     = `${catColor}18`;
          textColor   = catColor;
        }

        const dimmed = locked && !isMyAnswer && !isCorrect;

        return (
          <button key={i}
            onClick={() => !locked && onAnswer && onAnswer(i)}
            disabled={locked}
            style={{
              all: 'unset', boxSizing: 'border-box',
              padding: isMobile ? '12px 10px' : '14px 16px',
              borderRadius: 12,
              border: `2px solid ${borderColor}`,
              background: bgColor,
              opacity: dimmed ? 0.45 : 1,
              transition: 'all 0.25s',
              cursor: locked ? 'default' : 'pointer',
              display: 'flex', alignItems: 'flex-start', gap: 10,
              position: 'relative', textAlign: 'left',
            }}>
            {/* Letter badge */}
            <div style={{
              width: 24, height: 24, borderRadius: '50%', flexShrink: 0,
              background: isCorrect ? t.success : isMyAnswer ? catColor : t.bgElev,
              border: `1px solid ${isCorrect ? t.success : isMyAnswer ? catColor : t.borderSoft}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 10, fontWeight: 800, color: (isCorrect || isMyAnswer) ? '#000' : t.textMute,
              fontFamily: t.fontMono, transition: 'all 0.25s',
            }}>
              {OPTION_LETTERS[i]}
            </div>
            <div style={{ fontSize: isMobile ? 12 : 13, fontWeight: 600, color: textColor,
              lineHeight: 1.35, flex: 1, transition: 'color 0.25s' }}>
              {opt}
            </div>
            {isCorrect && (
              <div style={{ position: 'absolute', top: 8, right: 10, fontSize: 14 }}>✅</div>
            )}
            {isWrong && (
              <div style={{ position: 'absolute', top: 8, right: 10, fontSize: 14 }}>❌</div>
            )}
          </button>
        );
      })}
    </div>
  );

  // ── Mobile layout ────────────────────────────────────────────────────────────
  if (isMobile) {
    return (
      <div style={{ height: 'calc(100vh - 52px)', background: t.bg, display: 'flex',
        flexDirection: 'column', overflow: 'hidden', fontFamily: t.fontDisplay }}>

        {/* Top bar */}
        <div style={{ padding: '10px 14px', borderBottom: `1px solid ${t.borderSoft}`,
          background: t.bgElev, flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
            {/* Progress */}
            <div style={{ fontSize: 10, fontFamily: t.fontMono, color: t.textMute, fontWeight: 700 }}>
              Q {qNum}/{totalQuestions}
            </div>
            {/* Category badge */}
            <div style={{ padding: '3px 10px', borderRadius: 20,
              background: `${catColor}22`, border: `1px solid ${catColor}44`,
              fontSize: 9, fontWeight: 800, fontFamily: t.fontMono, color: catColor,
              letterSpacing: 1, textTransform: 'uppercase' }}>
              {CAT_LABEL[question.cat] || question.cat}
            </div>
            {/* Timer */}
            <div style={{ fontSize: 18, fontWeight: 900, fontFamily: t.fontMono,
              color: timerColor, minWidth: 28, textAlign: 'right',
              transition: 'color 0.3s' }}>
              {timeLeft}
            </div>
          </div>
          {/* Progress + timer bar */}
          <div style={{ height: 4, background: t.bgElev, borderRadius: 2, overflow: 'hidden',
            border: `1px solid ${t.borderSoft}` }}>
            <div style={{ height: '100%', borderRadius: 2, background: timerColor,
              width: `${timerPct}%`, transition: 'width 1s linear, background 0.3s' }} />
          </div>
        </div>

        {/* Scores */}
        <div style={{ display: 'flex', borderBottom: `1px solid ${t.borderSoft}`,
          background: t.bgElev, flexShrink: 0 }}>
          <ScoreBar name={myName || 'You'} score={myScore} isMe color={t.accent} t={t} />
          <div style={{ width: 1, background: t.borderSoft }} />
          <ScoreBar name={oppName || 'Opp'} score={oppScore} color={t.textMute} t={t} />
        </div>

        {/* Question */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '14px' }}>
          <div style={{ fontSize: 16, fontWeight: 800, color: t.text, lineHeight: 1.4,
            marginBottom: 16, letterSpacing: -0.3 }}>
            {question.q}
          </div>
          <AnswerGrid />
          {/* Result feedback */}
          {roundResult && <RoundFeedback result={roundResult} t={t} isMobile />}
        </div>
      </div>
    );
  }

  // ── Desktop layout ───────────────────────────────────────────────────────────
  return (
    <div style={{ minHeight: 'calc(100vh - 52px)', background: t.bg,
      display: 'flex', alignItems: 'flex-start', justifyContent: 'center',
      padding: '32px 24px', fontFamily: t.fontDisplay }}>
      <div style={{ width: '100%', maxWidth: 720 }}>

        {/* Header row */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          marginBottom: 20, gap: 16 }}>
          {/* Scores */}
          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            <PlayerScore name={myName || 'You'} score={myScore} isMe accent={t.accent} t={t} />
            <div style={{ fontSize: 12, color: t.textDim, fontFamily: t.fontMono }}>VS</div>
            <PlayerScore name={oppName || 'Opp'} score={oppScore} accent={t.textMute} t={t} />
          </div>

          {/* Timer ring */}
          <div style={{ textAlign: 'center' }}>
            <TimerRing value={timeLeft} max={question.timeLimit || 15} color={timerColor} t={t} />
          </div>

          {/* Q counter + cat */}
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 11, fontFamily: t.fontMono, color: t.textMute,
              fontWeight: 700, letterSpacing: 1.5, marginBottom: 4 }}>
              Q {qNum} / {totalQuestions}
            </div>
            <div style={{ padding: '3px 12px', borderRadius: 20, display: 'inline-block',
              background: `${catColor}22`, border: `1px solid ${catColor}44`,
              fontSize: 10, fontWeight: 800, fontFamily: t.fontMono, color: catColor,
              letterSpacing: 1, textTransform: 'uppercase' }}>
              {CAT_LABEL[question.cat] || question.cat}
            </div>
          </div>
        </div>

        {/* Progress bar */}
        <div style={{ height: 4, background: t.surface, borderRadius: 2,
          overflow: 'hidden', marginBottom: 28, border: `1px solid ${t.borderSoft}` }}>
          <div style={{ height: '100%', background: `linear-gradient(90deg,${catColor},${catColor}99)`,
            width: `${((qNum - 1) / totalQuestions) * 100}%`, borderRadius: 2, transition: 'width 0.4s' }} />
        </div>

        {/* Question box */}
        <div style={{ background: t.surface, border: `1px solid ${t.borderSoft}`,
          borderRadius: 20, padding: '24px 28px', marginBottom: 16 }}>
          <div style={{ fontSize: 20, fontWeight: 800, color: t.text, lineHeight: 1.45,
            marginBottom: 24, letterSpacing: -0.5 }}>
            {question.q}
          </div>
          <AnswerGrid />
        </div>

        {/* Status / result */}
        {myAnswerIdx !== null && !roundResult && (
          <div style={{ marginTop: 16, textAlign: 'center', fontSize: 13, color: t.textMute,
            fontFamily: t.fontMono, letterSpacing: 0.5 }}>
            ✅ Answer locked in — waiting for opponent…
          </div>
        )}
        {roundResult && <RoundFeedback result={roundResult} t={t} />}
      </div>
    </div>
  );
}

// ── Sub-components ──────────────────────────────────────────────────────────

function RoundFeedback({ result, t, isMobile = false }) {
  const { iGotIt, iWon, winnerName } = result;
  const msg   = iWon   ? '🏆 You got it first!'
              : iGotIt ? '✅ Correct — but they were faster!'
              : winnerName ? `${winnerName} got it right!`
              : '❌ Nobody got this one';
  const color = iWon ? t.success : iGotIt ? '#f59e0b' : winnerName ? t.danger : t.textMute;

  return (
    <div style={{ marginTop: 16, padding: isMobile ? '10px 14px' : '14px 20px',
      borderRadius: 12, background: `${color}18`, border: `1px solid ${color}44`,
      textAlign: 'center', fontSize: isMobile ? 13 : 15, fontWeight: 700, color,
      transition: 'all 0.3s' }}>
      {msg}
    </div>
  );
}

function ScoreBar({ name, score, isMe, color, t }) {
  return (
    <div style={{ flex: 1, padding: '8px 12px', textAlign: 'center' }}>
      <div style={{ fontSize: 9, fontFamily: t.fontMono, color: t.textDim,
        textTransform: 'uppercase', letterSpacing: 1, marginBottom: 2 }}>
        {isMe ? 'You' : 'Opp'}
      </div>
      <div style={{ fontSize: 11, fontWeight: 700, color: t.textMute, marginBottom: 1,
        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{name}</div>
      <div style={{ fontSize: 22, fontWeight: 900, color, fontFamily: t.fontMono }}>{score}</div>
    </div>
  );
}

function PlayerScore({ name, score, isMe, accent, t }) {
  return (
    <div style={{ background: t.surface, border: `1px solid ${t.borderSoft}`,
      borderRadius: 10, padding: '8px 14px', textAlign: 'center', minWidth: 80 }}>
      <div style={{ fontSize: 10, fontFamily: t.fontMono, color: t.textDim,
        textTransform: 'uppercase', letterSpacing: 1, marginBottom: 2 }}>
        {isMe ? 'You' : 'Opp'}
      </div>
      <div style={{ fontSize: 12, fontWeight: 700, color: t.textMute, marginBottom: 2,
        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 80 }}>{name}</div>
      <div style={{ fontSize: 28, fontWeight: 900, color: accent, fontFamily: t.fontMono }}>{score}</div>
    </div>
  );
}

function TimerRing({ value, max, color, t }) {
  const r = 22;
  const circ = 2 * Math.PI * r;
  const fill = (value / max) * circ;

  return (
    <div style={{ position: 'relative', width: 64, height: 64, margin: '0 auto' }}>
      <svg width={64} height={64} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={32} cy={32} r={r} fill="none" stroke={t.borderSoft} strokeWidth={5} />
        <circle cx={32} cy={32} r={r} fill="none" stroke={color} strokeWidth={5}
          strokeDasharray={`${fill} ${circ}`}
          style={{ transition: 'stroke-dasharray 1s linear, stroke 0.3s' }} />
      </svg>
      <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center',
        justifyContent: 'center', fontSize: 18, fontWeight: 900,
        color, fontFamily: t.fontMono, transition: 'color 0.3s' }}>
        {value}
      </div>
    </div>
  );
}
