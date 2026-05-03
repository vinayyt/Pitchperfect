import { useState, useRef, useEffect } from 'react';
import Btn from '../components/Btn';
import GameCode from '../components/GameCode';
import { useResponsive } from '../hooks/useResponsive';

function Card({ theme: t, children, isMobile }) {
  return (
    <div style={{ background:t.surface, border:`1px solid ${t.borderSoft}`, borderRadius:20,
      padding: isMobile ? 24 : 40 }}>
      {children}
    </div>
  );
}

function Label({ theme: t, children }) {
  return <div style={{ fontSize:11, fontWeight:700, letterSpacing:1.5, color:t.textMute,
    textTransform:'uppercase', fontFamily:t.fontMono, marginBottom:10 }}>{children}</div>;
}

// ── CREATE FORM ───────────────────────────────────────────────────────────────
function CreateForm({ theme: t, loading, error, onCreate, onBack }) {
  const { isMobile } = useResponsive();
  const [name, setName]         = useState('');
  const [duration, setDuration] = useState(10);
  const ref = useRef(null);
  useEffect(() => { ref.current?.focus(); }, []);

  return (
    <div style={{ minHeight:'100vh', background:t.bg, fontFamily:t.fontDisplay, color:t.text }}>
      <div style={{ maxWidth:560, margin: isMobile ? '24px auto' : '40px auto', padding: isMobile ? '0 16px' : '0 24px' }}>
        <h1 style={{ fontSize: isMobile ? 32 : 40, fontWeight:800, letterSpacing:-1.5, marginBottom:8 }}>Create a game</h1>
        <p style={{ fontSize:15, color:t.textMute, marginBottom: isMobile ? 24 : 40, lineHeight:1.6 }}>
          Set up the room, share the code, and wait for your opponent.
        </p>

        <Card theme={t} isMobile={isMobile}>
          <Label theme={t}>Your name</Label>
          <input ref={ref} type="text" value={name} onChange={e => setName(e.target.value)}
            onKeyDown={e => e.key==='Enter' && name.trim() && onCreate(name.trim(), duration*60)}
            placeholder="Enter your name" maxLength={18}
            style={{ width:'100%', padding:'14px 18px', marginBottom: isMobile ? 24 : 32,
              background:t.bgElev, border:`1.5px solid ${t.border}`, borderRadius:12,
              color:t.text, fontSize:16, fontFamily:t.fontDisplay, outline:'none',
              transition:'border-color 0.2s', boxSizing:'border-box',
            }}
            onFocus={e => e.target.style.borderColor=t.accent}
            onBlur={e => e.target.style.borderColor=t.border}
          />

          <Label theme={t}>Match length</Label>
          <div style={{ display:'flex', gap:10, marginBottom: isMobile ? 24 : 32 }}>
            {[5,10,15].map(d => (
              <button key={d} onClick={() => setDuration(d)} style={{
                all:'unset', flex:1, textAlign:'center', padding: isMobile ? '12px 0' : '16px 0', cursor:'pointer',
                background: duration===d ? `${t.accent}22` : t.bgElev,
                border:`2px solid ${duration===d ? t.accent : t.borderSoft}`,
                borderRadius:12, transition:'all 0.15s',
              }}>
                <div style={{ fontSize: isMobile ? 22 : 26, fontWeight:800, color:duration===d?t.accent:t.text, fontFamily:t.fontMono }}>{d}</div>
                <div style={{ fontSize:11, letterSpacing:1, color:t.textMute, marginTop:4 }}>MIN</div>
              </button>
            ))}
          </div>

          {error && (
            <div style={{ padding:'12px 16px', background:`${t.danger}18`, border:`1px solid ${t.danger}44`,
              borderRadius:10, fontSize:13, color:t.danger, marginBottom:20 }}>{error}</div>
          )}

          <Btn theme={t} size="lg" onClick={() => name.trim() && onCreate(name.trim(), duration*60)}
            disabled={!name.trim() || loading} style={{ width:'100%' }}>
            {loading ? 'Creating…' : 'Create room →'}
          </Btn>
        </Card>
      </div>
    </div>
  );
}

