//
//  index.tsx
//  ancilla
// 
//  Created by Wess Cope (me@wess.io) on 12/05/19
//  Copyright 2019 Wess Cope
//

import React from 'react'

import {
  Pane,
  Text,
  Strong,
  IconButton,
  Icon
} from 'evergreen-ui'

export default class Statusbar extends React.Component {
  renderOption(icon, target) {
    return (
      <IconButton 
        icon={icon} 
        iconSize={20} 
        appearance="minimal" 
        className="statusBarButton"
        onClick={target}
        marginTop={5}
      />
    )
  }

  render() {
    return (
      <Pane background="#122330" height={42} width="100%" display="flex" paddingLeft={20} paddingRight={20}>
        <Pane flex={1} alignItems="center" display="flex">
          <Icon icon="dot" size={22} color={this.props.status || "red"}/>
          <Text color="muted">
            {this.props.service.kind.charAt(0).toUpperCase() + this.props.service.kind.slice(1) }: &nbsp;
            <Strong color="rgba(255.0, 255.0, 255.0, 0.8)">{this.props.service.name}</Strong>
          </Text>
        </Pane>

        <Pane display="flex">
          {this.props.powerAction &&  this.renderOption("power", this.props.powerAction)}
          {this.props.settingsAction && this.renderOption("cog", this.props.settingsAction)}
        </Pane>
      </Pane>
    )
  }
}
