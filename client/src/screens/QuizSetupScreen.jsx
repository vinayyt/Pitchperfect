import { useState } from 'react';
import Btn from '../components/Btn';
import { useResponsive } from '../hooks/useResponsive';

export default function QuizSetupScreen({
  theme: t,
  phase  = 'create',   // 'create' | 'waiting'
  code   = '',
  error  = '',
  loading = false,
  onVsBot,
  onCreate,
  onJoin,
}) {
  const { isMobile } = useResponsive();
  const [tab,  setTab]  = useState('bots');
  const [name, setName] = useState('');
  const [joinCode, setJoinCode] = useState('');

  const inputStyle = {
    width: '100%', boxSizing: 'border-box', padding: '12px 16px', borderRadius: 10,
    border: `1px solid ${t.borderSoft}`, background: t.surface, color: t.text,
    fontSize: 15, fontFamily: t.fontDisplay, outline: 'none',
  };
  const labelStyle = {
    display: 'block', fontSize: 11, fontWeight: 700, letterSpacing: 1.5,
    color: t.textMute, textTransform: 'uppercase', fontFamily: t.fontMono, marginBottom: 8,
  };

  // ── Waiting for opponent ─────────────────────────────────────────────────────
  if (phase === 'waiting') {
    return (
      <div style={{ minHeight: 'calc(100vh - 52px)', background: t.bg,
        display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
        <div style={{ textAlign: 'center', maxWidth: 400 }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>🧠</div>
          <h2 style={{ fontSize: 22, fontWeight: 900, color: t.text, marginBottom: 8, letterSpacing: -0.5 }}>
            Waiting for opponent…
          </h2>
          <div style={{ background: t.surface, border: `1px solid ${t.borderSoft}`, borderRadius: 16,
            padding: '20px 32px', marginBottom: 20 }}>
            <div style={{ fontSize: 11, color: t.textMute, fontFamily: t.fontMono, letterSpacing: 1.5,
              textTransform: 'uppercase', marginBottom: 8 }}>Room Code</div>
            <div style={{ fontSize: 36, fontWeight: 900, letterSpacing: 8, fontFamily: t.fontMono,
              color: t.accent }}>{code}</div>
          </div>
          <p style={{ fontSize: 13, color: t.textDim, fontFamily: t.fontMono, lineHeight: 1.6 }}>
            Share this code with your friend.<br/>Game starts as soon as they join.
          </p>
        </div>
      </div>
    );
  }

  // ── Setup form ───────────────────────────────────────────────────────────────
  return (
    <div style={{ minHeight: 'calc(100vh - 52px)', background: t.bg, fontFamily: t.fontDisplay, color: t.text }}>
      <div style={{ maxWidth: 640, margin: '0 auto', padding: isMobile ? '24px 16px' : '40px 24px' }}>

        {/* Title */}
        <div style={{ marginBottom: isMobile ? 20 : 28 }}>
          <div style={{ fontSize: isMobile ? 28 : 36, fontWeight: 900, letterSpacing: -1,
            color: t.text, lineHeight: 1.1, marginBottom: 6 }}>
            🧠 Cricket IQ Quiz
          </div>
          <p style={{ fontSize: 14, color: t.textMute, lineHeight: 1.6 }}>
            Race against the clock — 10 questions, 15 seconds each. Fastest correct answer wins the round.
          </p>
        </div>

        {/* Stats row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8, marginBottom: 24 }}>
          {[
            { icon: '❓', label: '10 questions' },
            { icon: '⏱️', label: '15 sec each'  },
            { icon: '🏆', label: '100 Q pool'   },
          ].map(s => (
            <div key={s.label} style={{ background: t.surface, border: `1px solid ${t.borderSoft}`,
              borderRadius: 12, padding: isMobile ? '10px 8px' : '12px 14px', textAlign: 'center' }}>
              <div style={{ fontSize: isMobile ? 18 : 22, marginBottom: 4 }}>{s.icon}</div>
              <div style={{ fontSize: isMobile ? 10 : 11, fontFamily: t.fontMono, color: t.textMute,
                fontWeight: 700, letterSpacing: 0.5 }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Error */}
        {error && (
          <div style={{ background: `${t.danger}18`, border: `1px solid ${t.danger}44`,
            borderRadius: 10, padding: '10px 16px', marginBottom: 16,
            fontSize: 13, color: t.danger, fontFamily: t.fontMono }}>
            {error}
          </div>
        )}

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 0, marginBottom: 24,
          border: `1px solid ${t.borderSoft}`, borderRadius: 12, overflow: 'hidden',
          width: isMobile ? '100%' : 'fit-content' }}>
          {[
            { key: 'bots',   label: '🤖 vs Bot'    },
            { key: 'create', label: 'Multiplayer'  },
            { key: 'join',   label: 'Join Room'    },
          ].map(tb => (
            <button key={tb.key} onClick={() => setTab(tb.key)} style={{
              all: 'unset', cursor: 'pointer',
              flex: isMobile ? 1 : undefined,
              padding: isMobile ? '11px 8px' : '10px 22px',
              background: tab === tb.key ? t.accent : 'transparent',
              color:      tab === tb.key ? '#000'   : t.textMute,
              fontSize: isMobile ? 12 : 13, fontWeight: 700, letterSpacing: isMobile ? 0.3 : 0.8,
              fontFamily: t.fontMono, textTransform: 'uppercase', transition: 'all 0.18s',
              textAlign: 'center',
            }}>{tb.label}</button>
          ))}
        </div>

        {/* ── vs Bot ── */}
        {tab === 'bots' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <label style={labelStyle}>Your Name</label>
              <input value={name} onChange={e => setName(e.target.value)}
                placeholder="e.g. Vinay" maxLength={18}
                onKeyDown={e => e.key === 'Enter' && name.trim() && onVsBot(name.trim())}
                style={inputStyle} />
            </div>
            <Btn theme={t} size="lg" disabled={!name.trim() || loading} onClick={() => onVsBot(name.trim())}
              style={{ width: '100%' }}>
              {loading ? 'Starting…' : '🤖 Play vs CricBot →'}
            </Btn>
            <p style={{ fontSize: 12, color: t.textDim, fontFamily: t.fontMono, textAlign: 'center' }}>
              CricBot has a 62% hit rate — can you beat it?
            </p>
          </div>
        )}

        {/* ── Create multiplayer ── */}
        {tab === 'create' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <label style={labelStyle}>Your Name</label>
              <input value={name} onChange={e => setName(e.target.value)}
                placeholder="e.g. Vinay" maxLength={18}
                onKeyDown={e => e.key === 'Enter' && name.trim() && onCreate(name.trim())}
                style={inputStyle} />
            </div>
            <Btn theme={t} size="lg" disabled={!name.trim() || loading} onClick={() => onCreate(name.trim())}
              style={{ width: '100%' }}>
              {loading ? 'Creating…' : 'Create Quiz Room →'}
            </Btn>
          </div>
        )}

        {/* ── Join room ── */}
        {tab === 'join' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16, maxWidth: isMobile ? '100%' : 400 }}>
            <div>
              <label style={labelStyle}>Your Name</label>
              <input value={name} onChange={e => setName(e.target.value)}
                placeholder="e.g. Vipin" maxLength={18}
                style={{ ...inputStyle, marginBottom: 0 }} />
            </div>
            <div>
              <label style={labelStyle}>Room Code</label>
              <input value={joinCode} onChange={e => setJoinCode(e.target.value.toUpperCase())}
                placeholder="6-letter code" maxLength={6}
                style={{ ...inputStyle, fontFamily: t.fontMono, letterSpacing: 4, textTransform: 'uppercase' }} />
            </div>
            <Btn theme={t} size="lg"
              disabled={!name.trim() || joinCode.length !== 6 || loading}
              onClick={() => onJoin(joinCode.trim(), name.trim())}
              style={{ width: '100%' }}>
              {loading ? 'Joining…' : 'Join Quiz →'}
            </Btn>
          </div>
        )}

        {/* Category legend */}
        <div style={{ marginTop: 32, display: 'flex', gap: 12, justifyContent: 'center' }}>
          {[{ label: 'IPL', color: '#f59e0b' }, { label: 'International', color: '#38bdf8' }].map(c => (
            <div key={c.label} style={{ display: 'flex', alignItems: 'center', gap: 6,
              fontSize: 11, fontFamily: t.fontMono, color: t.textMute, fontWeight: 700 }}>
              <div style={{ width: 8, height: 8, borderRadius: 2, background: c.color }} />
              {c.label}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
