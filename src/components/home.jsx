import { useState } from 'react';
import Login from './Login';
import SelectCharacter from './selectCharacter';
import Fight from './figth'; 
import data from '../assets/data.json';
import Header from '../header';

const Home = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [selectedCharacter, setSelectedCharacter] = useState(null);
  const [characters, setCharacters] = useState(data);

  console.log(selectedCharacter)
  

  const redirectCharacter = () => {
    setSelectedCharacter(null);
  };

  const handleCharacterSelect = (character) => {
    setSelectedCharacter(character);
    localStorage.setItem('Personnage',JSON.stringify(character))
    console.log('Personnage sélectionné:', character.name);
  };

  const handleCharacterUpdate = (updatedCharacters) => {
    setCharacters(updatedCharacters);
  };

  const handleLogin = () => {
    setIsLoggedIn(true);
  };

  return (
    <div>
      <Header character={redirectCharacter} />
      {isLoggedIn ? (
        selectedCharacter ? (
          <Fight character={selectedCharacter} redirect={redirectCharacter} />
        ) : (
          <SelectCharacter
            characters={characters}
            characterSelect={handleCharacterSelect}
            onCharacterUpdate={handleCharacterUpdate}
          />
        )
      ) : (
        <Login onLogin={handleLogin} />
      )}
    </div>
  );
};

export default Home;
