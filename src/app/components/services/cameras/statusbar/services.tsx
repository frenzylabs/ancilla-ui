//
//  devices.tsx
//  ancilla
// 
//  Created by Wess Cope (me@wess.io) on 11/08/19
//  Copyright 2019 Wess Cope
//

import React from 'react'
import PubSub from 'pubsub-js'
import { CameraHandler } from '../../../../network'

import {
  Pane,
  IconButton,
} from 'evergreen-ui'

export default class Service extends React.Component {
  power(){
    if (this.props.service.state.open) {
      CameraHandler.disconnect(this.props.node, this.props.service)
      .then((response) => {
        console.log("disconnected", response)
      })
      // var res = PubSub.publishSync(this.props.node.name + ".request", [this.props.camera.name, "REQUEST.close"])
    } else {
      CameraHandler.connect(this.props.node, this.props.service)
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

  render() {
    return (
      <Pane alignItems="center" display="flex">
        <IconButton icon="console" iconSize={20} appearance="minimal" className="statusBarButton"/>
        <IconButton icon="power" iconSize={20} appearance="minimal" className="statusBarButton" onClick={this.power.bind(this)}/>
      </Pane>
    )
  }
}
