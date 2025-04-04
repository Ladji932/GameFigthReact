import React, { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import { Copy, Users, Trophy, ArrowLeftRight } from 'lucide-react';

const socket = io('https://backpowerfour.onrender.com');

const App = () => {
  const [roomId, setRoomId] = useState('');
  const [joinRoomId, setJoinRoomId] = useState('');
  const [gameStarted, setGameStarted] = useState(false);
  const [board, setBoard] = useState([]);
  const [currentPlayer, setCurrentPlayer] = useState('');
  const [playerId, setPlayerId] = useState('');
  const [message, setMessage] = useState('');
  const [players, setPlayers] = useState([]);
  const [winner, setWinner] = useState(null);
  const [gravityInverted, setGravityInverted] = useState(false);
  const [playerColors, setPlayerColors] = useState({});
  const [lastMove, setLastMove] = useState(null);

  useEffect(() => {
    if (!socket) return;
    socket.on('play', ({ row, column, playerId }) => {
      setBoard(prevBoard => {
        const newBoard = prevBoard.map(row => [...row]);
        newBoard[row][column] = playerId;
        return newBoard;
      });
      setLastMove({ row, col: column });
      setCurrentPlayer(prev => (prev === players[0] ? players[1] : players[0]));
    });
    return () => socket.off('play');
  }, [players]);

  useEffect(() => {
    const handleConnect = () => setPlayerId(socket.id);
    const handleGameCreated = ({ roomId }) => {
      setRoomId(roomId);
      setMessage("En attente d'un autre joueur...");
      setPlayerColors({ [socket.id]: 'red' });
    };
    const handleStartGame = ({ players }) => {
      setGameStarted(true);
      setPlayers(players);
      const colors = { [players[0]]: 'red', [players[1]]: 'yellow' };
      setPlayerColors(colors);
      setMessage(players[0] === socket.id ? "C'est votre tour" : "Tour de l'adversaire");
    };
    const handleUpdateBoard = ({ board, currentPlayer, gravityState }) => {
      setBoard(board);
      setCurrentPlayer(currentPlayer);
      setGravityInverted(gravityState);
      setMessage(currentPlayer === socket.id ? "C'est votre tour" : "Tour de l'adversaire");
      checkWinner(board);
    };
    const handlePlayerLeft = () => {
      setMessage("L'adversaire a quitté la partie");
      setGameStarted(false);
      setBoard([]);
      resetGameState();
    };
    const handleError = (error) => setMessage(error);

    socket.on('connect', handleConnect);
    socket.on('gameCreated', handleGameCreated);
    socket.on('startGame', handleStartGame);
    socket.on('updateBoard', handleUpdateBoard);
    socket.on('playerLeft', handlePlayerLeft);
    socket.on('error', handleError);

    return () => {
      socket.off('connect', handleConnect);
      socket.off('gameCreated', handleGameCreated);
      socket.off('startGame', handleStartGame);
      socket.off('updateBoard', handleUpdateBoard);
      socket.off('playerLeft', handlePlayerLeft);
      socket.off('error', handleError);
    };
  }, [lastMove]);

  const resetGameState = () => {
    setGravityInverted(false);
    setPlayerColors({});
    setLastMove(null);
  };

  const handleCreateGame = () => socket.emit('createGame');
  const handleJoinGame = () => socket.emit('joinGame', joinRoomId);

  const handleColumnClick = (column) => {
    if (currentPlayer === socket.id) {
      socket.emit('play', { roomId: roomId || joinRoomId, column, gravityState: gravityInverted });
    }
  };

  const handleCopyRoomId = () => {
    navigator.clipboard.writeText(roomId);
    setMessage('Code de la partie copié !');
    setTimeout(() => setMessage("En attente d'un autre joueur..."), 2000);
  };

  const handleDisconnectSockets = () => {
    socket.disconnect();
    setMessage('Vous avez quitté la partie.');
    setGameStarted(false);
    setBoard([]);
    setCurrentPlayer('');
    setPlayers([]);
    setWinner(null);
    resetGameState();
  };

  const checkWinner = (board) => {
    for (let row = 0; row < 6; row++) {
      for (let col = 0; col < 7; col++) {
        const player = board[row][col];
        if (player === null) continue;
        if (col + 3 < 7 && board[row][col + 1] === player && board[row][col + 2] === player && board[row][col + 3] === player) return endGame(player);
        if (row + 3 < 6 && board[row + 1][col] === player && board[row + 2][col] === player && board[row + 3][col] === player) return endGame(player);
        if (row + 3 < 6 && col + 3 < 7 && board[row + 1][col + 1] === player && board[row + 2][col + 2] === player && board[row + 3][col + 3] === player) return endGame(player);
        if (row - 3 >= 0 && col + 3 < 7 && board[row - 1][col + 1] === player && board[row - 2][col + 2] === player && board[row - 3][col + 3] === player) return endGame(player);
      }
    }
    if (board.every(row => row.every(cell => cell !== null))) {
      setMessage("Match nul !");
      handleDisconnectSockets();
    }
  };

  const endGame = (winnerId) => {
    setWinner(winnerId);
    setMessage(winnerId === playerId ? "🎉 Vous avez gagné !" : "😢 L'adversaire a gagné !");
    setTimeout(() => {
      handleDisconnectSockets();
    }, 4000);
  };

  const getCellColor = (cell) => {
    if (cell === null) return 'bg-white/90 hover:bg-white';
    return playerColors[cell] === 'red' ? 'bg-red-500' : 'bg-yellow-500';
  };

  const renderCell = (cell, rowIndex, colIndex) => {
    const isLastMove = lastMove && lastMove.row === rowIndex && lastMove.col === colIndex;
    return (
      <div
        key={`${rowIndex}-${colIndex}`}
        onClick={() => handleColumnClick(colIndex)}
        className={`w-14 h-14 md:w-16 md:h-16 rounded-full border-4 border-blue-300/50 cursor-pointer transition-all transform hover:scale-105 
          ${getCellColor(cell)} 
          ${isLastMove && cell !== null ? (gravityInverted ? 'token-drop-inverted' : 'token-drop') : ''}
          shadow-inner`}
      />
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 to-purple-700 flex flex-col items-center justify-center p-4">
      <h1 className="text-4xl md:text-5xl font-bold mb-8 text-white tracking-tight flex items-center gap-3">
        <Trophy className="w-8 h-8 md:w-10 md:h-10" />
        Puissance 4
      </h1>
      
      {!gameStarted ? (
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-8 shadow-xl space-y-6 w-full max-w-md">
          <button 
            onClick={handleCreateGame} 
            className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-4 rounded-xl font-semibold hover:from-blue-600 hover:to-blue-700 transition-all transform hover:scale-105 flex items-center justify-center gap-2"
          >
            <Users className="w-5 h-5" />
            Créer une partie
          </button>
          
          {roomId && (
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
              <span className="text-gray-700 font-medium">Code : {roomId}</span>
              <button 
                onClick={handleCopyRoomId} 
                className="text-blue-500 hover:text-blue-600 p-2 hover:bg-blue-50 rounded-lg transition-colors"
              >
                <Copy className="w-5 h-5" />
              </button>
            </div>
          )}

          <div className="space-y-3">
            <input
              type="text"
              value={joinRoomId}
              onChange={(e) => setJoinRoomId(e.target.value)}
              placeholder="Entrez le code de la partie"
              className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <button 
              onClick={handleJoinGame} 
              className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white px-6 py-4 rounded-xl font-semibold hover:from-green-600 hover:to-green-700 transition-all transform hover:scale-105"
            >
              Rejoindre la partie
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="flex items-center justify-center gap-3">
            <div className={`px-6 py-3 rounded-xl ${currentPlayer === playerId ? 'bg-green-500' : 'bg-white/90'} text-center font-medium text-lg transition-colors`}>
              {message}
            </div>
            {gravityInverted && (
              <ArrowLeftRight className="w-6 h-6 text-white animate-pulse" />
            )}
          </div>
          
          {winner && (
            <div className="text-4xl font-bold text-white winner-animation text-center p-4 bg-black/20 backdrop-blur-sm rounded-xl">
              {winner === playerId ? '🎉 Victoire !' : '😢 Défaite !'}
            </div>
          )}
          
          <div className="grid grid-cols-7 gap-2 bg-blue-500/90 backdrop-blur-sm p-4 rounded-xl shadow-2xl">
            {board.map((row, rowIndex) =>
              row.map((cell, colIndex) => renderCell(cell, rowIndex, colIndex))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default App;