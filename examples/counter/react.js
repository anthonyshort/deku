import React from "react";

class Counter extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      secondsElapsed: 0
    };
  }

  render () {
    let { secondsElapsed } = this.state;
    return (
      <span>Seconds Elapsed: { secondsElapsed }</span>
    );
  }

  componentWillUpdate() {
    let { secondsElapsed } = this.state;
    let { onAnEmittedEventFromCounter } = this.props;
    if (secondsElapsed && secondsElapsed % 10 === 0) onAnEmittedEventFromCounter();
  }

  componentDidMount () {
    let self = this;
    var counter = 0;
    this.interval = setInterval(() => {
      self.setState({ secondsElapsed: counter++ })
    }, 1000);
  }

  componentWillUnmount () {
    clearInterval(this.interval);
  }
}

function doSomething() {
  console.log('I did something.');
}

React.render(<Counter onAnEmittedEventFromCounter={ doSomething } />, document.body);
