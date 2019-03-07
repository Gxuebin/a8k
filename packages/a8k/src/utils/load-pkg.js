import path from 'path';
import chokidar from 'chokidar';
import logger from '@a8k/cli-utils/logger';
import JoyCon from 'joycon';

export default ({ cwd = process.cwd() } = {}) => {
  let pkgData;
  let pkgPath;
  let watcher;

  const updatePkg = () => {
    const joycon = new JoyCon({
      // Only read up to current working directory
      stopDir: path.dirname(process.cwd()),
    });
    const res = joycon.loadSync({
      files: ['package.json'],
      cwd,
    });

    pkgPath = res.path;
    pkgData = res.data || {};
  };

  const watchPkg = file => {
    return chokidar
      .watch(file, {
        ignoreInitial: true,
      })
      .on('add', () => {
        updatePkg();
      })
      .on('unlink', () => {
        pkgData = {};
        pkgPath = null;
      })
      .on('change', () => {
        logger.debug(`${file} has changed..`);
        updatePkg();
      });
  };

  updatePkg();

  return {
    get path() {
      return pkgPath;
    },

    get data() {
      return pkgData;
    },

    watch(file) {
      watcher = watcher || watchPkg(file || pkgPath || path.join(cwd, 'package.json'));
      return watcher;
    },

    close() {
      return watcher && watcher.close();
    },
  };
};
