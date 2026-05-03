import { useState } from 'react';
import { AUCTION_TEAMS, RARITIES } from '../data';
import Btn from '../components/Btn';
import { useResponsive } from '../hooks/useResponsive';

const ROLE_LABEL = { BAT: 'Bat', BWL: 'Bowl', ALL: 'All', WK: 'WK' };

export default function AuctionResultsScreen({ theme: t, teams = [], myTeamKey, onHome }) {
  const { isMobile } = useResponsive();
  const [viewTeam, setViewTeam] = useState(myTeamKey || teams[0]?.teamKey);

  const sorted  = [...teams].sort((a, b) => b.spent - a.spent);
  const viewing = teams.find(tm => tm.teamKey === viewTeam) || teams[0];

  return (
    <div style={{ minHeight: '100vh', background: t.bg, fontFamily: t.fontDisplay,
      color: t.text, display: 'flex', flexDirection: 'column' }}>

      {/* Header */}
      <div style={{ padding: isMobile ? '12px 14px' : '14px 24px',
        borderBottom: `1px solid ${t.borderSoft}`, background: t.bgElev,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <div style={{ fontSize: 10, fontFamily: t.fontMono, color: t.textMute,
            letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 2 }}>Auction Complete</div>
          <div style={{ fontSize: isMobile ? 18 : 24, fontWeight: 900, letterSpacing: -1, color: t.text }}>
            🏆 Final Squads
          </div>
        </div>
        <Btn theme={t} variant="ghost" size="md" onClick={onHome}>← Home</Btn>
      </div>

      {isMobile ? (
        /* ── Mobile: team pills scroll + squad below ── */
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          {/* Horizontal team scroll */}
          <div style={{ overflowX: 'auto', padding: '12px 14px', borderBottom: `1px solid ${t.borderSoft}`,
            display: 'flex', gap: 8, flexShrink: 0 }}>
            {sorted.map((tm, idx) => {
              const info  = AUCTION_TEAMS[tm.teamKey] || {};
              const isMe  = tm.teamKey === myTeamKey;
              const isSel = tm.teamKey === viewTeam;
              return (
                <button key={tm.teamKey} onClick={() => setViewTeam(tm.teamKey)} style={{
                  all: 'unset', cursor: 'pointer', flexShrink: 0,
                  padding: '8px 14px', borderRadius: 20,
                  border: isSel ? `2px solid ${info.primary || t.accent}` : `1px solid ${t.borderSoft}`,
                  background: isSel ? `${info.primary || t.accent}18` : t.surface,
                  display: 'flex', alignItems: 'center', gap: 6,
                }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: info.primary || '#888' }} />
                  <span style={{ fontSize: 12, fontWeight: 700,
                    color: isSel ? (info.primary || t.accent) : t.textMute, fontFamily: t.fontMono }}>
                    {info.short || tm.teamKey}
                    {isMe ? ' ★' : ''}
                  </span>
                  <span style={{ fontSize: 11, color: t.textDim, fontFamily: t.fontMono }}>
                    ₹{(tm.spent / 100).toFixed(0)}Cr
                  </span>
                </button>
              );
            })}
          </div>
          {/* Squad view */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '14px 14px' }}>
            {viewing && <TeamSquadView tm={viewing} t={t} myTeamKey={myTeamKey} isMobile />}
          </div>
        </div>
      ) : (
        /* ── Desktop: sidebar + main ── */
        <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
          <div style={{ flex: '0 0 260px', borderRight: `1px solid ${t.borderSoft}`,
            padding: '14px 0', overflowY: 'auto' }}>
            <div style={{ padding: '0 14px 8px', fontSize: 11, fontWeight: 700,
              letterSpacing: 1.5, color: t.textMute, fontFamily: t.fontMono, textTransform: 'uppercase' }}>
              All Teams
            </div>
            {sorted.map((tm, idx) => {
              const info  = AUCTION_TEAMS[tm.teamKey] || {};
              const isMe  = tm.teamKey === myTeamKey;
              const isSel = tm.teamKey === viewTeam;
              return (
                <button key={tm.teamKey} onClick={() => setViewTeam(tm.teamKey)} style={{
                  all: 'unset', cursor: 'pointer', display: 'block', width: '100%',
                  padding: '10px 14px', boxSizing: 'border-box',
                  borderLeft: isSel ? `3px solid ${info.primary || t.accent}` : '3px solid transparent',
                  background: isSel ? `${info.primary || t.accent}12` : 'transparent',
                  transition: 'all 0.15s' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: t.textDim,
                      fontFamily: t.fontMono, width: 20 }}>#{idx + 1}</div>
                    <div style={{ width: 10, height: 10, borderRadius: '50%',
                      background: info.primary || '#888', flexShrink: 0 }} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 700,
                        color: isMe ? (info.primary || t.accent) : t.text,
                        display: 'flex', alignItems: 'center', gap: 4 }}>
                        {info.short || tm.teamKey}
                        {isMe && <span style={{ fontSize: 9, fontFamily: t.fontMono, color: info.primary || t.accent }}>YOU</span>}
                      </div>
                      <div style={{ fontSize: 11, color: t.textDim, fontFamily: t.fontMono }}>
                        {tm.owner} {tm.isBot ? '🤖' : ''}
                      </div>
                    </div>
                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                      <div style={{ fontSize: 12, fontWeight: 700, color: info.primary || t.accent,
                        fontFamily: t.fontMono }}>₹{(tm.spent / 100).toFixed(0)}Cr</div>
                      <div style={{ fontSize: 10, color: t.textDim, fontFamily: t.fontMono }}>
                        {tm.squadSize} players
                      </div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
          <div style={{ flex: 1, padding: '14px 24px', overflowY: 'auto' }}>
            {viewing && <TeamSquadView tm={viewing} t={t} myTeamKey={myTeamKey} />}
          </div>
        </div>
      )}
    </div>
  );
}

function TeamSquadView({ tm, t, myTeamKey, isMobile = false }) {
  const info   = AUCTION_TEAMS[tm.teamKey] || {};
  const isMe   = tm.teamKey === myTeamKey;
  const byRole = { WK: [], BAT: [], ALL: [], BWL: [] };
  (tm.squad || []).forEach(p => byRole[p.role]?.push(p));

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16,
        paddingBottom: 14, borderBottom: `1px solid ${t.borderSoft}`,
        flexWrap: isMobile ? 'wrap' : 'nowrap' }}>
        <div style={{ width: 40, height: 40, borderRadius: '50%', flexShrink: 0,
          background: `${info.primary || t.accent}33`, border: `2px solid ${info.primary || t.accent}66`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 12, fontWeight: 800, color: info.primary || t.accent, fontFamily: t.fontMono }}>
          {info.short?.slice(0, 2) || tm.teamKey.slice(0, 2)}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: isMobile ? 16 : 20, fontWeight: 900,
            color: isMe ? (info.primary || t.accent) : t.text, letterSpacing: -0.5 }}>
            {info.name || tm.teamKey}
            {isMe && <span style={{ fontSize: 11, color: t.textMute, fontWeight: 400, marginLeft: 6 }}>(Your team)</span>}
          </div>
          <div style={{ fontSize: 12, color: t.textMute }}>{tm.owner} {tm.isBot ? '🤖' : ''}</div>
        </div>
        <div style={{ display: 'flex', gap: isMobile ? 12 : 20, flexWrap: 'wrap' }}>
          <BudgetStat label="Spent"     value={`₹${(tm.spent/100).toFixed(1)}Cr`}    t={t} color={info.primary || t.accent} />
          <BudgetStat label="Remaining" value={`₹${(tm.budget/100).toFixed(1)}Cr`}   t={t} />
          <BudgetStat label="Squad"     value={`${tm.squadSize} players`}             t={t} />
          <BudgetStat label="Foreign"   value={`${tm.foreignCount}/8`}               t={t} />
        </div>
      </div>

      {['WK', 'BAT', 'ALL', 'BWL'].map(role => {
        const list = byRole[role];
        if (!list?.length) return null;
        const roleLabel = { WK: 'Keepers', BAT: 'Batters', ALL: 'All-rounders', BWL: 'Bowlers' }[role];
        return (
          <div key={role} style={{ marginBottom: 18 }}>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1.5, color: t.textMute,
              fontFamily: t.fontMono, textTransform: 'uppercase', marginBottom: 8 }}>
              {roleLabel} ({list.length})
            </div>
            <div style={{ display: 'grid',
              gridTemplateColumns: isMobile ? 'repeat(2,1fr)' : 'repeat(auto-fill, minmax(170px,1fr))', gap: 7 }}>
              {list.map(p => <PlayerChip key={p.id} player={p} t={t} />)}
            </div>
          </div>
        );
      })}

      {tm.squadSize === 0 && (
        <div style={{ textAlign: 'center', padding: '32px 0', color: t.textDim,
          fontSize: 13, fontFamily: t.fontMono }}>No players acquired</div>
      )}
    </div>
  );
}

