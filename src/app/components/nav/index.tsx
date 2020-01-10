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
  Dialog,
  SideSheet,
  Paragraph,
  Heading,
  Position
} from 'evergreen-ui'


import { string } from 'prop-types'

import { NodeState } from '../../store/state'

type Props = {
  nodes: any,
  node: NodeState
}

export default class Nav extends React.Component<Props> {
  state = {
    isSettingsShowing: false,
    isShown: false
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
  renderNodes() {
    return this.props.nodes.map((node) => {
      var current = ""
      if (node == this.props.node)
        current = "Current: "
      return (
        <Pane key={`${node.url}`}>
          <a href={`${node.url}`}>{node.name}</a> {current} 
        </Pane>)
    })
  }

  render() {
    return (
      <Pane height="100%" display="flex" flexDirection="column" background="#234361">
        <Menu className="left-menu">
          {this.renderMenuItem('application', '/', true)}
          {this.renderMenuItem('graph', () => this.setState({isShown: true}) )} 
        </Menu>

        <Pane display="flex" margin="auto">&nbsp;</Pane>

        <Pane>
          {this.renderSettingsItem()}
        </Pane>

        <SideSheet
          isShown={this.state.isShown}
          onCloseComplete={() => this.setState({ isShown: false })}
          position={Position.LEFT}
          width={400}
        >
          <Pane zIndex={1} flexShrink={0} elevation={0} backgroundColor="white">
            <Pane padding={16}>
              <Heading size={800}>Ancilla Nodes</Heading>
              {this.state.isShown ? this.renderNodes() : ""}
            </Pane>
          </Pane>          
        </SideSheet>

      </Pane>
    )
  }
}
