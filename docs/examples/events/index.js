/** @jsx element */

import element from 'dekujs/magic-virtual-element'
import { render, tree } from 'dekujs/deku'

let timers = {};

var MouseOver = {
  render (component, setState) {
    let {props, state} = component
    function hover() {
      setState({ hover: true })
    }
    function blur() {
      setState({ hover: false })
    }
    var classes = {
      'box': true,
      'active': state.hover === true
    }
    return (
      <div class={classes} onMouseOver={hover} onMouseOut={blur}>
        Mouseover / Mouseout
      </div>
    )
  }
}

var MouseDown = function(component, send){
  let {props, state} = component
  function down() {
    send({ down: true });
  }
  function up() {
    send({ down: false });
  }
  var classes = {
    box: true,
    'active': state.down === true
  };
  return element('div', { class: classes, onMouseDown: down, onMouseUp: up }, [
    'Mousedown / Mouseup'
  ]);
};

var MouseMove = function(component, send){
  let {props, state, id} = component
  function move() {
    if (timers[id]) {
      clearTimeout(timers[id]);
      delete timers[id];
    }
    timers[id] = setTimeout(function(){
      send({ moving: false });
      delete timers[id];
    }, 50);
    send({
      moving: true
    });
  }
  var classes = {
    box: true,
    'active': state.moving === true
  };
  return element('div', { class: classes, onMouseMove: move }, [
    'Mousemove'
  ]);
};

var BlurFocus = function(component, send){
  let {props, state} = component
  function focus(event) {
    send({ focused: true });
  }
  function blur() {
    send({ focused: false });
  }
  var classes = {
    box: true,
    'active': state.focused === true
  };
  return element('div', { class: classes }, [
    element('input', {
      type: 'text',
      onFocus: focus,
      onBlur: blur
    })
  ]);
};

var Click = {
  initialState: function(){
    return {
      count: 0
    };
  },
  render: function(component, send){
    let {props, state} = component
    function click() {
      var count = state.count + 1;
      send({ count: count });
    }
    var classes = {
      box: true,
      'active': state.count % 2
    };
    return element('div', { class: classes }, [
      'Clicked ' + state.count + ' times',
      element('button', { onClick: click }, 'Click Me')
    ]);
  }
};

var DblClick = {
  initialState: function(){
    return {
      count: 0
    };
  },
  render: function(component, send){
    let {props, state} = component
    function click() {
      var count = state.count + 1;
      send({ count: count });
    }
    var classes = {
      box: true,
      'active': state.count % 2
    };
    return element('div', { class: classes, onDoubleClick: click }, [
      'Double clicked ' + state.count + ' times'
    ]);
  }
};

var FormSubmit = {
  render: function(component, send){
    let {props, state} = component
    function submit(e) {
      e.preventDefault();
      send({ submitted: !state.submitted });
    }
    var classes = {
      box: true,
      'active': state.submitted
    };
    return element('form', { class: classes, onSubmit: submit }, [
      element('button', { type: 'submit' }, 'Submit')
    ]);
  }
};

var KeyDown = function(component, send){
  let {props, state, id} = component
  function down(event) {
    if (timers[id]) {
      clearTimeout(timers[id]);
      delete timers[id];
    }
    send({ active: true });
    timers[id] = setTimeout(function(){
      send({ active: false });
      delete timers[id];
    }, 100);
  }
  var classes = {
    box: true,
    'active': state.active
  };
  return element('div', { class: classes }, [
    'onKeyDown',
    element('input', {
      type: 'text',
      onKeyDown: down
    })
  ]);
};

var KeyUp = function(component, send){
  let {props, state, id} = component
  function down(event) {
    if (timers[id]) {
      clearTimeout(timers[id]);
      delete timers[id];
    }
    send({ active: true });
    timers[id] = setTimeout(function(){
      send({ active: false });
      delete timers[id];
    }, 100);
  }
  var classes = {
    box: true,
    'active': state.active
  };
  return element('div', { class: classes }, [
    'onKeyUp',
    element('input', {
      type: 'text',
      onKeyUp: down
    })
  ]);
};

