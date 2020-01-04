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

// import Form 				from './form'
import CameraRequest 	from '../../network/camera'
import Layerkeep 	from '../../network/layerkeep'
import Modal from '../modal/index'
import AuthForm from '../services/layerkeep/form'
import { PaginatedList } from '../utils/pagination'

import ErrorModal from '../modal/error'


// const qs = require('qs');

export class RecordingShow extends React.Component {

  state = {    
    isLoading: true,
    cameraRecording: null,
    redirectTo: null,
    showAuth: false,
    filter: {
      name: ""
    },
    search: {
      page: Number, 
      per_page: Number, 
      q: {name: undefined}
    },
    commands: {
      data: [],
      meta: {}
    }
  }

  timer:number = null

  form:Form = {}
  cancelRequest = null
  
  constructor(props:any) {
    super(props)
    // var qparams = qs.parse(this.props.location.search, { ignoreQueryPrefix: true })

    this.state = {    
      isLoading: true,
      cameraRecording: null,
      redirectTo: null,
      filter: {
        name: ""
      },
      search: {
        page: 1, //parseInt(qparams["page"] || 1), 
        per_page: 20, //parseInt(qparams["per_page"] || 20), 
        q: {name: ""} //qparams["q"] || {}
      },
      commands: {
        data: [],
        meta: {}
      }
      // printerCommand: null
    }
    this.getRecording       = this.getRecording.bind(this)
    this.onChangePage       = this.onChangePage.bind(this)
    this.renderPagination   = this.renderPagination.bind(this)
    this.handleFilterChange = this.handleFilterChange.bind(this)
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

    window.ps = this
  }

