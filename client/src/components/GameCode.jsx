export default function GameCode({ code = '', theme: t, size = 'md' }) {
  const d = size === 'lg' ? { cw:42, ch:56, fs:28 } : { cw:34, ch:44, fs:22 };
  const chars = (code + '      ').slice(0,6).split('');
  return (
    <div style={{ display:'flex', gap:6 }}>
      {chars.map((c, i) => (
        <div key={i} style={{
          width:d.cw, height:d.ch,
          display:'flex', alignItems:'center', justifyContent:'center',
          fontFamily:t.fontMono, fontSize:d.fs, fontWeight:700,
          color: c.trim() ? t.accent : t.textDim,
          background:t.surface, border:`1.5px solid ${c.trim()?t.border:t.borderSoft}`,
          borderRadius:8,
        }}>{c.trim()}</div>
      ))}
    </div>
  );
}
