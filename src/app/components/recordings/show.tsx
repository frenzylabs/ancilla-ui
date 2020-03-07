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


export class RecordingShow extends React.Component<Props, StateProps> {

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

    this.getRecording       = this.getRecording.bind(this)
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
    if (this.props.location.state) {
      var state = {} 
      if (this.props.location.state.cameraRecording)
        state['cameraRecording'] = this.props.location.state.cameraRecording
      if (this.props.location.state.parentMatch)
        state['parentMatch'] = this.props.location.state.parentMatch

      this.setState(state)
    } 
    // else {
    this.getRecording()
    // this.getPrintCommands()

    // }
  }

  componentWillUnmount() {
    if (this.cancelRequest)
      this.cancelRequest.cancel("Left Prints Page");
  }

  componentDidUpdate(prevProps, prevState) {
  }

  getRecording() {
    this.setState({loading: true})
    ServiceHandler.getRecording(this.props.node, this.props.match.params.recordingId, {cancelToken: this.cancelRequest.token})
    .then((res) => {
      this.setState({
        ...this.state,
        cameraRecording: res.data.data,
        loading: false
      })
    })
    .catch((error) => {
      if (error.response && error.response.status == 401) {
        // this.setState({showAuth: true, loading: false})
        this.setState({loading: false})
      } else {
        // this.setState({requestError: error})
        // toaster.danger(<ErrorModal requestError={error} />)
        this.setState({loading: false})
      }
      this.cancelRequest = CameraRequest.cancelSource();

      
    })
  }

  

  syncToLayerkeep(row) {
    // let lkslice  = e.currentTarget.getAttribute('data-row')
    

    // CameraRequest.syncPrintToLayerkeep(this.props.node, this.props.service, this.state.cameraRecording.id)
    // .then((res) => {
    //   // this.listLocal()

    //   toaster.success(`${this.state.cameraRecording} has been successfully synced.`)
    // })
    // .catch((_err) => {})
  }

  
  deleteRecording() {
    ServiceHandler.deleteRecording(this.props.node, this.state.cameraRecording.id)
    .then((res) => {
      var url = `/cameras/${this.state.cameraRecording.camera.service.id}/recordings`
      if (this.state.parentMatch) {
        url = this.state.parentMatch.url
      }
      // if (this.props.redirectTo)
      //   url = this.props.redirectTo
      this.setState({redirectTo: url})
    })
    .catch((error) => {
      toaster.danger(<ErrorModal requestError={error} />)
      // toaster.danger(`${this.state.printer_print.name} could not be deleted.`)
    })
  }


  renderCameraDetails() {
    if (!this.state.cameraRecording || !this.state.cameraRecording.camera) 
      return null;
    
    var cam = this.state.cameraRecording.camera
      
    return (
        <Pane
              is="section"
              background="tint2"
              border="default"
              marginLeft={12}
              marginY={24}
              // paddingTop={12}
              
              // width={120}
              // height={120}
              // cursor="help"
              // onClick={() => alert('Works just like expected')}
            >
              <Pane display="flex" flexDirection="column" width="100%" background="#fff" paddingY={10} paddingX={15} margin={0} borderBottom="default">
                <Heading>Camera</Heading>
              </Pane>
              <Pane padding={20}>
                <Paragraph>Name: <Link to={`/cameras/${cam.service.id}`}>{cam.name}</Link> </Paragraph>
                <Paragraph>Endpoint: {this.state.cameraRecording.camera.endpoint}</Paragraph>
              </Pane>
          </Pane>
    )
  }

  renderRecordingDetails() {
    if (!this.state.cameraRecording) 
      return null;
    return (
        <Pane
              is="section"
              innerRef={(ref) => {}}
              background="tint2"
              border="default"
              marginLeft={12}
              marginY={24}
            >
              <Pane display="flex" flexDirection="column" width="100%" background="#fff" paddingY={10} paddingX={15} margin={0} borderBottom="default">
                <Heading>Recording Details</Heading>
              </Pane>
              <Pane padding={20}>
                <Paragraph>{this.state.cameraRecording.id}</Paragraph>
                <Paragraph>Status: {this.state.cameraRecording.status}</Paragraph>
                <Paragraph>Started At: {Dayjs.unix(this.state.cameraRecording.created_at).format('MM.d.YYYY - hh:mm:ss a')}</Paragraph>
                <Paragraph>Duration: {(this.state.cameraRecording.updated_at - this.state.cameraRecording.created_at)}</Paragraph>                
              </Pane>
          </Pane>
    )
  }

  renderPrintDetails() {
    if (!this.state.cameraRecording || !this.state.cameraRecording.print) 
      return null;
    var prnt = this.state.cameraRecording.print
    return (
        <Pane
              is="section"
              innerRef={(ref) => {}}
              background="tint2"
              border="default"
              marginLeft={12}
              marginY={24}
            >
              <Pane display="flex" flexDirection="column" width="100%" background="#fff" paddingY={10} paddingX={15} margin={0} borderBottom="default">
                <Heading>Print Details</Heading>
              </Pane>
              <Pane padding={20}>
                <Paragraph>Name: <Link to={`/printers/${prnt.printer.service.id}/prints/${prnt.id}`}>{prnt.name}</Link> </Paragraph>
                <Paragraph>Status: {this.state.cameraRecording.print.status}</Paragraph>
              </Pane>
          </Pane>
    )
  }

  renderDelete() {
    return (
      <Pane display="flex" borderTop >
        <Pane display="flex" flex={1} padding={20} marginBottom={20} className="" alignItems="center" flexDirection="row">
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

  renderVideo() {
    if (this.state.cameraRecording && this.state.cameraRecording.video_path) {
      return (
        <Pane>
          <video width="370" height="285" controls src={`${this.props.node.apiUrl}/recordings/${this.state.cameraRecording.id}/video`}></video>
        </Pane>
      )
    }
    return null
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
    if (this.state.redirectTo) {
      return (<Redirect to={this.state.redirectTo} />)
    }
    return (
      <div className={"scrollable-content"}>
      <Pane display="flex" key={"prints"}>
        <Pane display="flex" flexDirection="column" width="100%" background="#fff" padding={20} margin={20} border="default">
          <Pane display="flex" marginBottom={20}>
            <Pane display="flex" flex={1}>
              {this.renderHeaderLinks()}              
              {(this.state.cameraRecording && this.state.cameraRecording.id) || ""}
              
            </Pane>
            {this.renderDelete()}

          </Pane>
          <Pane display="flex" flex={1} style={{"flexWrap": "wrap"}}>
            <Pane margin={20}>
              {this.renderVideo()}
              
            </Pane>
            <Pane display="flex" flexDirection="column" flex={1}>
              {this.renderRecordingDetails()}
              {this.renderCameraDetails()}
              {this.renderPrintDetails()}
            </Pane>

          </Pane>
          
          
          

          
          
        </Pane>
      </Pane>
      {this.renderDialog()}
      {/* <Modal
          component={AuthForm}
          node={this.props.node}
          // requestError={this.state.requestError}
          isActive={this.state.showAuth}
          // dismissAction={this.authenticated.bind(this)}
          // onAuthenticated={this.authenticated.bind(this)}
        /> */}
      </div>
    )
  }	
}

export default RecordingShow