  componentDidMount() {
    if (this.props.location.state && this.props.location.state.cameraRecording) {
      this.setState({cameraRecording: this.props.location.state.cameraRecording})
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
    if (JSON.stringify(this.state.search) != JSON.stringify(prevState.search)) {
      // var url = qs.stringify(this.state.search, { addQueryPrefix: true });      
      // this.getPrintCommands();
    }
  }

  getRecording() {
    this.setState({loading: true})
    CameraRequest.getRecording(this.props.node, this.props.service, this.props.match.params.cameraId, {cancelToken: this.cancelRequest.token})
    .then((res) => {
      this.setState({
        ...this.state,
        cameraRecording: res.data.data,
        loading: false
      })
    })
    .catch((error) => {
      console.log(error)
      if (error.response && error.response.status == 401) {
        console.log("Unauthorized")
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

  getPrintCommands() {
    this.setState({loading: true})
    var params = {print_id: this.props.match.params.printId}
    CameraRequest.getPrinterCommands(this.props.node, this.props.service, {qs: this.state.search, params: params, cancelToken: this.cancelRequest.token})
    .then((res) => {
      this.setState({
        ...this.state,
        commands: res.data,
        loading: false
      })
    })
    .catch((error) => {
      console.log(error)
      if (error.response && error.response.status == 401) {
        console.log("Unauthorized")
        // this.setState({showAuth: true, loading: false})
        this.setState({loading: false})
      } else {
        // this.setState({requestError: error})
        // toaster.danger(<ErrorModal requestError={error} />)
        this.setState({loading: false})
      }
      this.cancelRequest = PrinterRequest.cancelSource();

      
    })
  }

  syncToLayerkeep() {
    // let lkslice  = e.currentTarget.getAttribute('data-row')
    

    PrinterRequest.syncPrintToLayerkeep(this.props.node, this.props.service, this.state.cameraRecording.id)
    .then((res) => {
      // this.listLocal()

      toaster.success(`${this.state.cameraRecording} has been successfully synced.`)
    })
    .catch((_err) => {})
  }

  filterList() {
    if (this.state.loading && this.cancelRequest) {
      this.cancelRequest.cancel()
    }
    var search = this.state.search
    this.setState({ search: {...search, page: 1, q: {...search.q, ...this.state.filter} }})
  }

  deleteRecording() {
    CameraRequest.deleteRecording(this.props.node, this.props.service, this.state.cameraRecording.id)
    .then((res) => {

      this.setState({redirectTo: `/cameras/${this.props.service.id}/recordings`})
    })
    .catch((error) => {
      toaster.danger(<ErrorModal requestError={error} />)
      // toaster.danger(`${this.state.printer_print.name} could not be deleted.`)
    })
  }

  handleFilterChange(val) {    
    if (this.timer) {
      clearTimeout(this.timer)
    }
    this.timer = setTimeout(this.filterList.bind(this), 500);
    this.setState({ filter: {...this.state.filter, name: val}})
    // if (this.state.loading && this.cancelRequest) {
    //   this.cancelRequest.cancel()
    // }
    // var search = this.state.search
    // this.setState({ search: {...search, page: 1, q: {...search.q, name: val} }})
    // this.filterchange = 
    // this.setState({ search: {...search, page: 1, q: {...search.q, project_id: item["id"]} }})
  }

  onChangePage(page) {
    this.setState({ search: {...this.state.search, page: page }});    
  }

  showResponse(row) {
    this.setState({printerCommand: row})
  } 


  renderRowMenu = (row) => {
    return (
      <Menu>
        <Menu.Group>
          <Menu.Item onSelect={() => this.syncToLayerkeep(row)}>Sync to Layerkeep...</Menu.Item>
        </Menu.Group>
        <Menu.Divider />
        <Menu.Group>
          <Menu.Item intent="danger"  data-id={row.id} data-name={row.name} onSelect={this.deleteFile}>
            Delete... 
          </Menu.Item>
        </Menu.Group>
      </Menu>
    )
  }

  renderCommandRows(files) {
    return files.map((row, index) => (
      <Table.Row key={row.id} isSelectable >
        <Table.TextCell>{row.command}</Table.TextCell>
        <Table.TextCell>{row.status}</Table.TextCell>        
        <Table.TextCell onClick={() => this.showResponse(row)}>{row.response}</Table.TextCell>
        <Table.TextCell width={210} flex="none">{Dayjs.unix(row.created_at).format('MM.d.YYYY - hh:mm:ss a')}</Table.TextCell>
      </Table.Row>
    ))
  }
  renderCommandsTable() {

    return (
      <Table>
        <Table.Head>
          <Table.SearchHeaderCell 
            onChange={this.handleFilterChange}
            value={this.state.filter.name}
          />
          <Table.TextHeaderCell >
            Status:
          </Table.TextHeaderCell>
          <Table.TextHeaderCell>
            Response:
          </Table.TextHeaderCell>
          <Table.TextHeaderCell  width={210} flex="none">
            Created At:
          </Table.TextHeaderCell>
        </Table.Head>
        <Table.VirtualBody height={440}>
          {this.renderCommandRows(this.state.commands.data)}
        </Table.VirtualBody>
      </Table>)
  }

  renderPagination() {
    if (this.state.commands.data.length > 0) {
      var {current_page, last_page, total} = this.state.commands.meta;
      return (
        <PaginatedList currentPage={current_page} pageSize={this.state.search.per_page} totalPages={last_page} totalItems={total} onChangePage={this.onChangePage} /> 
      )
    }
  }

  renderCommands() {
    if (this.state.commands.data.length < 1)
      return null
    return (
      <Pane>
        <Pane display="flex" flexDirection="column" width="100%" background="#fff" paddingY={10} paddingX={15} margin={0} borderBottom="default">
            <Heading>Print Commands</Heading>
        </Pane>
        <Pane padding={20}>
          {this.renderCommandsTable()}
        </Pane>
        {this.renderPagination()}
      </Pane>
    )
  }
  renderCameraDetails() {
    if (!this.state.cameraRecording || !this.state.cameraRecording.printer) 
      return null;
    
      
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
                <Paragraph>Name: {this.state.cameraRecording.camera.name}</Paragraph>
                <Paragraph>Endpoint: {this.state.printerPrint.camera.endpoint}</Paragraph>
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

  renderCommandResponse(response) {
    return (response || []).map((r, index) => {
      return (
        <Paragraph key={index}>{r}</Paragraph>
      )
    })
  }
  renderDialog() {
    return (<Dialog
      isShown={!!this.state.printerCommand}
      title={this.state.printerCommand && this.state.printerCommand.command}
      confirmLabel="OK"
      onCloseComplete={() => this.setState({printerCommand: null})}
      hasCancel={false}
    >
        <Pane >{this.state.printerCommand && this.renderCommandResponse(this.state.printerCommand.response)}</Pane>

    </Dialog>)
  }

  renderVideo() {
    if (this.state.cameraRecording && this.state.cameraRecording.video_path) {
      return (
        <Pane>
          <video width="370" height="285" controls src={`${this.props.node.apiUrl}/services/camera/${this.props.service.id}/recordings/${this.state.cameraRecording.id}/video`}></video>
        </Pane>
      )
    }
    return null
  }
  render() {
    if (this.state.redirectTo) {
      return (<Redirect to={this.state.redirectTo} />)
    }
    return (
      <div>
      <Pane display="flex" key={"prints"}>
        <Pane display="flex" flexDirection="column" width="100%" background="#fff" padding={20} margin={20} border="default">
          <Pane display="flex" marginBottom={20}>
            <Pane display="flex" flex={1}>
              <Link to={"/cameras/" + this.props.service.id}>{this.props.service.name}</Link>&nbsp; / &nbsp;
              <Link to={"/cameras/" + this.props.service.id + "/recordings"}>Recordings</Link>&nbsp; / &nbsp;
              {(this.state.cameraRecording && this.state.cameraRecording.id) || ""}
              
            </Pane>
            {this.renderDelete()}

          </Pane>
          
          {this.renderRecordingDetails()}
          {this.renderCameraDetails()}
          

          <Pane borderBottom borderLeft borderRight>
            {this.renderVideo()}
            
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
