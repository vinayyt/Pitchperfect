import { ThemeToggle } from '../ThemeContext';
import { useResponsive } from '../hooks/useResponsive';

export default function TopNav({
  theme: t,
  activeTab = 'trump',
  onTabChange,
  trumpInGame   = false,
  auctionInGame = false,
  quizInGame    = false,
  onBack,
  backLabel = '',
  showBackBtn = false,
}) {
  const { isMobile } = useResponsive();
  const TABS = [
    { key: 'trump',   icon: '🃏', label: 'Trump Card' },
    { key: 'auction', icon: '🏏', label: 'Auction'    },
    { key: 'quiz',    icon: '🧠', label: 'Cricket IQ' },
  ];

  return (
    <nav style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: isMobile ? '0 14px' : '0 28px', height: 52,
      background: `${t.bg}f0`, backdropFilter: 'blur(16px)',
      borderBottom: `1px solid ${t.borderSoft}`,
      position: 'sticky', top: 0, zIndex: 200,
    }}>
      {/* Left */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', minWidth: 0 }}>
        {showBackBtn ? (
          <button onClick={onBack} style={{
            all: 'unset', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5,
            fontSize: 13, color: t.textMute, fontFamily: t.fontMono, letterSpacing: 0.4,
            padding: '6px 0', transition: 'color 0.15s',
          }}
          onMouseEnter={e => e.currentTarget.style.color = t.text}
          onMouseLeave={e => e.currentTarget.style.color = t.textMute}>
            ← {!isMobile && backLabel}
          </button>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
            <span style={{ fontSize: 18 }}>🏏</span>
            {!isMobile && (
              <span style={{ fontSize: 12, fontWeight: 800, letterSpacing: 2.5,
                color: t.accent, textTransform: 'uppercase', fontFamily: t.fontMono }}>
                Pitch Perfect
              </span>
            )}
          </div>
        )}
      </div>

      {/* Centre tabs */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 3,
        background: t.surface, borderRadius: 10, padding: 3,
        border: `1px solid ${t.borderSoft}` }}>
        {TABS.map(tab => {
          const isActive = activeTab === tab.key;
          const inGame   = tab.key === 'trump' ? trumpInGame : tab.key === 'auction' ? auctionInGame : quizInGame;
          return (
            <button key={tab.key} onClick={() => onTabChange(tab.key)} style={{
              all: 'unset', cursor: 'pointer',
              padding: isMobile ? '7px 14px' : '5px 16px',
              borderRadius: 7,
              background: isActive ? t.accent : 'transparent',
              color:      isActive ? '#000'   : t.textMute,
              fontSize: 12, fontWeight: 700, fontFamily: t.fontMono,
              letterSpacing: isMobile ? 0.5 : 1,
              textTransform: 'uppercase', transition: 'all 0.15s',
              display: 'flex', alignItems: 'center', gap: 5,
            }}>
              <span style={{ fontSize: isMobile ? 14 : 12 }}>{tab.icon}</span>
              {!isMobile && <span>{tab.label}</span>}
              {!isActive && inGame && (
                <span style={{ width: 6, height: 6, borderRadius: '50%',
                  background: t.success, boxShadow: `0 0 6px ${t.success}`, flexShrink: 0 }} />
              )}
            </button>
          );
        })}
      </div>

      {/* Right: theme toggle */}
      <div style={{ flex: 1, display: 'flex', justifyContent: 'flex-end' }}>
        <ThemeToggle theme={t} />
      </div>
    </nav>
  );
}
