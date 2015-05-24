
// CORE API
// --------------------------------------------------------------------

declare module "deku" {

  /** 
   * Take an Application and paint it into the DOM at a given root node. 
   */
  function render(tree: Application, root: Node): void;
  
  /**
   * Produce the image of an Application as an HTML string.
   * Used server-side pre-rendering.
   */
  function renderString(tree: Application): string;
  
  /**
   * Produces an Application tree from a VirtualNode tree.
   * 
   * An Application appends environment and plugin information to
   * the virtual node, preparing it for rendering.
   */
  function tree<P, S>(virtualNode: VirtualNode<P, S>): Application;
  
  /**
   * Raw VirtualNode contruction API. 
   * 
   * Builds either "raw" DOM-like elements or "component-like" elements. 
   */
  function element(tag: string): VirtualNode<{}, {}>;
  function element(tag: string, props: PropLike): VirtualNode<{}, {}>;
  function element(tag: string, props: PropLike, children: Child[]): VirtualNode<{}, {}>;
  function element<P extends PropLike, S>(spec: Spec<P, S>, props: P): VirtualNode<P, S>;
  function element<P extends PropLike, S>(spec: Spec<P, S>, props: P, children: Child[]): VirtualNode<P, S>;
  
  /**
   * Prop types are constrained and informed by three interfaces: HasChildren, 
   * Evented, and Keyed.
   * 
   * In practice, what this implies is two-fold. First, prop types will have "children"
   * appended in all circumstances once the component is mounted to the DOM. Custom Prop
   * types should therefore properly inherit this slot. Second, props may include both
   * event listener declarations and keys used for controlling tree diffing.
   */
  interface PropLike extends HasChildren, Evented, Keyed {}
  
  /**
   * VirtualNodes are abstract types that form a "skeletonized" DOM tree that
   * is much faster to construct, compare, and analyze.
   */
  class VirtualNode<P, S> {
    type: string;
  }
    
  class ElementNode<P, S> extends VirtualNode<P, S> {
    tagName: string;
    children: VirtualNode<any, any>[];
    attributes: any;
    key: string;
  }
  class ComponentNode<P extends HasChildren, S> extends VirtualNode<P, S> {
    component: Component<P, S>;
    props: P;
    key: string;
  }
  class TextNode<P, S> extends VirtualNode<P, S> {
    data: string;
  }
  type Child = VirtualNode<any, any> | string;
  
  /**
   * An Application is a virtual tree extended with environment and plugin
   * information. In this form it is ready to mount to the browser DOM.
   */
  interface Application {
    
    /** 
     * Set environment data.
     * Values set in the environment are available in components by
     * registering a 'source' in their proptype declaration.
     */
    set(name: string, value: any): void;
    
    /** 
     * Set rendering options. Options include:
     * 
     * - validateProps: boolean
     *   Is propType validation enabled? There is a runtime penalty, so 
     *   it may be useful to disable in production. 
     */
    option(name: string, value: any): void;
    
    /** Change the virtual element currently mounted */
    mount<P, S>(vnode: VirtualNode<P, S>): void;
    
    /** Use a plugin */
    use(fn: (app: Application) => any): void;
  }
  
  
  
  // COMPONENT API
  //
  // Components are modularized behavior which manages creation, 
  // parameterization, and local state within a virtual subtree of the 
  // DOM.  
  // --------------------------------------------------------------------
  
  /**
   * A "live" component providing access to the current properties and state
   * at a current time of a component managing a virtual tree which is now
   * mounted.
   * 
   * Users do not construct Components directly but instead create component 
   * Specs which 
   */
  interface Component<P extends HasChildren, S> {
    props: P;
    state: S;
    id: string;
  }
  
  /**
   * Keys within a component's Property set may be configured and 
   * deliminated by property specifications.
   */
  interface PropSpec {
    type?: string;
    expects?: Array<any>;
    optional?: boolean;
    
    /**
     * A source string links the value of a property to a value which
     * must be present in the Application environment.
     */
    source?: string;
  }
  
  /**
   * A descriptor of Component creation, behavior, and lifecycle.
   * 
   * Deku's primary interface is operated via specification of components.
   * Components are collections of behavior and state parameterized by immutable,
   * static properties. A value of type Spec<P, S> specifies a component of
   * type Component<P, S> with properties in type P and local state in type S.
   */
  interface Spec<P extends HasChildren, S> {
   
    /** Define a name for the component that can be used in debugging */
    name?: string;
   
    /** Validate the props sent to your component */
    propTypes?: { [prop: string]: PropSpec };
   
    /** 
     * Render a component. We need to pass in setState so that callbacks on
     * sub-components. This may change in the future.
     * 
     * Client: Yes
     * Server: Yes
     */  
    render: (component: Component<P, S>, setState: (newState: S) => void) => VirtualNode<P, S>;
    
    /** 
     * Get the initial state for the component. We don't pass props in here like
     * React does because the state should just be computed in the render function.  
     */
    initialState?: () => S;
    
    /** Default props can be defined that will be used across all instances.  */
    defaultProps?: P;
    
    /** This is called on both the server and the client. */
    beforeMount?: (component: Component<P, S>) => any;
    
    /**
     * This is called after the component is rendered the first time and is only
     * ever called once.
     * 
     * Use cases:
     * - Analytics tracking
     * - Loading initial data
     * - Setting the state that should change immediately eg. open/close
     * - Adding DOM event listeners on the window/document
     * - Moving the element in the DOM. eg. to the root for dialogs
     * - Focusing the element
     *
     * Client: Yes
     * Server: No
     */
    afterMount?: (component: Component<P, S>, el: Node, setState: (newState: S) => void) => any;
    
