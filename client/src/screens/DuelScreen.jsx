import { useState, useEffect } from 'react';
import PlayerCard from '../components/PlayerCard';
import TimerRing from '../components/TimerRing';
import { STAT_BY_KEY } from '../data';
import { useResponsive } from '../hooks/useResponsive';

function getRuleText(statKey) {
  if (statKey === 'bestFig') return 'More wickets wins · tied wickets: fewer runs wins';
  if (statKey === 'econ')    return 'Lower Economy wins — fewer runs conceded per over';
  if (statKey === 'bowlAvg') return 'Lower Bowling Average wins — fewer runs per wicket';
  const stat = STAT_BY_KEY[statKey];
  if (!stat) return '';
  return stat.hi ? `Higher ${stat.label} wins` : `Lower ${stat.label} wins`;
}

function fmtVal(statKey, val) {
  if ((statKey === 'econ' || statKey === 'bowlAvg') && (val === 0 || val == null)) return 'N/A';
  const stat = STAT_BY_KEY[statKey];
  if (!stat || val == null) return '—';
  return stat.fmt(val);
}

export default function DuelScreen({ theme: t, state, lastRound, timeLeft, myName, oppName, onChooseStat, onQuit }) {
  const { isMobile } = useResponsive();
  const [selectedStat, setSelectedStat] = useState(null);
  const [phase, setPhase]               = useState('picking');
  const [roundResult, setRoundResult]   = useState(null);

  useEffect(() => {
    if (!lastRound) return;
    setSelectedStat(lastRound.statKey);
    setRoundResult(lastRound);
    setPhase('comparing');
  }, [lastRound]);

  const handleNextRound = () => { setPhase('picking'); setSelectedStat(null); setRoundResult(null); };
  const handlePickStat  = (key) => {
    if (!isMyTurn || phase !== 'picking') return;
    setSelectedStat(key);
    onChooseStat(key);
  };

  if (!state) return null;
  const { myTopCard, oppTopCard, myDeckCount, oppDeckCount, isMyTurn, potCount, roundCount, isVsBot } = state;
  const displayOppName = oppName || state.oppName || 'Opponent';
  const oppLabel       = isVsBot ? `🤖 ${displayOppName}` : displayOppName.toUpperCase();
  const isComparing    = phase === 'comparing';
  const timeLimit      = state.timeLimit || 600;
  const low            = (timeLeft ?? 0) < 30;

  const cmpKey    = roundResult?.statKey;
  const myVal     = cmpKey ? fmtVal(cmpKey, roundResult.myCard?.[cmpKey])  : '—';
  const oppVal    = cmpKey ? fmtVal(cmpKey, roundResult.oppCard?.[cmpKey]) : '—';
  const statLabel = cmpKey ? (STAT_BY_KEY[cmpKey]?.label || cmpKey) : '';
  const outcome   = roundResult?.iWon ? 'you' : roundResult?.isTie ? 'tie' : roundResult ? 'opp' : null;

  const outcomeColor = outcome === 'you' ? t.success : outcome === 'opp' ? t.danger : t.accent;
  const outcomeEmoji = outcome === 'you' ? '🏆' : outcome === 'tie' ? '🤝' : '💀';
  const outcomeText  = outcome === 'you' ? 'YOU WIN' : outcome === 'tie' ? 'TIE' : (isVsBot ? 'BOT WINS' : 'OPP WINS');

  /* ── Shared sub-sections ── */

  // Center comparison / picking panel
  const CenterPanel = () => isComparing && roundResult ? (
    <div style={{ borderRadius: 16, overflow: 'hidden', background: t.surface,
      border: `1px solid ${outcomeColor}55`, boxShadow: `0 0 32px ${outcomeColor}22`,
      width: isMobile ? '100%' : undefined }}>
      <div style={{ padding: '12px 20px', textAlign: 'center',
        background: `${outcomeColor}12`, borderBottom: `1px solid ${t.borderSoft}` }}>
        <div style={{ fontFamily: t.fontMono, fontSize: 10, letterSpacing: 2, color: t.textMute, fontWeight: 700 }}>
          ROUND {roundResult.round || roundCount} RESULT
        </div>
        <div style={{ fontFamily: t.fontMono, fontSize: 15, fontWeight: 900, color: t.accent,
          letterSpacing: 1, marginTop: 3, textTransform: 'uppercase' }}>{statLabel}</div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr',
        alignItems: 'center', padding: '16px 12px', gap: 4 }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontFamily: t.fontMono, fontSize: 10, letterSpacing: 1.5, color: t.textMute, fontWeight: 700, marginBottom: 6 }}>YOU</div>
          <div style={{ fontFamily: t.fontMono, fontSize: isMobile ? 32 : 36, fontWeight: 900, lineHeight: 1,
            color: outcome === 'you' ? t.success : outcome === 'opp' ? t.danger : t.accent }}>{myVal}</div>
        </div>
        <div style={{ fontFamily: t.fontMono, fontSize: 11, color: t.textDim, fontWeight: 700,
          letterSpacing: 1, padding: '0 6px', paddingTop: 16 }}>VS</div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontFamily: t.fontMono, fontSize: 10, letterSpacing: 1.5, color: t.textMute, fontWeight: 700, marginBottom: 6 }}>
            {isVsBot ? '🤖 BOT' : 'OPP'}
          </div>
          <div style={{ fontFamily: t.fontMono, fontSize: isMobile ? 32 : 36, fontWeight: 900, lineHeight: 1,
            color: outcome === 'opp' ? t.success : outcome === 'you' ? t.danger : t.accent }}>{oppVal}</div>
        </div>
      </div>

      <div style={{ margin: '0 14px', padding: '10px 16px', borderRadius: 10, textAlign: 'center',
        background: `${outcomeColor}18`, border: `1.5px solid ${outcomeColor}` }}>
        <span style={{ fontSize: 18 }}>{outcomeEmoji}</span>
        <span style={{ fontFamily: t.fontMono, fontSize: 13, fontWeight: 900, letterSpacing: 1.5,
          color: outcomeColor, marginLeft: 8 }}>{outcomeText}</span>
      </div>

      <div style={{ padding: '8px 20px', textAlign: 'center' }}>
        <div style={{ fontSize: 11, color: t.textMute, lineHeight: 1.5, fontStyle: 'italic' }}>
          {getRuleText(cmpKey)}
        </div>
      </div>

      {(roundResult.potCount > 0 || roundResult.isTie) && (
        <div style={{ margin: '0 14px', marginBottom: 10, padding: '7px 12px', borderRadius: 8,
          textAlign: 'center', background: `${t.accent}10`, border: `1px solid ${t.accent}44` }}>
          <span style={{ fontFamily: t.fontMono, fontSize: 11, color: t.accent, fontWeight: 700 }}>
            {roundResult.isTie ? 'Cards go to the pot · winner takes all' : `+${roundResult.potCount} pot cards won!`}
          </span>
        </div>
      )}

      <div style={{ padding: '6px 14px 14px' }}>
        {isMyTurn ? (
          <button onClick={handleNextRound} style={{ width: '100%', padding: '12px 16px', borderRadius: 10,
            cursor: 'pointer', fontFamily: t.fontMono, fontSize: 12, fontWeight: 700, letterSpacing: 1,
            border: `1.5px solid ${t.accent}`, background: `${t.accent}18`, color: t.accent, transition: 'all 0.15s' }}
          onMouseEnter={e => { e.currentTarget.style.background = t.accent; e.currentTarget.style.color = '#000'; }}
          onMouseLeave={e => { e.currentTarget.style.background = `${t.accent}18`; e.currentTarget.style.color = t.accent; }}>
            Next Round →
          </button>
        ) : (
          <div style={{ textAlign: 'center', padding: '8px 0', fontFamily: t.fontMono, fontSize: 11, color: t.textMute, letterSpacing: 1 }}>
            <span style={{ display: 'inline-block', width: 8, height: 8, borderRadius: '50%',
              background: t.accent, animation: 'pulse 1.2s ease-in-out infinite', marginRight: 8, verticalAlign: 'middle' }}/>
            Waiting for {isVsBot ? 'bot' : 'opponent'} to continue…
          </div>
        )}
      </div>
    </div>
  ) : (
    /* Picking phase */
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12,
      width: isMobile ? '100%' : undefined }}>
      {potCount > 0 && (
        <div style={{ padding: '10px 20px', borderRadius: 14, textAlign: 'center', width: '100%',
          background: `linear-gradient(135deg, ${t.accent}18, ${t.accent}08)`, border: `1px solid ${t.accent}` }}>
          <div style={{ fontFamily: t.fontMono, fontSize: 24, fontWeight: 800, color: t.accent }}>{potCount}</div>
          <div style={{ fontFamily: t.fontMono, fontSize: 10, letterSpacing: 1.5, color: t.accent, marginTop: 2 }}>CARDS IN POT</div>
          <div style={{ fontSize: 11, color: t.textMute, marginTop: 3 }}>Next winner takes all</div>
        </div>
      )}
      {!isMobile && (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
          <div style={{ width: 1, height: 32, background: t.borderSoft }}/>
          <div style={{ width: 44, height: 44, borderRadius: '50%', background: t.surface,
            border: `2px solid ${t.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: t.fontMono, fontSize: 12, fontWeight: 800, color: t.textMute, letterSpacing: 1 }}>VS</div>
          <div style={{ width: 1, height: 32, background: t.borderSoft }}/>
        </div>
      )}
      {isMyTurn ? (
        <div style={{ padding: '14px', background: `${t.accent}12`, border: `1px solid ${t.accent}44`,
          borderRadius: 14, textAlign: 'center', width: '100%' }}>
          <div style={{ fontSize: 18, marginBottom: 4 }}>🏏</div>
          <div style={{ fontFamily: t.fontMono, fontSize: 11, fontWeight: 700, letterSpacing: 1.5, color: t.accent }}>YOUR TURN</div>
          <div style={{ fontSize: 12, color: t.textMute, marginTop: 4, lineHeight: 1.5 }}>
            {isMobile ? 'Tap a stat on your card' : 'Pick a stat from your card to challenge'}
          </div>
        </div>
      ) : (
        <div style={{ padding: '14px', background: t.surface, border: `1px dashed ${t.borderSoft}`,
          borderRadius: 14, textAlign: 'center', width: '100%' }}>
          <div style={{ width: 10, height: 10, borderRadius: '50%', background: t.accent,
            animation: 'pulse 1.2s ease-in-out infinite', margin: '0 auto 8px' }}/>
          <div style={{ fontFamily: t.fontMono, fontSize: 11, fontWeight: 700, letterSpacing: 1.5, color: t.textMute }}>
            OPPONENT'S TURN
          </div>
          <div style={{ fontSize: 12, color: t.textMute, marginTop: 4 }}>Waiting for them to pick…</div>
        </div>
      )}
    </div>
  );

  /* ── Mobile layout ── */
  if (isMobile) {
    return (
      <div style={{ minHeight: '100vh', background: t.bg, fontFamily: t.fontDisplay, color: t.text,
        display: 'flex', flexDirection: 'column' }}>

        {/* Compact HUD */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '8px 16px', borderBottom: `1px solid ${t.borderSoft}`,
          background: `${t.bg}ee`, backdropFilter: 'blur(12px)',
          position: 'sticky', top: 52, zIndex: 100 }}>
          <span style={{ fontFamily: t.fontMono, fontSize: 11, letterSpacing: 1.5, color: t.textMute, fontWeight: 700 }}>
            R{roundCount || 1}
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontFamily: t.fontMono, fontSize: 13, fontWeight: 800, color: t.accent }}>{myDeckCount}</span>
            <TimerRing remaining={timeLeft ?? 0} total={timeLimit} theme={t} size={38} stroke={3} low={low}/>
            <span style={{ fontFamily: t.fontMono, fontSize: 13, fontWeight: 800, color: t.textMute }}>{oppDeckCount}</span>
          </div>
          <button onClick={onQuit} style={{ all: 'unset', cursor: 'pointer', fontFamily: t.fontMono,
            fontSize: 11, color: t.textDim, padding: '5px 9px',
            border: `1px solid ${t.borderSoft}`, borderRadius: 8 }}>✕</button>
        </div>

        {/* Mobile arena: opponent top, panel mid, my card bottom */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '12px 14px', gap: 10,
          overflowY: 'auto' }}>

          {/* Opp row */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '5px 12px',
              background: t.surface, border: `1px solid ${t.borderSoft}`, borderRadius: 20, flexShrink: 0 }}>
              <div style={{ width: 7, height: 7, borderRadius: '50%',
                background: !isMyTurn && !isComparing ? t.accent : t.textMute,
                animation: !isMyTurn && phase === 'picking' ? 'pulse 1.2s ease-in-out infinite' : 'none' }}/>
              <span style={{ fontFamily: t.fontMono, fontSize: 10, letterSpacing: 1, color: t.textMute, fontWeight: 700 }}>
                {isVsBot ? '🤖' : 'OPP'}{!isMyTurn && phase === 'picking' ? ' · PICKING' : ''}
              </span>
            </div>
            <div style={{ flex: 1, overflow: 'hidden', display: 'flex', justifyContent: 'center',
              opacity: isComparing ? 1 : 0.6, transition: 'opacity 0.3s' }}>
              {oppTopCard
                ? <PlayerCard player={oppTopCard} theme={t} size="sm" revealed={isComparing}
                    selectedStat={isComparing ? cmpKey : null}
                    highlightWinner={isComparing && outcome === 'you' ? 'opp' : isComparing && outcome === 'opp' ? 'this' : null}/>
                : <div style={{ padding: '12px 20px', background: t.surface, borderRadius: 12,
                    border: `1px dashed ${t.borderSoft}`, color: t.textDim, fontSize: 12, fontFamily: t.fontMono }}>
                    OPP DECK EMPTY
                  </div>
              }
            </div>
          </div>

          {/* Center panel */}
          <CenterPanel />

          {/* My card */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '5px 12px',
              background: t.surface,
              border: `1px solid ${isMyTurn && phase === 'picking' ? t.accent : t.borderSoft}`,
              borderRadius: 20, transition: 'border-color 0.2s' }}>
              <div style={{ width: 7, height: 7, borderRadius: '50%',
                background: isMyTurn && !isComparing ? t.accent : t.textMute,
                animation: isMyTurn && phase === 'picking' ? 'pulse 1.2s ease-in-out infinite' : 'none' }}/>
              <span style={{ fontFamily: t.fontMono, fontSize: 10, letterSpacing: 1,
                color: isMyTurn && phase === 'picking' ? t.accent : t.textMute, fontWeight: 700 }}>
                YOU{isMyTurn && phase === 'picking' ? ' · TAP A STAT' : ''}
              </span>
            </div>
            <div style={{ transition: 'filter 0.4s',
              filter: isComparing && outcome === 'opp' ? 'brightness(0.65) saturate(0.5)' : 'none' }}>
              {myTopCard
                ? <PlayerCard player={myTopCard} theme={t} size="md"
                    selectedStat={selectedStat}
                    onPickStat={isMyTurn && phase === 'picking' ? handlePickStat : null}
                    highlightWinner={isComparing && outcome === 'you' ? 'this' : isComparing && outcome === 'opp' ? 'opp' : null}/>
                : <div style={{ padding: '16px 24px', background: t.surface, borderRadius: 16,
                    border: `2px dashed ${t.borderSoft}`, color: t.textMute, fontSize: 13,
                    fontFamily: t.fontMono, textAlign: 'center' }}>
                    YOUR DECK EMPTY
                  </div>
              }
            </div>
          </div>
        </div>

        <style>{`@keyframes pulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:.4;transform:scale(.85)}}`}</style>
      </div>
    );
  }

  /* ── Desktop layout ── */
  return (
    <div style={{ minHeight: '100vh', background: t.bg, fontFamily: t.fontDisplay, color: t.text, display: 'flex', flexDirection: 'column' }}>

      {/* HUD bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 48px',
        borderBottom: `1px solid ${t.borderSoft}`, background: `${t.bg}ee`, backdropFilter: 'blur(12px)',
        position: 'sticky', top: 52, zIndex: 100 }}>
        <span style={{ fontFamily: t.fontMono, fontSize: 11, letterSpacing: 2, color: t.textMute, fontWeight: 700 }}>
          ROUND {roundCount || 1}
        </span>
        <TimerRing remaining={timeLeft ?? 0} total={timeLimit} theme={t} size={52} stroke={4} low={low}/>
        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontFamily: t.fontMono, fontSize: 10, letterSpacing: 1.5, color: t.textMute, fontWeight: 700 }}>YOU</div>
              <div style={{ fontFamily: t.fontMono, fontSize: 22, fontWeight: 800, color: t.accent }}>{myDeckCount}</div>
            </div>
            <div style={{ fontFamily: t.fontMono, fontSize: 10, color: t.textDim, letterSpacing: 1 }}>CARDS</div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontFamily: t.fontMono, fontSize: 10, letterSpacing: 1.5, color: t.textMute, fontWeight: 700 }}>{isVsBot ? '🤖' : 'OPP'}</div>
              <div style={{ fontFamily: t.fontMono, fontSize: 22, fontWeight: 800, color: t.textMute }}>{oppDeckCount}</div>
            </div>
          </div>
          <button onClick={onQuit} style={{ all: 'unset', cursor: 'pointer', fontFamily: t.fontMono,
            fontSize: 11, color: t.textDim, letterSpacing: 0.5, padding: '6px 10px',
            border: `1px solid ${t.borderSoft}`, borderRadius: 8 }}>✕ quit</button>
        </div>
      </div>

      {/* Desktop 3-col arena */}
      <div style={{ flex: 1, maxWidth: 1200, margin: '0 auto', width: '100%', padding: '40px 48px',
        display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: 40, alignItems: 'start' }}>

        {/* Left: Opp */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 14px',
            background: t.surface, border: `1px solid ${t.borderSoft}`, borderRadius: 20 }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%',
              background: !isMyTurn && !isComparing ? t.accent : t.textMute,
              animation: !isMyTurn && phase === 'picking' ? 'pulse 1.2s ease-in-out infinite' : 'none' }}/>
            <span style={{ fontFamily: t.fontMono, fontSize: 10, letterSpacing: 1.5, color: t.textMute, fontWeight: 700 }}>
              {oppLabel}{!isMyTurn && phase === 'picking' ? ' · PICKING' : ''}
            </span>
          </div>
          <div style={{ transition: 'opacity 0.4s, transform 0.4s',
            opacity: isComparing ? 1 : 0.7, transform: isComparing ? 'scale(1)' : 'scale(0.97)' }}>
            {oppTopCard
              ? <PlayerCard player={oppTopCard} theme={t} size="lg" revealed={isComparing}
                  selectedStat={isComparing ? cmpKey : null}
                  highlightWinner={isComparing && outcome === 'you' ? 'opp' : isComparing && outcome === 'opp' ? 'this' : null}/>
              : <div style={{ width: 296, height: 470, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: t.surface, border: `2px dashed ${t.borderSoft}`, borderRadius: 20,
                  color: t.textMute, fontSize: 13, fontFamily: t.fontMono, letterSpacing: 1, textAlign: 'center', lineHeight: 2 }}>OPPONENT<br/>DECK EMPTY</div>
            }
          </div>
        </div>

        {/* Center */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, minWidth: 240, paddingTop: 50 }}>
          <CenterPanel />
        </div>

        {/* Right: My card */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 14px',
            background: t.surface, border: `1px solid ${isMyTurn && phase === 'picking' ? t.accent : t.borderSoft}`,
            borderRadius: 20, transition: 'border-color 0.2s' }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%',
              background: isMyTurn && !isComparing ? t.accent : t.textMute,
              animation: isMyTurn && phase === 'picking' ? 'pulse 1.2s ease-in-out infinite' : 'none' }}/>
            <span style={{ fontFamily: t.fontMono, fontSize: 10, letterSpacing: 1.5,
              color: isMyTurn && phase === 'picking' ? t.accent : t.textMute, fontWeight: 700 }}>
              YOU{isMyTurn && phase === 'picking' ? ' · PICK A STAT' : ''}
            </span>
          </div>
          <div style={{ transition: 'filter 0.4s',
            filter: isComparing && outcome === 'opp' ? 'brightness(0.65) saturate(0.5)' : 'none' }}>
            {myTopCard
              ? <PlayerCard player={myTopCard} theme={t} size="lg"
                  selectedStat={selectedStat}
                  onPickStat={isMyTurn && phase === 'picking' ? handlePickStat : null}
                  highlightWinner={isComparing && outcome === 'you' ? 'this' : isComparing && outcome === 'opp' ? 'opp' : null}/>
              : <div style={{ width: 296, height: 470, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: t.surface, border: `2px dashed ${t.borderSoft}`, borderRadius: 20,
                  color: t.textMute, fontSize: 13, fontFamily: t.fontMono, letterSpacing: 1, textAlign: 'center', lineHeight: 2 }}>YOUR<br/>DECK EMPTY</div>
            }
          </div>
        </div>
      </div>

      <style>{`@keyframes pulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:.4;transform:scale(.85)}}`}</style>
    </div>
  );
}
