//
//  show.tsx
//  ancilla
// 
//  Created by Kevin Musselman (kevin@frenzylabs.com) on 12/22/19
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
import PrinterRequest 	from '../../network/printer'
import CameraRequest    from '../../network/camera'
import Layerkeep 	from '../../network/layerkeep'
import Modal from '../modal/index'
import AuthForm from '../services/layerkeep/form'
import { PaginatedList } from '../utils/pagination'

import ErrorModal from '../modal/error'

import List from '../table/list'
import CommandsController from './commands_controller'
import RecordingsController from '../recordings/table_controller'
// const qs = require('qs');



import { NodeState, ServiceState, AttachmentModel }  from '../../store/state'


type Props = {  
  node: NodeState, 
  service: ServiceState,
  location: any,
  match: any
}

type StateProps = {
  loading: boolean,
  printerPrint: any,
  redirectTo: any    
}


export class PrintShow extends React.Component<Props, StateProps> {

  

  cancelRequest = null
  
  constructor(props:any) {
    super(props)
    // var qparams = qs.parse(this.props.location.search, { ignoreQueryPrefix: true })

    this.state = {    
      loading: true,
      printerPrint: null,
      redirectTo: null      
    }
    this.getPrint         = this.getPrint.bind(this)
    this.syncToLayerkeep    = this.syncToLayerkeep.bind(this)
    this.getPrintRecordings = this.getPrintRecordings.bind(this)

    this.cancelRequest = PrinterRequest.cancelSource();
    
  }

  componentDidMount() {
    if (this.props.location.state && this.props.location.state.printerPrint) {
      this.setState({printerPrint: this.props.location.state.printerPrint})
    } 
    this.getPrint()
  }

  componentWillUnmount() {
    if (this.cancelRequest)
      this.cancelRequest.cancel("Left Print Show Page");
  }

  componentDidUpdate(prevProps, prevState) {
    // if (JSON.stringify(this.state.search) != JSON.stringify(prevState.search)) {
    //   // var url = qs.stringify(this.state.search, { addQueryPrefix: true });      
    //   this.getPrintCommands();
    // }
  }

