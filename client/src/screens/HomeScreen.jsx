import Btn from '../components/Btn';
import PlayerCard from '../components/PlayerCard';
import { SAMPLE_PLAYERS } from '../data';
import { useResponsive } from '../hooks/useResponsive';

export default function HomeScreen({ theme: t, onCreate, onJoin, onPlayBot }) {
  const { isMobile } = useResponsive();

  return (
    <div style={{ minHeight:'100vh', background:t.bg, fontFamily:t.fontDisplay, color:t.text, display:'flex', flexDirection:'column' }}>

      {/* Hero */}
      <div style={{
        flex:1, maxWidth:1200, margin:'0 auto', width:'100%',
        padding: isMobile ? '36px 20px 28px' : '80px 48px',
        display: isMobile ? 'flex' : 'grid',
        flexDirection: isMobile ? 'column' : undefined,
        gridTemplateColumns: isMobile ? undefined : '1fr 1fr',
        gap: isMobile ? 28 : 80, alignItems:'center',
      }}>

        {/* Copy + CTAs */}
        <div>
          <div style={{ display:'inline-block', padding:'5px 14px', borderRadius:100, marginBottom:18,
            background:`${t.accent}18`, border:`1px solid ${t.accent}44` }}>
            <span style={{ fontSize:11, fontWeight:700, letterSpacing:2, color:t.accent, textTransform:'uppercase' }}>
              No sign-up · Play in 30 seconds
            </span>
          </div>

          <h1 style={{ fontSize: isMobile ? 52 : 72, fontWeight:900, lineHeight:1.0,
            letterSpacing: isMobile ? -2 : -3, marginBottom: isMobile ? 16 : 24, color:t.text }}>
            Cricket<br/>stats<br/><span style={{ color:t.accent, fontStyle:'italic' }}>card duel.</span>
          </h1>

          <p style={{ fontSize: isMobile ? 14 : 16, color:t.textMute, lineHeight:1.7,
            marginBottom: isMobile ? 28 : 40, maxWidth:420 }}>
            Mixed men's &amp; women's roster. Pick a stat, beat your opponent's card.
            Ties go to the pot — next winner takes all.
          </p>

          <div style={{ display:'flex', flexDirection:'column', gap:10, maxWidth: isMobile ? '100%' : 360 }}>
            <Btn theme={t} size="lg" onClick={onCreate} style={{ width:'100%', fontSize: isMobile ? 16 : 17 }}>
              Create a game →
            </Btn>
            <Btn theme={t} size="lg" variant="ghost" onClick={onJoin} style={{ width:'100%', fontSize: isMobile ? 16 : 17 }}>
              Join with a code
            </Btn>
            <button onClick={onPlayBot} style={{
              all:'unset', cursor:'pointer', textAlign:'center',
              padding: isMobile ? '13px 0' : '14px 0',
              border:`1.5px dashed ${t.accent}66`, borderRadius:14,
              fontSize: isMobile ? 14 : 15,
              color:t.textMute, fontFamily:t.fontDisplay, fontWeight:600,
              transition:'all 0.2s', letterSpacing:0.3,
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor=t.accent; e.currentTarget.style.color=t.accent; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor=`${t.accent}66`; e.currentTarget.style.color=t.textMute; }}>
              🤖 Play vs Bot
            </button>
          </div>

          <div style={{ marginTop: isMobile ? 24 : 40, display:'flex', gap: isMobile ? 16 : 32,
            fontSize:12, color:t.textDim, fontFamily:t.fontMono, letterSpacing:0.8, flexWrap:'wrap' }}>
            <span>⏱ 5–15 min</span>
            <span>🃏 80 cards</span>
            <span>🏆 4 tiers</span>
          </div>
        </div>

        {/* Card showcase */}
        {isMobile ? (
          /* Mobile: single centred card */
          <div style={{ display:'flex', justifyContent:'center' }}>
            <div style={{ filter:`drop-shadow(0 16px 40px ${t.accent}33)` }}>
              <PlayerCard player={SAMPLE_PLAYERS[0]} theme={t} size="md"/>
            </div>
          </div>
        ) : (
          /* Desktop: fanned trio */
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
        )}
      </div>

      {/* How to play */}
      <div style={{ background:t.bgElev, borderTop:`1px solid ${t.borderSoft}`, padding: isMobile ? '28px 20px' : '48px 48px' }}>
        <div style={{ maxWidth:1200, margin:'0 auto' }}>
          <div style={{ fontSize:11, fontWeight:700, letterSpacing:2, color:t.textMute,
            textTransform:'uppercase', marginBottom: isMobile ? 16 : 24, fontFamily:t.fontMono }}>
            How it works
          </div>
          <div style={{ display:'grid', gridTemplateColumns: isMobile ? 'repeat(2,1fr)' : 'repeat(4,1fr)', gap: isMobile ? 10 : 24 }}>
            {[
              { n:'01', title:'Deal',    desc:'Both players get 11 cards from a shuffled deck.' },
              { n:'02', title:'Pick',    desc:'The active player picks a stat from their top card.' },
              { n:'03', title:'Compare', desc:'Higher value wins both cards. Ties go to the pot.' },
              { n:'04', title:'Win',     desc:'Most cards when the timer runs out wins the match.' },
            ].map(step => (
              <div key={step.n} style={{ padding: isMobile ? '14px' : '24px',
                background:t.surface, borderRadius:14, border:`1px solid ${t.borderSoft}` }}>
                <div style={{ fontSize: isMobile ? 22 : 32, fontWeight:900, color:t.accent,
                  fontFamily:t.fontMono, marginBottom: isMobile ? 6 : 10 }}>{step.n}</div>
                <div style={{ fontSize: isMobile ? 13 : 15, fontWeight:700, color:t.text,
                  marginBottom: isMobile ? 4 : 8 }}>{step.title}</div>
                <div style={{ fontSize: isMobile ? 11 : 13, color:t.textMute, lineHeight:1.6 }}>{step.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div style={{ padding: isMobile ? '14px 20px' : '20px 48px', textAlign:'center', borderTop:`1px solid ${t.borderSoft}` }}>
        <div style={{ fontSize:11, color:t.textDim, fontFamily:t.fontMono, letterSpacing:0.5, marginBottom:4 }}>
          PITCH PERFECT · CARD BATTLE GAME
        </div>
        <div style={{ fontSize:10, color:t.textDim, fontFamily:t.fontMono, letterSpacing:0.3, lineHeight:1.6, maxWidth:600, margin:'0 auto' }}>
          Independent fan project. Not affiliated with or endorsed by BCCI, IPL, WPL, or any cricket board or player.
        </div>
      </div>
    </div>
  );
}
