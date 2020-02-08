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
  Icon,
  Button,
  Spinner
} from 'evergreen-ui'

import { NodeState, ServiceState }  from '../../../store/state'

type Props = {
  service: ServiceState,
  status: string,
  powerOption?: object,
  powerAction?: Function,
  settingsAction?: Function,
  renderTitle?: Function
}


export default class Statusbar extends React.Component<Props> {
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

  renderOptionState(icon, option) {
    if (option) {
      if (this.props.powerOption["state"] == "waiting") {
      return (<Button appearance="minimal" intent="none" marginTop={5} padding={0}><Spinner size={28}/></Button>)
      }
      if (this.props.powerOption["action"]) {
        return this.renderOption(icon, this.props.powerOption["action"])
      }
    } 
  }

  renderTitle() {
    if (this.props.renderTitle) {
      return this.props.renderTitle()
    } else {
      return this.props.service.name
    }
  }
  render() {
    return (
      <Pane background="#122330" height={42} width="100%" display="flex" paddingLeft={20} paddingRight={20}>
        <Pane flex={1} alignItems="center" display="flex">
          <Icon icon="dot" size={22} color={this.props.status || "red"}/>
          <Text color="muted">
            {this.props.service.kind.charAt(0).toUpperCase() + this.props.service.kind.slice(1) }: &nbsp;
            <Strong color="rgba(255.0, 255.0, 255.0, 0.8)">{this.renderTitle()}</Strong>
          </Text>
        </Pane>

        <Pane display="flex">
          {this.props.powerOption &&  this.renderOptionState("power", this.props.powerOption)}
          {this.props.powerAction &&  this.renderOption("power", this.props.powerAction)}
          {this.props.settingsAction && this.renderOption("cog", this.props.settingsAction)}
        </Pane>
      </Pane>
    )
  }
}
