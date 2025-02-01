import './App.css';
import { HashRouter, Route, Routes } from 'react-router-dom';
import Game from './Game.tsx';

function App() {
  return (
    <HashRouter>
      <div>
        <Routes>
          <Route path="/" element={<Game />} />
          <Route path="/game/:shareCode?" element={<Game />} />
          <Route path="/about" element={<About />} />
        </Routes>
      </div>
    </HashRouter>
  );
}

const About = () => <h2>About page coming soon</h2>;

export default App;
