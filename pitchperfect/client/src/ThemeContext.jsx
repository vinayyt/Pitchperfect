import { createContext, useContext, useState } from 'react';
import { THEMES } from './theme';

const Ctx = createContext({ theme: THEMES.stadium, name: 'stadium', toggle: () => {} });

export function ThemeProvider({ children }) {
  const [name, setName] = useState('stadium');
  return (
    <Ctx.Provider value={{ theme: THEMES[name], name, toggle: () => setName(n => n === 'stadium' ? 'neon' : 'stadium') }}>
      {children}
    </Ctx.Provider>
  );
}

export const useTheme = () => useContext(Ctx);

export function ThemeToggle({ theme: t }) {
  const { name, toggle } = useContext(Ctx);
  return (
    <button onClick={toggle} style={{
      all: 'unset', cursor: 'pointer',
      padding: '5px 10px', borderRadius: 100,
      border: `1px solid ${t.borderSoft}`,
      fontSize: 10, fontWeight: 700, letterSpacing: 1.5,
      color: t.textMute, fontFamily: t.fontMono,
      display: 'flex', alignItems: 'center', gap: 6,
    }}>
      <div style={{ width: 6, height: 6, borderRadius: '50%', background: name === 'stadium' ? '#f4d36b' : '#84e0ff' }}/>
      {name === 'stadium' ? 'STADIUM' : 'NEON'}
    </button>
  );
}
