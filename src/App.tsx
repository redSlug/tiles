import './App.css';
import { HashRouter, Route, Routes } from 'react-router-dom';
import Game from './Game.tsx';

function changeColors() {
  console.log('changeColors');
  const curTheme = document.getElementsByTagName('html')[0].dataset.theme;
  document.getElementsByTagName('html')[0].dataset.theme =
    curTheme === 'dark' ? 'light' : 'dark';
}

function App() {
  return (
    <HashRouter>
      <div>
        <button onClick={changeColors} className={'color-button'}>
          <svg
            height="24"
            viewBox="0 0 24 24"
            width="24"
            xmlns="http://www.w3.org/2000/svg"
            opacity={0.3}
          >
            <path
              d="m12 22c5.5228475 0 10-4.4771525 10-10s-4.4771525-10-10-10-10 4.4771525-10 10 4.4771525 10 10 10zm0-2v-16c4.418278 0 8 3.581722 8 8s-3.581722 8-8 8z"
              fill="#212121"
            />
          </svg>
        </button>
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
