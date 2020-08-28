import { h, FunctionComponent } from 'preact';

import theme from '../../theme/variables';

import Maze from '../Maze/Maze';

import style from './App.css';

const App: FunctionComponent = () => {
  const backgroundColor = theme.customProperties['--color-main-1'];
  const strokeColor = theme.customProperties['--color-white'];
  return (
    <div className={style.app}>
      <Maze
        backgroundColor={backgroundColor}
        nbRows={12}
        strokeColor={strokeColor}
      />
      <Maze
        backgroundColor={backgroundColor}
        nbRows={4}
        strokeColor={strokeColor}
      />
      <Maze
        backgroundColor={backgroundColor}
        nbRows={8}
        strokeColor={strokeColor}
      />
    </div>
  );
};

export default App;
