import React, { useEffect, useState } from "react";
import Header from "../header";
import { motion, AnimatePresence } from "framer-motion";
import { Shield, Swords, Zap, Flame, Wind } from "lucide-react";

const CombatPopup = ({ message, type, onComplete }) => {
  useEffect(() => {
    const timer = setTimeout(onComplete, 1500);
    return () => clearTimeout(timer);
  }, [onComplete]);

  const getTypeStyles = () => {
    switch (type) {
      case "super-critical":
        return "bg-red-600/90 border-red-400";
      case "critical":
        return "bg-yellow-600/90 border-yellow-400";
      case "power-up":
        return "bg-orange-600/90 border-orange-400";
      case "defense":
        return "bg-blue-600/90 border-blue-400";
      default:
        return "bg-indigo-600/90 border-indigo-400";
    }
  };

  return (
    <motion.div
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0, opacity: 0 }}
      className={`fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 
        z-50 px-6 py-4 rounded-lg border-2 backdrop-blur-sm
        text-white font-bold text-xl shadow-lg ${getTypeStyles()}`}
    >
      {message}
    </motion.div>
  );
};

const Fight = ({ character, characterSelect, redirect }) => {
  const [opponent, setOpponent] = useState(null);
  const [stamina1, setStamina1] = useState(character.stamina);
  const [stamina2, setStamina2] = useState(true);
  const [turn, setTurn] = useState(1);
  const [comment, setComment] = useState("Prêt ?");
  const [isAttacking, setIsAttacking] = useState(false);
  const [lastAttack, setLastAttack] = useState(null);
  const [battleLog, setBattleLog] = useState([]);
  const [combo, setCombo] = useState(0);
  const [powerUp, setPowerUp] = useState(false);
  const [powerUpBonus, setPowerUpBonus] = useState(1);
  const [defenseStance, setDefenseStance] = useState(false);
  const [battleEnvironment, setBattleEnvironment] = useState('');
  const [weatherEffect, setWeatherEffect] = useState('');
  const [currentPopup, setCurrentPopup] = useState(null);

  useEffect(() => {
    const environments = [
      'Arène de combat',
      'Temple ancien',
      'Montagne enneigée',
      'Désert ardent',
      'Forêt mystique',
      'Volcan actif',
      'Ruines célestes'
    ];
    const weather = [
      'Pluie battante',
      'Tempête de sable',
      'Brouillard mystérieux',
      'Éclairs dans le ciel',
      'Aurore boréale',
      'Ciel étoilé'
    ];
    setBattleEnvironment(environments[Math.floor(Math.random() * environments.length)]);
    setWeatherEffect(weather[Math.floor(Math.random() * weather.length)]);
  }, []);

  useEffect(() => {
    let storedCharacters = localStorage.getItem('Characters');
    if (storedCharacters) {
      const allCharacters = JSON.parse(storedCharacters);
      const filteredCharacters = allCharacters.filter((char) => char.name !== character.name);
      if (filteredCharacters.length === 0) {
        alert("Il n'y a pas d'adversaire disponible !");
        return;
      }
      const randomIndex = Math.floor(Math.random() * filteredCharacters.length);
      const randomOpponent = filteredCharacters[randomIndex];
      setOpponent(randomOpponent);
      setStamina2(randomOpponent.stamina);
      
      setBattleLog([{ 
        message: `${character.name} affronte ${randomOpponent.name} dans ${battleEnvironment} !`,
        type: "info",
        icon: <Swords className="inline-block w-4 h-4 mr-1" />
      }]);
    } else {
      alert("Aucun personnage dans le roster");
    }
  }, [battleEnvironment]);

  useEffect(() => {
    if (stamina1 <= 0 || stamina2 <= 0) {
      const winner = stamina1 <= 0 ? opponent : character;
      const loser = stamina1 <= 0 ? character : opponent;
      const finalMessage = `${winner.name} remporte le combat ! ${loser.name} est K.O. !`;
      setComment(finalMessage);
      setBattleLog(prev => [...prev, { 
        message: finalMessage, 
        type: stamina1 <= 0 ? "defeat" : "victory",
        icon: <Swords className="inline-block w-4 h-4 mr-1" />
      }]);
      
      setTimeout(() => {
        redirect();
      }, 3000);
    }
  }, [stamina1, stamina2]);

  const calculateDamage = (attacker, defender, isCritical = false, isSuper = false) => {
    let baseDamage = (attacker.strenght - (defender.defense * (defenseStance ? 1.5 : 1))) * 1.2; // Augmentation de 20% des dégâts de base
    let multiplier = powerUpBonus;

    if (isSuper) multiplier *= 3.5; // Augmentation des dégâts super critiques
    else if (isCritical) multiplier *= 2.5; // Augmentation des dégâts critiques
    if (combo > 2) multiplier += 0.8; // Augmentation du bonus de combo

    if (attacker === character && powerUpBonus > 1) {
      setPowerUpBonus(1);
    }

    return Math.max(1, Math.floor(baseDamage * multiplier * 3));
  };

  const showPopup = (message, type) => {
    return new Promise((resolve) => {
      setCurrentPopup({ message, type, onComplete: resolve });
    });
  };

  const performAttack = async (attacker, defender, technique) => {
    const critChance = Math.random();
    let damage = 0;
    let messageType = "normal";
    let icon = <Swords className="inline-block w-4 h-4 mr-1" />;
    let message = "";

    // Augmentation des chances de coups critiques
    const criticalThreshold = defender === character && defenseStance ? 0.6 : 0.75; // Plus de chances de critiques
    const superCriticalThreshold = defender === character && defenseStance ? 0.8 : 0.9; // Plus de chances de super critiques

    if (critChance > superCriticalThreshold) {
      damage = calculateDamage(attacker, defender, false, true);
      messageType = "super-critical";
      message = `SUPER CRITIQUE ! ${attacker.name} déchaîne ${technique} !`;
      setCombo(prev => prev + 2);
      icon = <Flame className="inline-block w-4 h-4 mr-1 text-red-500" />;
    } else if (critChance > criticalThreshold) {
      damage = calculateDamage(attacker, defender, true);
      messageType = "critical";
      message = `Coup critique ! ${attacker.name} utilise ${technique} !`;
      setCombo(prev => prev + 1);
      icon = <Wind className="inline-block w-4 h-4 mr-1 text-yellow-500" />;
    } else {
      damage = calculateDamage(attacker, defender);
      message = `${attacker.name} utilise ${technique} !`;
      setCombo(0);
    }

    await showPopup(message, messageType);
    if (damage > 0) {
      await showPopup(`-${damage} PV !`, messageType);
      if (defender === opponent) {
        setStamina2(prev => Math.max(0, prev - damage));
      } else {
        setStamina1(prev => Math.max(0, prev - damage));
      }
    }

    setComment(message);
    setBattleLog(prev => [...prev, { 
      message, 
      type: messageType, 
      damage, 
      icon 
    }]);

    if (!isAttacking) setTurn(prev => prev + 1);
  };

  const activatePowerUp = async () => {
    if (!powerUp && turn > 2) {
      setPowerUp(true);
      setPowerUpBonus(1.03);
      
      await showPopup(`${character.name} concentre son énergie ! Le sol tremble !`, "power-up");
      
      setBattleLog(prev => [...prev, { 
        message: `${character.name} concentre son énergie ! Le sol tremble !`, 
        type: "power-up",
        icon: <Zap className="inline-block w-4 h-4 mr-1" />
      }]);

      setIsAttacking(true);
      const randomTechnique = opponent.techniques[Math.floor(Math.random() * opponent.techniques.length)];
      await performAttack(opponent, character, randomTechnique);
      setIsAttacking(false);
      setPowerUp(false);
    }
  };

  const activateDefense = async () => {
    if (!defenseStance && !isAttacking) {
      setDefenseStance(true);
      setIsAttacking(true);
      
      await showPopup(`${character.name} adopte une posture défensive imprenable !`, "defense");
      
      setBattleLog(prev => [...prev, { 
        message: `${character.name} adopte une posture défensive imprenable !`, 
        type: "defense",
        icon: <Shield className="inline-block w-4 h-4 mr-1" />
      }]);

      const randomTechnique = opponent.techniques[Math.floor(Math.random() * opponent.techniques.length)];
      await performAttack(opponent, character, randomTechnique);
      setDefenseStance(false);
      setIsAttacking(false);
    }
  };

  const goFight2 = async (selectedTechnique) => {
    if (isAttacking) return;
    setIsAttacking(true);
    setLastAttack(selectedTechnique);
    
    const randomTechnique = opponent.techniques[Math.floor(Math.random() * opponent.techniques.length)];

    await performAttack(character, opponent, selectedTechnique);
    await performAttack(opponent, character, randomTechnique);
    
    setIsAttacking(false);
  };

  const getHealthColor = (percent) => {
    if (percent >= 70) return 'bg-gradient-to-r from-emerald-500 to-green-500';
    if (percent >= 30) return 'bg-gradient-to-r from-amber-500 to-yellow-500';
    return 'bg-gradient-to-r from-red-600 to-rose-500';
  };

  const getBattlegroundStyle = () => {
    const styles = {
      'Arène de combat': 'from-gray-900 via-purple-900 to-gray-900',
      'Temple ancien': 'from-amber-900 via-yellow-800 to-amber-900',
      'Montagne enneigée': 'from-blue-900 via-sky-800 to-blue-900',
      'Désert ardent': 'from-orange-900 via-red-800 to-orange-900',
      'Forêt mystique': 'from-green-900 via-emerald-800 to-green-900',
      'Volcan actif': 'from-red-900 via-rose-800 to-red-900',
      'Ruines célestes': 'from-indigo-900 via-violet-800 to-indigo-900'
    };
    return styles[battleEnvironment] || styles['Arène de combat'];
  };

  const char1HealthPercent = character ? Math.max(0, Math.min(100, (stamina1 / character.stamina) * 100)) : 0;
  const char2HealthPercent = opponent ? Math.max(0, Math.min(100, (stamina2 / opponent.stamina) * 100)) : 0;

  return (
    <div className={`min-h-screen bg-gradient-to-b ${getBattlegroundStyle()} text-white relative`}>
      <AnimatePresence>
        {currentPopup && (
          <CombatPopup
            message={currentPopup.message}
            type={currentPopup.type}
            onComplete={currentPopup.onComplete}
          />
        )}
      </AnimatePresence>

      <div className="absolute inset-0 bg-black/20 backdrop-blur-[1px]"></div>
      
      <div className="relative">
        <Header location={redirect} />
        
        <div className="container mx-auto px-4 py-6">
          <div className="text-center mb-4">
            <h1 className="text-2xl font-bold text-white mb-2">{battleEnvironment}</h1>
            <p className="text-gray-300">{weatherEffect}</p>
          </div>
          
          <div className="relative mb-8">
            <div className="absolute inset-0 bg-black/30 rounded-xl backdrop-blur-sm"></div>
            
            <div className="relative grid grid-cols-1 md:grid-cols-3 gap-4 p-4 rounded-xl overflow-hidden">
              {/* Personnage du joueur */}
              {character && (
                <motion.div 
                  className={`flex flex-col items-center ${powerUp ? 'animate-pulse' : ''}`}
                  initial={{ x: -100, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ duration: 0.5 }}
                >
                  <div className={`relative w-32 h-32 md:w-40 md:h-40 mb-3 rounded-full overflow-hidden 
                    ${defenseStance ? 'border-8 border-blue-400' : 'border-4 border-indigo-600'} 
                    shadow-lg ${powerUp ? 'shadow-yellow-500/50' : 'shadow-indigo-500/50'}`}>
                    <img 
                      src={character.picture} 
                      alt={character.name} 
                      className="w-full h-full object-cover"
                    />
                    <AnimatePresence>
                      {isAttacking && lastAttack && (
                        <motion.div
                          initial={{ scale: 0, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          exit={{ scale: 0, opacity: 0 }}
                          className="absolute inset-0 flex items-center justify-center bg-indigo-600/40 backdrop-blur-sm"
                        >
                          <span className="text-white font-bold text-lg">{lastAttack}</span>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                  
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-xl font-bold text-indigo-300">{character.name}</h3>
                    {combo > 0 && (
                      <motion.span 
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="px-2 py-1 bg-yellow-500 text-black rounded-full text-sm font-bold"
                      >
                        Combo x{combo}
                      </motion.span>
                    )}
                  </div>
                  
                  <div className="w-full max-w-xs bg-gray-800 rounded-full h-4 mb-2 overflow-hidden">
                    <motion.div 
                      className={`h-full ${getHealthColor(char1HealthPercent)}`}
                      initial={{ width: '100%' }}
                      animate={{ width: `${char1HealthPercent}%` }}
                      transition={{ duration: 0.5 }}
                    ></motion.div>
                  </div>
                  
                  <div className="text-sm font-medium">
                    {stamina1} / {character.stamina} PV
                  </div>
                </motion.div>
              )}
              
              {/* Informations de combat */}
              <div className="flex flex-col items-center justify-center text-center">
                <motion.div
                  initial={{ y: -20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  className="mb-4"
                >
                  <div className="inline-block px-4 py-2 bg-indigo-900/70 rounded-full mb-2">
                    Tour {turn}
                  </div>
                  <h2 className="text-xl md:text-2xl font-bold text-white mb-2">
                    {comment}
                  </h2>
                </motion.div>
                
                <div className="w-full max-w-md h-32 overflow-y-auto bg-black/30 rounded-lg p-2 mb-4 scrollbar-thin scrollbar-thumb-indigo-600 scrollbar-track-gray-800">
                  {battleLog.slice().reverse().map((log, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                      className={`mb-1 text-sm flex items-center ${
                        log.type === "critical" ? "text-yellow-400" :
                        log.type === "super-critical" ? "text-red-400 font-bold" :
                        log.type === "power-up" ? "text-yellow-300" :
                        log.type === "defense" ? "text-blue-300" :
                        log.type === "victory" ? "text-emerald-400 font-bold" :
                        log.type === "defeat" ? "text-rose-500 font-bold" :
                        "text-gray-300"
                      }`}
                    >
                      {log.icon}
                      <span>{log.message}</span>
                      {log.damage > 0 && (
                        <motion.span 
                          initial={{ scale: 1.5, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          className="ml-1 font-bold"
                        >
                          (-{log.damage})
                        </motion.span>
                      )}
                    </motion.div>
                  ))}
                </div>
              </div>
              
              {/* Adversaire */}
              {opponent && (
                <motion.div 
                  className="flex flex-col items-center"
                  initial={{ x: 100, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ duration: 0.5 }}
                >
                  <div className="relative w-32 h-32 md:w-40 md:h-40 mb-3 rounded-full overflow-hidden border-4 border-rose-600 shadow-lg shadow-rose-500/50">
                    <img 
                      src={opponent.picture} 
                      alt={opponent.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  
                  <h3 className="text-xl font-bold mb-2 text-rose-300">{opponent.name}</h3>
                  
                  <div className="w-full max-w-xs bg-gray-800 rounded-full h-4 mb-2 overflow-hidden">
                    <motion.div 
                      className={`h-full ${getHealthColor(char2HealthPercent)}`}
                      initial={{ width: '100%' }}
                      animate={{ width: `${char2HealthPercent}%` }}
                      transition={{ duration: 0.5 }}
                    ></motion.div>
                  </div>
                  
                  <div className="text-sm font-medium">
                    {stamina2} / {opponent.stamina} PV
                  </div>
                </motion.div>
              )}
            </div>
          </div>
          
          {/* Actions de combat */}
          <motion.div 
            className="grid grid-cols-2 md:grid-cols-6 gap-3 md:gap-4 max-w-6xl mx-auto"
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            {/* Boutons spéciaux */}
            <motion.button
              onClick={activatePowerUp}
              disabled={isAttacking || powerUp || turn <= 2}
              className={`
                col-span-1 md:col-span-2
                relative overflow-hidden rounded-lg py-3 px-4 
                bg-gradient-to-br from-yellow-600 to-orange-600
                text-white font-medium shadow-lg transform transition-all duration-300
                hover:shadow-yellow-500/50 hover:scale-105
                active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed
                flex items-center justify-center gap-2
              `}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Zap className="w-5 h-5" />
              <span>Power Up</span>
            </motion.button>

            <motion.button
              onClick={activateDefense}
              disabled={isAttacking || defenseStance}
              className={`
                col-span-1 md:col-span-2
                relative overflow-hidden rounded-lg py-3 px-4 
                bg-gradient-to-br from-blue-600 to-cyan-600
                text-white font-medium shadow-lg transform transition-all duration-300
                hover:shadow-blue-500/50 hover:scale-105
                active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed
                flex items-center justify-center gap-2
              `}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Shield className="w-5 h-5" />
              <span>Défense</span>
            </motion.button>

            {/* Techniques */}
            {character && Array.isArray(character.techniques) ? (
              character.techniques.map((technique, index) => (
                <motion.button
                  key={index}
                  onClick={() => { goFight2(technique); }}
                  disabled={isAttacking}
                  className={`
                    relative overflow-hidden rounded-lg py-3 px-4 
                    bg-gradient-to-br from-indigo-700 to-purple-700 
                    text-white font-medium shadow-lg transform transition-all duration-300
                    hover:shadow-indigo-500/50 hover:scale-105
                    active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed
                    ${powerUp ? 'ring-2 ring-yellow-400 ring-opacity-50' : ''}
                    ${defenseStance ? 'opacity-50' : ''}
                  `}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <span className="relative z-10">{technique}</span>
                  <span className="absolute inset-0 bg-gradient-to-br from-purple-600 to-indigo-800 opacity-0 hover:opacity-100 transition-opacity duration-300"></span>
                </motion.button>
              ))
            ) : (
              <div className="col-span-full text-center p-4 bg-red-900/30 rounded-lg">
                Aucune technique disponible
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Fight;