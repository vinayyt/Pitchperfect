import React from 'react';
import ReactDOM from 'react-dom/client';
import { ThemeProvider } from './ThemeContext';
import App from './App';
import './index.css';

class ErrorBoundary extends React.Component {
  constructor(props) { super(props); this.state = { error: null }; }
  static getDerivedStateFromError(e) { return { error: e }; }
  componentDidCatch(e, info) { console.error('App crashed:', e, info); }
  render() {
    if (this.state.error) {
      return (
        <div style={{ position:'fixed', inset:0, background:'#070c1a', display:'flex', alignItems:'center', justifyContent:'center', padding:20, fontFamily:'"Space Grotesk",sans-serif' }}>
          <div style={{ maxWidth:360, background:'#142044', border:'1px solid rgba(244,211,107,0.2)', borderRadius:16, padding:32, textAlign:'center' }}>
            <div style={{ fontSize:22, fontWeight:700, color:'#e85a5a', marginBottom:12 }}>Something crashed</div>
            <div style={{ fontSize:13, color:'#8a9ac1', lineHeight:1.6, marginBottom:20, wordBreak:'break-word' }}>
              {this.state.error.message}
            </div>
            <button onClick={() => window.location.reload()} style={{ padding:'10px 24px', background:'#f4d36b', color:'#070c1a', border:'none', borderRadius:10, fontWeight:700, cursor:'pointer', fontSize:13 }}>
              Reload
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary>
      <ThemeProvider>
        <App />
      </ThemeProvider>
    </ErrorBoundary>
  </React.StrictMode>
);