    /**
     * This is called once just before the element is removed. It should be used
     * to clean up after the component.
     * 
     * Use cases:
     * - Unbind window/document event handlers
     * - Edit the DOM in anyway to clean up after the component
     * - Unbind any event emitters
     * - Disconnect streams
     *
     * Client: Yes
     * Server: No
     */
    beforeUnmount?: (component: Component<P, S>, el: Node) => any;
    
    /** 
     * This is called on each update and can be used to skip renders to improve 
     * performance of the component.
     */
    shouldUpdate?: (component: Component<P, S>, nextProps: P, nextState: S) => boolean;
    
    /**
     * Called before each render on both the client and server.
     * 
     * Example use cases:
     * - Updating stream/emitter based on next props
     * 
     * Client: Yes
     * Server: Yes
     */
    beforeRender?: (component: Component<P, S>) => any;
    
    /**
     * Called after every render, including the first one. This is better
     * than the afterUpdate as it's called on the first render so if forces
     * us to think in single renders instead of worrying about the lifecycle.
     * It can't update state here because then you'd be changing state based on 
     * the DOM.
     * 
     * Example use cases:
     * - Update the DOM based on the latest state eg. animations, event handlers
     * 
     * Client: Yes
     * Server: No
     */
    afterRender?: (component: Component<P, S>, el: Node) => any;
    
    /**
     * This isn't called on the first render only on updates. 
     *
     * Example use cases:
     * - Updating stream/emitter based on next props
     *
     * Client: Yes
     * Server: No
     */
    beforeUpdate?: (component: Component<P, S>, nextProps: P, nextState: S) => any;
    
    /**
     * Not called on the first render but on any update.
     * 
     * Example use cases:
     * - Changing the state based on the previous state transition
     * - Calling callbacks when a state change happens
     * 
     * Client: Yes
     * Server: No
     */
    afterUpdate?: (component: Component<P, S>, prevProps: P, prevState: S, setState: (newState: S) => void) => void;
  }
  
  
  
  // ANCILARY PROPERTY INTERFACES
  // -------------------------------------------------------------------- 
  
  /**
   * Prop types are assigned a slot to hold the children assigned to a component
   * after it has been built into the virtual tree; therefore, all Prop types
   * should recognize that they may also include a children slot.
   */
  interface HasChildren {
    children?: Array<VirtualNode<any, any>>;
  }
  
  /**
   * A component with Keyed properties can be more efficiently diffed under
   * the assumption that keys preserve identity between diffs. 
   * 
   * To be more particular, when diffing old and new virtual elements that
   * and children of the new element with keys that match the keys of the old
   * element are actually *the same* nodes which have perhaps merely moved. 
   * Without this identity preservation over keys it would be necessary to 
   * completely remove and replace all children more frequently.
   */
  interface Keyed {
    key?: string;
  }
  
  /**
   * An Evented property may contain keys corresponding to DOM events. The
   * EventListeners stored at these keys will be registered against the DOM
   * element corresponding to the virtual element with the given property.
   * 
   * In Deku the events submitted are regular browser events---there is no 
   * synthetic event system for canonicalization of browser event semantics. 
   */
  
  interface EventListenerOf<T extends Event> {
    (event: T): any;
  }
  
  // For listing and event details, see 
  // <https://developer.mozilla.org/en-US/docs/Web/Events>
  interface Evented {
    
    // Element interaction events
    onFocus?: EventListenerOf<FocusEvent>;
    onBlur?: EventListenerOf<FocusEvent>;
    onChange?: EventListenerOf<Event>;
    onInput?: EventListenerOf<Event>;
    
    // Clipboard events
    //
    // Ought to be <ClipboardEvent>
    onCopy?: EventListenerOf<Event>;
    onCut?: EventListenerOf<Event>;
    onPaste?: EventListenerOf<Event>;
    
    // Drag events
    onDrag?: EventListenerOf<DragEvent>;
    onDragEnd?: EventListenerOf<DragEvent>;
    onDragEnter?: EventListenerOf<DragEvent>;
    onDragExit?: EventListenerOf<DragEvent>;
    onDragLeave?: EventListenerOf<DragEvent>;
    onDragOver?: EventListenerOf<DragEvent>
    onDragStart?: EventListenerOf<DragEvent>;
    onDrop?: EventListenerOf<DragEvent>;
    
    // UI events  
    onScroll?: EventListenerOf<UIEvent>;
    
    // Keyboard events
    onKeyDown?: EventListenerOf<KeyboardEvent>;
    onKeyUp?: EventListenerOf<KeyboardEvent>;
    
    // Mouse events
    onClick?: EventListenerOf<MouseEvent>;
    onDoubleClick?: EventListenerOf<MouseEvent>;
    onContextMenu?: EventListenerOf<MouseEvent>;
    onMouseDown?: EventListenerOf<MouseEvent>;
    onMouseMove?: EventListenerOf<MouseEvent>;
    onMouseOut?: EventListenerOf<MouseEvent>;
    onMouseOver?: EventListenerOf<MouseEvent>;
    onMouseUp?: EventListenerOf<MouseEvent>;
    
    // Form events
    onSubmit?: EventListenerOf<Event>;
    
    // Touch events
    //
    // Ought to be <TouchEvent>s
    onTouchCancel?: EventListenerOf<Event>;
    onTouchEnd?: EventListenerOf<Event>;
    onTouchMove?: EventListenerOf<Event>;
    onTouchStart?: EventListenerOf<Event>;
  }
  
}

