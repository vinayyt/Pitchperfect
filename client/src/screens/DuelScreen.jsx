import { useState, useEffect } from 'react';
import PlayerCard from '../components/PlayerCard';
import TimerRing from '../components/TimerRing';
import Btn from '../components/Btn';
import { ThemeToggle } from '../ThemeContext';
import { STAT_BY_KEY } from '../data';

export default function DuelScreen({ theme: t, state, lastRound, timeLeft, myName, onChooseStat, onQuit }) {
  const [selectedStat, setSelectedStat] = useState(null);
  const [phase, setPhase] = useState('picking'); // picking | revealed | resolved
  const [roundResult, setRoundResult] = useState(null);

  useEffect(() => {
    if (!lastRound) return;
    setSelectedStat(lastRound.statKey);
    setRoundResult(lastRound);
    setPhase('revealed');
    const t1 = setTimeout(() => setPhase('resolved'), 800);
    const t2 = setTimeout(() => {
      setPhase('picking');
      setSelectedStat(null);
      setRoundResult(null);
    }, 2600);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [lastRound]);

  if (!state) return null;
  const { myTopCard, oppTopCard, myDeckCount, oppDeckCount, isMyTurn, potCount, roundCount } = state;
  const isRevealed = phase === 'revealed' || phase === 'resolved';
  const outcome = roundResult?.iWon ? 'you' : roundResult?.isTie ? 'tie' : roundResult ? 'opp' : null;

  const handlePickStat = (key) => {
    if (!isMyTurn || phase !== 'picking') return;
    setSelectedStat(key);
    onChooseStat(key);
  };

  const timeLimit = state.timeLimit || 600;
  const low = (timeLeft ?? 0) < 30;

  return (
    <div style={{ minHeight: '100vh', background: t.bg, fontFamily: t.fontDisplay, color: t.text, display: 'flex', flexDirection: 'column' }}>

      {/* ── Nav ── */}
      <nav style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 48px',
        borderBottom: `1px solid ${t.borderSoft}`, background: `${t.bg}ee`, backdropFilter: 'blur(12px)',
        position: 'sticky', top: 0, zIndex: 100 }}>

        {/* Left: Logo + round */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 20 }}>🏏</span>
            <span style={{ fontSize: 14, fontWeight: 800, letterSpacing: 2, color: t.accent, textTransform: 'uppercase' }}>Pitch Perfect</span>
          </div>
          <div style={{ width: 1, height: 20, background: t.borderSoft }}/>
          <span style={{ fontFamily: t.fontMono, fontSize: 11, letterSpacing: 2, color: t.textMute, fontWeight: 700 }}>
            ROUND {roundCount || 1}
          </span>
        </div>

        {/* Center: Timer */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
          <TimerRing remaining={timeLeft ?? 0} total={timeLimit} theme={t} size={52} stroke={4} low={low}/>
        </div>

        {/* Right: Scores + quit */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontFamily: t.fontMono, fontSize: 10, letterSpacing: 1.5, color: t.textMute, fontWeight: 700 }}>YOU</div>
              <div style={{ fontFamily: t.fontMono, fontSize: 22, fontWeight: 800, color: t.accent }}>{myDeckCount}</div>
            </div>
            <div style={{ fontFamily: t.fontMono, fontSize: 10, color: t.textDim, letterSpacing: 1 }}>CARDS</div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontFamily: t.fontMono, fontSize: 10, letterSpacing: 1.5, color: t.textMute, fontWeight: 700 }}>OPP</div>
              <div style={{ fontFamily: t.fontMono, fontSize: 22, fontWeight: 800, color: t.textMute }}>{oppDeckCount}</div>
            </div>
          </div>
          <ThemeToggle theme={t}/>
          <button onClick={onQuit} style={{ all: 'unset', cursor: 'pointer', fontFamily: t.fontMono,
            fontSize: 11, color: t.textDim, letterSpacing: 0.5, padding: '6px 10px',
            border: `1px solid ${t.borderSoft}`, borderRadius: 8 }}>✕ quit</button>
        </div>
      </nav>

      {/* ── Main arena ── */}
      <div style={{ flex: 1, maxWidth: 1200, margin: '0 auto', width: '100%', padding: '40px 48px',
        display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: 40, alignItems: 'start' }}>

        {/* ── Left: Opponent card ── */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 14px',
            background: t.surface, border: `1px solid ${t.borderSoft}`, borderRadius: 20 }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%',
              background: !isMyTurn ? t.accent : t.textMute,
              animation: !isMyTurn && phase === 'picking' ? 'pulse 1.2s ease-in-out infinite' : 'none' }}/>
            <span style={{ fontFamily: t.fontMono, fontSize: 10, letterSpacing: 1.5, color: t.textMute, fontWeight: 700 }}>
              OPPONENT{!isMyTurn && phase === 'picking' ? ' · PICKING' : ''}
            </span>
          </div>

          <div style={{ transition: 'opacity 0.4s, transform 0.4s',
            opacity: isRevealed ? 1 : 0.7,
            transform: isRevealed ? 'scale(1)' : 'scale(0.97)' }}>
            {oppTopCard
              ? <PlayerCard player={oppTopCard} theme={t} size="lg" revealed={isRevealed}
                  selectedStat={selectedStat}
                  highlightWinner={phase === 'resolved' && outcome === 'you' ? 'opp' : phase === 'resolved' && outcome === 'opp' ? 'this' : null}/>
              : <div style={{ width: 296, height: 470, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: t.surface, border: `2px dashed ${t.borderSoft}`, borderRadius: 20,
                  color: t.textMute, fontSize: 13, fontFamily: t.fontMono, letterSpacing: 1 }}>OPPONENT<br/>DECK EMPTY</div>
            }
          </div>
        </div>

        {/* ── Center: Status panel ── */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, minWidth: 220, paddingTop: 50 }}>

          {/* Pot */}
          {potCount > 0 && (
            <div style={{ padding: '12px 20px', borderRadius: 14, textAlign: 'center', width: '100%',
              background: `linear-gradient(135deg, ${t.accent}18, ${t.accent}08)`,
              border: `1px solid ${t.accent}` }}>
              <div style={{ fontFamily: t.fontMono, fontSize: 28, fontWeight: 800, color: t.accent }}>{potCount}</div>
              <div style={{ fontFamily: t.fontMono, fontSize: 10, letterSpacing: 1.5, color: t.accent, marginTop: 2 }}>CARDS IN POT</div>
              <div style={{ fontSize: 11, color: t.textMute, marginTop: 4 }}>Next winner takes all</div>
            </div>
          )}

          {/* VS divider */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
            <div style={{ width: 1, height: 40, background: t.borderSoft }}/>
            <div style={{ width: 44, height: 44, borderRadius: '50%', background: t.surface,
              border: `2px solid ${t.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: t.fontMono, fontSize: 12, fontWeight: 800, color: t.textMute, letterSpacing: 1 }}>VS</div>
            <div style={{ width: 1, height: 40, background: t.borderSoft }}/>
          </div>

          {/* Phase status */}
          {phase === 'picking' && (
            isMyTurn ? (
              <div style={{ padding: '16px', background: `${t.accent}12`, border: `1px solid ${t.accent}44`,
                borderRadius: 14, textAlign: 'center', width: '100%' }}>
                <div style={{ fontSize: 20, marginBottom: 6 }}>🏏</div>
                <div style={{ fontFamily: t.fontMono, fontSize: 11, fontWeight: 700, letterSpacing: 1.5, color: t.accent }}>
                  YOUR TURN
                </div>
                <div style={{ fontSize: 12, color: t.textMute, marginTop: 6, lineHeight: 1.5 }}>
                  Pick a stat from<br/>your card to challenge
                </div>
              </div>
            ) : (
              <div style={{ padding: '16px', background: t.surface, border: `1px dashed ${t.borderSoft}`,
                borderRadius: 14, textAlign: 'center', width: '100%' }}>
                <div style={{ width: 10, height: 10, borderRadius: '50%', background: t.accent,
                  animation: 'pulse 1.2s ease-in-out infinite', margin: '0 auto 10px' }}/>
                <div style={{ fontFamily: t.fontMono, fontSize: 11, fontWeight: 700, letterSpacing: 1.5, color: t.textMute }}>
                  OPPONENT'S TURN
                </div>
                <div style={{ fontSize: 12, color: t.textMute, marginTop: 6 }}>Waiting for them to pick…</div>
              </div>
            )
          )}

          {phase === 'revealed' && selectedStat && (
            <div style={{ padding: '16px', background: t.surface, border: `1px solid ${t.accent}`,
              borderRadius: 14, textAlign: 'center', width: '100%' }}>
              <div style={{ fontFamily: t.fontMono, fontSize: 10, letterSpacing: 2, color: t.textMute, marginBottom: 6 }}>COMPARING</div>
              <div style={{ fontFamily: t.fontMono, fontSize: 15, fontWeight: 800, color: t.accent, letterSpacing: 1 }}>
                {(STAT_BY_KEY[selectedStat]?.label || selectedStat).toUpperCase()}
              </div>
            </div>
          )}

          {phase === 'resolved' && (
            <div style={{ padding: '20px', borderRadius: 14, textAlign: 'center', width: '100%',
              background: outcome === 'tie' ? `${t.accent}12` : outcome === 'you' ? `${t.success}12` : `${t.danger}12`,
              border: `2px solid ${outcome === 'tie' ? t.accent : outcome === 'you' ? t.success : t.danger}` }}>
              <div style={{ fontSize: 28, marginBottom: 8 }}>
                {outcome === 'you' ? '🏆' : outcome === 'tie' ? '🤝' : '💀'}
              </div>
              <div style={{ fontFamily: t.fontMono, fontSize: 13, fontWeight: 800, letterSpacing: 1,
                color: outcome === 'tie' ? t.accent : outcome === 'you' ? t.success : t.danger }}>
                {outcome === 'tie' ? 'TIE' : outcome === 'you' ? 'YOU WIN' : 'OPP WINS'}
              </div>
              {outcome === 'tie' && (
                <div style={{ fontSize: 11, color: t.textMute, marginTop: 6 }}>{potCount} cards to the pot</div>
              )}
            </div>
          )}
        </div>

        {/* ── Right: My card ── */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 14px',
            background: t.surface, border: `1px solid ${isMyTurn && phase === 'picking' ? t.accent : t.borderSoft}`,
            borderRadius: 20, transition: 'border-color 0.2s' }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%',
              background: isMyTurn ? t.accent : t.textMute,
              animation: isMyTurn && phase === 'picking' ? 'pulse 1.2s ease-in-out infinite' : 'none' }}/>
            <span style={{ fontFamily: t.fontMono, fontSize: 10, letterSpacing: 1.5,
              color: isMyTurn && phase === 'picking' ? t.accent : t.textMute, fontWeight: 700 }}>
              YOU{isMyTurn && phase === 'picking' ? ' · PICK A STAT' : ''}
            </span>
          </div>

          <div style={{ transition: 'filter 0.4s',
            filter: phase === 'resolved' && outcome === 'opp' ? 'brightness(0.7) saturate(0.6)' : 'none' }}>
            {myTopCard
              ? <PlayerCard player={myTopCard} theme={t} size="lg"
                  selectedStat={selectedStat}
                  onPickStat={isMyTurn && phase === 'picking' ? handlePickStat : null}
                  highlightWinner={phase === 'resolved' && outcome === 'you' ? 'this' : phase === 'resolved' && outcome === 'opp' ? 'opp' : null}/>
              : <div style={{ width: 296, height: 470, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: t.surface, border: `2px dashed ${t.borderSoft}`, borderRadius: 20,
                  color: t.textMute, fontSize: 13, fontFamily: t.fontMono, letterSpacing: 1 }}>YOUR<br/>DECK EMPTY</div>
            }
          </div>

          {/* Confirm button when stat selected */}
          {isMyTurn && phase === 'picking' && selectedStat && (
            <Btn theme={t} size="lg" style={{ width: '100%', maxWidth: 296 }}
              onClick={() => setPhase('revealed')}>
              Challenge on {STAT_BY_KEY[selectedStat]?.label || selectedStat} →
            </Btn>
          )}
        </div>
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.4; transform: scale(0.85); }
        }
        @keyframes potGlow {
          0%, 100% { box-shadow: 0 0 0 0 transparent; }
          50% { box-shadow: 0 0 16px 2px ${t.accent}44; }
        }
      `}</style>
    </div>
  );
}
