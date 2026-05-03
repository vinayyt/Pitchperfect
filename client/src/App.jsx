import { useState, useEffect, useCallback, useRef } from 'react';
import { io } from 'socket.io-client';
import { useTheme } from './ThemeContext';
import TopNav                from './components/TopNav';
import HomeScreen            from './screens/HomeScreen';
import LobbyScreen           from './screens/LobbyScreen';
import DuelScreen            from './screens/DuelScreen';
import ResultsScreen         from './screens/ResultsScreen';
import AuctionSetupScreen    from './screens/AuctionSetupScreen';
import AuctionRetentionScreen from './screens/AuctionRetentionScreen';
import AuctionScreen         from './screens/AuctionScreen';
import AuctionResultsScreen  from './screens/AuctionResultsScreen';
import QuizSetupScreen       from './screens/QuizSetupScreen';
import QuizScreen            from './screens/QuizScreen';
import QuizResultsScreen     from './screens/QuizResultsScreen';

export default function App() {
  const { theme } = useTheme();
  const socketRef = useRef(null);

  // ── Top-level tab ───────────────────────────────────────────────────────────
  const [activeTab, setActiveTab] = useState('trump'); // 'trump' | 'auction' | 'quiz'

  // ── Trump Card state ────────────────────────────────────────────────────────
  const [trumpScreen,   setTrumpScreen]   = useState('home');
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

  // ── Auction state ───────────────────────────────────────────────────────────
  const [auctionScreen,      setAuctionScreen]      = useState('setup');
  const [auctionPhase,       setAuctionPhase]       = useState('create');
  const [auctionLobby,       setAuctionLobby]       = useState(null);
  const [myTeamKey,          setMyTeamKey]           = useState('');
  const [isHost,             setIsHost]              = useState(false);
  const [auctionPlayers,     setAuctionPlayers]      = useState([]);
  const [auctionTeamsStatus, setAuctionTeamsStatus]  = useState({});
  const [retentionSubmitted, setRetentionSubmitted]  = useState(false);
  const [auctionBudget,      setAuctionBudget]       = useState(12000);
  const [auctionTeams,       setAuctionTeams]        = useState([]);
  const [currentPlayer,      setCurrentPlayer]       = useState(null);
  const [currentBid,         setCurrentBid]          = useState(0);
  const [currentBidder,      setCurrentBidder]       = useState(null);
  const [soldLog,            setSoldLog]             = useState([]);
  const [bidMessage,         setBidMessage]          = useState('');
  const [lastSold,           setLastSold]            = useState(null);
  const [auctionError,       setAuctionError]        = useState('');
  const [auctionLoading,     setAuctionLoading]      = useState(false);
  const [finalTeams,         setFinalTeams]          = useState([]);

  // ── Quiz state ──────────────────────────────────────────────────────────────
  const [quizScreen,      setQuizScreen]      = useState('setup');
  // 'setup' | 'waiting' | 'game' | 'result'
  const [quizPhase,       setQuizPhase]       = useState('create');
  // 'create' | 'waiting'
  const [quizCode,        setQuizCode]        = useState('');
  const [quizMyName,      setQuizMyName]      = useState('');
  const [quizOppName,     setQuizOppName]     = useState('');
  const [quizMySocketId,  setQuizMySocketId]  = useState('');
  const [quizQuestion,    setQuizQuestion]    = useState(null);
  const [quizMyAnswer,    setQuizMyAnswer]    = useState(null);
  const [quizRoundResult, setQuizRoundResult] = useState(null);
  const [quizScores,      setQuizScores]      = useState([]);
  const [quizTotalQ,      setQuizTotalQ]      = useState(10);
  const [quizResult,      setQuizResult]      = useState(null);
  const [quizError,       setQuizError]       = useState('');
  const [quizLoading,     setQuizLoading]     = useState(false);

  // ── Socket setup ─────────────────────────────────────────────────────────────
  useEffect(() => {
    const socket = io({ transports: ['websocket', 'polling'] });
    socketRef.current = socket;
    setQuizMySocketId(socket.id || '');
    socket.on('connect', () => setQuizMySocketId(socket.id));

    // ── Trump / Duel events ──────────────────────────────────────────────────
    socket.on('room_created', ({ code, name, timeLimit: tl }) => {
      setRoomCode(code); setMyName(name); setTimeLimit(tl);
      setLoading(false); setError('');
      setLobbyMode('host-waiting'); setTrumpScreen('lobby');
    });

    socket.on('room_joined', ({ code, name, oppName: opp }) => {
      setRoomCode(code); setMyName(name); setOppName(opp);
      setLoading(false); setError('');
      setLobbyMode('join-waiting'); setTrumpScreen('lobby');
    });

    socket.on('opponent_joined', ({ oppName: opp }) => { setOppName(opp); });

    socket.on('game_started', state => {
      setGameState(state); setLastRound(null); setResult(null);
      setRematchVotes(0); setTimeLeft(state.timeLeft ?? 600);
      if (state.oppName) setOppName(state.oppName);
      setTrumpScreen('game');
      setActiveTab('trump');
    });

    socket.on('state_update',   state => setGameState(state));
    socket.on('round_result',   data  => { setLastRound(data); setGameState(data.newState); });
    socket.on('timer_tick',     ({ timeLeft: t }) => setTimeLeft(t));
    socket.on('game_over',      data  => { setResult(data); setTrumpScreen('result'); });
    socket.on('rematch_waiting',({ votes }) => setRematchVotes(votes));
    socket.on('opponent_disconnected', () => setError('Opponent disconnected.'));
    socket.on('error', ({ msg }) => {
      setError(msg); setLoading(false);
      setTimeout(() => setError(''), 4000);
    });

    // ── Auction events ────────────────────────────────────────────────────────
    socket.on('auction_room_created', ({ code, teamKey, lobby }) => {
      setAuctionLoading(false); setAuctionError('');
      setAuctionLobby(lobby); setMyTeamKey(teamKey); setIsHost(true);
      setAuctionPhase('host-waiting'); setAuctionScreen('setup');
    });

    socket.on('auction_player_joined', ({ teamKey, lobby }) => {
      setAuctionLobby(lobby);
    });

    socket.on('auction_joined', ({ teamKey, lobby }) => {
      setAuctionLoading(false); setAuctionError('');
      setMyTeamKey(teamKey); setAuctionLobby(lobby); setIsHost(false);
      setAuctionPhase('join-waiting'); setAuctionScreen('setup');
    });

    socket.on('auction_retention_phase', ({ players, myTeamKey: mk, budget }) => {
      setAuctionPlayers(players);
      if (mk) setMyTeamKey(mk);
      if (budget) setAuctionBudget(budget);
      setAuctionPhase('retention');
      setAuctionScreen('retention');
      setActiveTab('auction');
    });

    socket.on('auction_retention_submitted', ({ teamKey }) => {
      setAuctionTeamsStatus(prev => ({ ...prev, [teamKey]: true }));
      if (teamKey === myTeamKey) setRetentionSubmitted(true);
    });

    socket.on('auction_all_retained', () => {});

    socket.on('auction_player_up', ({ player, phase, currentBid: bid, currentBidder: bidder,
      timeLeft: tl, soldLog: log }) => {
      setCurrentPlayer(player);
      setCurrentBid(bid || player?.basePrice || 0);
      setCurrentBidder(bidder);
      setSoldLog(log || []);
      setBidMessage('');
      setLastSold(null);
      setAuctionPhase(phase);
      setAuctionScreen('bidding');
      setActiveTab('auction');
    });

    socket.on('auction_bid_placed', ({ teamKey, bid, currentBid: cb, currentBidder: cbd }) => {
      setCurrentBid(cb);
      setCurrentBidder(cbd);
      setAuctionTeams(prev => prev.map(tm => tm.key === teamKey ? { ...tm } : tm));
    });

    socket.on('auction_player_sold', ({ player, soldTo, price, teamName }) => {
      setBidMessage('sold');
      setLastSold({ player, soldTo, price, teamName });
      setSoldLog(prev => [...prev, { player, soldTo, price, teamName }]);
    });

    socket.on('auction_player_unsold', ({ player }) => {
      setBidMessage('unsold');
      setLastSold({ player });
    });

    socket.on('auction_second_round', ({ unsoldCount }) => {
      setAuctionPhase('second_round');
    });

    socket.on('auction_ended', ({ teams }) => {
      setFinalTeams(teams);
      setAuctionScreen('results');
      setActiveTab('auction');
    });

    socket.on('auction_error', ({ msg }) => {
      setAuctionError(msg);
      setAuctionLoading(false);
      setTimeout(() => setAuctionError(''), 5000);
    });

    // ── Quiz events ───────────────────────────────────────────────────────────
    socket.on('quiz_room_created', ({ code, name, vsBot }) => {
      setQuizLoading(false); setQuizError('');
      setQuizCode(code);
      if (vsBot) {
        // bot game — quiz_started will arrive momentarily
      } else {
        setQuizPhase('waiting');
        setQuizScreen('waiting');
      }
    });

    socket.on('quiz_joined', ({ code, name, oppName: opp }) => {
      setQuizLoading(false); setQuizError('');
      setQuizCode(code); setQuizOppName(opp);
      // game will start automatically (server triggers quiz_started)
    });

    socket.on('quiz_opponent_joined', ({ oppName: opp }) => {
      setQuizOppName(opp);
    });

    socket.on('quiz_started', ({ totalQuestions, oppName: opp }) => {
      setQuizTotalQ(totalQuestions || 10);
      if (opp) setQuizOppName(opp);
      setQuizQuestion(null);
      setQuizMyAnswer(null);
      setQuizRoundResult(null);
      setQuizScores([]);
      setQuizScreen('game');
      setActiveTab('quiz');
    });

    socket.on('quiz_question', q => {
      setQuizQuestion(q);
      setQuizMyAnswer(null);
      setQuizRoundResult(null);
    });

    socket.on('quiz_answer_ack', ({ answerIdx }) => {
      setQuizMyAnswer(answerIdx);
    });

    socket.on('quiz_round_result', data => {
      setQuizRoundResult(data);
      if (data.scores) setQuizScores(data.scores);
    });

    socket.on('quiz_game_over', data => {
      setQuizResult(data);
      setQuizScreen('result');
    });

    socket.on('quiz_error', ({ msg }) => {
      setQuizError(msg);
      setQuizLoading(false);
      setTimeout(() => setQuizError(''), 5000);
    });

    return () => socket.disconnect();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Trump actions ────────────────────────────────────────────────────────────
  const handleCreate    = useCallback((name, tl) => {
    setError(''); setLoading(true); setMyName(name); setTimeLimit(tl);
    socketRef.current?.emit('create_room', { name, timeLimit: tl });
  }, []);

  const handleJoin      = useCallback((code, name) => {
    setError(''); setLoading(true); setMyName(name);
    socketRef.current?.emit('join_room', { code, name });
  }, []);

  const handleStart     = useCallback(() => socketRef.current?.emit('start_game'), []);
  const handleChooseStat= useCallback(statKey => socketRef.current?.emit('choose_stat', { statKey }), []);
  const handleRematch   = useCallback(() => socketRef.current?.emit('rematch_vote'), []);

  const handlePlayBot   = useCallback((name, tl) => {
    setError(''); setLoading(true); setMyName(name); setTimeLimit(tl);
    socketRef.current?.emit('play_vs_bot', { name, timeLimit: tl });
  }, []);

  const resetTrump = useCallback(() => {
    setTrumpScreen('home'); setRoomCode(''); setMyName(''); setOppName('');
    setGameState(null); setLastRound(null); setResult(null);
    setTimeLeft(600); setError(''); setRematchVotes(0);
    setLobbyMode('create-form');
  }, []);

  // ── Auction actions ─────────────────────────────────────────────────────────
  const handleAuctionCreate = useCallback((name, teamKeys) => {
    setAuctionError(''); setAuctionLoading(true);
    socketRef.current?.emit('auction_create', { name, teamKeys });
  }, []);

  const handleAuctionVsBot = useCallback((name, teamKeys) => {
    setAuctionError(''); setAuctionLoading(true);
    setMyTeamKey(teamKeys[0]);
    socketRef.current?.emit('auction_vs_bots', { name, teamKeys });
  }, []);

  const handleAuctionJoin = useCallback((code, name, teamKey) => {
    setAuctionError(''); setAuctionLoading(true);
    socketRef.current?.emit('auction_join', { code, name, teamKey });
  }, []);

  const handleAuctionStartRetention = useCallback(() => {
    socketRef.current?.emit('auction_start_retention');
  }, []);

  const handleAuctionSubmitRetention = useCallback(playerIds => {
    socketRef.current?.emit('auction_submit_retention', { playerIds });
    setRetentionSubmitted(true);
  }, []);

  const handleAuctionBid = useCallback(amount => {
    socketRef.current?.emit('auction_bid', { amount });
  }, []);

  const resetAuction = useCallback(() => {
    setAuctionScreen('setup'); setAuctionPhase('create'); setAuctionLobby(null);
    setMyTeamKey(''); setIsHost(false); setAuctionPlayers([]);
    setAuctionTeamsStatus({}); setRetentionSubmitted(false);
    setAuctionBudget(12000); setAuctionTeams([]);
    setCurrentPlayer(null); setCurrentBid(0); setCurrentBidder(null);
    setSoldLog([]); setBidMessage(''); setLastSold(null);
    setAuctionError(''); setAuctionLoading(false); setFinalTeams([]);
  }, []);

  // ── Quiz actions ────────────────────────────────────────────────────────────
  const handleQuizVsBot = useCallback(name => {
    setQuizError(''); setQuizLoading(true);
    setQuizMyName(name); setQuizOppName('🤖 CricBot');
    socketRef.current?.emit('quiz_vs_bot', { name });
  }, []);

  const handleQuizCreate = useCallback(name => {
    setQuizError(''); setQuizLoading(true);
    setQuizMyName(name);
    socketRef.current?.emit('quiz_create', { name });
  }, []);

  const handleQuizJoin = useCallback((code, name) => {
    setQuizError(''); setQuizLoading(true);
    setQuizMyName(name);
    socketRef.current?.emit('quiz_join', { code, name });
  }, []);

  const handleQuizAnswer = useCallback(answerIdx => {
    socketRef.current?.emit('quiz_answer', { answerIdx });
  }, []);

  const resetQuiz = useCallback(() => {
    setQuizScreen('setup'); setQuizPhase('create'); setQuizCode('');
    setQuizMyName(''); setQuizOppName('');
    setQuizQuestion(null); setQuizMyAnswer(null); setQuizRoundResult(null);
    setQuizScores([]); setQuizTotalQ(10); setQuizResult(null);
    setQuizError(''); setQuizLoading(false);
  }, []);

  // ── TopNav context ───────────────────────────────────────────────────────────
  const trumpInGame   = trumpScreen === 'game' || trumpScreen === 'result';
  const auctionInGame = auctionScreen === 'retention' || auctionScreen === 'bidding' || auctionScreen === 'results';
  const quizInGame    = quizScreen === 'game' || quizScreen === 'result';

  const showBackBtn = activeTab === 'trump'
    ? trumpScreen !== 'home'
    : activeTab === 'auction'
    ? auctionScreen !== 'setup'
    : quizScreen !== 'setup';

  const handleBack = useCallback(() => {
    if (activeTab === 'trump')   { resetTrump();   }
    else if (activeTab === 'auction') { resetAuction(); }
    else                         { resetQuiz();    }
  }, [activeTab, resetTrump, resetAuction, resetQuiz]);

  const backLabel = activeTab === 'trump'
    ? (trumpScreen === 'lobby' ? 'Trump Card' : trumpScreen === 'game' ? 'Quit Game' : 'Trump Card')
    : activeTab === 'auction'
    ? 'Auction'
    : 'Cricket IQ';

  // ── Trump sub-nav helpers ─────────────────────────────────────────────────
  const goCreate = useCallback(() => { setLobbyMode('create-form'); setTrumpScreen('lobby'); }, []);
  const goJoin   = useCallback(() => { setLobbyMode('join-form');   setTrumpScreen('lobby'); }, []);
  const goBot    = useCallback(() => { setLobbyMode('bot-form');    setTrumpScreen('lobby'); }, []);

  const handleTabChange = useCallback(tab => { setActiveTab(tab); }, []);

  // ── Render tab screens ────────────────────────────────────────────────────
  const renderTrump = () => {
    if (trumpScreen === 'home') {
      return <HomeScreen theme={theme} onCreate={goCreate} onJoin={goJoin} onPlayBot={goBot}/>;
    }
    if (trumpScreen === 'lobby') {
      return (
        <LobbyScreen theme={theme} mode={lobbyMode} code={roomCode} myName={myName}
          oppName={oppName} timeLimit={timeLimit} loading={loading} error={error}
          onCreate={handleCreate} onJoin={handleJoin} onStart={handleStart}
          onPlayBot={handlePlayBot} onBack={resetTrump}/>
      );
    }
    if (trumpScreen === 'game') {
      return (
        <DuelScreen theme={theme} state={gameState ? { ...gameState, timeLimit } : null}
          lastRound={lastRound} timeLeft={timeLeft} myName={myName} oppName={oppName}
          onChooseStat={handleChooseStat} onQuit={resetTrump}/>
      );
    }
    if (trumpScreen === 'result') {
      return (
        <ResultsScreen theme={theme} result={result} myName={myName}
          rematchVotes={rematchVotes} onRematch={handleRematch} onHome={resetTrump}/>
      );
    }
    return null;
  };

  const renderAuction = () => {
    if (auctionScreen === 'setup') {
      return (
        <AuctionSetupScreen theme={theme}
          phase={auctionPhase} lobby={auctionLobby} myTeamKey={myTeamKey}
          error={auctionError} loading={auctionLoading} isHost={isHost}
          onCreate={handleAuctionCreate} onJoin={handleAuctionJoin}
          onVsBot={handleAuctionVsBot} onStartRetention={handleAuctionStartRetention}
          onBack={resetAuction}
        />
      );
    }
    if (auctionScreen === 'retention') {
      return (
        <AuctionRetentionScreen theme={theme}
          myTeamKey={myTeamKey} budget={auctionBudget} players={auctionPlayers}
          submitted={retentionSubmitted} teamsStatus={auctionTeamsStatus}
          error={auctionError} onSubmit={handleAuctionSubmitRetention}
        />
      );
    }
    if (auctionScreen === 'bidding') {
      return (
        <AuctionScreen theme={theme}
          phase={auctionPhase} player={currentPlayer}
          currentBid={currentBid} currentBidder={currentBidder}
          myTeamKey={myTeamKey} myBudget={auctionBudget} teams={auctionTeams}
          soldLog={soldLog} bidMessage={bidMessage} lastSold={lastSold}
          onBid={handleAuctionBid}
        />
      );
    }
    if (auctionScreen === 'results') {
      return (
        <AuctionResultsScreen theme={theme}
          teams={finalTeams} myTeamKey={myTeamKey} onHome={resetAuction}
        />
      );
    }
    return null;
  };

  const renderQuiz = () => {
    if (quizScreen === 'setup' || quizScreen === 'waiting') {
      return (
        <QuizSetupScreen theme={theme}
          phase={quizScreen === 'waiting' ? 'waiting' : quizPhase}
          code={quizCode}
          error={quizError}
          loading={quizLoading}
          onVsBot={handleQuizVsBot}
          onCreate={handleQuizCreate}
          onJoin={handleQuizJoin}
        />
      );
    }
    if (quizScreen === 'game') {
      return (
        <QuizScreen theme={theme}
          question={quizQuestion}
          myName={quizMyName}
          oppName={quizOppName}
          scores={quizScores}
          mySocketId={quizMySocketId}
          myAnswerIdx={quizMyAnswer}
          roundResult={quizRoundResult}
          totalQuestions={quizTotalQ}
          phase={quizQuestion ? 'question' : 'waiting'}
          onAnswer={handleQuizAnswer}
        />
      );
    }
    if (quizScreen === 'result') {
      return (
        <QuizResultsScreen theme={theme}
          result={quizResult}
          myName={quizMyName}
          onPlayAgain={resetQuiz}
          onHome={resetQuiz}
        />
      );
    }
    return null;
  };

  return (
    <div style={{ minHeight: '100vh', background: theme.bg, fontFamily: theme.fontDisplay, color: theme.text }}>
      <TopNav
        theme={theme}
        activeTab={activeTab}
        onTabChange={handleTabChange}
        trumpInGame={trumpInGame}
        auctionInGame={auctionInGame}
        quizInGame={quizInGame}
        showBackBtn={showBackBtn}
        onBack={handleBack}
        backLabel={backLabel}
      />
      {/* Render all tabs simultaneously — preserves in-flight socket state */}
      <div style={{ display: activeTab === 'trump'   ? 'block' : 'none' }}>{renderTrump()}</div>
      <div style={{ display: activeTab === 'auction' ? 'block' : 'none' }}>{renderAuction()}</div>
      <div style={{ display: activeTab === 'quiz'    ? 'block' : 'none' }}>{renderQuiz()}</div>
    </div>
  );
}
