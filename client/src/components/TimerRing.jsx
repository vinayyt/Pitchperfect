export default function TimerRing({ remaining, total, theme: t, size = 56, stroke = 4, low = false }) {
  const r   = (size - stroke) / 2;
  const c   = 2 * Math.PI * r;
  const pct = Math.max(0, Math.min(1, remaining / (total || 1)));
  const col = low ? t.danger : t.accent;
  const mins = Math.floor(remaining / 60);
  const secs = String(Math.floor(remaining % 60)).padStart(2, '0');
  return (
    <div style={{ position:'relative', width:size, height:size }}>
      <svg width={size} height={size} style={{ transform:'rotate(-90deg)' }}>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={t.surface} strokeWidth={stroke}/>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={col} strokeWidth={stroke}
          strokeDasharray={c} strokeDashoffset={c*(1-pct)} strokeLinecap="round"
          style={{ transition:'stroke-dashoffset 1s linear' }}/>
      </svg>
      <div style={{
        position:'absolute', inset:0, display:'flex', alignItems:'center', justifyContent:'center',
        fontFamily:t.fontMono, fontWeight:700, fontSize:size>50?14:11, color:col,
        fontVariantNumeric:'tabular-nums',
      }}>{mins}:{secs}</div>
    </div>
  );
}
