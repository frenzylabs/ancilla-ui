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
  TabNavigation,
  Tab,
  IconButton,
  Button,
  Dialog,
  Text,
  Heading,
  Paragraph,
  Position,
  Table,
  Menu,
  Popover,
  toaster
} from 'evergreen-ui'

import CameraRequest 	from '../../network/camera'
import { ServiceHandler } 	from '../../network'
import { PaginatedList } from '../utils/pagination'

import ErrorModal from '../modal/error'

import Form from './form'


import { NodeState, ServiceState, AttachmentModel }  from '../../store/state'


type Props = {  
  node: NodeState, 
  service?: ServiceState,
  location: any,
  match: any,
  previousUrl?: any,
  listUrl?: any
}

type StateProps = {
  loading: boolean,
  cameraRecording: any,
  redirectTo: any,
  parentMatch: any    
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
      parentMatch: null      
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

    this.cancelRequest = CameraRequest.cancelSource();

    
  }

  componentDidMount() {
    
    // }
  }

  componentWillUnmount() {
    if (this.cancelRequest)
      this.cancelRequest.cancel("Left Wifi Page");
  }

  componentDidUpdate(prevProps, prevState) {
  }


  
  
  renderDelete() {
    return (
      <Pane display="flex" borderTop paddingTop={20}>
        <Pane display="flex" flex={1} padding={20} marginBottom={20} className="danger-zone" alignItems="center" flexDirection="row">
          <Pane>
            <Button appearance="primary" intent="danger" height={40} onClick={() => this.deleteRecording()}> Delete </Button>
          </Pane>
        </Pane>
      </Pane>
    )
  }


  renderDialog() {
    // return (<Dialog
    //   isShown={!!this.state.printerCommand}
    //   title={this.state.printerCommand && this.state.printerCommand.command}
    //   confirmLabel="OK"
    //   onCloseComplete={() => this.setState({printerCommand: null})}
    //   hasCancel={false}
    // >
    //     <Pane >{this.state.printerCommand && this.renderCommandResponse(this.state.printerCommand.response)}</Pane>

    // </Dialog>)
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
  // <Link to={"/cameras/" + this.props.service.id}>{this.props.service.name}</Link>&nbsp; / &nbsp;
  //             <Link to={"/cameras/" + this.props.service.id + "/recordings"}>Recordings</Link>&nbsp; / &nbsp;
  render() {

    return ( 
      <Pane padding={40}>
        <Pane display="flex" is="section" justifyContent="center" background="white" borderRadius={3} border>
          <Pane  padding={30} paddingBottom={0}>
            <Pane alignItems="center" display="flex" marginBottom={20}>
              <Heading size={700}>Add Wifi Connection</Heading>
            </Pane>
          
            <Pane alignItems="center" display="flex">
              <Form ref={frm => this.form = frm} node={this.props.node} />        
            </Pane>
          </Pane>         
        </Pane>

      </Pane>
    )
  }	
}

export default WifiShow