function PlayerChip({ player, t }) {
  const rarColor  = RARITIES[player.rarity]?.color || '#888';
  const isRetained= player.retained;
  return (
    <div style={{ padding: '7px 10px', borderRadius: 8,
      border: `1px solid ${rarColor}44`, background: `${rarColor}0d`,
      display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <div style={{ minWidth: 0 }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: t.text, lineHeight: 1.3 }}>{player.name}</div>
        <div style={{ fontSize: 10, color: t.textDim, fontFamily: t.fontMono }}>
          {ROLE_LABEL[player.role] || player.role} · {player.nationality === 'Foreign' ? '🌍' : '🇮🇳'}
          {isRetained && <span style={{ marginLeft: 4, color: rarColor }}>★</span>}
        </div>
      </div>
      <div style={{ fontSize: 11, fontWeight: 700, color: rarColor, fontFamily: t.fontMono, flexShrink: 0, marginLeft: 6 }}>
        {isRetained ? `${player.retainedAt}L` : `${player.soldAt}L`}
      </div>
    </div>
  );
}

function BudgetStat({ label, value, t, color }) {
  return (
    <div style={{ textAlign: 'right' }}>
      <div style={{ fontSize: 9, color: t.textDim, fontFamily: t.fontMono,
        letterSpacing: 1, textTransform: 'uppercase', marginBottom: 2 }}>{label}</div>
      <div style={{ fontSize: 13, fontWeight: 700, color: color || t.text, fontFamily: t.fontMono }}>{value}</div>
    </div>
  );
}
