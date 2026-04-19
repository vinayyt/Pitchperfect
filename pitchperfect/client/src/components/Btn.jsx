export default function Btn({ theme: t, onClick, variant = 'primary', size = 'md', disabled = false, style: sx = {}, children }) {
  const s = { sm:{pad:'8px 14px',fs:12,h:34}, md:{pad:'12px 20px',fs:14,h:46}, lg:{pad:'16px 28px',fs:16,h:56} }[size];
  const v = {
    primary:   { bg: t.accent,   color: t.bg,    border:'transparent', shadow:`0 4px 16px ${t.accent}44,inset 0 -2px 0 rgba(0,0,0,0.15)` },
    secondary: { bg:'transparent',color: t.text,  border: t.border,     shadow:'none' },
    ghost:     { bg: t.surface,  color: t.text,  border: t.borderSoft, shadow:'none' },
    danger:    { bg: t.danger,   color:'#fff',   border:'transparent', shadow:`0 4px 16px ${t.danger}44` },
  }[variant];
  return (
    <button onClick={onClick} disabled={disabled}
      onMouseDown={e => !disabled && (e.currentTarget.style.transform='translateY(1px)')}
      onMouseUp={e => (e.currentTarget.style.transform='')}
      onMouseLeave={e => (e.currentTarget.style.transform='')}
      style={{
        all:'unset', boxSizing:'border-box',
        padding:s.pad, height:s.h, fontSize:s.fs,
        fontWeight:700, letterSpacing:0.4, textTransform:'uppercase',
        fontFamily:t.fontDisplay,
        background:v.bg, color:v.color,
        border:`1.5px solid ${v.border}`, borderRadius:10,
        cursor: disabled?'not-allowed':'pointer', opacity:disabled?0.4:1,
        boxShadow:v.shadow, transition:'transform 0.08s',
        display:'inline-flex', alignItems:'center', justifyContent:'center', gap:8,
        ...sx,
      }}>
      {children}
    </button>
  );
}
