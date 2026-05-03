import { useState, useEffect, useRef } from 'react';
import { AUCTION_TEAMS, RARITIES } from '../data';
import { useResponsive } from '../hooks/useResponsive';

const ROLE_LABEL  = { BAT: 'Batter', BWL: 'Bowler', ALL: 'All-rounder', WK: 'Keeper' };
const BASE_BUDGET = 12000;

export default function AuctionScreen({
  theme: t,
  phase = 'auction',
  player = null,
  currentBid = 0,
  currentBidder = null,
  myTeamKey = '',
  myBudget = BASE_BUDGET,
  teams = [],
  soldLog = [],
  bidMessage = '',
  lastSold = null,
  onBid,
}) {
  const { isMobile } = useResponsive();
  const [customBid, setCustomBid] = useState('');
  const [timeLeft,  setTimeLeft]  = useState(20);
  const [showLog,   setShowLog]   = useState(false); // mobile sold log toggle
  const timerRef = useRef(null);
  const logRef   = useRef(null);

  useEffect(() => {
    setTimeLeft(20); setCustomBid('');
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => setTimeLeft(t => Math.max(0, t - 1)), 1000);
    return () => clearInterval(timerRef.current);
  }, [player?.id]);

  useEffect(() => {
    if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight;
  }, [soldLog.length]);

  const minBid = currentBid === 0 ? (player?.basePrice || 5) : currentBid + 5;
  const canBid = myTeamKey !== currentBidder && minBid <= myBudget && player;

  const myTeamInfo        = AUCTION_TEAMS[myTeamKey] || {};
  const currentBidderInfo = currentBidder ? (AUCTION_TEAMS[currentBidder] || {}) : null;
  const rarColor          = RARITIES[player?.rarity]?.color || t.accent;
  const timerPct          = timeLeft / 20;
  const timerColor        = timeLeft > 10 ? t.success : timeLeft > 5 ? '#f4a623' : t.danger;
  const quickBids         = player
    ? [minBid, minBid + 25, minBid + 75, minBid + 150].filter(b => b <= myBudget)
    : [];

  const handleBid = amt => {
    if (!canBid || !amt || isNaN(amt) || amt < minBid || amt > myBudget) return;
    onBid(Number(amt)); setCustomBid('');
  };

  /* ── Timer SVG ── */
  const Timer = ({ size = 60 }) => (
    <div style={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)', position: 'absolute', top: 0, left: 0 }}>
        <circle cx={size/2} cy={size/2} r={size/2 - 4} fill="none" stroke={t.borderSoft} strokeWidth="4" />
        <circle cx={size/2} cy={size/2} r={size/2 - 4} fill="none" stroke={timerColor} strokeWidth="4"
          strokeDasharray={`${2 * Math.PI * (size/2 - 4)}`}
          strokeDashoffset={`${2 * Math.PI * (size/2 - 4) * (1 - timerPct)}`}
          strokeLinecap="round" style={{ transition: 'stroke-dashoffset 1s linear, stroke 0.3s' }}/>
      </svg>
      <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center',
        justifyContent: 'center', fontSize: size * 0.34, fontWeight: 900,
        color: timerColor, fontFamily: t.fontMono }}>{timeLeft}</div>
    </div>
  );

  /* ── Bid panel (shared between mobile/desktop) ── */
  const BidPanel = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      {/* Current bid banner */}
      <div style={{ padding: isMobile ? '14px 16px' : '18px 22px', borderRadius: 14,
        background: currentBidder ? `${AUCTION_TEAMS[currentBidder]?.primary || t.accent}18` : t.surface,
        border: `1px solid ${currentBidder ? (AUCTION_TEAMS[currentBidder]?.primary || t.accent) + '44' : t.borderSoft}` }}>
        <div style={{ fontSize: 10, color: t.textMute, fontFamily: t.fontMono, letterSpacing: 1,
          textTransform: 'uppercase', marginBottom: 6 }}>Current Highest Bid</div>
        <div style={{ fontSize: isMobile ? 34 : 42, fontWeight: 900, letterSpacing: -2, color: t.text, lineHeight: 1 }}>
          {currentBid > 0 ? `${currentBid}L` : `${player?.basePrice || '—'}L`}
        </div>
        <div style={{ fontSize: 12, color: t.textMute, marginTop: 3 }}>
          ₹{((currentBid || player?.basePrice || 0) / 100).toFixed(2)} Cr
        </div>
        {currentBidder ? (
          <div style={{ marginTop: 6, display: 'flex', alignItems: 'center', gap: 6 }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%',
              background: AUCTION_TEAMS[currentBidder]?.primary || t.accent }} />
            <span style={{ fontSize: 13, color: t.textMute }}>
              {AUCTION_TEAMS[currentBidder]?.short || currentBidder}
              {currentBidder === myTeamKey ? ' — You\'re highest!' : ''}
            </span>
          </div>
        ) : (
          <div style={{ marginTop: 4, fontSize: 12, color: t.textDim, fontFamily: t.fontMono }}>
            No bids yet — open at base price
          </div>
        )}
      </div>

      {/* Sold/unsold flash */}
      {bidMessage && lastSold && (
        <div style={{ padding: '10px 16px', borderRadius: 10, textAlign: 'center',
          background: bidMessage === 'sold' ? `${t.success}22` : `${t.danger}22`,
          border: `1px solid ${bidMessage === 'sold' ? t.success : t.danger}66` }}>
          {bidMessage === 'sold' ? (
            <>
              <div style={{ fontSize: 14, fontWeight: 700, color: t.success }}>🔨 SOLD!</div>
              <div style={{ fontSize: 12, color: t.textMute, fontFamily: t.fontMono }}>
                {lastSold.teamName} — ₹{(lastSold.price / 100).toFixed(2)} Cr
              </div>
            </>
          ) : (
            <div style={{ fontSize: 14, fontWeight: 700, color: t.danger }}>❌ UNSOLD</div>
          )}
        </div>
      )}

      {/* Quick bids */}
      {canBid && quickBids.length > 0 && (
        <div>
          <div style={{ fontSize: 10, color: t.textMute, fontFamily: t.fontMono, letterSpacing: 1,
            textTransform: 'uppercase', marginBottom: 8 }}>Quick Bid</div>
          <div style={{ display: 'grid', gridTemplateColumns: `repeat(${Math.min(quickBids.length, isMobile ? 2 : 4)}, 1fr)`, gap: 8 }}>
            {quickBids.map(amt => (
              <button key={amt} onClick={() => handleBid(amt)} style={{
                all: 'unset', cursor: 'pointer',
                padding: isMobile ? '12px 8px' : '10px 16px',
                borderRadius: 10, border: `1.5px solid ${myTeamInfo.primary || t.accent}66`,
                background: `${myTeamInfo.primary || t.accent}12`,
                fontSize: isMobile ? 15 : 14, fontWeight: 700,
                color: myTeamInfo.primary || t.accent,
                fontFamily: t.fontMono, transition: 'all 0.15s', textAlign: 'center',
              }}
              onMouseEnter={e => e.currentTarget.style.borderColor = myTeamInfo.primary || t.accent}
              onMouseLeave={e => e.currentTarget.style.borderColor = `${myTeamInfo.primary || t.accent}66`}>
                {amt}L
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Custom bid */}
      {canBid && (
        <div>
          <div style={{ fontSize: 10, color: t.textMute, fontFamily: t.fontMono, letterSpacing: 1,
            textTransform: 'uppercase', marginBottom: 8 }}>Custom Bid (Lakhs)</div>
          <div style={{ display: 'flex', gap: 8 }}>
            <input type="number" min={minBid} max={myBudget} step={5}
              value={customBid} onChange={e => setCustomBid(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleBid(customBid)}
              placeholder={`Min ${minBid}L`}
              style={{ flex: 1, padding: '11px 14px', borderRadius: 10,
                border: `1px solid ${t.borderSoft}`, background: t.surface,
                color: t.text, fontSize: 15, fontFamily: t.fontMono, outline: 'none' }}/>
            <button onClick={() => handleBid(customBid)} disabled={!customBid} style={{
              all: 'unset', cursor: customBid ? 'pointer' : 'not-allowed',
              padding: '11px 18px', borderRadius: 10,
              background: customBid ? (myTeamInfo.primary || t.accent) : t.surface,
              color: customBid ? '#000' : t.textDim,
              fontSize: 14, fontWeight: 700, fontFamily: t.fontMono, transition: 'all 0.15s' }}>Bid →</button>
          </div>
        </div>
      )}

      {!canBid && currentBidder === myTeamKey && (
        <div style={{ padding: '12px 16px', borderRadius: 10,
          background: `${t.success}18`, border: `1px solid ${t.success}44`,
          fontSize: 14, color: t.success }}>
          🏆 You're the highest bidder! Waiting…
        </div>
      )}
      {!canBid && currentBidder !== myTeamKey && myBudget < minBid && (
        <div style={{ padding: '12px 16px', borderRadius: 10,
          background: `${t.danger}18`, border: `1px solid ${t.danger}44`,
          fontSize: 13, color: t.danger, fontFamily: t.fontMono }}>
          Insufficient budget for this player.
        </div>
      )}
    </div>
  );

  /* ── Player card ── */
  const PlayerPanel = () => (
    <div style={{ display: 'flex', flexDirection: isMobile ? 'row' : 'column',
      alignItems: isMobile ? 'center' : 'center', gap: isMobile ? 14 : 16 }}>
      <Timer size={isMobile ? 52 : 64} />
      {player ? (
        <AuctionPlayerCard player={player} t={t} rarColor={rarColor} compact={isMobile} />
      ) : (
        <div style={{ color: t.textDim, fontSize: 13, fontFamily: t.fontMono }}>Loading…</div>
      )}
    </div>
  );

  /* ── MOBILE LAYOUT ── */
  if (isMobile) {
    return (
      <div style={{ minHeight: '100vh', background: t.bg, fontFamily: t.fontDisplay,
        color: t.text, display: 'flex', flexDirection: 'column' }}>

        {/* Mobile top bar: my team + budget */}
        <div style={{ padding: '8px 14px', background: t.bgElev,
          borderBottom: `1px solid ${t.borderSoft}`,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: myTeamInfo.primary || t.accent }} />
            <span style={{ fontSize: 12, color: t.textMute, fontFamily: t.fontMono }}>{myTeamInfo.short || myTeamKey}</span>
            <span style={{ fontSize: 13, fontWeight: 800, color: myTeamInfo.primary || t.accent, fontFamily: t.fontMono }}>
              ₹{(myBudget / 100).toFixed(0)}Cr
            </span>
          </div>
          <span style={{ fontSize: 11, fontWeight: 700, color: t.accent, fontFamily: t.fontMono,
            letterSpacing: 1, textTransform: 'uppercase' }}>
            {phase === 'second_round' ? 'Round 2' : 'Auction'}
          </span>
          <button onClick={() => setShowLog(v => !v)} style={{
            all: 'unset', cursor: 'pointer', fontSize: 11, color: t.textMute,
            fontFamily: t.fontMono, padding: '4px 10px', borderRadius: 8,
            border: `1px solid ${t.borderSoft}`,
            background: showLog ? `${t.accent}18` : 'transparent',
          }}>
            Log ({soldLog.length})
          </button>
        </div>

        {showLog ? (
          /* Sold log view */
          <div style={{ flex: 1, overflowY: 'auto', padding: '12px 14px' }}>
            {soldLog.length === 0 ? (
              <div style={{ textAlign: 'center', padding: 40, color: t.textDim, fontFamily: t.fontMono, fontSize: 13 }}>
                No sales yet
              </div>
            ) : [...soldLog].reverse().map((entry, i) => {
              const info = AUCTION_TEAMS[entry.soldTo] || {};
              const rar  = RARITIES[entry.player?.rarity] || {};
              return (
                <div key={i} style={{ padding: '10px 12px', borderRadius: 10, marginBottom: 8,
                  background: t.surface, border: `1px solid ${t.borderSoft}` }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: rar.color || t.text, marginBottom: 3 }}>
                    {entry.player?.name}
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <div style={{ fontSize: 11, color: t.textMute, fontFamily: t.fontMono }}>→ {info.short || entry.soldTo}</div>
                    <div style={{ fontSize: 12, fontWeight: 700, color: info.primary || t.accent, fontFamily: t.fontMono }}>
                      {entry.price}L
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* Main bidding view */
          <div style={{ flex: 1, overflowY: 'auto', padding: '14px 14px' }}>
            <PlayerPanel />
            <div style={{ marginTop: 16 }}>
              <BidPanel />
            </div>
          </div>
        )}
      </div>
    );
  }

  /* ── DESKTOP LAYOUT ── */
  return (
    <div style={{ minHeight: '100vh', background: t.bg, fontFamily: t.fontDisplay,
      color: t.text, display: 'flex', flexDirection: 'column' }}>

      {/* Top bar */}
      <div style={{ padding: '10px 20px', background: t.bgElev,
        borderBottom: `1px solid ${t.borderSoft}`,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontSize: 13, fontWeight: 800, letterSpacing: 2, color: t.accent,
            fontFamily: t.fontMono, textTransform: 'uppercase' }}>
            🏏 Auction {phase === 'second_round' ? '· Round 2' : ''}
          </span>
          <div style={{ width: 1, height: 16, background: t.borderSoft }} />
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: myTeamInfo.primary || t.accent }} />
            <span style={{ fontSize: 12, color: t.textMute, fontFamily: t.fontMono }}>{myTeamInfo.short || myTeamKey}</span>
            <span style={{ fontSize: 12, fontWeight: 700, color: t.accent, fontFamily: t.fontMono }}>
              ₹{(myBudget / 100).toFixed(0)} Cr left
            </span>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {teams.map(tm => {
            const info = AUCTION_TEAMS[tm.key] || {};
            const isMe = tm.key === myTeamKey;
            return (
              <div key={tm.key} style={{ padding: '3px 8px', borderRadius: 6,
                border: isMe ? `1px solid ${info.primary || t.accent}` : `1px solid ${t.borderSoft}`,
                background: isMe ? `${info.primary || t.accent}18` : 'transparent',
                fontSize: 10, fontFamily: t.fontMono,
                color: isMe ? (info.primary || t.accent) : t.textDim }}>
                {info.short || tm.key}: ₹{((tm.budget || 0) / 100).toFixed(0)}Cr · {tm.squadSize || 0}🎴
              </div>
            );
          })}
        </div>
      </div>

      {/* 3-col layout */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        {/* Left: Player */}
        <div style={{ flex: '0 0 300px', padding: '20px', borderRight: `1px solid ${t.borderSoft}`,
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14 }}>
          <PlayerPanel />
        </div>
        {/* Center: Bid controls */}
        <div style={{ flex: 1, padding: '20px', display: 'flex', flexDirection: 'column', gap: 16,
          borderRight: `1px solid ${t.borderSoft}`, minWidth: 0, overflowY: 'auto' }}>
          <BidPanel />
        </div>
        {/* Right: Sold log */}
        <div style={{ flex: '0 0 240px', display: 'flex', flexDirection: 'column', padding: '14px 0' }}>
          <div style={{ padding: '0 14px 8px', fontSize: 11, fontWeight: 700,
            letterSpacing: 1.5, color: t.textMute, fontFamily: t.fontMono, textTransform: 'uppercase' }}>
            Sold Log ({soldLog.length})
          </div>
          <div ref={logRef} style={{ flex: 1, overflowY: 'auto', padding: '0 14px' }}>
            {soldLog.length === 0 ? (
              <div style={{ fontSize: 12, color: t.textDim, fontFamily: t.fontMono }}>No sales yet</div>
            ) : [...soldLog].reverse().map((entry, i) => {
              const info = AUCTION_TEAMS[entry.soldTo] || {};
              const rar  = RARITIES[entry.player?.rarity] || {};
              return (
                <div key={i} style={{ padding: '8px 10px', borderRadius: 8, marginBottom: 6,
                  background: t.surface, border: `1px solid ${t.borderSoft}` }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: rar.color || t.text, marginBottom: 2 }}>
                    {entry.player?.name}
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ fontSize: 10, color: t.textMute, fontFamily: t.fontMono }}>→ {info.short || entry.soldTo}</div>
                    <div style={{ fontSize: 11, fontWeight: 700, color: info.primary || t.accent, fontFamily: t.fontMono }}>
                      {entry.price}L
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

function AuctionPlayerCard({ player, t, rarColor, compact = false }) {
  return (
    <div style={{ width: compact ? '100%' : 220, borderRadius: 14, overflow: 'hidden',
      border: `2px solid ${rarColor}66`,
      background: `linear-gradient(160deg, ${t.surface}, ${t.bgElev})`,
      boxShadow: `0 0 24px ${rarColor}28`, flex: compact ? 1 : undefined }}>
      <div style={{ height: 5, background: `linear-gradient(90deg, ${player.teamObj?.primary || rarColor}, ${rarColor})` }} />
      <div style={{ padding: compact ? '10px 12px' : '14px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 9, fontFamily: t.fontMono, color: rarColor,
              letterSpacing: 1, textTransform: 'uppercase', fontWeight: 700, marginBottom: 2 }}>
              {player.rarity} · {ROLE_LABEL[player.role] || player.role}
            </div>
            <div style={{ fontSize: compact ? 14 : 16, fontWeight: 900, color: t.text,
              lineHeight: 1.2, letterSpacing: -0.5 }}>{player.name}</div>
            <div style={{ fontSize: 10, color: t.textMute, fontFamily: t.fontMono, marginTop: 1 }}>
              {player.teamObj?.short || player.team}
            </div>
          </div>
          <div style={{ width: 34, height: 34, borderRadius: '50%', flexShrink: 0,
            background: `${player.teamObj?.primary || rarColor}33`,
            border: `2px solid ${player.teamObj?.primary || rarColor}66`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 11, fontWeight: 800, color: player.teamObj?.primary || rarColor, fontFamily: t.fontMono }}>
            {player.initials || player.name.slice(0, 2)}
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '5px 6px' }}>
          {getKeyStats(player).map(({ label, value }) => (
            <div key={label} style={{ background: t.bg, borderRadius: 6, padding: '4px 8px' }}>
              <div style={{ fontSize: 8, color: t.textDim, fontFamily: t.fontMono,
                letterSpacing: 0.8, textTransform: 'uppercase', marginBottom: 1 }}>{label}</div>
              <div style={{ fontSize: 13, fontWeight: 700, color: t.text, fontFamily: t.fontMono }}>{value}</div>
            </div>
          ))}
        </div>
        <div style={{ marginTop: 8, textAlign: 'center' }}>
          <span style={{ fontSize: 10, color: t.textDim, fontFamily: t.fontMono }}>Base: </span>
          <span style={{ fontSize: 12, fontWeight: 700, color: rarColor, fontFamily: t.fontMono }}>
            {player.basePrice}L
          </span>
        </div>
      </div>
    </div>
  );
}

function getKeyStats(p) {
  if (p.role === 'BAT' || p.role === 'WK')
    return [{ label: 'Matches', value: p.matches }, { label: 'Runs', value: p.runs?.toLocaleString() },
            { label: 'Avg', value: p.avg?.toFixed(1) }, { label: 'SR', value: p.sr?.toFixed(0) }];
  if (p.role === 'BWL')
    return [{ label: 'Matches', value: p.matches }, { label: 'Wkts', value: p.wkts },
            { label: 'Econ', value: p.econ?.toFixed(2) }, { label: 'Avg', value: p.bowlAvg?.toFixed(1) }];
  return [{ label: 'Runs', value: p.runs?.toLocaleString() }, { label: 'SR', value: p.sr?.toFixed(0) },
          { label: 'Wkts', value: p.wkts }, { label: 'Econ', value: p.econ?.toFixed(2) }];
}
