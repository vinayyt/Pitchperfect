import { useState, useMemo } from 'react';
import { AUCTION_TEAMS, RARITIES } from '../data';
import Btn from '../components/Btn';
import { useResponsive } from '../hooks/useResponsive';

const ROLE_LABEL  = { BAT: 'Bat', BWL: 'Bowl', ALL: 'All', WK: 'WK' };
const RARITY_ORDER= { LEGEND: 4, GOLD: 3, SILVER: 2, BRONZE: 1 };

export default function AuctionRetentionScreen({
  theme: t, myTeamKey, budget = 12000, players = [],
  submitted = false, teamsStatus = {}, error = '', onSubmit,
}) {
  const { isMobile } = useResponsive();
  const [selected,     setSelected]     = useState([]);
  const [search,       setSearch]       = useState('');
  const [roleFilter,   setRoleFilter]   = useState('ALL');
  const [rarityFilter, setRarityFilter] = useState('ALL');

  const MAX_RETAIN     = 5;
  const teamInfo       = AUCTION_TEAMS[myTeamKey] || {};
  const retentionCost  = selected.reduce((s, id) => s + (players.find(x => x.id === id)?.basePrice || 0), 0);
  const budgetAfter    = budget - retentionCost;
  const totalTeams     = Object.keys(teamsStatus).length;
  const doneTeams      = Object.values(teamsStatus).filter(Boolean).length;

  const togglePlayer = p => {
    if (selected.includes(p.id)) { setSelected(s => s.filter(x => x !== p.id)); return; }
    if (selected.length >= MAX_RETAIN || retentionCost + p.basePrice > budget) return;
    setSelected(s => [...s, p.id]);
  };

  const filtered = useMemo(() => {
    let list = [...players];
    if (roleFilter !== 'ALL')   list = list.filter(p => p.role === roleFilter);
    if (rarityFilter !== 'ALL') list = list.filter(p => p.rarity === rarityFilter);
    if (search.trim()) { const q = search.toLowerCase(); list = list.filter(p => p.name.toLowerCase().includes(q)); }
    return list.sort((a, b) => (RARITY_ORDER[b.rarity] - RARITY_ORDER[a.rarity]) || (b.basePrice - a.basePrice));
  }, [players, roleFilter, rarityFilter, search]);

  return (
    <div style={{ height: '100vh', background: t.bg, fontFamily: t.fontDisplay, color: t.text,
      display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

      {/* Header */}
      <div style={{ padding: isMobile ? '10px 14px' : '14px 24px',
        borderBottom: `1px solid ${t.borderSoft}`, background: t.bgElev,
        display: 'flex', alignItems: isMobile ? 'flex-start' : 'center',
        flexDirection: isMobile ? 'column' : 'row',
        justifyContent: 'space-between', gap: 8, flexShrink: 0 }}>
        <div>
          <div style={{ fontSize: 10, fontFamily: t.fontMono, color: t.textMute,
            letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 2 }}>Retention Phase</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 10, height: 10, borderRadius: '50%', background: teamInfo.primary || t.accent }} />
            <span style={{ fontSize: isMobile ? 15 : 18, fontWeight: 800, letterSpacing: -0.5 }}>
              {teamInfo.short || myTeamKey}
            </span>
            {!isMobile && <span style={{ fontSize: 13, color: t.textMute }}>{teamInfo.name}</span>}
          </div>
        </div>
        <div style={{ display: 'flex', gap: isMobile ? 16 : 24, flexWrap: 'wrap' }}>
          <Stat label="Budget"  value={`₹${(budget/100).toFixed(0)}Cr`} t={t} />
          <Stat label="After"   value={`₹${(budgetAfter/100).toFixed(0)}Cr`} t={t} accent={budgetAfter < 5000} />
          <Stat label="Picked"  value={`${selected.length}/${MAX_RETAIN}`} t={t} />
          <Stat label="Done"    value={`${doneTeams}/${totalTeams}`} t={t} />
        </div>
      </div>

      {submitted ? (
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexDirection: 'column', gap: 14, padding: 24 }}>
          <div style={{ fontSize: 48 }}>✅</div>
          <div style={{ fontSize: 20, fontWeight: 700, color: t.text }}>Retention submitted!</div>
          <div style={{ fontSize: 14, color: t.textMute, fontFamily: t.fontMono }}>
            Waiting for {totalTeams - doneTeams} more team{totalTeams - doneTeams !== 1 ? 's' : ''}…
          </div>
          {selected.length > 0 && (
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'center',
              maxWidth: 480, marginTop: 8 }}>
              {selected.map(id => {
                const p = players.find(x => x.id === id);
                return p ? (
                  <div key={id} style={{ padding: '6px 14px', borderRadius: 20, background: t.surface,
                    border: `1px solid ${RARITIES[p.rarity]?.color}44`,
                    fontSize: 13, color: RARITIES[p.rarity]?.color || t.text }}>
                    {p.name} — {p.basePrice}L
                  </div>
                ) : null;
              })}
            </div>
          )}
        </div>
      ) : (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

          {/* Filters */}
          <div style={{ padding: isMobile ? '8px 14px' : '10px 24px',
            borderBottom: `1px solid ${t.borderSoft}`,
            display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center', flexShrink: 0 }}>
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search…" style={{
                padding: '6px 12px', borderRadius: 8, border: `1px solid ${t.borderSoft}`,
                background: t.surface, color: t.text, fontFamily: t.fontDisplay,
                fontSize: 13, outline: 'none', width: isMobile ? 120 : 160, flexShrink: 0,
              }} />
            {['ALL','WK','BAT','ALL','BWL'].map((r, i) => {
              const val   = i === 0 ? 'ALL' : r;
              const label = i === 0 ? 'All' : r === 'ALL' ? 'All-r' : ROLE_LABEL[r] || r;
              const key   = `role-${i}`;
              return <FilterPill key={key} label={label} active={roleFilter === val && !(i === 0 && roleFilter !== 'ALL')}
                onClick={() => setRoleFilter(val)} t={t} />;
            })}
            <span style={{ color: t.borderSoft, fontSize: 14 }}>|</span>
            {['ALL','LEGEND','GOLD','SILVER','BRONZE'].map(r => (
              <FilterPill key={r} label={r === 'ALL' ? 'All' : r} active={rarityFilter === r}
                onClick={() => setRarityFilter(r)} t={t} color={r !== 'ALL' ? RARITIES[r]?.color : undefined} />
            ))}
          </div>

          {error && (
            <div style={{ margin: '8px 14px 0', padding: '8px 14px', borderRadius: 8,
              background: `${t.danger}18`, border: `1px solid ${t.danger}44`,
              fontSize: 13, color: t.danger, fontFamily: t.fontMono, flexShrink: 0 }}>{error}</div>
          )}

          {/* Player grid */}
          <div style={{ flex: 1, overflowY: 'auto', padding: isMobile ? '10px 14px' : '14px 24px' }}>
            <div style={{ display: 'grid',
              gridTemplateColumns: isMobile ? 'repeat(2,1fr)' : 'repeat(auto-fill, minmax(180px,1fr))', gap: 8 }}>
              {filtered.map(p => {
                const isSel    = selected.includes(p.id);
                const rarColor = RARITIES[p.rarity]?.color || '#888';
                const canAdd   = !isSel && selected.length < MAX_RETAIN && retentionCost + p.basePrice <= budget;
                return (
                  <button key={p.id} onClick={() => togglePlayer(p)}
                    disabled={!isSel && !canAdd}
                    style={{
                      all: 'unset', cursor: (!isSel && !canAdd) ? 'not-allowed' : 'pointer',
                      borderRadius: 10, padding: isMobile ? '8px 10px' : '10px 12px', textAlign: 'left',
                      border: isSel ? `2px solid ${rarColor}` : `1px solid ${t.borderSoft}`,
                      background: isSel ? `${rarColor}18` : t.surface,
                      opacity: (!isSel && !canAdd) ? 0.4 : 1,
                      transition: 'all 0.15s', position: 'relative',
                    }}>
                    {isSel && (
                      <div style={{ position: 'absolute', top: 7, right: 7, width: 16, height: 16,
                        borderRadius: '50%', background: rarColor, display: 'flex', alignItems: 'center',
                        justifyContent: 'center', fontSize: 10, color: '#000', fontWeight: 800 }}>✓</div>
                    )}
                    <div style={{ fontSize: 9, fontFamily: t.fontMono, color: rarColor,
                      letterSpacing: 1, textTransform: 'uppercase', marginBottom: 3, fontWeight: 700 }}>
                      {p.rarity} · {ROLE_LABEL[p.role] || p.role}
                    </div>
                    <div style={{ fontSize: isMobile ? 12 : 13, fontWeight: 700, color: t.text,
                      marginBottom: 2, lineHeight: 1.3, paddingRight: 20 }}>{p.name}</div>
                    <div style={{ fontSize: 10, color: t.textMute, marginBottom: 4, fontFamily: t.fontMono }}>
                      {p.teamObj?.short || p.team}
                    </div>
                    <div style={{ fontSize: 11, fontWeight: 700, color: rarColor }}>
                      {p.basePrice}L
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Footer */}
          <div style={{ padding: isMobile ? '12px 14px' : '14px 24px',
            borderTop: `1px solid ${t.borderSoft}`, background: t.bgElev, flexShrink: 0,
            display: 'flex', flexDirection: isMobile ? 'column' : 'row',
            alignItems: isMobile ? 'stretch' : 'center',
            justifyContent: 'space-between', gap: 12 }}>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', flex: 1 }}>
              {selected.length === 0 ? (
                <span style={{ fontSize: 13, color: t.textDim, fontFamily: t.fontMono }}>
                  Tap players above to retain them
                </span>
              ) : selected.map(id => {
                const p = players.find(x => x.id === id);
                return p ? (
                  <div key={id} style={{ padding: '4px 10px', borderRadius: 16,
                    background: `${RARITIES[p.rarity]?.color}22`,
                    border: `1px solid ${RARITIES[p.rarity]?.color}55`,
                    fontSize: 12, color: RARITIES[p.rarity]?.color || t.text }}>
                    {p.name}
                  </div>
                ) : null;
              })}
            </div>
            <Btn theme={t} size="md" onClick={() => onSubmit(selected)}
              style={isMobile ? { width: '100%' } : {}}>
              {selected.length === 0 ? 'Skip Retention →' : `Retain ${selected.length} →`}
            </Btn>
          </div>
        </div>
      )}
    </div>
  );
}

function Stat({ label, value, t, accent }) {
  return (
    <div style={{ textAlign: 'right' }}>
      <div style={{ fontSize: 9, color: t.textDim, fontFamily: t.fontMono, letterSpacing: 1,
        textTransform: 'uppercase', marginBottom: 1 }}>{label}</div>
      <div style={{ fontSize: 14, fontWeight: 700, color: accent ? t.danger : t.accent,
        fontFamily: t.fontMono }}>{value}</div>
    </div>
  );
}

function FilterPill({ label, active, onClick, t, color }) {
  return (
    <button onClick={onClick} style={{
      all: 'unset', cursor: 'pointer', padding: '4px 10px', borderRadius: 20,
      border: active ? `1px solid ${color || t.accent}` : `1px solid ${t.borderSoft}`,
      background: active ? `${color || t.accent}18` : 'transparent',
      fontSize: 10, fontWeight: 700, fontFamily: t.fontMono, letterSpacing: 0.8,
      color: active ? (color || t.accent) : t.textMute, textTransform: 'uppercase', transition: 'all 0.15s',
    }}>{label}</button>
  );
}
