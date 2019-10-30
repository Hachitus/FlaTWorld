import loglevel from 'loglevel';

loglevel.enableAll();
/**
 * @namespace flatworld
 * @class log
 * @requires loglevel.js for frontend logging, or something similar
 **/
const log = {
  debug(e, ...args) {
    loglevel.debug(e, ...args);
  },
  warn(e, ...args) {
    loglevel.warn(e, ...args);
  },
  error(e, ...args) {
    loglevel.error(e, ...args);
  }
};

/*---------------------
--------- API ---------
----------------------*/
export default log;
