import { useState, useEffect, useCallback, useRef } from 'react';
import { io } from 'socket.io-client';
import { useTheme } from './ThemeContext';
import HomeScreen   from './screens/HomeScreen';
import LobbyScreen  from './screens/LobbyScreen';
import DuelScreen   from './screens/DuelScreen';
import ResultsScreen from './screens/ResultsScreen';

export default function App() {
  const { theme } = useTheme();
  const socketRef = useRef(null);

  // ── All state at top ────────────────────────────────────────────────────────
  const [screen,       setScreen]       = useState('home');
  const [lobbyMode,    setLobbyMode]    = useState('create-form');
  const [roomCode,     setRoomCode]     = useState('');
  const [myName,       setMyName]       = useState('');
  const [oppName,      setOppName]      = useState('');
  const [timeLimit,    setTimeLimit]    = useState(600);
  const [gameState,    setGameState]    = useState(null);
  const [lastRound,    setLastRound]    = useState(null);
  const [timeLeft,     setTimeLeft]     = useState(600);
  const [result,       setResult]       = useState(null);
  const [rematchVotes, setRematchVotes] = useState(0);
  const [error,        setError]        = useState('');
  const [loading,      setLoading]      = useState(false);

  // ── Socket setup ────────────────────────────────────────────────────────────
  useEffect(() => {
    const socket = io({ transports: ['websocket', 'polling'] });
    socketRef.current = socket;

    socket.on('room_created', ({ code, name, timeLimit: tl }) => {
      setRoomCode(code); setMyName(name); setTimeLimit(tl);
      setLoading(false); setError('');
      setLobbyMode('host-waiting'); setScreen('lobby');
    });

    socket.on('room_joined', ({ code, name, oppName: opp }) => {
      setRoomCode(code); setMyName(name); setOppName(opp);
      setLoading(false); setError('');
      setLobbyMode('join-waiting'); setScreen('lobby');
    });

    socket.on('opponent_joined', ({ oppName: opp }) => {
      setOppName(opp);
    });

    socket.on('game_started', state => {
      setGameState(state); setLastRound(null); setResult(null);
      setRematchVotes(0); setTimeLeft(state.timeLeft ?? 600);
      if (state.oppName) setOppName(state.oppName);
      setScreen('game');
    });

    socket.on('state_update', state => {
      setGameState(state);
    });

    socket.on('round_result', data => {
      setLastRound(data);
      setGameState(data.newState);
    });

    socket.on('timer_tick', ({ timeLeft: t }) => {
      setTimeLeft(t);
    });

    socket.on('game_over', data => {
      setResult(data); setScreen('result');
    });

    socket.on('rematch_waiting', ({ votes }) => {
      setRematchVotes(votes);
    });

    socket.on('opponent_disconnected', () => {
      setError('Opponent disconnected.');
    });

    socket.on('error', ({ msg }) => {
      setError(msg); setLoading(false);
      setTimeout(() => setError(''), 4000);
    });

    return () => socket.disconnect();
  }, []);

  // ── Actions ─────────────────────────────────────────────────────────────────
  const handleCreate = useCallback((name, tl) => {
    setError(''); setLoading(true); setMyName(name); setTimeLimit(tl);
    socketRef.current?.emit('create_room', { name, timeLimit: tl });
  }, []);

  const handleJoin = useCallback((code, name) => {
    setError(''); setLoading(true); setMyName(name);
    socketRef.current?.emit('join_room', { code, name });
  }, []);

  const handleStart = useCallback(() => {
    socketRef.current?.emit('start_game');
  }, []);

  const handleChooseStat = useCallback(statKey => {
    socketRef.current?.emit('choose_stat', { statKey });
  }, []);

  const handleRematch = useCallback(() => {
    socketRef.current?.emit('rematch_vote');
  }, []);

  const handleHome = useCallback(() => {
    setScreen('home'); setRoomCode(''); setMyName(''); setOppName('');
    setGameState(null); setLastRound(null); setResult(null);
    setTimeLeft(600); setError(''); setRematchVotes(0);
    setLobbyMode('create-form');
  }, []);

  const handlePlayBot = useCallback((name, tl) => {
    setError(''); setLoading(true); setMyName(name); setTimeLimit(tl);
    socketRef.current?.emit('play_vs_bot', { name, timeLimit: tl });
  }, []);

  // ── Navigation helpers ──────────────────────────────────────────────────────
  const goCreate = useCallback(() => { setLobbyMode('create-form'); setScreen('lobby'); }, []);
  const goJoin   = useCallback(() => { setLobbyMode('join-form');   setScreen('lobby'); }, []);
  const goBot    = useCallback(() => { setLobbyMode('bot-form');    setScreen('lobby'); }, []);

  // ── Render ──────────────────────────────────────────────────────────────────
  if (screen === 'home') {
    return <HomeScreen theme={theme} onCreate={goCreate} onJoin={goJoin} onPlayBot={goBot}/>;
  }

  if (screen === 'lobby') {
    return (
      <LobbyScreen
        theme={theme}
        mode={lobbyMode}
        code={roomCode}
        myName={myName}
        oppName={oppName}
        timeLimit={timeLimit}
        loading={loading}
        error={error}
        onCreate={handleCreate}
        onJoin={handleJoin}
        onStart={handleStart}
        onPlayBot={handlePlayBot}
        onBack={handleHome}
      />
    );
  }

  if (screen === 'game') {
    return (
      <DuelScreen
        theme={theme}
        state={gameState ? { ...gameState, timeLimit } : null}
        lastRound={lastRound}
        timeLeft={timeLeft}
        myName={myName}
        oppName={oppName}
        onChooseStat={handleChooseStat}
        onQuit={handleHome}
      />
    );
  }

  if (screen === 'result') {
    return (
      <ResultsScreen
        theme={theme}
        result={result}
        myName={myName}
        rematchVotes={rematchVotes}
        onRematch={handleRematch}
        onHome={handleHome}
      />
    );
  }

  return null;
}
