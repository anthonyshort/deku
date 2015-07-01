/** @jsx dom */

import raf from 'component-raf';
import assert from 'assert';
import {tree,dom,render} from '../../';
import {mount,div} from '../helpers';

it('should render svg elements', function(){

  var MyCircle = {
    render() {
      return (
        <svg width="92px" height="92px" viewBox="0 0 92 92">
          <g stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
            <circle id="circle" fill="#D8D8D8" cx="46" cy="46" r="46"></circle>
          </g>
        </svg>
      )
    }
  }

  var app = (<MyCircle />)
  mount(app)
})
