import { h, FunctionComponent } from 'preact';

import Mazes from '../Mazes/Mazes';

import style from './App.css';

const App: FunctionComponent = () => (
  <div className={style.app}>
    <div className={style.appContent}>
      <Mazes />
    </div>
  </div>
);

export default App;
