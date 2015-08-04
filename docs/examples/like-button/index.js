import { tree, render, element } from 'deku';

let Button = {
  initialState () {
    return {
      liked: false
    }
  },

  render (component) {
    let { props, state } = component;

    function onClick(e, component, setState) {
      e.preventDefault();
      setState({
        liked: !state.liked
      })
    }

    return (
      <button onClick={ onClick }>
        You { state.liked ? "like" : "unlike" } this.
      </button>
    )
  }
}

let button = tree(
  <Button></Button>
);

render(button, document.body);
