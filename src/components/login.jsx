import { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';

const Login = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

   useEffect(() => {
    const storedCredentials = localStorage.getItem('Users');
    if (storedCredentials) {
      const credentials = JSON.parse(storedCredentials);
      setUsername(credentials.username);
      setPassword(credentials.password);
    }
  }, []);

const handleSubmit = async (e) => {
  e.preventDefault();
  if (!username || !password) {
    alert("Merci de rentrer des données");
  } else {
    const userId = uuidv4(); 
    const users = {
      id: userId,
      username: username,
      password: password
    };
    localStorage.setItem('Users', JSON.stringify(users));
    onLogin();
  }
};

  return (
    <div className='loginComponent'>
    <form onSubmit={handleSubmit} className='login'>
      <label>
        Username:
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
      </label>
      <label>
        Password:
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </label>
      <button type="submit">Se connecter</button>
      </form>
      </div>
  );
};

export default Login;
