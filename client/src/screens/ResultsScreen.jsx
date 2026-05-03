import Btn from '../components/Btn';
import { useResponsive } from '../hooks/useResponsive';

function Avatar({ theme: t, name, ready }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
      <div style={{ width: 52, height: 52, borderRadius: '50%',
        background: `${t.accent}22`, border: `2px solid ${ready ? t.success : t.border}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 18, fontWeight: 700, color: t.accent, transition: 'border-color 0.3s' }}>
        {name?.[0] || '?'}
      </div>
      <div style={{ fontFamily: t.fontMono, fontSize: 10, letterSpacing: 1.5,
        color: ready ? t.success : t.textMute, fontWeight: 700 }}>
        {ready ? '✓ READY' : name || 'WAITING'}
      </div>
    </div>
  );
}

export default function ResultsScreen({ theme: t, result, myName, rematchVotes, onRematch, onHome }) {
  const { isMobile } = useResponsive();
  if (!result) return null;
  const { iWon, isDraw, scores, rounds } = result;
  const winner   = iWon ? 'you' : isDraw ? 'draw' : 'opp';
  const myScore  = scores?.[0] ?? 0;
  const oppScore = scores?.[1] ?? 0;
  const total    = myScore + oppScore || 1;
  const winColor = winner === 'you' ? t.success : winner === 'draw' ? t.accent : t.danger;

  return (
    <div style={{ minHeight: '100vh', background: t.bg, fontFamily: t.fontDisplay, color: t.text,
      display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden' }}>

      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none',
        background: `radial-gradient(ellipse at 50% 20%, ${winColor}1a, transparent 60%)` }}/>

      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: isMobile ? '28px 16px' : '60px 24px', position: 'relative', zIndex: 1 }}>
        <div style={{ width: '100%', maxWidth: 640 }}>

          {/* Headline */}
          <div style={{ textAlign: 'center', marginBottom: isMobile ? 28 : 48 }}>
            <div style={{ fontSize: isMobile ? 56 : 80, marginBottom: 12, lineHeight: 1 }}>
              {winner === 'you' ? '🏆' : winner === 'draw' ? '🤝' : '🏏'}
            </div>
            <h1 style={{ fontSize: isMobile ? 48 : 64, fontWeight: 900,
              letterSpacing: isMobile ? -2 : -3, lineHeight: 1, marginBottom: 10, color: winColor }}>
              {winner === 'you' ? 'Victory' : winner === 'draw' ? 'Draw' : 'Defeat'}
            </h1>
            <p style={{ fontSize: isMobile ? 14 : 16, color: t.textMute, lineHeight: 1.6 }}>
              {winner === 'you'  ? 'Your deck dominated the innings.' :
               winner === 'draw' ? 'All square at stumps.' :
               'A valiant chase, but not enough.'}
            </p>
          </div>

          {/* Score card */}
          <div style={{ background: t.surface, border: `1px solid ${t.borderSoft}`, borderRadius: 20,
            padding: isMobile ? 20 : 32, marginBottom: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontFamily: t.fontMono, fontSize: 11, letterSpacing: 2, color: t.textMute,
                  fontWeight: 700, marginBottom: 6 }}>YOU</div>
                <div style={{ fontFamily: t.fontMono, fontSize: isMobile ? 44 : 56, fontWeight: 900, lineHeight: 1,
                  color: winner === 'you' ? t.success : t.text }}>{myScore}</div>
                <div style={{ fontFamily: t.fontMono, fontSize: 10, color: t.textDim, letterSpacing: 1, marginTop: 4 }}>CARDS</div>
              </div>
              <div style={{ fontFamily: t.fontMono, fontSize: 11, letterSpacing: 2, color: t.textDim }}>VS</div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontFamily: t.fontMono, fontSize: 11, letterSpacing: 2, color: t.textMute,
                  fontWeight: 700, marginBottom: 6 }}>OPP</div>
                <div style={{ fontFamily: t.fontMono, fontSize: isMobile ? 44 : 56, fontWeight: 900, lineHeight: 1,
                  color: winner === 'opp' ? t.danger : t.text }}>{oppScore}</div>
                <div style={{ fontFamily: t.fontMono, fontSize: 10, color: t.textDim, letterSpacing: 1, marginTop: 4 }}>CARDS</div>
              </div>
            </div>
            <div style={{ height: 8, background: t.bgElev, borderRadius: 4, overflow: 'hidden' }}>
              <div style={{ width: `${(myScore / total) * 100}%`, height: '100%',
                background: `linear-gradient(90deg, ${winColor}, ${winColor}99)`,
                transition: 'width 1s cubic-bezier(0.4, 0, 0.2, 1)', borderRadius: 4 }}/>
            </div>
          </div>

          {/* Stats row */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 16 }}>
            <div style={{ background: t.surface, border: `1px solid ${t.borderSoft}`, borderRadius: 14,
              padding: isMobile ? '14px 16px' : '16px 20px' }}>
              <div style={{ fontFamily: t.fontMono, fontSize: 10, letterSpacing: 1.5, color: t.textMute,
                fontWeight: 700, marginBottom: 4 }}>ROUNDS</div>
              <div style={{ fontFamily: t.fontMono, fontSize: isMobile ? 24 : 28, fontWeight: 800, color: t.text }}>
                {rounds || 0}
              </div>
            </div>
            <div style={{ background: t.surface, border: `1px solid ${t.borderSoft}`, borderRadius: 14,
              padding: isMobile ? '14px 16px' : '16px 20px' }}>
              <div style={{ fontFamily: t.fontMono, fontSize: 10, letterSpacing: 1.5, color: t.textMute,
                fontWeight: 700, marginBottom: 4 }}>WINNER</div>
              <div style={{ fontSize: isMobile ? 15 : 18, fontWeight: 700, color: winColor }}>
                {winner === 'draw' ? 'Draw' : winner === 'you' ? (myName || 'You') : 'Opponent'}
              </div>
            </div>
          </div>

          {/* Rematch */}
          {rematchVotes > 0 && (
            <div style={{ background: `${t.accent}10`, border: `1px solid ${t.accent}44`,
              borderRadius: 16, padding: isMobile ? '16px' : '20px 24px', marginBottom: 16, textAlign: 'center' }}>
              <div style={{ fontFamily: t.fontMono, fontSize: 10, letterSpacing: 2, color: t.accent,
                fontWeight: 700, marginBottom: 12 }}>REMATCH VOTE</div>
              <div style={{ display: 'flex', justifyContent: 'center', gap: 40, marginBottom: 12 }}>
                <Avatar theme={t} name={myName || 'You'} ready={rematchVotes >= 1}/>
                <Avatar theme={t} name="Opp" ready={rematchVotes >= 2}/>
              </div>
              <div style={{ fontSize: 12, color: t.textMute, fontFamily: t.fontMono, letterSpacing: 0.5 }}>
                {rematchVotes === 1 ? 'Waiting for opponent...' : '🎮 Rematch starting!'}
              </div>
            </div>
          )}

          {/* CTAs */}
          <div style={{ display: 'flex', gap: 10 }}>
            <Btn theme={t} size="lg" variant="ghost" onClick={onHome} style={{ flex: 1 }}>← Home</Btn>
            <Btn theme={t} size="lg" onClick={onRematch} style={{ flex: 2 }}>
              {rematchVotes > 0 ? `Rematch (${rematchVotes}/2)` : 'Rematch →'}
            </Btn>
          </div>
        </div>
      </div>
    </div>
  );
}