// ── HOST WAITING ──────────────────────────────────────────────────────────────
function HostWaiting({ theme: t, code, oppName, timeLimit, onStart, onBack }) {
  const { isMobile } = useResponsive();
  const [copied, setCopied] = useState(false);
  const copy = () => { navigator.clipboard.writeText(code); setCopied(true); setTimeout(() => setCopied(false), 1500); };

  return (
    <div style={{ minHeight:'100vh', background:t.bg, fontFamily:t.fontDisplay, color:t.text }}>
      <div style={{ maxWidth:680, margin: isMobile ? '24px auto' : '40px auto', padding: isMobile ? '0 16px' : '0 24px' }}>
        <h1 style={{ fontSize: isMobile ? 32 : 40, fontWeight:800, letterSpacing:-1.5, marginBottom:8 }}>Share the code</h1>
        <p style={{ fontSize:15, color:t.textMute, marginBottom: isMobile ? 24 : 40 }}>Send this 6-character code to your opponent.</p>

        <Card theme={t} isMobile={isMobile}>
          <div style={{ textAlign:'center', marginBottom:28 }}>
            <Label theme={t}>Room code</Label>
            <div style={{ display:'flex', justifyContent:'center', marginBottom:16 }}>
              <GameCode code={code} theme={t} size="lg"/>
            </div>
            <Btn theme={t} size="sm" variant="ghost" onClick={copy}>{copied ? '✓ Copied!' : 'Copy code'}</Btn>
          </div>

          <div style={{ borderTop:`1px solid ${t.borderSoft}`, paddingTop:24, marginBottom:24 }}>
            {oppName ? (
              <div style={{ display:'flex', alignItems:'center', gap:16, padding:'16px 20px',
                background:`${t.success}12`, border:`1px solid ${t.success}44`, borderRadius:14 }}>
                <div style={{ width:44, height:44, borderRadius:'50%', background:`${t.success}22`,
                  border:`2px solid ${t.success}`, display:'flex', alignItems:'center', justifyContent:'center',
                  fontSize:20, fontWeight:700, color:t.success, flexShrink:0 }}>✓</div>
                <div>
                  <div style={{ fontSize:16, fontWeight:700, color:t.text }}>{oppName} joined!</div>
                  <div style={{ fontSize:13, color:t.textMute, marginTop:2 }}>Ready when you are.</div>
                </div>
              </div>
            ) : (
              <div style={{ display:'flex', alignItems:'center', gap:16, padding:'16px 20px',
                background:t.bgElev, border:`1px dashed ${t.borderSoft}`, borderRadius:14 }}>
                <div style={{ width:12, height:12, borderRadius:'50%', background:t.accent,
                  animation:'pulse 1.4s ease-in-out infinite', flexShrink:0 }}/>
                <div>
                  <div style={{ fontSize:15, fontWeight:600, color:t.text }}>Waiting for opponent...</div>
                  <div style={{ fontSize:13, color:t.textMute, marginTop:2 }}>Share the code above to invite them.</div>
                </div>
              </div>
            )}
          </div>

          <Btn theme={t} size="lg" onClick={onStart} disabled={!oppName} style={{ width:'100%' }}>
            {oppName ? 'Start match →' : 'Waiting for opponent…'}
          </Btn>
        </Card>
      </div>
      <style>{`@keyframes pulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:.4;transform:scale(.85)} }`}</style>
    </div>
  );
}

