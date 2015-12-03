import element from 'dekujs/virtual-element'
import { render, tree } from 'dekujs/deku'

const intervals = {};

let Counter = {
  initialState () {
    return {
      secondsElapsed: 0
    }
  },

  render (component) {
    let { props, state } = component
    let { secondsElapsed } = state;
    return element('span', [ 'Seconds Elapsed: ' + secondsElapsed ]);
  },

  afterUpdate (component) {
    let { props, state } = component;
    if (state.secondsElapsed && state.secondsElapsed % 10 === 0) props.onAnEmittedEventFromCounter();
  },

  afterMount (component, el, setState) {
    let counter = 0;
    intervals[component.id] = setInterval(() => {
       setState({ secondsElapsed: counter++ })
    }, 1000);
  },

  beforeUnmount (component) {
    clearInterval(intervals[component.id]);
    delete intervals[component.id];
  }
}

function doSomething() {
  console.log('I did something.');
}

let counter = tree(
  element(Counter, { onAnEmittedEventFromCounter: doSomething })
);

render(counter, document.body);
