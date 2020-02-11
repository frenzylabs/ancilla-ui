//
//  show.tsx
//  ancilla
// 
//  Created by Kevin Musselman (kevin@frenzylabs.com) on 12/31/19
//  Copyright 2019 FrenzyLabs, LLC.
//


import React from 'react'
import { Link, Redirect }       from 'react-router-dom';
import Dayjs from 'dayjs'

import {
  Pane,
  Icon,
  TabNavigation,
  Tab,
  IconButton,
  Button,
  Dialog,
  Text,
  Strong,
  Heading,
  Paragraph,
  Position,
  Table,
  Menu,
  Popover,
  toaster
} from 'evergreen-ui'

import CameraRequest 	from '../../network/camera'
import { WifiHandler, SystemHandler } 	from '../../network'
import { PaginatedList } from '../utils/pagination'

import ErrorModal from '../modal/error'

import Form from './form'


import { NodeState, ServiceState, AttachmentModel }  from '../../store/state'


type Props = {  
  node: NodeState, 
  service?: ServiceState,
  previousUrl?: any,
  listUrl?: any
}

type StateProps = {
  loading: boolean,
  cameraRecording: any,
  redirectTo: any,
  parentMatch: any,
  wifi: any,
  networkConnected: boolean,
  wifiOn: boolean
}


export class WifiShow extends React.Component<Props, StateProps> {

  timer:number = null

  cancelRequest = null
  
  constructor(props:any) {
    super(props)
    // var qparams = qs.parse(this.props.location.search, { ignoreQueryPrefix: true })

    this.state = {    
      loading: true,
      cameraRecording: null,
      redirectTo: null,
      parentMatch: null,
      wifi: null,
      networkConnected: false,
      wifiOn: false  
    }

    // this.onChangePage       = this.onChangePage.bind(this)
    // this.renderPagination   = this.renderPagination.bind(this)
    // this.handleFilterChange = this.handleFilterChange.bind(this)
    // this.syncToLayerkeep    = this.syncToLayerkeep.bind(this)
    // this.deleteFile     = this.deleteFile.bind(this)
    // this.saveFile				= this.saveFile.bind(this)
    // this.toggleDialog		= this.toggleDialog.bind(this)
    // this.renderRow 			= this.renderRow.bind(this)
    // this.renderGroup 		= this.renderGroup.bind(this)
    // this.renderGroups		= this.renderGroups.bind(this)
    // this.renderTopBar		= this.renderTopBar.bind(this)
    // this.renderSection	= this.renderSection.bind(this)

    this.networkStatus     = this.networkStatus.bind(this)
    this.toggleAccessPoint = this.toggleAccessPoint.bind(this)
    this.cancelRequest     = WifiHandler.cancelSource()

    
  }

  componentDidMount() {
    this.getSystemConfig()
    this.networkStatus()
    
    // }
  }

  componentWillUnmount() {
    if (this.cancelRequest)
      this.cancelRequest.cancel("Left Wifi Page")
  }

  componentDidUpdate(prevProps, prevState) {
  }

  getSystemConfig() {
    SystemHandler.getConfig(this.props.node, {timeout: 2000})
    .then((res) => {
      this.setState({wifiOn: (res.data.data.system["wifion"] || false)})
    })
    .catch((error) => {
      this.setState({networkConnected: false})
      // this.timer = setTimeout(this.getSystemConfig.bind(this), RetryNetworkInterval);
      // toaster.danger(<ErrorModal requestError={error} />)
    })
  }

  toggleAccessPoint() {
    var newwifistate = !this.state.wifiOn
    SystemHandler.toggleWifi(this.props.node, {"wifi": newwifistate})
    .then((res) => {
      this.setState({wifiOn: newwifistate})
      toaster.success(`Wifi Access Point will be turned ${newwifistate ? "on" : "off"}`)
      // this.setState({networkConnected: false, restarting: true})
      // this.timer = setTimeout(this.getSystemConfig.bind(this), RetryNetworkInterval);
    })
    .catch((error) => {
      toaster.danger(<ErrorModal requestError={error} />)
    })
  }

