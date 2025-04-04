import React, { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import { GaugeCircle as GameCircle, Copy, Bomb, ArrowUpDown, Eraser } from 'lucide-react';

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
  const [selectedPower, setSelectedPower] = useState(null);
  const [gravityInverted, setGravityInverted] = useState(false);
  const [playerColors, setPlayerColors] = useState({});
  const [lastMove, setLastMove] = useState(null);
  const [powers, setPowers] = useState({
    remove: 1,
    explode: 1,
    gravity: 1
  });

  useEffect(() => {
    const handleConnect = () => {
      setPlayerId(socket.id);
    };

    const handleGameCreated = ({ roomId }) => {
      setRoomId(roomId);
      setMessage("En attente d'un autre joueur...");
      setPlayerColors({ [socket.id]: 'red' });
    };

    const handleStartGame = ({ players }) => {
      setGameStarted(true);
      setPlayers(players);
      const colors = {
        [players[0]]: 'red',
        [players[1]]: 'yellow'
      };
      setPlayerColors(colors);
      setMessage(players[0] === socket.id ? "C'est votre tour" : "Tour de l'adversaire");
    };

    const handleUpdateBoard = ({ board, currentPlayer, gravityState }) => {
      // Compare avec l'ancien board pour trouver le nouveau jeton
      if (board) {
        let foundNewToken = false;
        for (let row = board.length - 1; row >= 0 && !foundNewToken; row--) {
          for (let col = 0; col < board[row].length; col++) {
            if (!lastMove || (board[row][col] !== null && (row !== lastMove.row || col !== lastMove.col))) {
              setLastMove({ row, col });
              foundNewToken = true;
              break;
            }
          }
        }
      }
      
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

    const handleError = (error) => {
      setMessage(error);
    };

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
    setPowers({
      remove: 1,
      explode: 1,
      gravity: 1
    });
    setSelectedPower(null);
    setGravityInverted(false);
    setPlayerColors({});
    setLastMove(null);
  };

  const handleCreateGame = () => {
    socket.emit('createGame');
  };

  const handleJoinGame = () => {
    socket.emit('joinGame', joinRoomId);
  };

  const handleColumnClick = (column) => {
    if (currentPlayer === socket.id) {
      if (selectedPower) {
        if (powers[selectedPower] > 0) {
          socket.emit('usePower', {
            roomId: roomId || joinRoomId,
            column,
            power: selectedPower,
            gravityState: gravityInverted
          });
          setPowers(prev => ({
            ...prev,
            [selectedPower]: prev[selectedPower] - 1
          }));
          setSelectedPower(null);
        }
      } else {
        socket.emit('play', {
          roomId: roomId || joinRoomId,
          column,
          gravityState: gravityInverted
        });
      }
    }
  };

  const handlePowerSelection = (power) => {
    alert("ok")

    console.log(`Power selected: ${power}`);
    if (currentPlayer === socket.id && powers[power] > 0) {
      setSelectedPower(selectedPower === power ? null : power);
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
  
        if (col + 3 < 7 && board[row][col + 1] === player && board[row][col + 2] === player && board[row][col + 3] === player) {
          setWinner(player);
          setMessage(player === playerId ? "Vous avez gagné !" : "L'adversaire a gagné !");
          handleDisconnectSockets();
          return;
        }
  
        if (row + 3 < 6 && board[row + 1][col] === player && board[row + 2][col] === player && board[row + 3][col] === player) {
          setWinner(player);
          setMessage(player === playerId ? "Vous avez gagné !" : "L'adversaire a gagné !");
          handleDisconnectSockets();
          return;
        }
  
        if (row + 3 < 6 && col + 3 < 7 && board[row + 1][col + 1] === player && board[row + 2][col + 2] === player && board[row + 3][col + 3] === player) {
          setWinner(player);
          setMessage(player === playerId ? "Vous avez gagné !" : "L'adversaire a gagné !");
          handleDisconnectSockets();
          return;
        }
  
        if (row - 3 >= 0 && col + 3 < 7 && board[row - 1][col + 1] === player && board[row - 2][col + 2] === player && board[row - 3][col + 3] === player) {
          setWinner(player);
          setMessage(player === playerId ? "Vous avez gagné !" : "L'adversaire a gagné !");
          handleDisconnectSockets();
          return;
        }
      }
    }
  
    if (board.every(row => row.every(cell => cell !== null))) {
      setMessage("Match nul !");
      handleDisconnectSockets();
    }
  };

  const getCellColor = (cell) => {
    if (cell === null) return 'bg-white hover:bg-gray-100';
    return playerColors[cell] === 'red' ? 'bg-red-500' : 'bg-yellow-500';
  };

  const renderCell = (cell, rowIndex, colIndex) => {
    const isLastMove = lastMove && lastMove.row === rowIndex && lastMove.col === colIndex;
    
    return (
      <div
        key={`${rowIndex}-${colIndex}`}
        onClick={() => handleColumnClick(colIndex)}
        className={`
          w-16 h-16 
          rounded-full 
          border-4 
          border-blue-200 
          cursor-pointer 
          transition-all
          ${getCellColor(cell)}
          ${selectedPower === 'remove' ? 'hover:border-red-500' : ''}
          ${selectedPower === 'explode' ? 'hover:border-orange-500' : ''}
          ${selectedPower === 'gravity' ? 'hover:border-purple-500' : ''}
          ${isLastMove && cell !== null ? 'token-drop' : ''}
          transform ${isLastMove ? 'scale-110' : ''}  // Optionnel : ajouter un effet visuel pour la dernière cellule
        `}
      />
    );
  };
  
  const renderPowerButton = (power, icon, color, label) => (
    <button
      onClick={() => handlePowerSelection(power)}
      disabled={powers[power] === 0 || currentPlayer !== playerId}
      className={`
        flex items-center gap-2 px-4 py-2 rounded-lg font-semibold
        ${selectedPower === power ? `${color} text-white` : 'bg-gray-200'}
        ${powers[power] === 0 ? 'opacity-50 cursor-not-allowed' : 'hover:opacity-90'}
        transition-colors duration-200
      `}
    >
      {icon}
      <span>{label} ({powers[power]})</span>
    </button>
  );

  const renderPowers = () => (
    <div className="flex gap-4 justify-center mt-4">
      {renderPowerButton('remove', <Eraser className="w-5 h-5" />, 'bg-red-500', 'Supprimer')}
      {renderPowerButton('explode', <Bomb className="w-5 h-5" />, 'bg-orange-500', 'Exploser')}
      {renderPowerButton('gravity', <ArrowUpDown className="w-5 h-5" />, 'bg-purple-500', 'Inverser')}
    </div>
  );

  const renderLobby = () => (
    <div className="bg-white rounded-lg p-8 shadow-lg">
      <div className="space-y-6">
        <div className="text-center">
          <button
            onClick={handleCreateGame}
            className="bg-blue-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-600 transition-colors"
          >
            Créer une partie
          </button>
        </div>

        {roomId && (
          <div className="flex items-center justify-center space-x-4">
            <span className="text-gray-600">Code de la partie : {roomId}</span>
            <button
              onClick={handleCopyRoomId}
              className="text-blue-500 hover:text-blue-600"
            >
              <Copy className="w-5 h-5" />
            </button>
          </div>
        )}

        <div className="flex items-center justify-center space-x-4">
          <input
            type="text"
            value={joinRoomId}
            onChange={(e) => setJoinRoomId(e.target.value)}
            placeholder="Entrez le code de la partie"
            className="border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={handleJoinGame}
            className="bg-green-500 text-white px-6 py-2 rounded-lg font-semibold hover:bg-green-600 transition-colors"
          >
            Rejoindre
          </button>
        </div>
      </div>
    </div>
  );

  const renderGame = () => (
    <div className="bg-white rounded-lg p-8 shadow-lg">
      <div className={`grid grid-cols-7 gap-2 mb-8 ${gravityInverted ? 'rotate-180' : ''} transition-transform duration-500`}>
        {board.map((row, rowIndex) =>
          row.map((cell, colIndex) => renderCell(cell, rowIndex, colIndex))
        )}
      </div>
      {renderPowers()}
      <div className="text-center text-lg font-semibold text-gray-700 mt-4">
        {message}
      </div>
      <div className="mt-4 text-center text-lg">
        <h3 className="font-semibold">Joueurs dans la partie:</h3>
        <ul className="text-gray-600">
          {players.map((player, index) => (
            <li key={index} className="flex items-center justify-center gap-2">
              <span className={`w-4 h-4 rounded-full ${playerColors[player] === 'red' ? 'bg-red-500' : 'bg-yellow-500'}`}></span>
              {player === playerId ? 'Vous' : 'Adversaire'}
            </li>
          ))}
        </ul>
      </div>
      <div className="mt-4 text-center">
        <button
          onClick={handleDisconnectSockets}
          className="bg-red-500 text-white px-6 py-2 rounded-lg font-semibold hover:bg-red-600 transition-colors"
        >
          Quitter la partie
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-center mb-8">
          <GameCircle className="w-8 h-8 text-white mr-2" />
          <h1 className="text-4xl font-bold text-white">Puissance 4</h1>
        </div>

        {!gameStarted ? renderLobby() : renderGame()}
      </div>
    </div>
  );
};

export default App;