// ── JOIN FORM ─────────────────────────────────────────────────────────────────
function JoinForm({ theme: t, loading, error, onJoin, onBack }) {
  const { isMobile } = useResponsive();
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [pasteFlash, setPasteFlash] = useState(false);

  const applyCode = (raw) => {
    const cleaned = raw.replace(/[^A-Za-z0-9]/g, '').toUpperCase().slice(0, 6);
    setCode(cleaned);
    const focusIdx = Math.min(cleaned.length, 5);
    setTimeout(() => document.getElementById(`jc-${focusIdx}`)?.focus(), 0);
  };

  const handleBoxKey = (e, i) => {
    const k = e.key;
    if (k === 'Backspace') {
      e.preventDefault();
      const arr = (code + '      ').slice(0,6).split('');
      arr[i] = ' ';
      setCode(arr.join('').trimEnd());
      if (i > 0) document.getElementById(`jc-${i-1}`)?.focus();
    } else if (/^[A-Za-z0-9]$/.test(k)) {
      e.preventDefault();
      const arr = (code.padEnd(6,' ')).split('');
      arr[i] = k.toUpperCase();
      setCode(arr.join('').trimEnd());
      if (i < 5) document.getElementById(`jc-${i+1}`)?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const text = e.clipboardData?.getData('text') || '';
    applyCode(text);
    setPasteFlash(true);
    setTimeout(() => setPasteFlash(false), 1000);
  };

  const handlePasteBtn = async () => {
    try {
      const text = await navigator.clipboard.readText();
      applyCode(text);
      setPasteFlash(true);
      setTimeout(() => setPasteFlash(false), 1000);
    } catch {
      document.getElementById('jc-0')?.focus();
    }
  };

  const cleanCode = code.replace(/\s/g,'');
  const boxSize = isMobile ? 44 : 56;
  const boxHeight = isMobile ? 58 : 72;

  return (
    <div style={{ minHeight:'100vh', background:t.bg, fontFamily:t.fontDisplay, color:t.text }}>
      <div style={{ maxWidth:560, margin: isMobile ? '24px auto' : '40px auto', padding: isMobile ? '0 16px' : '0 24px' }}>
        <h1 style={{ fontSize: isMobile ? 32 : 40, fontWeight:800, letterSpacing:-1.5, marginBottom:8 }}>Join a game</h1>
        <p style={{ fontSize:15, color:t.textMute, marginBottom: isMobile ? 24 : 40 }}>Enter the 6-character code your opponent shared.</p>

        <Card theme={t} isMobile={isMobile}>
          <Label theme={t}>Your name</Label>
          <input type="text" value={name} onChange={e => setName(e.target.value)}
            placeholder="Enter your name" maxLength={18}
            style={{ width:'100%', padding:'14px 18px', marginBottom: isMobile ? 24 : 32,
              background:t.bgElev, border:`1.5px solid ${t.border}`, borderRadius:12,
              color:t.text, fontSize:16, fontFamily:t.fontDisplay, outline:'none', boxSizing:'border-box' }}
            onFocus={e => e.target.style.borderColor=t.accent}
            onBlur={e => e.target.style.borderColor=t.border}
          />

          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:10 }}>
            <Label theme={t}>Room code</Label>
            <button onClick={handlePasteBtn} style={{
              all:'unset', cursor:'pointer', display:'flex', alignItems:'center', gap:6,
              padding:'5px 12px', borderRadius:8, fontSize:12, fontWeight:700,
              fontFamily:t.fontMono, letterSpacing:0.5,
              background: pasteFlash ? `${t.success}22` : `${t.accent}15`,
              border: `1px solid ${pasteFlash ? t.success : t.accent}44`,
              color: pasteFlash ? t.success : t.accent, transition:'all 0.2s',
            }}>
              {pasteFlash ? '✓ Pasted!' : 'Paste'}
            </button>
          </div>

          <div style={{ display:'flex', gap: isMobile ? 6 : 10, marginBottom: isMobile ? 24 : 32, justifyContent:'center' }}>
            {Array.from({length:6}).map((_, i) => (
              <input key={i} id={`jc-${i}`} type="text" maxLength={1}
                value={(code[i]||'').trim()}
                onChange={() => {}}
                onKeyDown={e => handleBoxKey(e, i)}
                onPaste={handlePaste}
                onClick={() => document.getElementById(`jc-${i}`)?.select()}
                style={{
                  width:boxSize, height:boxHeight, textAlign:'center', padding:0,
                  fontFamily:t.fontMono, fontSize: isMobile ? 26 : 32, fontWeight:700,
                  color: code[i]?.trim() ? t.accent : t.textDim,
                  background: pasteFlash && code[i]?.trim() ? `${t.success}12` : t.bgElev,
                  border:`2px solid ${pasteFlash && code[i]?.trim() ? t.success : code[i]?.trim() ? t.accent : t.borderSoft}`,
                  borderRadius:12, outline:'none', cursor:'text', transition:'border-color 0.2s, background 0.2s',
                  flexShrink: 0,
                }}
              />
            ))}
          </div>

          {error && (
            <div style={{ padding:'12px 16px', background:`${t.danger}18`, border:`1px solid ${t.danger}44`,
              borderRadius:10, fontSize:13, color:t.danger, marginBottom:20 }}>{error}</div>
          )}

          <Btn theme={t} size="lg" style={{ width:'100%' }}
            disabled={!name.trim() || cleanCode.length<6 || loading}
            onClick={() => onJoin(cleanCode, name.trim())}>
            {loading ? 'Joining…' : 'Join match →'}
          </Btn>
        </Card>
      </div>
    </div>
  );
}

