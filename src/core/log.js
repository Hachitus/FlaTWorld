import loglevel from 'loglevel';

loglevel.enableAll();
/**
 * @namespace flatworld
 * @class log
 * @requires loglevel.js for frontend logging, or something similar
 **/
const log = {
  debug(e) {
    loglevel.debug(e);
  },
  error(e) {
    loglevel.error(e);
  }
};

/*---------------------
--------- API ---------
----------------------*/
export default log;
