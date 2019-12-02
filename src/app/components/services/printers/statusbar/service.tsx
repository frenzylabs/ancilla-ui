//
//  devices.tsx
//  ancilla
// 
//  Created by Wess Cope (me@wess.io) on 11/08/19
//  Copyright 2019 Wess Cope
//

import React from 'react'
import PubSub from 'pubsub-js'

import {
  Pane,
	IconButton,
	Popover,
	Menu,
	Position,
	Text
} from 'evergreen-ui'

import { PrinterHandler } from '../../../../network'
import { PrinterState } from '../../../../store/reducers/printers'

export default class Service extends React.Component<{status?: string, printer: PrinterState, node: object}> {
	power(){
    if (this.props.service.state.connected) {
      PrinterHandler.disconnect(this.props.node, this.props.service)
      .then((response) => {
        console.log("disconnected", response)
      })
      // var res = PubSub.publishSync(this.props.node.name + ".request", [this.props.camera.name, "REQUEST.close"])
    } else {
      PrinterHandler.connect(this.props.node, this.props.service)
      .then((response) => {
        console.log("CONNECT resp ", response)
        // var attachments = this.state.attachments
        // var f = response.data.attachment
        // attachments = attachments.concat(f)
        // this.setState({
        //   loading: false,
        //   attachments: attachments
        // })
  
        // toaster.success(`Attachment ${f.name} has been successfully added`)
        // closeDialog()
      })
      .catch((error) => {
        console.log(error)
        // this.setState({
        //   loading: false,
        // })
        // let errors = Object.keys(error.response.data.errors).map((key, index) => {
        //   return  `${key} : ${error.response.data.errors[key]}<br/>`
        // })
  
        // toaster.danger(
        //   `Unable to save attachment ${JSON.stringify(attachment)}`, 
        //   {description: errors}
        // )
      })
      // var res = PubSub.publishSync(this.props.node.name + ".request", [this.props.camera.name, "REQUEST.connect"])
    }
	}
	
  // power(){
  //   if (this.props.printer.state.connected) {
  //     var res = PubSub.publishSync(this.props.node.name + ".request", [this.props.printer.name, "REQUEST.close"])
  //   } else {
  //     var res = PubSub.publishSync(this.props.node.name + ".request", [this.props.printer.name, "REQUEST.connect"])
  //   }
  // }

	settingsMenu() {
		return (
			<Menu>
				<Menu.Group>
					<Menu.Item>
						Edit
					</Menu.Item>
				</Menu.Group>
				<Menu.Divider />
				<Menu.Group>
					<Menu.Item>
						<Text color="red">Delete</Text>
					</Menu.Item>
				</Menu.Group>
			</Menu>
		)
	}

	renderSettingsMenu() {
		return (
			<Popover position={Position.BOTTOM_RIGHT} content={this.settingsMenu()}>
				<IconButton icon="cog" iconSize={20} appearance="minimal" className="statusBarButton"/>
			</Popover>
		)
	}

  render() {
    return (
      <Pane alignItems="center" display="flex">
        <IconButton icon="power" iconSize={20} appearance="minimal" className="statusBarButton" onClick={this.power.bind(this)}/>
        {this.renderSettingsMenu()}
      </Pane>
    )
  }
}
