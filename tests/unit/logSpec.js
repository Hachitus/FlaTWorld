import loglevel from 'loglevel';
import mapLog from '../../src/core/log';

describe('log tests => ', () => {
  it('debug', () => {
    spyOn(loglevel, 'debug');
    mapLog.debug('test')

    expect(loglevel.debug).toHaveBeenCalled()
  });
  it('warn', () => {
    spyOn(loglevel, 'warn');
    mapLog.warn('test')

    expect(loglevel.warn).toHaveBeenCalled()
  });
  it('error', () => {
    spyOn(loglevel, 'error');
    mapLog.error('test')

    expect(loglevel.error).toHaveBeenCalled()
  });
});
