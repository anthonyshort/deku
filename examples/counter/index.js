import { tree, render, element } from 'deku';

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
    var counter = 0;
    component.interval = setInterval(() => {
       setState({ secondsElapsed: counter++ })
    }, 1000);
  },

  beforeUnmount (component) {
    clearInterval(component.interval);
  }
}

function doSomething() {
  console.log('I did something.');
}

let counter = tree(
  <Counter onAnEmittedEventFromCounter={ doSomething }></Counter>
);

render(counter, document.body);
