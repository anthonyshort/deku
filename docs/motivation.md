# Motivation

React provides a great developer experience and enables a functional approach to rendering interfaces. However, it's just OOP in disguise. You're still hiding and encapsulating state within components, so you still run into the same problem of tracking down state changes and side-effects.

This is great to help people switch to this new paradigm, but it's possible to remove a lot of complexity by avoiding older browsers and classical style.

Deku has no opinion about how you store or manage your state unlike React. When something happens within the interface (e.g. a button is clicked) you handle the event and let some other part of your application change the state. This is a similar approach to Elm and makes Deku a natural fit for state management containers like Redux.

The API was heavily based on React, and owes a lot of the recent internal changes to [virtex](https://github.com/ashaffer/virtex) and [snabbdom](https://github.com/paldepind/snabbdom).
