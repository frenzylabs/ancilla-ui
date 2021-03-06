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
  Position,
  Popover,
  Button,
  IconButton,
  Badge,
  Tablist,
  SidebarTab,
  Tab
} from 'evergreen-ui'


import { string } from 'prop-types'

import { WifiShow } from '../wifi/show'
import SystemSettings from '../settings/system'

import { NodeState } from '../../store/state'

type Props = {
  nodes: any,
  node: NodeState
}

class SystemForm extends React.Component<Props> {

}

export default class Nav extends React.Component<Props> {
  state = {
    isSettingsShowing: false,
    isShown: false,
    tabs: [
      {"key": "Wifi", "component": WifiShow },
      {"key": "System", "component": SystemSettings }
    ],
    selectedSettingsIndex: 0
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
    
     const $component = this.state.tabs[this.state.selectedSettingsIndex].component
    return (
      <React.Fragment>
        <Dialog 
          isShown={this.state.isSettingsShowing} 
          title="Settings" 
          onCloseComplete={() => this.setState({isSettingsShowing: false})}
          confirmLabel="Save"
          width={"750px"}
          hasFooter={false}
        >
          {({ close }) => (
            <Pane display="flex" width="100%" flex={1}>
              <Tablist marginBottom={16} flexBasis={140} marginRight={24}>
                {this.state.tabs.map((tab, index) => {
                  return (
                    <SidebarTab
                    key={tab.key}
                    id={tab.key}
                    onSelect={() => this.setState({ selectedSettingsIndex: index })}
                    isSelected={index === this.state.selectedSettingsIndex}
                    aria-controls={`panel-${tab.key}`}
                  >
                    {tab.key}
                  </SidebarTab>
                  )
                })}
                {/* {this.state.tabs.map((tab, index) => (
                  <SidebarTab
                    key={tab}
                    id={tab}
                    onSelect={() => this.setState({ selectedSettingsIndex: index })}
                    isSelected={index === this.state.selectedSettingsIndex}
                    aria-controls={`panel-${tab}`}
                  >
                    {tab}
                  </SidebarTab>
                ))} */}
              </Tablist>
              <Pane padding={16} background="tint1" flex={1} width="500px">
                
                <$component node={this.props.node} />
                

              {/* {(Object.keys(this.state.tabs) || []).map((tab, index) => {
                if (this.state.tabs[tab]) {
                  return 
                }
                {this.state.tabs.map((tab, index) => (
                  <Pane
                    key={tab}
                    id={`panel-${tab}`}
                    role="tabpanel"
                    aria-labelledby={tab}
                    aria-hidden={index !== this.state.selectedSettingsIndex}
                    display={index === this.state.selectedSettingsIndex ? 'block' : 'none'}
                  >
                    <Paragraph>Panel {tab}</Paragraph>
                  </Pane>
                ))} */}
              </Pane>
            </Pane>
          )}
          
          {/* <Pane>
            <Heading>Wifi</Heading>
            <WifiShow node={this.props.node}></WifiShow>
          </Pane>  */}

        </Dialog>

        {this.renderMenuItem('cog', this.settingsAction)}
      </React.Fragment>
    )
  }

  renderNodeInfo(node) {
    return (<Popover
      content={({ close }) => (
        
          <Pane
              is="section"
              background="tint2"
              border="default"
              // paddingX={40}
              marginLeft={0}
              marginY={0}
            >
              <Pane display="flex" flexDirection="column" width="100%" background="#fff" paddingY={10} paddingX={15} margin={0} borderBottom="default">
                <Heading>Network Details</Heading>
              </Pane>
              <Pane padding={20}>
                <Paragraph>Name: <a href={`${node.url}`}>{node.name}</a> </Paragraph>
                <Paragraph>Network Url: <a href={`${node.networkUrl}`}>{node.networkUrl}</a> </Paragraph>
                <Paragraph>Network IP: <a href={`${node.ipUrl}`}>{node.ip}</a> </Paragraph>
              </Pane>
          </Pane>          

        
      )}
    >
      <IconButton icon="info-sign" />
    </Popover>)
  }

  renderNodes() {
    return this.props.nodes.map((node) => {
      var current = (null)
      if (node.uuid == this.props.node.uuid)
        current = (<Badge color="green"><small>current</small></Badge>)
      return (
        <Pane key={`${node.url}`} display="flex" flex={1} alignItems="center">
          <Pane display="flex" flex={1} alignItems="center">
            <a href={`${node.networkUrl}`}>{node.name}</a>
            &nbsp; {current} 
          </Pane>
          
          <Pane>{this.renderNodeInfo(node)}</Pane>
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
