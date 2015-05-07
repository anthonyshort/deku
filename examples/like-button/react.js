import React from "react";

class Button extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      liked: false
    };
  }

  onClick(e) {
    e.preventDefault();
    let { liked } = this.state;
    this.setState({
      liked: !liked
    })
  }

  render() {
    let { liked } = this.state;
    return (
      <button onClick={ this.onClick.bind(this) }>
        You { liked ? "like" : "unlike" } this.
      </button>
    )
  }
}

React.render(<Button />, document.body);
