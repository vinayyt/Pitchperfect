import { useState } from 'react';
import { AUCTION_TEAMS } from '../data';
import Btn from '../components/Btn';
import { useResponsive } from '../hooks/useResponsive';

const ALL_KEYS = Object.keys(AUCTION_TEAMS);

export default function AuctionSetupScreen({
  theme: t,
  phase = 'create',
  lobby = null,
  myTeamKey = null,
  error = '',
  loading = false,
  isHost = false,
  onCreate,
  onJoin,
  onVsBot,
  onStartRetention,
  onBack,
}) {
  const { isMobile } = useResponsive();
  const [tab,           setTab]          = useState('bots');
  const [name,          setName]         = useState('');
  const [code,          setCode]         = useState('');
  const [joinTeam,      setJoinTeam]     = useState('');
  const [selectedTeams, setSelectedTeams]= useState(['CSK', 'MI', 'RCB', 'KKR']);

  const toggleTeam = key => setSelectedTeams(prev =>
    prev.includes(key)
      ? prev.length > 2 ? prev.filter(k => k !== key) : prev
      : prev.length < 10 ? [...prev, key] : prev
  );

  const handleCreate = () => { if (name.trim() && selectedTeams.length >= 2) onCreate(name.trim(), selectedTeams); };
  const handleJoin   = () => { if (name.trim() && code.trim() && joinTeam) onJoin(code.trim().toUpperCase(), name.trim(), joinTeam); };
  const handleVsBot  = () => { if (name.trim() && selectedTeams.length >= 2) onVsBot(name.trim(), selectedTeams); };

  const isWaiting = phase === 'host-waiting' || phase === 'join-waiting';

  const inputStyle = {
    width: '100%', boxSizing: 'border-box', padding: '12px 16px', borderRadius: 10,
    border: `1px solid ${t.borderSoft}`, background: t.surface, color: t.text,
    fontSize: 15, fontFamily: t.fontDisplay, outline: 'none',
  };
  const labelStyle = {
    display: 'block', fontSize: 11, fontWeight: 700, letterSpacing: 1.5,
    color: t.textMute, textTransform: 'uppercase', fontFamily: t.fontMono, marginBottom: 8,
  };

  // Team grid — always 4 cols on mobile, 5 on desktop
  const TeamGrid = ({ selectedKey = null, onToggle, onSelect }) => (
    <div style={{ display: 'grid', gridTemplateColumns: `repeat(${isMobile ? 4 : 5}, 1fr)`, gap: 6 }}>
      {ALL_KEYS.map((key, idx) => {
        const info    = AUCTION_TEAMS[key];
        const sel     = selectedKey ? selectedKey === key : selectedTeams.includes(key);
        const isFirst = !selectedKey && selectedTeams[0] === key;
        return (
          <button key={key} onClick={() => onToggle ? onToggle(key) : onSelect(key)} style={{
            all: 'unset', cursor: 'pointer', padding: isMobile ? '7px 4px' : '8px 6px',
            borderRadius: 8, textAlign: 'center',
            border: sel ? `2px solid ${info.primary}` : `1px solid ${t.borderSoft}`,
            background: sel ? `${info.primary}22` : t.surface,
            transition: 'all 0.15s', position: 'relative',
          }}>
            {isFirst && (
              <div style={{ position: 'absolute', top: -5, right: -5, background: t.accent,
                color: '#000', fontSize: 7, fontWeight: 800, borderRadius: 4,
                padding: '1px 3px', fontFamily: t.fontMono }}>YOU</div>
            )}
            <div style={{ width: 16, height: 16, borderRadius: '50%',
              background: info.primary, margin: '0 auto 3px' }} />
            <div style={{ fontSize: 9, fontWeight: 700, color: sel ? info.primary : t.textMute,
              fontFamily: t.fontMono, letterSpacing: 0.3 }}>{info.short}</div>
          </button>
        );
      })}
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', background: t.bg, fontFamily: t.fontDisplay,
      color: t.text, display: 'flex', flexDirection: 'column' }}>

      <div style={{ flex: 1, maxWidth: 860, margin: '0 auto', width: '100%',
        padding: isMobile ? '24px 16px' : '40px 24px' }}>

        {/* ── WAITING LOBBY ── */}
        {isWaiting && lobby ? (
          <div>
            <h2 style={{ fontSize: isMobile ? 22 : 28, fontWeight: 900, color: t.text,
              marginBottom: 4, letterSpacing: -1 }}>Auction Lobby</h2>
            <p style={{ fontSize: 13, color: t.textMute, marginBottom: 12, fontFamily: t.fontMono }}>
              Code: <span style={{ color: t.accent, fontWeight: 700, letterSpacing: 2 }}>{lobby.code}</span>
              {!isMobile && <span style={{ color: t.textDim, marginLeft: 12 }}>Share with friends to join</span>}
            </p>
            {error && <div style={{ color: t.danger, fontSize: 13, marginBottom: 12, fontFamily: t.fontMono }}>{error}</div>}

            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? 'repeat(2,1fr)' : 'repeat(auto-fill,minmax(200px,1fr))',
              gap: isMobile ? 8 : 12, marginBottom: 24 }}>
              {lobby.teams.map(team => (
                <TeamSlot key={team.key} team={team} t={t} isMe={team.key === myTeamKey} isMobile={isMobile}/>
              ))}
            </div>

            {isHost ? (
              <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', gap: 12, alignItems: isMobile ? 'stretch' : 'center' }}>
                <Btn theme={t} size="lg" onClick={onStartRetention} style={{ minWidth: isMobile ? '100%' : 200 }}>
                  Start Retention Phase →
                </Btn>
                <span style={{ fontSize: 12, color: t.textDim, fontFamily: t.fontMono }}>
                  Empty slots become AI bots
                </span>
              </div>
            ) : (
              <p style={{ fontSize: 14, color: t.textMute, fontFamily: t.fontMono }}>
                ⌛ Waiting for host to start retention…
              </p>
            )}
          </div>

        ) : (
          /* ── SETUP FORM ── */
          <div>
            <h2 style={{ fontSize: isMobile ? 24 : 32, fontWeight: 900, color: t.text,
              marginBottom: 6, letterSpacing: -1 }}>Mock IPL Auction</h2>
            <p style={{ fontSize: 14, color: t.textMute, marginBottom: 20, lineHeight: 1.6 }}>
              Each player owns a team. 120 Cr budget. Retain up to 5, then bid for the rest.
            </p>

            {error && (
              <div style={{ background: `${t.danger}18`, border: `1px solid ${t.danger}44`, borderRadius: 10,
                padding: '10px 16px', marginBottom: 16, fontSize: 13, color: t.danger, fontFamily: t.fontMono }}>
                {error}
              </div>
            )}

            {/* Tabs */}
            <div style={{ display: 'flex', gap: 0, marginBottom: 24,
              border: `1px solid ${t.borderSoft}`, borderRadius: 12, overflow: 'hidden',
              width: isMobile ? '100%' : 'fit-content' }}>
              {[
                { key: 'bots',   label: '🤖 vs Bots'   },
                { key: 'create', label: 'Multiplayer'   },
                { key: 'join',   label: 'Join Room'     },
              ].map(tb => (
                <button key={tb.key} onClick={() => setTab(tb.key)} style={{
                  all: 'unset', cursor: 'pointer',
                  flex: isMobile ? 1 : undefined,
                  padding: isMobile ? '11px 8px' : '10px 24px',
                  background: tab === tb.key ? t.accent : 'transparent',
                  color:      tab === tb.key ? '#000' : t.textMute,
                  fontSize: isMobile ? 12 : 13, fontWeight: 700, letterSpacing: isMobile ? 0.3 : 1,
                  fontFamily: t.fontMono, textTransform: 'uppercase', transition: 'all 0.18s',
                  textAlign: 'center',
                }}>{tb.label}</button>
              ))}
            </div>

            {/* VS BOTS */}
            {tab === 'bots' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                <div>
                  <label style={labelStyle}>Your Name</label>
                  <input value={name} onChange={e => setName(e.target.value)}
                    placeholder="e.g. Vinay" maxLength={18}
                    onKeyDown={e => e.key === 'Enter' && handleVsBot()}
                    style={inputStyle} />
                  <div style={{ marginTop: 6, fontSize: 12, color: t.textDim, fontFamily: t.fontMono }}>
                    You own <strong style={{ color: t.accent }}>{AUCTION_TEAMS[selectedTeams[0]]?.short || selectedTeams[0]}</strong> · {selectedTeams.length - 1} bot team{selectedTeams.length !== 2 ? 's' : ''}
                  </div>
                  <Btn theme={t} size="lg" onClick={handleVsBot}
                    disabled={!name.trim() || selectedTeams.length < 2 || loading}
                    style={{ marginTop: 16, width: '100%' }}>
                    {loading ? 'Starting…' : '🤖 Start vs Bots →'}
                  </Btn>
                </div>
                <div>
                  <label style={labelStyle}>Pick Teams (2–10) · You get the first one</label>
                  <TeamGrid onToggle={toggleTeam} />
                </div>
              </div>
            )}

            {/* MULTIPLAYER CREATE */}
            {tab === 'create' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                <div>
                  <label style={labelStyle}>Your Name</label>
                  <input value={name} onChange={e => setName(e.target.value)}
                    placeholder="e.g. Vinay" maxLength={18}
                    onKeyDown={e => e.key === 'Enter' && handleCreate()}
                    style={inputStyle} />
                  <div style={{ marginTop: 6, fontSize: 12, color: t.textDim, fontFamily: t.fontMono }}>
                    Teams selected: <span style={{ color: t.accent }}>{selectedTeams.length}</span> / 10
                  </div>
                  <Btn theme={t} size="lg" onClick={handleCreate}
                    disabled={!name.trim() || selectedTeams.length < 2 || loading}
                    style={{ marginTop: 16, width: '100%' }}>
                    {loading ? 'Creating…' : 'Create Auction Room →'}
                  </Btn>
                </div>
                <div>
                  <label style={labelStyle}>Select Teams (2–10)</label>
                  <TeamGrid onToggle={toggleTeam} />
                </div>
              </div>
            )}

            {/* JOIN */}
            {tab === 'join' && (
              <div style={{ maxWidth: isMobile ? '100%' : 400 }}>
                <label style={labelStyle}>Your Name</label>
                <input value={name} onChange={e => setName(e.target.value)}
                  placeholder="e.g. Vipin" maxLength={18}
                  style={{ ...inputStyle, marginBottom: 14 }} />
                <label style={labelStyle}>Room Code</label>
                <input value={code} onChange={e => setCode(e.target.value.toUpperCase())}
                  placeholder="6-letter code" maxLength={6}
                  style={{ ...inputStyle, marginBottom: 14, fontFamily: t.fontMono, letterSpacing: 4, textTransform: 'uppercase' }} />
                <label style={labelStyle}>Pick Your Team</label>
                <TeamGrid selectedKey={joinTeam} onSelect={k => setJoinTeam(k)} />
                <Btn theme={t} size="lg" onClick={handleJoin}
                  disabled={!name.trim() || !code.trim() || !joinTeam || loading}
                  style={{ width: '100%', marginTop: 20 }}>
                  {loading ? 'Joining…' : 'Join Auction →'}
                </Btn>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function TeamSlot({ team, t, isMe, isMobile }) {
  const info  = AUCTION_TEAMS[team.key] || {};
  const taken = !!team.owner;
  return (
    <div style={{ padding: isMobile ? '10px 12px' : '14px 16px', borderRadius: 12,
      border: isMe ? `2px solid ${info.primary || t.accent}` : `1px solid ${t.borderSoft}`,
      background: taken ? `${info.primary || t.accent}12` : t.surface, position: 'relative' }}>
      {isMe && (
        <div style={{ position: 'absolute', top: 6, right: 8, fontSize: 9,
          fontFamily: t.fontMono, color: info.primary, fontWeight: 700, letterSpacing: 1 }}>YOU</div>
      )}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
        <div style={{ width: 10, height: 10, borderRadius: '50%', background: info.primary || '#888', flexShrink: 0 }} />
        <span style={{ fontSize: 11, fontWeight: 700, color: t.textMute, fontFamily: t.fontMono, letterSpacing: 0.5 }}>
          {info.short || team.key}
        </span>
      </div>
      {taken
        ? <div style={{ fontSize: 12, fontWeight: 700, color: isMe ? info.primary : t.text }}>{team.owner}</div>
        : <div style={{ fontSize: 11, color: t.textDim, fontStyle: 'italic' }}>Open (bot)</div>
      }
    </div>
  );
}
