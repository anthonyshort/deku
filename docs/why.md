# Why?

### Functional components
Many of the virtual DOM libraries that exist either don't have the concept of components or they focus on hiding state by favouring OOP APIs like classes. Components are a natural way of thinking about pieces of your interface, they're our lego blocks, and they're a first-class feature in Deku. Components allow us to add extra optimizations to the render and add lifecycle hooks to allow the creation of higher-order components.

### No stateful components
React has components but they are stateful which just brings back the same problems we have with the DOM hiding state, except we're putting it in another place. Removing state from the components makes things easier to reason about.

Deku has no opinion about how you store or manage your state unlike React. When something happens within the interface (e.g. a button is clicked) you handle the event and let some other part of your application change the state. This is a similar approach to Elm and makes Deku a natural fit for state management containers like Redux.

### No peer dependency problems
Many of the pieces of React are coupled so components usually need to deal with peer dependencies. This is code smell and it's difficult to deal with in large projects. In Deku, components have no knowledge of the renderer itself, they are just plain objects and functions and the virtual element feature is separate.

### Easy to learn
The API and concepts will be really easy to learn if you've used React. We have many of the same features, like lifecycle hooks, but we've apporached it in a functional way.
