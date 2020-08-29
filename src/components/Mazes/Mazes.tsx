import { h, FunctionComponent } from 'preact';

import theme from '../../theme/variables';

import LoadBar from '../LoadBar/LoadBar';
import Maze from '../Maze/Maze';

import style from './Mazes.css';

const Mazes: FunctionComponent = () => {
  const backgroundColor = theme.customProperties['--color-main-1'];
  const strokeColor = theme.customProperties['--color-white'];
  return (
    <div className={style.mazes}>
      <div className={style.mazesContent}>
        <LoadBar />
        <div className={style.separator} />
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
    </div>
  );
};

export default Mazes;
