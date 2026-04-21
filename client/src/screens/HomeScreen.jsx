import Btn from '../components/Btn';
import PlayerCard from '../components/PlayerCard';
import { ThemeToggle } from '../ThemeContext';
import { SAMPLE_PLAYERS } from '../data';

export default function HomeScreen({ theme: t, onCreate, onJoin, onPlayBot }) {
  return (
    <div style={{ minHeight:'100vh', background:t.bg, fontFamily:t.fontDisplay, color:t.text, display:'flex', flexDirection:'column' }}>

      {/* Nav */}
      <nav style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'20px 48px',
        borderBottom:`1px solid ${t.borderSoft}`, background:`${t.bg}ee`, backdropFilter:'blur(12px)',
        position:'sticky', top:0, zIndex:100 }}>
        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
          <span style={{ fontSize:22 }}>🏏</span>
          <span style={{ fontSize:16, fontWeight:800, letterSpacing:2, color:t.accent, textTransform:'uppercase' }}>Pitch Perfect</span>
        </div>
        <ThemeToggle theme={t}/>
      </nav>

      {/* Hero */}
      <div style={{ flex:1, maxWidth:1200, margin:'0 auto', width:'100%', padding:'80px 48px',
        display:'grid', gridTemplateColumns:'1fr 1fr', gap:80, alignItems:'center' }}>

        {/* Left: copy + CTAs */}
        <div>
          <div style={{ display:'inline-block', padding:'5px 14px', borderRadius:100, marginBottom:24,
            background:`${t.accent}18`, border:`1px solid ${t.accent}44` }}>
            <span style={{ fontSize:11, fontWeight:700, letterSpacing:2, color:t.accent, textTransform:'uppercase' }}>
              No sign-up · Play in 30 seconds
            </span>
          </div>

          <h1 style={{ fontSize:72, fontWeight:900, lineHeight:1.0, letterSpacing:-3, marginBottom:24, color:t.text }}>
            Cricket<br/>stats<br/><span style={{ color:t.accent, fontStyle:'italic' }}>card duel.</span>
          </h1>

          <p style={{ fontSize:16, color:t.textMute, lineHeight:1.7, marginBottom:40, maxWidth:420 }}>
            Mixed men's &amp; women's roster. Pick a stat, beat your opponent's card.
            Ties go to the pot — next winner takes all.
          </p>

          <div style={{ display:'flex', flexDirection:'column', gap:12, maxWidth:360 }}>
            <Btn theme={t} size="lg" onClick={onCreate} style={{ width:'100%', fontSize:17 }}>
              Create a game →
            </Btn>
            <Btn theme={t} size="lg" variant="ghost" onClick={onJoin} style={{ width:'100%', fontSize:17 }}>
              Join with a code
            </Btn>
            <button onClick={onPlayBot} style={{
              all:'unset', cursor:'pointer', textAlign:'center', padding:'14px 0',
              border:`1.5px dashed ${t.accent}66`, borderRadius:14, fontSize:15,
              color:t.textMute, fontFamily:t.fontDisplay, fontWeight:600,
              transition:'all 0.2s', letterSpacing:0.3,
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor=t.accent; e.currentTarget.style.color=t.accent; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor=`${t.accent}66`; e.currentTarget.style.color=t.textMute; }}>
              🤖 Play vs Bot
            </button>
          </div>

          <div style={{ marginTop:40, display:'flex', gap:32, fontSize:12, color:t.textDim, fontFamily:t.fontMono, letterSpacing:0.8 }}>
            <span>⏱ 5–15 min rounds</span>
            <span>🃏 80 cards</span>
            <span>🏆 4 rarity tiers</span>
          </div>
        </div>

        {/* Right: fanned cards */}
        <div style={{ position:'relative', height:480, display:'flex', alignItems:'center', justifyContent:'center' }}>
          <div style={{ position:'absolute', transform:'rotate(-14deg) translate(-120px, 20px)', zIndex:1, opacity:0.85 }}>
            <PlayerCard player={SAMPLE_PLAYERS[2]} theme={t} size="md"/>
          </div>
          <div style={{ position:'absolute', transform:'rotate(12deg) translate(110px, 30px)', zIndex:1, opacity:0.85 }}>
            <PlayerCard player={SAMPLE_PLAYERS[1]} theme={t} size="md"/>
          </div>
          <div style={{ position:'relative', zIndex:2, filter:`drop-shadow(0 24px 48px ${t.accent}44)` }}>
            <PlayerCard player={SAMPLE_PLAYERS[0]} theme={t} size="lg"/>
          </div>
        </div>
      </div>

      {/* How to play strip */}
      <div style={{ background:t.bgElev, borderTop:`1px solid ${t.borderSoft}`, padding:'48px 48px' }}>
        <div style={{ maxWidth:1200, margin:'0 auto' }}>
          <div style={{ fontSize:11, fontWeight:700, letterSpacing:2, color:t.textMute, textTransform:'uppercase', marginBottom:24, fontFamily:t.fontMono }}>
            How it works
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:24 }}>
            {[
              { n:'01', title:'Deal',    desc:'Both players get 11 cards from a shuffled deck.' },
              { n:'02', title:'Pick',    desc:'The active player picks a stat from their top card.' },
              { n:'03', title:'Compare', desc:'Higher value wins both cards. Ties go to the pot.' },
              { n:'04', title:'Win',     desc:'Most cards when the timer runs out wins the match.' },
            ].map(step => (
              <div key={step.n} style={{ padding:'24px', background:t.surface, borderRadius:14, border:`1px solid ${t.borderSoft}` }}>
                <div style={{ fontSize:32, fontWeight:900, color:t.accent, fontFamily:t.fontMono, marginBottom:10 }}>{step.n}</div>
                <div style={{ fontSize:15, fontWeight:700, color:t.text, marginBottom:8 }}>{step.title}</div>
                <div style={{ fontSize:13, color:t.textMute, lineHeight:1.6 }}>{step.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div style={{ padding:'20px 48px', textAlign:'center', borderTop:`1px solid ${t.borderSoft}` }}>
        <div style={{ fontSize:11, color:t.textDim, fontFamily:t.fontMono, letterSpacing:0.5, marginBottom:6 }}>
          PITCH PERFECT · CARD BATTLE GAME
        </div>
        <div style={{ fontSize:10, color:t.textDim, fontFamily:t.fontMono, letterSpacing:0.3, lineHeight:1.6, maxWidth:600, margin:'0 auto' }}>
          Independent fan project. Not affiliated with or endorsed by BCCI, IPL, WPL, or any cricket board or player. Player names and statistics are used for entertainment purposes only.
        </div>
      </div>
    </div>
  );
}
