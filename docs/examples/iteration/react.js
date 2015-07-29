import React from "react";

/**
 * ListItem
 */

class ListItem extends React.Component {
  render() {
    let props = this.props;
    return (
      <li data-item={ JSON.stringify(props.item) }>
        { props.item.name }
        <button onClick={ props.onRemove }>Remove</button>
      </li>
    );
  }
};


/**
 * List
 */

class List extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      items: [
        {"name": "Barry"},
        {"name": "Trevor"}
      ]
    };
  }

  componentDidMount() {
    this.input = this.refs.input.getDOMNode();
  }

  removeItem(e) {
    e.preventDefault();
    let el = e.target.parentElement;
    let item = el.getAttribute('data-item');
    let { items } = this.state;

    let updatedItems = items.filter((target) => {
      return JSON.stringify(target) !== item;
    });

    this.setState({
      items: updatedItems
    });
  }

  addItem(e){
    e.preventDefault();
    let val = this.input.value;
    if (!val) return;
    this.input.value = "";

    let { items } = this.state;
    items.push({"name": val})
    this.setState({ items: items });
  }

  reverseItems(){
    let { items } = this.state;
    this.setState({ items: items.reverse() });
  }

  sortItems(){
    let { items } = this.state;

    let sorted = items.sort((a, b) => {
      a = a.name.toLowerCase();
      b = b.name.toLowerCase();
      if (a > b) return 1;
      if (a < b) return -1;
      return 0;
    });

    this.setState({ items: sorted });
  }

  renderItem(item) {
    return (
      <ListItem item={item} onRemove={ this.removeItem.bind(this) }></ListItem>
    );
  }

  render() {
    let { items } = this.state;

    return (
      <div>
        <ul className="listItems">
          { items.map(this.renderItem.bind(this)) }
        </ul>
        <input ref="input" type="text"/>
        <button type="button" onClick={ this.addItem.bind(this) }>Add</button>
        <button type="button" onClick={ this.reverseItems.bind(this) }>Reverse</button>
        <button type="button" onClick={ this.sortItems.bind(this) }>Sort</button>
      </div>
    );
  }
};

React.render(<List />, document.body);
