import React, { useState, useEffect, useRef } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { PlusCircle, X, Swords, Shield, Zap, Heart } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Character = ({ characterSelect, characters: initialCharacters, onCharacterUpdate }) => {
  const generatorSpeed = () => Math.floor(Math.random() * 11) + 100;
  const generatorStrength = () => Math.floor(Math.random() * (1500 - 1300 + 1)) + 1300;
  const generatorDefense = () => Math.floor(Math.random() * (900 - 800 + 1)) + 800;
  const generatorStamina = () => Math.floor(Math.random() * (24000 - 21000 + 1)) + 21000;

  const [characters, setCharacters] = useState([]);
  const [selectedCharacterId, setSelectedCharacterId] = useState(null);
  const [newCharacter, setNewCharacter] = useState({
    name: '',
    strenght: generatorStrength(),
    speed: generatorSpeed(),
    defense: generatorDefense(),
    techniques: ["", "", "", ""],
    picture: '',
    stamina: generatorStamina()
  });

  const charactersRef = useRef(null);
  const lastCharacterRef = useRef(null);

  useEffect(() => {
    const storedCharacters = localStorage.getItem('Characters');
    if (storedCharacters) {
      setCharacters(JSON.parse(storedCharacters));
    } else {
      setCharacters(initialCharacters || []);
      localStorage.setItem('Characters', JSON.stringify(initialCharacters || []));
    }
  }, [initialCharacters]);

  const handleCharacterSelect = (character) => {
    setSelectedCharacterId(character.id);
    setTimeout(() => {
      characterSelect(character);
    }, 800); // Délai pour laisser l'animation se jouer
  };

  const onAddCharacter = () => {
    const maxLocalStorageCapacity = 5242880;
    const storedCharacters = JSON.parse(localStorage.getItem('Characters')) || [];

    const updatedCharacters = [...characters, { ...newCharacter, id: uuidv4() }];
    const updatedCharactersSize = JSON.stringify(updatedCharacters).length * 2;

    if (updatedCharactersSize >= maxLocalStorageCapacity) {
      alert("Étant donné que le stockage local est actuellement plein, vous pourriez envisager de prioriser l'utilisation d'images au format WebP pour réduire la taille des fichiers ou de supprimer certains personnages de votre roster actuel")
      return;
    }

    if (
      !newCharacter.name ||
      !newCharacter.strenght ||
      !newCharacter.speed ||
      !newCharacter.defense ||
      !newCharacter.techniques[0] ||
      !newCharacter.picture ||
      !newCharacter.stamina
    ) {
      alert("Veuillez remplir tous les champs du formulaire.");
      return;
    }

    const characterWithId = { ...newCharacter, id: uuidv4() };
    const updatedCharacters2 = [...characters, characterWithId];
    setCharacters(updatedCharacters2);
    onCharacterUpdate(updatedCharacters2);
    localStorage.setItem('Characters', JSON.stringify(updatedCharacters2));

    setTimeout(() => {
      lastCharacterRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const handleChange = (e, index) => {
    const { name, value } = e.target;
    if (name === 'technique') {
      const updatedTechniques = [...newCharacter.techniques];
      updatedTechniques[index] = value;
      setNewCharacter(prevCharacter => ({
        ...prevCharacter,
        techniques: updatedTechniques
      }));
    } else {
      setNewCharacter(prevCharacter => ({
        ...prevCharacter,
        [name]: value
      }));
    }
  };

  const deleteCharacter = (id) => {
    if (id === 1 || id === 2) {
      alert("Les joueurs 1 et 2 ne peuvent pas être supprimés.");
      return;
    }
    const updatedCharacters = characters.filter(character => character.id !== id);
    setCharacters(updatedCharacters);
    const updatedLocalStorage = JSON.parse(localStorage.getItem('Characters')).filter(character => character.id !== id);
    localStorage.setItem('Characters', JSON.stringify(updatedLocalStorage));
  };

  return (
    <div className="min-h-screen bg-[url('https://images.unsplash.com/photo-1579546929518-9e396f3cc809')] bg-cover bg-fixed bg-center text-white p-8" ref={charactersRef}>
      <div className="max-w-7xl mx-auto">
        <h1 className="text-6xl font-bold text-center mb-16 bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 drop-shadow-lg">
          Galerie des Héros
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 mb-16">
          {characters.map((character, index) => (
            <motion.div 
              key={index}
              ref={index === characters.length - 1 ? lastCharacterRef : null}
              className="relative group bg-gray-900/80 backdrop-blur-sm rounded-2xl overflow-hidden shadow-2xl transition-all duration-300 hover:scale-105 hover:shadow-purple-500/20"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <div className="aspect-square overflow-hidden relative">
                <img 
                  src={character.picture} 
                  alt={character.name}
                  onClick={() => handleCharacterSelect(character)}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110 cursor-pointer"
                />
                <AnimatePresence>
                  {selectedCharacterId === character.id && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center"
                    >
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        exit={{ scale: 0 }}
                        className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"
                      />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              <div className="p-6 bg-gradient-to-t from-black via-black/80 to-transparent absolute bottom-0 left-0 right-0">
                <h2 className="text-2xl font-bold mb-3 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500">
                  {character.name}
                </h2>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="flex items-center gap-2">
                    <Swords className="w-4 h-4 text-red-400" />
                    <span>{character.strenght}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Zap className="w-4 h-4 text-yellow-400" />
                    <span>{character.speed}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Shield className="w-4 h-4 text-blue-400" />
                    <span>{character.defense}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Heart className="w-4 h-4 text-green-400" />
                    <span>{character.stamina}</span>
                  </div>
                </div>
                {character.id !== 1 && character.id !== 2 && (
                  <button
                    onClick={() => deleteCharacter(character.id)}
                    className="absolute top-3 right-3 p-2 rounded-full bg-red-500/80 hover:bg-red-600 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                )}
              </div>
            </motion.div>
          ))}
        </div>

        <div className="max-w-2xl mx-auto bg-gray-900/90 backdrop-blur-md rounded-2xl p-8 shadow-2xl border border-purple-500/20">
          <form onSubmit={(e) => {
            e.preventDefault();
            onAddCharacter();
          }} className="space-y-8">
            <h2 className="text-3xl font-bold text-center mb-8 bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 bg-clip-text text-transparent">
              Créez Votre Héros
            </h2>
            
            <div className="space-y-6">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Nom du héros"
                  name="name"
                  value={newCharacter.name}
                  onChange={handleChange}
                  className="w-full px-6 py-3 bg-gray-800/50 rounded-xl border border-purple-500/20 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 outline-none transition-all duration-300 placeholder-gray-400"
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[0, 1, 2, 3].map(index => (
                  <input
                    key={index}
                    type="text"
                    placeholder={`Technique ${index + 1}`}
                    name="technique"
                    value={newCharacter.techniques[index]}
                    onChange={(e) => handleChange(e, index)}
                    className="w-full px-6 py-3 bg-gray-800/50 rounded-xl border border-purple-500/20 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 outline-none transition-all duration-300 placeholder-gray-400"
                  />
                ))}
              </div>

              <div className="relative">
                <input
                  type="file"
                  accept="image/*"
                  name="picture"
                  onChange={(e) => {
                    const file = e.target.files[0];
                    const reader = new FileReader();
                    reader.onload = (event) => {
                      setNewCharacter((prevCharacter) => ({
                        ...prevCharacter,
                        picture: event.target.result
                      }));
                    };
                    reader.readAsDataURL(file);
                  }}
                  className="w-full px-6 py-3 bg-gray-800/50 rounded-xl border border-purple-500/20 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 outline-none transition-all duration-300 file:mr-4 file:py-2 file:px-6 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-gradient-to-r file:from-purple-500 file:to-pink-500 file:text-white hover:file:from-purple-600 hover:file:to-pink-600"
                />
              </div>
            </div>

            <button 
              type="submit"
              className="w-full bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 text-white py-4 rounded-xl font-semibold flex items-center justify-center gap-3 hover:from-purple-600 hover:via-pink-600 hover:to-red-600 transition-all duration-300 shadow-lg hover:shadow-purple-500/20"
            >
              <PlusCircle className="w-6 h-6" />
              Créer le Héros
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Character;