// ── JOIN WAITING ──────────────────────────────────────────────────────────────
function JoinWaiting({ theme: t, code, oppName, onBack }) {
  const { isMobile } = useResponsive();
  return (
    <div style={{ minHeight:'100vh', background:t.bg, fontFamily:t.fontDisplay, color:t.text }}>
      <div style={{ maxWidth:560, margin: isMobile ? '24px auto' : '40px auto', padding: isMobile ? '0 16px' : '0 24px' }}>
        <h1 style={{ fontSize: isMobile ? 32 : 40, fontWeight:800, letterSpacing:-1.5, marginBottom:8 }}>You're in!</h1>
        <p style={{ fontSize:15, color:t.textMute, marginBottom: isMobile ? 24 : 40 }}>Waiting for the host to start the match.</p>
        <Card theme={t} isMobile={isMobile}>
          <div style={{ textAlign:'center', marginBottom:24 }}>
            <Label theme={t}>Room code</Label>
            <div style={{ display:'flex', justifyContent:'center' }}>
              <GameCode code={code} theme={t} size="lg"/>
            </div>
          </div>
          <div style={{ display:'flex', alignItems:'center', gap:16, padding:'20px',
            background:t.bgElev, borderRadius:14, border:`1px solid ${t.borderSoft}` }}>
            <div style={{ width:12, height:12, borderRadius:'50%', background:t.accent, flexShrink:0,
              animation:'pulse 1.4s ease-in-out infinite' }}/>
            <div>
              <div style={{ fontSize:15, fontWeight:600, color:t.text }}>
                {oppName ? `Waiting for ${oppName} to start…` : 'Waiting for host…'}
              </div>
              <div style={{ fontSize:13, color:t.textMute, marginTop:2 }}>The host controls when the game begins.</div>
            </div>
          </div>
        </Card>
      </div>
      <style>{`@keyframes pulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:.4;transform:scale(.85)} }`}</style>
    </div>
  );
}

