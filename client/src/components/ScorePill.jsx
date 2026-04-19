export default function ScorePill({ label, count, color, theme: t, active = false }) {
  return (
    <div style={{
      display:'flex', alignItems:'center', gap:8,
      padding:'6px 12px',
      background: active ? `${color}22` : t.surface,
      border:`1px solid ${active?color:t.borderSoft}`,
      borderRadius:100,
    }}>
      <div style={{ width:8, height:8, borderRadius:'50%', background:color, boxShadow:active?`0 0 8px ${color}`:'none' }}/>
      <span style={{ fontSize:11, color:t.textMute, fontWeight:500, textTransform:'uppercase', letterSpacing:0.8 }}>{label}</span>
      <span style={{ fontFamily:t.fontMono, fontSize:16, fontWeight:700, color:t.text, fontVariantNumeric:'tabular-nums' }}>{count}</span>
    </div>
  );
}