var Input = function(component, send){
  let {props, state, id} = component
  function down(event) {
    if (timers[id]) {
      clearTimeout(timers[id]);
      delete timers[id];
    }
    send({ active: true });
    timers[id] = setTimeout(function(){
      send({ active: false });
      delete timers[id];
    }, 100);
  }
  var classes = {
    box: true,
    'active': state.active
  };
  return element('div', { class: classes }, [
    'onInput',
    element('input', {
      type: 'text',
      onInput: down
    })
  ]);
};

var ContextMenu = function(component, send){
  let {props, state} = component
  function down(event) {
    event.preventDefault();
    send({ active: !state.active });
  }
  var classes = {
    box: true,
    'active': state.active
  };
  return element('div', { class: classes, onContextMenu: down }, [
    'Context Menu (Right click on me)'
  ]);
};

var Copy = function(component, send){
  let {props, state} = component
  function run(event) {
    send({ active: !state.active });
  }
  var classes = {
    box: true,
    'active': state.active
  };
  return element('div', { class: classes, onCopy: run }, [
    'Copy Me'
  ]);
};

var CutPaste = function(component, send){
  let {props, state} = component
  function run(event) {
    send({ active: !state.active });
  }
  var classes = {
    box: true,
    'active': state.active
  };
  return element('div', { class: classes }, [
    element('input', { onPaste: run, onCut: run, onCopy: run, value: 'Cut/Copy/Paste Here' })
  ]);
};

var Draggable = function(component, send){
  let {props, state} = component
  function start(event) {
    event.dataTransfer.setData('text', 'asdasd');
    send({ active: true });
  }
  function end(event) {
    send({ active: false });
  }
  var attrs = {
    classes: {
      box: true,
      'active': state.active
    },
    draggable: true,
    onDragStart: start,
    onDragEnd: end
  };
  return element('div', attrs, [
    'Drag Me'
  ]);
};

var Droppable = function(component, send){
  let {props, state} = component
  function over(event) {
    event.preventDefault();
    //console.log('droppable', 'over', event.target);
  }
  function drop(event) {
    event.preventDefault()
    console.log('droppable', 'drop', event.target);
    send({ dropped: true, active: false });
  }
  function enter(event) {
    event.preventDefault()
    console.log('draggable', 'enter', event.target);
    send({ active: true });
  }
  function leave(event) {
    console.log('draggable', 'leave', event.target);
    send({ active: false });
  }
  var attrs = {
    classes: {
      box: true,
      'active': state.active
    },
    onDragOver: over,
    onDrop: drop,
    onDragEnter: enter,
    onDragLeave: leave
  };
  return element('div', attrs, [
    state.dropped ? 'Dropped' : 'Drop Here'
  ]);
};

var Scroll = function(component, send){
  let {props, state} = component
  function scroll(event) {
    send({ position: event.target.scrollTop });
  }
  var attrs = {
    onScroll: scroll,
    class: {
      'active': state.position > 100
    },
    style: {
      overflow: 'scroll'
    }
  };
  var innerAttrs = {
    class: 'box',
    style: {
      height: '500px',
      width: '100%'
    }
  };
  return element('div', attrs, [
    element('div', innerAttrs, 'Scroll Me')
  ]);
};

var Examples = {
  render() {
    return (
      <div class="App">
        <MouseOver />
        <MouseMove />
        <MouseDown />
        <BlurFocus />
        <Click />
        <FormSubmit />
        <KeyDown />
        <Input />
        <KeyUp />
        <ContextMenu />
        <DblClick />
        <Copy />
        <CutPaste />
        <Draggable />
        <Droppable />
        <Scroll />
      </div>
    )
  }
}

var app = tree(<Examples />)
render(app, document.body);
