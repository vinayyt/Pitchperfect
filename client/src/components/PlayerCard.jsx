import { STAT_BY_KEY } from '../data';

const RARITY_BORDER = {
  BRONZE: 'linear-gradient(135deg,#8a5424,#b87333,#6b3c19)',
  SILVER: 'linear-gradient(135deg,#8d9298,#dfe3e6,#6d7278)',
  GOLD:   'linear-gradient(135deg,#a8862e,#f4d36b,#b8922f)',
  LEGEND: 'linear-gradient(135deg,#d4a340,#fff1c0,#f4d36b,#b98c26,#fff1c0)',
};

export default function PlayerCard({
  player, theme: t, size = 'lg',
  selectedStat = null, onPickStat = null,
  revealed = true, highlightWinner = null,
  flipped = false, compact = false,
}) {
  if (!player || !t) return null;

  const dims = {
    lg: { w:296, h:470, portH:188, nameSize:22, statRow:30, statFs:13 },
    md: { w:180, h:286, portH:114, nameSize:14, statRow:20, statFs:10 },
    sm: { w:116, h:184, portH:72,  nameSize:10, statRow:14, statFs:8  },
  }[size];

  const rarity   = player.rarity   || 'BRONZE';
  const rarityBorder = RARITY_BORDER[rarity] || RARITY_BORDER.BRONZE;
  const rarityObj    = player.rarityObj || { color:'#b87333', glow:'rgba(184,115,51,0.3)' };
  const team         = player.teamObj   || { name:'', short:'??', primary:'#333', secondary:'#111' };
  const role         = player.roleObj   || { label:'', stats:['matches','runs','avg','sr'] };
  const isLegend = rarity === 'LEGEND';
  const isGold   = rarity === 'GOLD';

  const shownStats = role.stats.slice(0, size === 'sm' ? 3 : size === 'md' ? 5 : 7);

  if (flipped) {
    return (
      <div style={{ width:dims.w, height:dims.h, borderRadius:14, background:rarityBorder, padding:3,
        boxShadow:`0 8px 32px ${rarityObj.glow},0 2px 8px rgba(0,0,0,0.4)` }}>
        <div style={{ width:'100%', height:'100%', borderRadius:11,
          background:`linear-gradient(160deg,${t.bgElev},${t.bg})`,
          display:'flex', alignItems:'center', justifyContent:'center',
          position:'relative', overflow:'hidden' }}>
          <div style={{ width:'70%', aspectRatio:'1', borderRadius:'50%',
            border:`2px solid ${t.accent}`, opacity:0.3 }}/>
          <div style={{ position:'absolute', bottom:18, fontFamily:t.fontDisplay,
            fontSize:11, fontWeight:600, letterSpacing:3, color:t.accent, opacity:0.6 }}>
            PITCH • PERFECT
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ width:dims.w, height:dims.h, borderRadius:14, background:rarityBorder, padding:3,
      position:'relative', boxShadow:`0 8px 32px ${rarityObj.glow},0 2px 8px rgba(0,0,0,0.4)`,
      fontFamily:t.fontDisplay }}>

      {isLegend && (
        <div style={{ position:'absolute', inset:0, borderRadius:14, pointerEvents:'none',
          background:'linear-gradient(115deg,transparent 30%,rgba(255,255,255,0.22) 48%,rgba(132,224,255,0.18) 52%,transparent 70%)',
          backgroundSize:'250% 250%', mixBlendMode:'screen', animation:'holoShift 4s ease-in-out infinite' }}/>
      )}
      {isGold && (
        <div style={{ position:'absolute', inset:0, borderRadius:14, pointerEvents:'none',
          background:'linear-gradient(115deg,transparent 40%,rgba(255,241,192,0.15) 50%,transparent 60%)',
          backgroundSize:'200% 200%', mixBlendMode:'screen', animation:'holoShift 6s ease-in-out infinite' }}/>
      )}

      <div style={{ width:'100%', height:'100%', borderRadius:11,
        background:`linear-gradient(175deg,${team.secondary} 0%,${t.bgElev} 45%,${t.bg} 100%)`,
        position:'relative', overflow:'hidden', display:'flex', flexDirection:'column' }}>

        {/* Top strip */}
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between',
          padding: size==='sm'?'4px 6px':'7px 10px',
          background:`linear-gradient(90deg,${team.primary}cc,${team.primary}66 60%,transparent)`,
          color:'#fff', fontSize: size==='sm'?7:10, fontWeight:700, letterSpacing:1.2 }}>
          <span style={{ fontFamily:t.fontMono, background:'rgba(0,0,0,0.35)', padding:'2px 6px', borderRadius:3, fontSize: size==='sm'?7:9 }}>
            {rarity}
          </span>
          <span style={{ opacity:0.8 }}>{player.league==='W'?"WOMEN'S":"MEN'S"} · {role.label.toUpperCase()}</span>
          <span style={{ fontFamily:t.fontMono, fontSize: size==='sm'?7:10, color:t.accent }}>#{player.jersey||'?'}</span>
        </div>

        {/* Portrait */}
        <div style={{ height:dims.portH, position:'relative', overflow:'hidden',
          background:`linear-gradient(165deg,${team.primary}44 0%,${team.secondary} 60%)`,
          borderBottom:`1px solid ${t.borderSoft}` }}>
          <div style={{ position:'absolute', inset:0,
            backgroundImage:`repeating-linear-gradient(45deg,transparent 0,transparent 8px,${team.primary}18 8px,${team.primary}18 9px)` }}/>
          {/* team badge */}
          <div style={{ position:'absolute', top: size==='sm'?6:10, right: size==='sm'?6:10,
            width: size==='sm'?22:36, height: size==='sm'?22:36, borderRadius:'50%',
            background:team.primary, display:'flex', alignItems:'center', justifyContent:'center',
            fontSize: size==='sm'?8:12, fontWeight:800, color:team.secondary,
            boxShadow:'0 2px 4px rgba(0,0,0,0.4)', letterSpacing:0.5 }}>
            {team.short}
          </div>
          {/* initials watermark */}
          <div style={{ position:'absolute', bottom:0, left:'50%', transform:'translateX(-50%)',
            fontSize:dims.portH*0.6, fontWeight:900, color:'rgba(255,255,255,0.06)',
            fontFamily:t.fontDisplay, letterSpacing:-4, lineHeight:1 }}>
            {player.initials}
          </div>
          {/* name card */}
          <div style={{ position:'absolute', left:0, right:0, bottom:0,
            padding: size==='sm'?'4px 6px':'8px 10px',
            background:'linear-gradient(transparent,rgba(0,0,0,0.75))' }}>
            <div style={{ fontSize:dims.nameSize, fontWeight:700, color:'#fff', letterSpacing:-0.3,
              textShadow:'0 1px 2px rgba(0,0,0,0.6)', lineHeight:1.1 }}>{player.name}</div>
            <div style={{ fontSize: size==='sm'?7:10, fontWeight:500, color:t.accent, opacity:0.9,
              fontFamily:t.fontMono, letterSpacing:0.5, marginTop:2 }}>{team.name.toUpperCase()}</div>
          </div>
        </div>

        {/* Stats */}
        {!compact && (
          <div style={{ flex:1, padding: size==='sm'?'4px 6px':'8px 10px',
            display:'flex', flexDirection:'column', gap: size==='sm'?1:2, overflow:'hidden' }}>
            {shownStats.map(key => {
              const meta = STAT_BY_KEY[key];
              if (!meta) return null;
              const val       = player[key];
              const inPrimary = role.stats.includes(key);
              const isSelected = selectedStat === key;
              const isWin  = isSelected && highlightWinner === 'this';
              const isLoss = isSelected && highlightWinner === 'opp';
              return (
                <button key={key}
                  onClick={onPickStat ? () => onPickStat(key) : undefined}
                  disabled={!onPickStat}
                  style={{
                    all:'unset', display:'grid', gridTemplateColumns:'1fr auto',
                    alignItems:'center', padding: size==='sm'?'1px 4px':'3px 8px',
                    height:dims.statRow, borderRadius:4,
                    cursor: onPickStat?'pointer':'default',
                    opacity: inPrimary ? 1 : 0.35,
                    background: isWin  ? `linear-gradient(90deg,${t.success}33,${t.success}11)` :
                                isLoss ? `linear-gradient(90deg,${t.danger}33,${t.danger}11)` :
                                isSelected ? `linear-gradient(90deg,${t.accent}44,${t.accent}11)` : 'transparent',
                    border: isSelected
                      ? `1px solid ${isWin?t.success:isLoss?t.danger:t.accent}`
                      : '1px solid transparent',
                    transition:'background 0.2s, border 0.2s',
                  }}>
                  <span style={{ fontSize:dims.statFs, fontWeight:500, textTransform:'uppercase', letterSpacing:0.3,
                    color: isSelected?(isWin?t.success:isLoss?t.danger:t.accent):t.textMute }}>
                    {meta.label}
                  </span>
                  <span style={{ fontFamily:t.fontMono, fontSize:dims.statFs+2, fontWeight:600,
                    fontVariantNumeric:'tabular-nums',
                    color: isSelected?(isWin?t.success:isLoss?t.danger:t.accent):t.text }}>
                    {revealed ? meta.fmt(val) : '• • •'}
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
