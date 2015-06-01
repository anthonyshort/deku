/** @jsx dom */

import {mount,div} from '../helpers'
import {component,render,deku,dom} from '../../'
import trigger from 'trigger-event'
import raf from 'component-raf'
import assert from 'assert'

it('should call register hook', function(done){
  const App = {
    propTypes: {
      closeOverlay: { source: 'currentCloseHandler' },
      popup: { source: 'currentPopup' }
    },

    render({props}) {
      let {closeOverlay, popup} = props

      return (
        <div class='App' onClick={closeOverlay}>
          <Page/>
          {popup}
        </div>
      )
    }
  }

  const Page = {
    propTypes: {
      openPopup: { source: 'openPopup' }
    },

    render({props}) {
      var openPopup = props.openPopup

      return (
        <div class='Page'>
          <button class='Page-popupButton' onClick={onClick}>Open Popup!</button>
        </div>
      )

      function onClick() {
        openPopup(<Popup>Some stuff</Popup>)
      }
    }
  }

  const Popup = {
    register(app) {
      app.set('openPopup', function(node){
        app.set('currentCloseHandler', close)
        app.set('currentPopup', node)

        function close() {
          app.set('currentPopup', null)
        }
      })
    },

    render({props}) {
      let {children} = props
      return <div class='Popup'>
        {children}
      </div>
    }
  }

  var el = document.createElement('div')
  var app = deku(<App/>)
  app.use(Popup.register)
  render(app, el)
  raf(function(){
    document.body.appendChild(el)
    trigger(el.querySelector('.Page-popupButton'), 'click')
    raf(function(){
      assert(el.querySelector('.Popup'))
      trigger(el.querySelector('.App'), 'click')
      raf(function(){
        assert(!el.querySelector('.Popup'))
        document.body.removeChild(el)
        done()
      })
    })
  })
})