  networkStatus() {
    WifiHandler.status(this.props.node, { cancelToken: this.cancelRequest.token })
    .then((response) => {
        if (response.data && response.data.data) {
          this.setState({wifi: response.data.data.payload})
        }
    })
    .catch((error) => {
        console.log(error)
    })
  }

  
  

  renderHeaderLinks() {
    if (!this.state.cameraRecording) return null

    var parentUrl = `/cameras/${this.state.cameraRecording.camera.service.id}`
    var parentName = this.state.cameraRecording.camera.name
    var listUrl = `/cameras/${this.state.cameraRecording.camera.service.id}/recordings`

    if (this.state.parentMatch) {
      listUrl = this.state.parentMatch.url
      if (this.state.parentMatch.params['service'] == 'printers') {
        var prnt = this.state.cameraRecording.print
        parentUrl = `/printers/${this.state.parentMatch.params['serviceId']}/prints`
        parentName = `${prnt.printer.name} Prints`
      }
    }

    return (
      <React.Fragment>
        <Link to={parentUrl}>{parentName}</Link> &nbsp; / &nbsp;
        <Link to={listUrl}>Recordings</Link>&nbsp; / &nbsp;
      </React.Fragment>
    )
  }
  renderCurrentStatus() {
    if (this.state.wifi) {
      var color = "red"
      if (this.state.wifi.wpa_state == "COMPLETED") {
        color = "green"
      }
      return (
        <Pane background="#122330" height={42} width="100%" display="flex" paddingLeft={20} paddingRight={20}>
          <Pane flex={1} alignItems="center" display="flex">
            <Icon icon="dot" size={22} color={color}/>
            <Strong color="rgba(255.0, 255.0, 255.0, 0.8)">{this.state.wifi.ssid}  &nbsp;  &nbsp;</Strong>
            <Text color="muted">
              {this.state.wifi.ip_address || "" }
              
            </Text>
          </Pane>
        </Pane>        
      )
    }
    return null
  }

  renderAccessPoint() {
    var disabled = !this.state.networkConnected
    var txt = ''
    if (this.state.wifiOn) {
      txt = "Turn Access Point Off"
    } else {
      txt = "Turn Access Point On"
    }
    return (
      <Pane margin={20} padding={20} background="white" elevation={1} border >
        <Heading size={600}>{"Access Point"} {this.state.wifiOn ? "On" : "Off"}</Heading>
        <Pane>
          <Paragraph size={300} marginTop="10px">
              This only works if you downloaded the image from ancilla or you 
              installed the ancilla.service startup script on your system.
          </Paragraph>
        </Pane>
        
        <Pane display="flex" flexDirection="column" borderTop marginTop={10} paddingTop={10}>
          <Button onClick={this.toggleAccessPoint}>{txt}</Button>
        </Pane>
      </Pane>
    )
  }
  // <Link to={"/cameras/" + this.props.service.id}>{this.props.service.name}</Link>&nbsp; / &nbsp;
  //             <Link to={"/cameras/" + this.props.service.id + "/recordings"}>Recordings</Link>&nbsp; / &nbsp;
  render() {

    return ( 
      <Pane>
        <Pane padding={20}>
          {this.renderCurrentStatus()}
          <Pane display="flex" is="section" justifyContent="center" background="white" borderRadius={3} border>
            
            <Pane  padding={30} paddingBottom={0}>
              <Pane alignItems="center" display="flex" marginBottom={20}>
                <Heading size={700}>Add Wifi Connection</Heading>
              </Pane>
            
              <Pane alignItems="center" display="flex">
                <Form node={this.props.node} onSave={this.networkStatus}/>
              </Pane>
            </Pane>         
          </Pane>
        </Pane>
        {this.renderAccessPoint()}
      </Pane>

    )
  }	
}

export default WifiShow
