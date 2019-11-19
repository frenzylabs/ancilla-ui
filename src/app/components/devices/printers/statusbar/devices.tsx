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

export default class Devices extends React.Component {
  power(){
    if (this.props.printer.state.connected) {
      var res = PubSub.publishSync(this.props.node.name + ".request", [this.props.printer.name, "REQUEST.close"])
    } else {
      var res = PubSub.publishSync(this.props.node.name + ".request", [this.props.printer.name, "REQUEST.connect"])
    }
  }

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