// ── BOT FORM ──────────────────────────────────────────────────────────────────
function BotForm({ theme: t, loading, error, onPlayBot, onBack }) {
  const { isMobile } = useResponsive();
  const [name, setName]         = useState('');
  const [duration, setDuration] = useState(10);
  const ref = useRef(null);
  useEffect(() => { ref.current?.focus(); }, []);

  return (
    <div style={{ minHeight:'100vh', background:t.bg, fontFamily:t.fontDisplay, color:t.text }}>
      <div style={{ maxWidth:560, margin: isMobile ? '24px auto' : '40px auto', padding: isMobile ? '0 16px' : '0 24px' }}>
        <div style={{ display:'flex', alignItems:'center', gap:14, marginBottom:8 }}>
          <span style={{ fontSize: isMobile ? 32 : 40 }}>🤖</span>
          <h1 style={{ fontSize: isMobile ? 32 : 40, fontWeight:800, letterSpacing:-1.5, margin:0 }}>Play vs Bot</h1>
        </div>
        <p style={{ fontSize:15, color:t.textMute, marginBottom: isMobile ? 24 : 40, lineHeight:1.6 }}>
          Solo mode — the bot picks stats at random. Good luck!
        </p>

        <Card theme={t} isMobile={isMobile}>
          <Label theme={t}>Your name</Label>
          <input ref={ref} type="text" value={name} onChange={e => setName(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && name.trim() && onPlayBot(name.trim(), duration * 60)}
            placeholder="Enter your name" maxLength={18}
            style={{ width:'100%', padding:'14px 18px', marginBottom: isMobile ? 24 : 32,
              background:t.bgElev, border:`1.5px solid ${t.border}`, borderRadius:12,
              color:t.text, fontSize:16, fontFamily:t.fontDisplay, outline:'none',
              transition:'border-color 0.2s', boxSizing:'border-box' }}
            onFocus={e => e.target.style.borderColor=t.accent}
            onBlur={e => e.target.style.borderColor=t.border}
          />

          <Label theme={t}>Match length</Label>
          <div style={{ display:'flex', gap:10, marginBottom: isMobile ? 24 : 32 }}>
            {[5, 10, 15].map(d => (
              <button key={d} onClick={() => setDuration(d)} style={{
                all:'unset', flex:1, textAlign:'center', padding: isMobile ? '12px 0' : '16px 0', cursor:'pointer',
                background: duration===d ? `${t.accent}22` : t.bgElev,
                border:`2px solid ${duration===d ? t.accent : t.borderSoft}`,
                borderRadius:12, transition:'all 0.15s',
              }}>
                <div style={{ fontSize: isMobile ? 22 : 26, fontWeight:800, color:duration===d?t.accent:t.text, fontFamily:t.fontMono }}>{d}</div>
                <div style={{ fontSize:11, letterSpacing:1, color:t.textMute, marginTop:4 }}>MIN</div>
              </button>
            ))}
          </div>

          {error && (
            <div style={{ padding:'12px 16px', background:`${t.danger}18`, border:`1px solid ${t.danger}44`,
              borderRadius:10, fontSize:13, color:t.danger, marginBottom:20 }}>{error}</div>
          )}

          <Btn theme={t} size="lg" onClick={() => name.trim() && onPlayBot(name.trim(), duration * 60)}
            disabled={!name.trim() || loading} style={{ width:'100%' }}>
            {loading ? 'Starting…' : '🤖 Start bot game →'}
          </Btn>
        </Card>
      </div>
    </div>
  );
}

// ── ROUTER ────────────────────────────────────────────────────────────────────
export default function LobbyScreen({ theme: t, mode, code, myName, oppName, timeLimit, loading, error, onCreate, onJoin, onStart, onPlayBot, onBack }) {
  if (mode === 'host-waiting') return <HostWaiting theme={t} code={code} oppName={oppName} timeLimit={timeLimit} onStart={onStart} onBack={onBack}/>;
  if (mode === 'join-form')    return <JoinForm    theme={t} loading={loading} error={error} onJoin={onJoin} onBack={onBack}/>;
  if (mode === 'join-waiting') return <JoinWaiting theme={t} code={code} oppName={oppName} onBack={onBack}/>;
  if (mode === 'bot-form')     return <BotForm     theme={t} loading={loading} error={error} onPlayBot={onPlayBot} onBack={onBack}/>;
  return <CreateForm theme={t} loading={loading} error={error} onCreate={onCreate} onBack={onBack}/>;
}
