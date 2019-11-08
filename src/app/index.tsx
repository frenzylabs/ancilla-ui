//
//  index.tsx
//  ancilla
// 
//  Created by Wess Cope (me@wess.io) on 10/30/19
//  Copyright 2019 Wess Cope
//

import "./styles/app.scss"
import {connect}  from 'react-redux'

import SplitPane from 'react-split-pane'

import {
  Pane
} from 'evergreen-ui'

import React  from 'react'
import {
  Nav,
  SubNav,
  Statusbar,
  Summary,
  Terminal
} from './components'

export class App extends React.Component {
  constructor(props:any) {
    super(props)    

    // this.toggleDialog = this.toggleDialog.bind(this)
    // this.savePrinter  = this.savePrinter.bind(this)
    // this.getPrinters  = this.getPrinters.bind(this)
  }

  componentDidMount() {
    // this.getPrinters()
  }

  render() {
    return (
      <Pane display="flex" flex={1} height="100%">
        <Pane display="flex" flex={0}>
          <Nav/>
          <SubNav {...this.props} />
        </Pane>

        <Pane background='#f6f6f6' width="100%" display="flex" flexDirection="column">
          <Statusbar/>
          <Summary/>
          <Terminal/>
        </Pane>
      </Pane>
    )
  }
}


const mapStateToProps = (state) => {
  return state
  // return {
  //   details: state.notification.notification
  // }
}

export default connect(mapStateToProps)(App)