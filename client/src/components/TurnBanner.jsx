export default function TurnBanner({ isMyTurn, theme: t }) {
  return (
    <div style={{
      display:'flex', alignItems:'center', gap:10, padding:'10px 16px',
      background: isMyTurn ? `${t.accent}15` : `${t.textMute}15`,
      border:`1px solid ${isMyTurn ? t.accent+'66' : t.borderSoft}`,
      borderRadius:12,
    }}>
      <div style={{
        width:8, height:8, borderRadius:'50%',
        background: isMyTurn ? t.accent : t.textMute,
        animation: isMyTurn ? 'none' : 'pulse 1.4s ease-in-out infinite',
      }}/>
      <span style={{
        fontSize:12, fontWeight:700, letterSpacing:1.5, textTransform:'uppercase',
        color: isMyTurn ? t.accent : t.textMute,
      }}>
        {isMyTurn ? 'Your turn — pick a stat' : 'Opponent is choosing...'}
      </span>
    </div>
  );
}
