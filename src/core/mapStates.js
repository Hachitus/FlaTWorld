import * as StateMachine from 'javascript-state-machine';

/*---------------------
-------- PUBLIC -------
----------------------*/
/**
 * Finite state machine for the map. Uses this library and pretty much it's API 
 * https://github.com/jakesgordon/javascript-state-machine.
 * 
 * You use this class simply by calling the states:
 * import mapStates from '...';
 * mapStates.objectSelect()
 * mapStates.normalize()
 *
 * @namespace flatworld
 * @class mapStates
 * @requires  state-machine library
 */
const mapStates = StateMachine.create({
  initial: 'statusQuo',
  events: [
    /**
     * When the object is selected
     *
     * @method objectSelect
     */
    { name: 'objectSelect', from: ['statusQuo', 'objectSelected'], to: 'objectSelected' },
    /**
     * When situation is normal, nothing selected.
     *
     * @method normalize
     */
    { name: 'normalize', from: ['objectSelected'], to: 'statusQuo' },
    /**
     * When object is issued a move order
     *
     * @method objectOrder
     */
    { name: 'objectOrder', from: 'objectSelected', to: 'animatingObject' },
    /**
     * When object ends it's movement animation
     *
     * @method objectOrderEnd
     */
    { name: 'objectOrderEnd', from: 'animatingObject', to: 'objectSelected' },
  ]});

/*---------------------
--------- API ---------
----------------------*/
export default mapStates;
