import Btn from '../components/Btn';
import { useResponsive } from '../hooks/useResponsive';

export default function QuizResultsScreen({
  theme: t,
  result     = null,   // { iWon, isDraw, scores, totalQuestions, winner }
  myName     = '',
  onPlayAgain,
  onHome,
}) {
  const { isMobile } = useResponsive();
  if (!result) return null;

  const { iWon, isDraw, scores, totalQuestions } = result;
  const myScore  = scores?.[0]?.score ?? 0;
  const oppScore = scores?.[1]?.score ?? 0;
  const total    = (myScore + oppScore) || 1;

  const outcome   = iWon ? 'win' : isDraw ? 'draw' : 'loss';
  const headline  = outcome === 'win' ? 'Brain of the Match!' : outcome === 'draw' ? 'Too Close!' : 'Well Played!';
  const subtext   = outcome === 'win'  ? 'Your cricket IQ won the day 🏏'
                  : outcome === 'draw' ? 'All square — total cricket heads!'
                  : 'Better luck next innings!';
  const emoji     = outcome === 'win'  ? '🏆' : outcome === 'draw' ? '🤝' : '🧠';
  const winColor  = outcome === 'win'  ? t.success : outcome === 'draw' ? t.accent : t.danger;

  const accuracy  = totalQuestions > 0 ? Math.round((myScore / totalQuestions) * 100) : 0;

  return (
    <div style={{ minHeight: 'calc(100vh - 52px)', background: t.bg, fontFamily: t.fontDisplay,
      color: t.text, display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden' }}>

      {/* Glow */}
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none',
        background: `radial-gradient(ellipse at 50% 20%, ${winColor}1a, transparent 60%)` }} />

      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: isMobile ? '24px 16px' : '48px 24px', position: 'relative', zIndex: 1 }}>
        <div style={{ width: '100%', maxWidth: 560 }}>

          {/* Headline */}
          <div style={{ textAlign: 'center', marginBottom: isMobile ? 24 : 36 }}>
            <div style={{ fontSize: isMobile ? 52 : 72, lineHeight: 1, marginBottom: 10 }}>{emoji}</div>
            <h1 style={{ fontSize: isMobile ? 38 : 54, fontWeight: 900, letterSpacing: isMobile ? -2 : -3,
              lineHeight: 1, marginBottom: 8, color: winColor }}>
              {headline}
            </h1>
            <p style={{ fontSize: isMobile ? 13 : 15, color: t.textMute, lineHeight: 1.6 }}>{subtext}</p>
          </div>

          {/* Score card */}
          <div style={{ background: t.surface, border: `1px solid ${t.borderSoft}`,
            borderRadius: 20, padding: isMobile ? 18 : 28, marginBottom: 10 }}>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              marginBottom: 16 }}>
              {scores.map((s, i) => (
                <div key={i} style={{ textAlign: 'center', flex: 1 }}>
                  <div style={{ fontSize: 10, fontFamily: t.fontMono, letterSpacing: 1.5,
                    color: t.textMute, fontWeight: 700, marginBottom: 4, textTransform: 'uppercase' }}>
                    {i === 0 ? 'You' : 'Opp'}
                  </div>
                  <div style={{ fontSize: 11, color: t.textDim, marginBottom: 4,
                    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 120, margin: '0 auto 4px' }}>
                    {s.name}
                  </div>
                  <div style={{ fontSize: isMobile ? 44 : 56, fontWeight: 900, lineHeight: 1,
                    fontFamily: t.fontMono,
                    color: i === 0 ? (outcome === 'win' ? t.success : t.text) : (outcome === 'loss' ? t.danger : t.text) }}>
                    {s.score}
                  </div>
                  <div style={{ fontSize: 10, color: t.textDim, fontFamily: t.fontMono,
                    letterSpacing: 1, marginTop: 4 }}>CORRECT</div>
                </div>
              ))}

              <div style={{ fontSize: 11, fontFamily: t.fontMono, color: t.textDim, letterSpacing: 1,
                padding: '0 12px' }}>VS</div>
            </div>

            {/* Bar */}
            <div style={{ height: 8, background: t.bgElev, borderRadius: 4, overflow: 'hidden' }}>
              <div style={{ width: `${(myScore / total) * 100}%`, height: '100%',
                background: `linear-gradient(90deg, ${winColor}, ${winColor}99)`,
                borderRadius: 4, transition: 'width 1s cubic-bezier(0.4,0,0.2,1)' }} />
            </div>
          </div>

          {/* Stats */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginBottom: 16 }}>
            <StatCard label="Questions" value={totalQuestions} t={t} />
            <StatCard label="Your score" value={myScore} t={t} color={winColor} />
            <StatCard label="Accuracy" value={`${accuracy}%`} t={t} />
          </div>

          {/* CTAs */}
          <div style={{ display: 'flex', gap: 10, flexDirection: isMobile ? 'column' : 'row' }}>
            <Btn theme={t} size="lg" variant="ghost" onClick={onHome}
              style={{ flex: isMobile ? undefined : 1 }}>← Home</Btn>
            <Btn theme={t} size="lg" onClick={onPlayAgain}
              style={{ flex: isMobile ? undefined : 2 }}>
              Play Again →
            </Btn>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, t, color }) {
  return (
    <div style={{ background: t.surface, border: `1px solid ${t.borderSoft}`,
      borderRadius: 14, padding: '14px 12px', textAlign: 'center' }}>
      <div style={{ fontSize: 9, fontFamily: t.fontMono, letterSpacing: 1.5,
        color: t.textMute, fontWeight: 700, marginBottom: 6, textTransform: 'uppercase' }}>
        {label}
      </div>
      <div style={{ fontSize: 22, fontWeight: 800, color: color || t.text,
        fontFamily: t.fontMono }}>{value}</div>
    </div>
  );
}
