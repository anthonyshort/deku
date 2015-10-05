import element from 'dekujs/virtual-element'
import { render, tree } from 'dekujs/deku'

var ListItem = {
  render (component) {
    let { props, state } = component;
    let { item } = props;
    return (
      <li>
        { item.name }
        <button onClick={ props.onRemove }>Remove</button>
      </li>
    );
  }
};

let List = {
  initialState() {
    return {
      items: [
        {"name": "Barry"},
        {"name": "Trevor"}
      ]
    }
  },

  render(component, setState) {
    var { props, state } = component;

    function removeItem(item) {
      return function() {
        let updatedItems = state.items.filter(function(target){
          return target !== item
        });
        setState({ items: updatedItems });
      }
    }

    function addItem(e){
      e.preventDefault();
      let val = component.input.value;
      if (!val) return;
      component.input.value = "";

      let existingItems = state.items;
      existingItems.push({"name": val});
      setState({ items: existingItems });
    }

    function reverseItems(){
      let reversed = state.items.reverse();
      setState({ items: reversed });
    }

    function sortItems(){
      let sorted = state.items.sort(function(a, b){
        a = a.name.toLowerCase();
        b = b.name.toLowerCase();
        if (a > b) return 1;
        if (a < b) return -1;
        return 0;
      });
      setState({ items: sorted });
    }

    let items = state.items.map((item, index) => {
      return (
        <ListItem item={item} onRemove={ removeItem(item) }></ListItem>
      );
    });

    return (
      <div>
        <ul className="listItems">
          { items }
        </ul>
        <input type="text"/>
        <button type="button" onClick={ addItem }>Add</button>
        <button type="button" onClick={ reverseItems }>Reverse</button>
        <button type="button" onClick={ sortItems }>Sort</button>
      </div>
    );
  },

  afterRender(component, el) {
    component.input = el.querySelector('input');
  }
}

let list = tree(
  <List></List>
);

render(list, document.body);
