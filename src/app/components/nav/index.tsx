//
//  index.tsx
//  ancilla
// 
//  Created by Wess Cope (me@wess.io) on 10/30/19
//  Copyright 2019 Wess Cope
//

import React from 'react'

import {
  Pane,
  Menu,
  Icon,
  Dialog
} from 'evergreen-ui'

import Action from './action'
import { string } from 'prop-types'

export default class Nav extends React.Component {
  state = {
    isSettingsShowing: false
  }

  constructor(props) {
    super(props)

    this.homeAction         = this.homeAction.bind(this)
    this.nodesAction        = this.nodesAction.bind(this)
    this.settingsAction     = this.settingsAction.bind(this)
    this.renderMenuItem     = this.renderMenuItem.bind(this)
    this.renderSettingsItem = this.renderSettingsItem.bind(this)

  }

  homeAction() {
  }

  nodesAction() {
  }

  settingsAction() {
    this.setState({
      isSettingsShowing: true
    })
  }

  renderMenuItem(icon:string, action:string|Function, active:boolean = false, hasAdd:boolean = false) {
    let props = {
      padding:      6,
      marginTop:    14,
      marginBottom: 14,
      color:        active ? "#F9F9FB" : "#C7CED4",
    }

    if(typeof action === "string") {
      props['is']   = 'a'
      props['href'] = action
    } else {
      props['onSelect'] = action
    }

    return (
      <Menu.Item {...props} padding={0}>
        <Icon icon={icon} size={20}/>
      </Menu.Item>
    )
  }

  renderSettingsItem() {
    return (
      <React.Fragment>
        <Dialog 
          isShown={this.state.isSettingsShowing} 
          title="Settings" 
          onCloseComplete={() => this.setState({isSettingsShowing: false})}
          confirmLabel="Save"
        >
          Content
        </Dialog>

        {this.renderMenuItem('cog', this.settingsAction)}
      </React.Fragment>
    )
  }

  render() {
    return (
      <Pane height="100%" display="flex" flexDirection="column" background="#234361">
        <Menu className="left-menu">
          {this.renderMenuItem('application', '/', true)}
          {this.renderMenuItem('graph', '/nodes')} 
        </Menu>

        <Pane display="flex" margin="auto">&nbsp;</Pane>

        <Pane>
          {this.renderSettingsItem()}
        </Pane>

      </Pane>
    )
  }
}
