// Desktop shell — full viewport, normal document flow
export default function Shell({ theme: t, children }) {
  return (
    <div style={{
      minHeight: '100vh',
      background: t.bg,
      fontFamily: t.fontDisplay,
      color: t.text,
    }}>
      {children}
    </div>
  );
}
