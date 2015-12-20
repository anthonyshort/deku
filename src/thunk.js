// import {isThunk, isText} from './utils'
// import each from 'component-each'
//
// export let renderThunk = (thunk) => {
//   if (!isThunk(thunk)) throw new Error('Need to render a thunk')
//   let {render, onCreate} = thunk.component
//   let {attributes, children} = thunk
//   let model = { attributes, children, context, path }
//   if (typeof onCreate === 'function') onCreate(model)
//   return render(model)
// }
//
// export let removeThunks = (vnode) => {
//   if (isText(vnode)) return
//   if (isThunk(vnode)) {
//     let {model, data} = vnode
//     let {render, onDestroy} = vnode.component
//     removeThunks(data)
//     if (typeof onDestroy === 'function') onDestroy(model)
//     return
//   }
//   each(vnode.children, removeThunks)
// }
