//
//  index.tsx
//  ancilla
// 
//  Created by Wess Cope (wess@frenzylabs.com) on 01/02/20
//  Copyright 2019 FrenzyLabs, LLC.
//

import React from 'react'

import {
  Pane,
  Modal
} from 'evergreen-ui'

import {
  Local
} from './sections'

import AuthForm from '../services/layerkeep/form'

export default class Files extends React.Component {

  state = {
    showingAuth:    false,
    authenticated:  false,
  }

  get showingAuth():boolean {
    return this.state.showingAuth
  }

  set showingAuth(val:boolean) {
    this.setState({
      ...this.state,
      showingAuth: val
    })
  }

  get authenticated():boolean {
    return this.state.authenticated
  }

  set authenticated(val:boolean) {
    this.setState({
      ...this.state,
      authenticated: val
    })
  }

  constructor(props:any) {
    super(props)
  }

  render() {
    return (
      <Pane>
        <div className="scrollable-content" >
          <Local/>
        </div>
      </Pane>
    )
  }
}
