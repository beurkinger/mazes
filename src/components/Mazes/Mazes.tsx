import { h, FunctionComponent } from 'preact';

import theme from '../../theme/variables';

import Loader from '../Loader/Loader';
import Maze from '../Maze/Maze';

import style from './Mazes.css';

const Mazes: FunctionComponent = () => {
  const backgroundColor = theme.customProperties['--color-main-1'];
  const strokeColor = theme.customProperties['--color-white'];
  return (
    <div className={style.mazes}>
      <div className={style.mazesContent}>
        <Maze
          backgroundColor={backgroundColor}
          nbColumns={16}
          nbRows={12}
          strokeColor={strokeColor}
        />
        <Maze
          backgroundColor={backgroundColor}
          nbColumns={16}
          nbRows={4}
          strokeColor={strokeColor}
        />
        <Maze
          backgroundColor={backgroundColor}
          nbColumns={16}
          nbRows={8}
          strokeColor={strokeColor}
        />
        <div className={style.separator} />
        <Loader nbBars={20} />
      </div>
    </div>
  );
};

export default Mazes;