  getPrint() {
    this.setState({loading: true})
    PrinterRequest.getPrint(this.props.node, this.props.service, this.props.match.params.printId, {cancelToken: this.cancelRequest.token})
    .then((res) => {
      this.setState({
        ...this.state,
        printerPrint: res.data.data,
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

  getPrintCommands(search = {}) {
    this.setState({loading: true})
    var params = {print_id: this.props.match.params.printId}
    return PrinterRequest.getPrinterCommands(this.props.node, this.props.service, {qs: search, params: params, cancelToken: this.cancelRequest.token})
    // .then((res) => {
    //   this.setState({
    //     ...this.state,
    //     commands: res.data,
    //     loading: false
    //   })
    // })
    // .catch((error) => {
    //   console.log(error)
    //   if (error.response && error.response.status == 401) {
    //     console.log("Unauthorized")
    //     // this.setState({showAuth: true, loading: false})
    //     this.setState({loading: false})
    //   } else {
    //     // this.setState({requestError: error})
    //     // toaster.danger(<ErrorModal requestError={error} />)
    //     this.setState({loading: false})
    //   }
    //   this.cancelRequest = PrinterRequest.cancelSource();
    // })
  }

  getPrintRecordings(search = {}) {
    // this.setState({loadingRecordings: true})
    var params = {print_id: this.props.match.params.printId}
    return PrinterRequest.getPrintRecordings(this.props.node, this.props.service, this.props.match.params.printId, {q: search, params: params, cancelToken: this.cancelRequest.token})
  }

  syncToLayerkeep() {

    PrinterRequest.syncPrintToLayerkeep(this.props.node, this.props.service, this.state.printerPrint.id)
    .then((res) => {
      // this.listLocal()

      toaster.success(`${this.state.printerPrint} has been successfully synced.`)
    })
    .catch((_err) => {})
  }

  

  deletePrint() {
    PrinterRequest.deletePrint(this.props.node, this.props.service, this.state.printerPrint.id)
    .then((res) => {

      this.setState({redirectTo: `/printers/${this.props.service.id}/prints`})
    })
    .catch((error) => {
      toaster.danger(<ErrorModal requestError={error} />)
      // toaster.danger(`${this.state.printer_print.name} could not be deleted.`)
    })
  }

  
  renderPrinterDetails() {
    if (!this.state.printerPrint || !this.state.printerPrint.printer) 
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
                <Heading>Printer</Heading>
              </Pane>
              <Pane padding={20}>
                <Paragraph>Name: {this.state.printerPrint.printer.name}</Paragraph>
                <Paragraph>Model: {this.state.printerPrint.printer.model}</Paragraph>
                <Paragraph>Description: {this.state.printerPrint.printer.description}</Paragraph>
              </Pane>
          </Pane>
    )
  }

  renderPrintDetails() {
    if (!this.state.printerPrint) 
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
                <Heading>Print Details</Heading>
              </Pane>
              <Pane padding={20}>
                <Paragraph>{this.state.printerPrint.name}</Paragraph>
                <Paragraph>Status: {this.state.printerPrint.status}</Paragraph>
                <Paragraph>
                  Printer Slice: &nbsp;
                  {this.state.printerPrint.print_slice &&
                  <Link to={`/files/${this.state.printerPrint.print_slice.id}`}>{this.state.printerPrint.print_slice.name}</Link>}
                </Paragraph>
                <Paragraph>Description: {this.state.printerPrint.print_slice && this.state.printerPrint.print_slice.description}</Paragraph>
              </Pane>
          </Pane>
    )
  }

  renderDelete() {
    return (
      <Pane display="flex" borderTop paddingTop={20}>
        <Pane display="flex" flex={1} padding={20} marginBottom={20} className="danger-zone" alignItems="center" flexDirection="row">
          <Pane>
            <Button appearance="primary" intent="danger" height={40} onClick={() => this.deletePrint()}> Delete </Button>
          </Pane>
        </Pane>
      </Pane>
    )
  }



  renderSectionHeader(title) {
    return (
      <Pane display="flex" flexDirection="column" width="100%" background="#fff" paddingY={10} paddingX={15} margin={0} borderBottom="default">
        {title}
      </Pane>
    )
  }
  renderRecordings() {
    return (
      <Pane
      is="section"
      innerRef={(ref) => {}}
      background="tint2"
      border="default"
      marginLeft={12}
      marginY={24}
    > 
    <RecordingsController 
      renderSectionHeader={() => this.renderSectionHeader("Recordings")}
      listData={this.getPrintRecordings.bind(this)}
      match={this.props.match}
    />
    
    </Pane>)
  }

  renderCommands() {
    return (
      <Pane
        is="section"
        innerRef={(ref) => {}}
        background="tint2"
        border="default"
        marginLeft={12}
        marginY={24}
      >
        <CommandsController 
          renderSectionHeader={() => this.renderSectionHeader("Commands")}
          node={this.props.node} 
          service={this.props.service} 
          printId={this.props.match.params.printId}
        />
      </Pane>)
  }

  render() {
    if (this.state.redirectTo) {
      return (<Redirect to={this.state.redirectTo} />)
    }
    return (
      <Pane display="flex" key={"prints"}>
        <Pane display="flex" flexDirection="column" width="100%" background="#fff" padding={20} margin={20} border="default">
          <Pane display="flex" marginBottom={20}>
            <Pane display="flex" flex={1}>
              <Link to={"/printers/" + this.props.service.id}>{this.props.service.name}</Link>&nbsp; / &nbsp;
              <Link to={"/printers/" + this.props.service.id + "/prints"}>Prints</Link>&nbsp; / &nbsp;
              {(this.state.printerPrint && this.state.printerPrint.name) || ""}
              
            </Pane>
            {this.renderDelete()}

          </Pane>
          
          {this.renderPrintDetails()}
          {this.renderPrinterDetails()}
          {this.renderRecordings()}
          {this.renderCommands()}

          <Pane borderBottom borderLeft borderRight>
            
            
          </Pane>
          
        </Pane>
      </Pane>
    )
  }	
}

export default PrintShow
