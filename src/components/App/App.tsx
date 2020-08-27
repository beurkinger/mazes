import { h, FunctionComponent } from 'preact';

import Maze from '../Maze/Maze';

import style from './App.css';

const App: FunctionComponent = () => (
  <div className={style.app}>
    <Maze />
  </div>
);

export default App;
