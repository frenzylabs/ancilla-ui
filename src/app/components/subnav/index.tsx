//
//  index.ts
//  ancilla
// 
//  Created by Wess Cope (me@wess.io) on 10/31/19
//  Copyright 2019 Wess Cope
//

import React from 'react'

import { Link } from 'react-router-dom'

import {
  Pane,
  Popover,
  Position,
  Menu,
  IconButton,
  Icon,
  Dialog,
  TextInput,
  Combobox,
  toaster
} from 'evergreen-ui'

import Tree from '../tree'

import {
  Printer
} from '../../models'

import printer, {default as request} from '../../network/printer'

import {
  Printers,
  Cameras
} from './sections'

import { NodeState, ServiceState, AttachmentModel }  from '../../store/state'


type Props = {  
  node: NodeState, 
  location: any,
  match: any,
  history: any
}

// type StateProps = {
//   loading: boolean,
//   cameraRecording: any,
//   redirectTo: any,
//   parentMatch: any    
// }


export default class SubNav extends React.Component<Props> {
	constructor(props:any) {
		super(props)

		this.filesSelected = this.filesSelected.bind(this)
	}

  componentDidMount() {
	}
	
	filesSelected() {
		this.props.history.push('/files')
  }
  
  
  renderCurrentNode() {
    return (
      <Pane  height={42} width="100%" display="flex" padding={10} color={"white"} borderBottom={"default"} borderWidth={2} borderColor={"#234361"}>
          <Pane  flex={1}>{this.props.node.name}</Pane> 
          
          <Link to={`/node/settings`} color={"white"} ><Icon color={"white"} icon="cog"></Icon></Link>
        </Pane>
    )
  }
  renderCurrentNodeDrop() {
    return (
      <Popover
        position={Position.BOTTOM_LEFT}
        content={({ close }) => (
          <Menu>
            <Menu.Group>
              <Menu.Item icon="blank">{this.props.node.server || this.props.node.networkName}</Menu.Item>
              
              <Menu.Item icon="cog" onSelect={() => close()}>
                <Link to={`/node/settings`}>Settings</Link>
              </Menu.Item>
            </Menu.Group>
            <Menu.Divider />
            {/* <Menu.Group title="destructive">
              <Menu.Item icon="trash" intent="danger">
                Delete...
              </Menu.Item>
            </Menu.Group> */}
          </Menu>
        )}
      >
        <Pane  height={42} width="100%" display="flex" padding={10} color={"white"} borderBottom={"default"} borderWidth={2} borderColor={"#234361"}>
          <Pane  flex={1}>{this.props.node.name}</Pane> <Icon icon="chevron-down"></Icon>
        </Pane>
      </Popover>
    )
  }

  render() {
    return (
      <Pane margin={0} padding={0} height="100%" display="flex" flexDirection="column" background="#425A70">
        <Pane >
          {this.renderCurrentNode()}
        </Pane>
        <Pane width={180} padding={0} margin={0}>
          <br/>
          <Printers {...this.props} />
          <Cameras {...this.props} />
          {/*<Files {...this.props}/>*/}
					<Tree.Node name="Sliced Files" item={{"name": "Files"}} selectItem={this.filesSelected}/>
        </Pane>

      </Pane>
    )
  }
}

