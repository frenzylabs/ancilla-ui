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
  toaster
} from 'evergreen-ui'

import {
  Local, LayerKeep
} from './sections'

import Modal              from '../modal/index'

import AuthForm from '../services/layerkeep/form'

import { NodeState }  from '../../store/state'

type Props = {
  node: NodeState
}


export default class Files extends React.Component<Props> {

  state = {
    showingAuth:    false,
    authenticated:  false,
  }


  constructor(props:any) {
    super(props)
    this.showAuth = this.showAuth.bind(this)
    this.setLKAuth = this.setLKAuth.bind(this)
  }

  componentDidMount() {
    this.setLKAuth()
  }

  componentDidUpdate(prevProps, prevState) {
    if (prevProps.node != this.props.node)
      this.setLKAuth()
    
    // prevProps
    // var prevLKService = prevProps.node.services.find((s) => s.kind == "layerkeep")
  }

  setLKAuth() {
    var lkservice = this.props.node.services.find((s) => s.kind == "layerkeep")
    if (lkservice) {
      if ((((lkservice.model.settings || {})['auth'] || {}).token || {}).access_token) {
        this.authenticated = true
        return
      }
    }
    this.authenticated = false
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

  showAuth() {
    this.showingAuth = true
  }

  getLocalService() {
    return this.props.node.services.find((s) => s.kind == "file")
  }

  render() {
    return (
      <Pane>
        <Pane className="scrollable-content" >
          <Local node={this.props.node} service={this.getLocalService()} showAuth={this.showAuth} authenticated={this.state.authenticated}/>
          <LayerKeep node={this.props.node} showAuth={this.showAuth} authenticated={this.state.authenticated} />
        </Pane>
        <Modal
          component={AuthForm}
          node={this.props.node}
          // requestError={this.state.requestError}
          isActive={this.state.showingAuth}
          dismissAction={() => this.showingAuth = false}
          onAuthenticated={(res) => {
            this.setState({
              ...this.state,
              showingAuth: false,
              authenticated: true
            })

            toaster.success('Succssfully signed in to LayerKeep.com')
          }}
        />
        
      </Pane>
    )
  }
}
