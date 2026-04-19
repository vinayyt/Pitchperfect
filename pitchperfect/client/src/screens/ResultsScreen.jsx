import Btn from '../components/Btn';
import { ThemeToggle } from '../ThemeContext';

function Avatar({ theme: t, name, ready }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
      <div style={{ width: 56, height: 56, borderRadius: '50%',
        background: `${t.accent}22`, border: `2px solid ${ready ? t.success : t.border}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 20, fontWeight: 700, color: t.accent, transition: 'border-color 0.3s' }}>
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
  if (!result) return null;
  const { iWon, isDraw, scores, rounds } = result;
  const winner = iWon ? 'you' : isDraw ? 'draw' : 'opp';
  const myScore  = scores?.[0] ?? 0;
  const oppScore = scores?.[1] ?? 0;
  const total    = myScore + oppScore || 1;

  const winColor = winner === 'you' ? t.success : winner === 'draw' ? t.accent : t.danger;

  return (
    <div style={{ minHeight: '100vh', background: t.bg, fontFamily: t.fontDisplay, color: t.text,
      display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden' }}>

      {/* Ambient glow */}
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none',
        background: `radial-gradient(ellipse at 50% 20%, ${winColor}1a, transparent 60%)` }}/>

      {/* Nav */}
      <nav style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 48px',
        borderBottom: `1px solid ${t.borderSoft}`, position: 'relative', zIndex: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 20 }}>🏏</span>
          <span style={{ fontSize: 14, fontWeight: 800, letterSpacing: 2, color: t.accent, textTransform: 'uppercase' }}>Pitch Perfect</span>
        </div>
        <div style={{ fontFamily: t.fontMono, fontSize: 11, letterSpacing: 2, color: t.textMute, fontWeight: 700 }}>
          MATCH COMPLETE
        </div>
        <ThemeToggle theme={t}/>
      </nav>

      {/* Main content */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '60px 24px', position: 'relative', zIndex: 1 }}>
        <div style={{ width: '100%', maxWidth: 640 }}>

          {/* Headline */}
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <div style={{ fontSize: 80, marginBottom: 16, lineHeight: 1 }}>
              {winner === 'you' ? '🏆' : winner === 'draw' ? '🤝' : '🏏'}
            </div>
            <h1 style={{ fontSize: 64, fontWeight: 900, letterSpacing: -3, lineHeight: 1, marginBottom: 12,
              color: winColor }}>
              {winner === 'you' ? 'Victory' : winner === 'draw' ? 'Draw' : 'Defeat'}
            </h1>
            <p style={{ fontSize: 16, color: t.textMute, lineHeight: 1.6 }}>
              {winner === 'you'  ? 'Your deck dominated the innings.' :
               winner === 'draw' ? 'All square at stumps.' :
               'A valiant chase, but not enough.'}
            </p>
          </div>

          {/* Score card */}
          <div style={{ background: t.surface, border: `1px solid ${t.borderSoft}`, borderRadius: 20,
            padding: 32, marginBottom: 16 }}>

            {/* Score numbers */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontFamily: t.fontMono, fontSize: 11, letterSpacing: 2, color: t.textMute, fontWeight: 700, marginBottom: 8 }}>YOU</div>
                <div style={{ fontFamily: t.fontMono, fontSize: 56, fontWeight: 900, lineHeight: 1,
                  color: winner === 'you' ? t.success : t.text }}>{myScore}</div>
                <div style={{ fontFamily: t.fontMono, fontSize: 10, color: t.textDim, letterSpacing: 1, marginTop: 4 }}>CARDS</div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                <div style={{ fontFamily: t.fontMono, fontSize: 11, letterSpacing: 2, color: t.textDim }}>VS</div>
              </div>

              <div style={{ textAlign: 'center' }}>
                <div style={{ fontFamily: t.fontMono, fontSize: 11, letterSpacing: 2, color: t.textMute, fontWeight: 700, marginBottom: 8 }}>OPPONENT</div>
                <div style={{ fontFamily: t.fontMono, fontSize: 56, fontWeight: 900, lineHeight: 1,
                  color: winner === 'opp' ? t.danger : t.text }}>{oppScore}</div>
                <div style={{ fontFamily: t.fontMono, fontSize: 10, color: t.textDim, letterSpacing: 1, marginTop: 4 }}>CARDS</div>
              </div>
            </div>

            {/* Progress bar */}
            <div style={{ height: 8, background: t.bgElev, borderRadius: 4, overflow: 'hidden', display: 'flex' }}>
              <div style={{ width: `${(myScore / total) * 100}%`, height: '100%',
                background: `linear-gradient(90deg, ${winColor}, ${winColor}99)`,
                transition: 'width 1s cubic-bezier(0.4, 0, 0.2, 1)', borderRadius: 4 }}/>
            </div>
          </div>

          {/* Stats row */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 24 }}>
            <div style={{ background: t.surface, border: `1px solid ${t.borderSoft}`, borderRadius: 14, padding: '16px 20px' }}>
              <div style={{ fontFamily: t.fontMono, fontSize: 10, letterSpacing: 1.5, color: t.textMute, fontWeight: 700, marginBottom: 6 }}>ROUNDS PLAYED</div>
              <div style={{ fontFamily: t.fontMono, fontSize: 28, fontWeight: 800, color: t.text }}>{rounds || 0}</div>
            </div>
            <div style={{ background: t.surface, border: `1px solid ${t.borderSoft}`, borderRadius: 14, padding: '16px 20px' }}>
              <div style={{ fontFamily: t.fontMono, fontSize: 10, letterSpacing: 1.5, color: t.textMute, fontWeight: 700, marginBottom: 6 }}>WINNER</div>
              <div style={{ fontSize: 18, fontWeight: 700, color: winColor }}>
                {winner === 'draw' ? 'Draw' : winner === 'you' ? (myName || 'You') : 'Opponent'}
              </div>
            </div>
          </div>

          {/* Rematch status */}
          {rematchVotes > 0 && (
            <div style={{ background: `${t.accent}10`, border: `1px solid ${t.accent}44`,
              borderRadius: 16, padding: '20px 24px', marginBottom: 24, textAlign: 'center' }}>
              <div style={{ fontFamily: t.fontMono, fontSize: 10, letterSpacing: 2, color: t.accent, fontWeight: 700, marginBottom: 16 }}>
                REMATCH VOTE
              </div>
              <div style={{ display: 'flex', justifyContent: 'center', gap: 48, marginBottom: 16 }}>
                <Avatar theme={t} name={myName || 'You'} ready={rematchVotes >= 1}/>
                <Avatar theme={t} name="Opp" ready={rematchVotes >= 2}/>
              </div>
              <div style={{ fontSize: 12, color: t.textMute, fontFamily: t.fontMono, letterSpacing: 0.5 }}>
                {rematchVotes === 1 ? 'Waiting for opponent...' : '🎮 Rematch starting!'}
              </div>
            </div>
          )}

          {/* CTAs */}
          <div style={{ display: 'flex', gap: 12 }}>
            <Btn theme={t} size="lg" variant="ghost" onClick={onHome} style={{ flex: 1 }}>
              ← Home
            </Btn>
            <Btn theme={t} size="lg" onClick={onRematch} style={{ flex: 2 }}>
              {rematchVotes > 0 ? `Rematch (${rematchVotes}/2)` : 'Rematch →'}
            </Btn>
          </div>
        </div>
      </div>
    </div>
  );
}
