import { h, FunctionComponent } from 'preact';

import theme from '../../theme/variables';

import Maze from '../Maze/Maze';

import style from './App.css';

const App: FunctionComponent = () => (
  <div className={style.app}>
    <Maze
      backgroundColor={theme.customProperties['--color-main-1']}
      strokeColor={theme.customProperties['--color-white']}
    />
  </div>
);

export default App;
