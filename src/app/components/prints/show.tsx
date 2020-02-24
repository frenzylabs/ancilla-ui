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
  IconButton,
  Checkbox,
  Button,
  Dialog,
  Text,
  Heading,
  Paragraph,
  Position,
  Table,
  Label,
  TextInput,
  Textarea,
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

import AttachRecordingForm from './attach_recording_form'


import { NodeState, ServiceState, AttachmentModel }  from '../../store/state'


type Props = {  
  node: NodeState, 
  service: ServiceState,
  location: any,
  match: any
}

type StateProps = {
  loading: boolean,
  saving: boolean,
  showAuth: boolean,
  syncing: boolean,
  confirmDelete: boolean,
  deleting: boolean,
  deleteRemote: boolean,
  printerPrint: any,
  redirectTo: any,
  reload: number,
  reloadRecordings: number,
  editPrint: any,
  editing: boolean,
  attachRecording: boolean
}


export class PrintShow extends React.Component<Props, StateProps> {

  

  cancelRequest = null
  form = null
  constructor(props:any) {
    super(props)
    // var qparams = qs.parse(this.props.location.search, { ignoreQueryPrefix: true })

    this.state = {    
      loading: true,
      saving: false,
      confirmDelete: false,
      deleteRemote: false,
      deleting: false,
      showAuth: false,
      syncing: false,      
      printerPrint: null,
      redirectTo: null,
      reload: 0,
      reloadRecordings: 0,
      editing: false,
      editPrint: null,
      attachRecording: false
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
      this.setState({loading: false})
      toaster.danger(<ErrorModal requestError={error} />)  
      this.cancelRequest = PrinterRequest.cancelSource();

    })
  }

  updatePrint() {
    this.setState({saving: true})
    return PrinterRequest.updatePrint(this.props.node, this.props.service, this.state.printerPrint.id, this.state.editPrint, {cancelToken: this.cancelRequest.token})
    .then((res) => {
      console.log("SAVE res = ", res)
      this.setState({
        printerPrint: res.data.data,
        editPrint: null,
        editing: false,
        attachRecording: false,
        saving: false
      })
    })
    .catch((error) => {
      console.log(error)
      this.setState({saving: false})
      toaster.danger(<ErrorModal requestError={error} />)  
      this.cancelRequest = PrinterRequest.cancelSource();

    })
  }

  deletePrintCommands() {
    this.setState({deleting: true, reload: Date.now()})
    var params = {print_id: this.props.match.params.printId}
    return PrinterRequest.deletePrinterCommands(this.props.node, this.props.service, {params: params, cancelToken: this.cancelRequest.token})
    .then((res) => {
      this.setState({deleting: false, reload: Date.now()})
      
    })
    .catch((error) => {
      console.log("delete error")
      this.setState({deleting: false})
      toaster.danger(<ErrorModal requestError={error} />)
    })    
  }

  getPrintRecordings(search = {}) {
    // this.setState({loadingRecordings: true})
    var params = {print_id: this.props.match.params.printId}
    return PrinterRequest.getPrintRecordings(this.props.node, this.props.service, this.props.match.params.printId, {q: search, params: params, cancelToken: this.cancelRequest.token})
  }

  syncToLayerkeep() {
    this.setState({syncing: true})
    PrinterRequest.syncPrintToLayerkeep(this.props.node, this.props.service, this.state.printerPrint.id)
    .then((res) => {
      // this.listLocal()
      this.setState({
        ...this.state,
        printerPrint: res.data.data,
        syncing: false
      })

      toaster.success(`${this.state.printerPrint.name} has been successfully synced.`)
    })
    .catch((error) => {
      if (error.response && error.response.status == 401) {
        console.log("Unauthorized")
        // this.setState({showAuth: true, loading: false})
        this.setState({
          syncing: false,
          showAuth: true
        })
      } else {
        this.setState({
          syncing: false
        })
      }
      toaster.danger(<ErrorModal requestError={error} />)
    })
  }

  unsyncFromLayerkeep() {
    PrinterRequest.unsyncFromLayerkeep(this.props.node, this.props.service, this.state.printerPrint.id)
    .then((res) => {
      // this.listLocal()
      this.setState({
        ...this.state,
        printerPrint: res.data.data,
        syncing: false
      })

      
    })
    .catch((error) => {
      this.setState({
        syncing: false
      })
      toaster.danger(<ErrorModal requestError={error} />)
    })
  }

  deletePrint() {
    this.setState({deleting: true})
    PrinterRequest.deletePrint(this.props.node, this.props.service, this.state.printerPrint.id)
    .then((res) => {

      this.setState({deleting: false, deleteRemote: false, confirmDelete: false, redirectTo: `/printers/${this.props.service.id}/prints`})
    })
    .catch((error) => {
      this.setState({deleting: false, deleteRemote: false, confirmDelete: false})
      toaster.danger(<ErrorModal requestError={error} />)
    })
  }
  
  onDelete() {
    this.setState({confirmDelete: true})
  }

  editPrint() {
    this.setState({editing: true, editPrint: {name: this.state.printerPrint.name, description: this.state.printerPrint.description || ""}})
  }

  renderDelete() {
    return (
      <Pane display="flex" borderTop >
        <Pane display="flex" flex={1} padding={20} marginBottom={20} className="" alignItems="center" flexDirection="row">
          <Pane>
            <Button appearance="primary" intent="danger" height={40} onClick={() => this.onDelete()}> Delete </Button>
          </Pane>
        </Pane>
      </Pane>
    )
  }

  renderLayerkeep() {
    if (!this.state.printerPrint) return
    var disabled = false
    if (this.state.syncing) {
      disabled = true
    }
    if (this.state.printerPrint.layerkeep_id) {
      return (
        <Pane display="flex" >
          <Pane display="flex" flex={1} padding={20} marginBottom={20} className="" alignItems="center" flexDirection="row">
            <Pane>
              <Button disabled={disabled} appearance="primary" intent="none" height={40} onClick={() => this.unsyncFromLayerkeep()}> {this.state.syncing ? "Unsyncing..." : "UnSync From Layerkeep"} </Button>
            </Pane>
          </Pane>
        </Pane>
      )
    } else {
      return (
          <Pane display="flex" >
            <Pane display="flex" flex={1} padding={20} marginBottom={20} className="" alignItems="center" flexDirection="row">
              <Pane>
                <Button disabled={disabled} appearance="primary" intent="none" height={40} onClick={() => this.syncToLayerkeep()}> {this.state.syncing ? "Syncing..." : "Sync To Layerkeep"} </Button>
              </Pane>
            </Pane>
          </Pane>
        )
    }
  }

  renderConfirmLayerkeepDelete() {
    if (this.state.printerPrint.layerkeep_id) {
      return (
        <Pane>
                <Paragraph>Your print is currently synced with LayerKeep.</Paragraph>
                <Checkbox
                  label="Check this box to delete from LayerKeep as well"
                  checked={this.state.deleteRemote}
                  onChange={e => {
                    this.setState({deleteRemote: e.target.checked})
                  }}
              />
            </Pane>
      )
    } else {
      return (
        <Pane>
        <Paragraph>Are you sure you want to delete this print?</Paragraph>
        </Pane>
      )
    }
  }

  renderConfirmDelete() {
    if (!this.state.confirmDelete) return
      return (
        <React.Fragment>
          <Dialog
            isShown={this.state.confirmDelete ? true : false}
            title="Delete Print?"
            isConfirmLoading={this.state.deleting}
            confirmLabel={this.state.deleting ? "Deleting..." : "Delete"}
            onCloseComplete={() => this.setState({...this.state, deleteRemote: false, confirmDelete: false})}
            onConfirm={() => this.deletePrint()}
          >

          {({ close }) => (
              this.renderConfirmLayerkeepDelete()
        )}

        </Dialog>
      </React.Fragment>
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
              <Pane display="flex" flexDirection="row" width="100%" background="#fff" paddingY={10} paddingX={15} margin={0} borderBottom="default">
                <Heading display="flex" flex={1}>Print Details</Heading>
                <Pane>
                  {this.renderEditPrint()}                  
                </Pane>
              </Pane>
              <Pane padding={20}>
                <Paragraph>Name: {this.state.printerPrint.name}</Paragraph>
                <Paragraph>Description: {this.state.printerPrint.description}</Paragraph>
                <Paragraph>Status: {this.state.printerPrint.status}</Paragraph>
                <Pane display="flex">
                  <Paragraph>Printer Slice: </Paragraph>&nbsp;
                  <Paragraph>
                    {this.state.printerPrint.print_slice &&
                    <Link to={`/files/${this.state.printerPrint.print_slice.id}`}>{this.state.printerPrint.print_slice.name}</Link>}
                    <br/>
                    {this.state.printerPrint.print_slice && this.state.printerPrint.print_slice.description}
                  </Paragraph>
                </Pane>
                
                
              </Pane>
          </Pane>
    )
  }

  renderEditPrint() {
    return (
      <React.Fragment>
        <Dialog
          isShown={this.state.editing ? true : false}
          title="Update Print"
          isConfirmLoading={this.state.saving}
          confirmLabel={this.state.saving ? "Saving..." : "Save"}
          onCloseComplete={() => this.setState({editing: false, editPrint: null})}
          onConfirm={() => this.updatePrint()}
        >

        {({ close }) => {
          if (!this.state.editPrint) return
          return (
            <Pane>
              <Label htmlFor="name" marginBottom={4} display="block">Name</Label>
              <TextInput 
                name="name" 
                placeholder="Print Name" 
                marginBottom={4}  
                width="100%" 
                height={48}
                value={this.state.editPrint.name}
                onChange={e => 
                  this.setState({
                    editPrint: {
                      ...this.state.editPrint,
                      name: e.target.value     
                    }
                  })
                }
              />
              <Label htmlFor="description" marginBottom={4} display="block">Description</Label>
              <Textarea 
                name="description" 
                placeholder="Print Description" 
                marginBottom={4}  
                width="100%" 
                height={48}
                value={this.state.editPrint.description}
                onChange={e => 
                  this.setState({
                    editPrint: {
                      ...this.state.editPrint,
                      description: e.target.value     
                    }
                  })
                }
              />
              </Pane>
          )
        }}

        </Dialog>
        <IconButton appearance='minimal' icon="edit" onClick={this.editPrint.bind(this)}/>
      </React.Fragment>
    )
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

  


  renderSectionHeader(title) {
    return (
      <Pane display="flex" flexDirection="column" width="100%" background="#fff" paddingY={10} paddingX={15} margin={0} borderBottom="default">
        <Pane display="flex" flex={1}>{title}</Pane>
      </Pane>
    )
  }

  renderCommandSectionHeader() {
    return (
      <Pane display="flex" flexDirection="row" width="100%" background="#fff" paddingY={10} paddingX={15} margin={0} borderBottom="default">
        <Pane display="flex" flex={1}>Commands</Pane>
        <Pane>
          <IconButton appearance='minimal' icon="delete" onClick={this.deletePrintCommands.bind(this)}/>            
        </Pane>
      </Pane>
    )
  }

  renderRecordingsSectionHeader() {
    return (
      <Pane display="flex" flexDirection="row" width="100%" background="#fff" paddingY={10} paddingX={15} margin={0} borderBottom="default">
        <Pane display="flex" flex={1}>Recordings</Pane>
        <Pane>
          <IconButton appearance='minimal' icon="add" onClick={() => this.setState({attachRecording: true})} />            
        </Pane>
      </Pane>
    )
  }

  addPrintRecording(recording) {
    console.log("REcroding = ", recording)
    if (recording && recording.recording_id != "") {
      this.state.editPrint = {recording: recording}
      this.updatePrint().then((res) => {
        this.setState({reloadRecordings: Date.now()})
      })
    }
  }

  renderRecordingAttachments() {
    return (
      <React.Fragment>
        <Dialog
          isShown={this.state.attachRecording ? true : false}
          title="Attach Recording"
          isConfirmLoading={this.state.saving}
          confirmLabel={this.state.saving ? "Saving..." : "Save"}
          onCloseComplete={() => this.setState({attachRecording: false})}
          onConfirm={() => this.addPrintRecording(this.form.state.newAttachment)}
        >

        {({ close }) => {
          return (
            <AttachRecordingForm 
              ref={f => this.form = f}
              {...this.props}>
            </AttachRecordingForm>            
          )
        }}

        </Dialog>
      </React.Fragment>
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
    {this.renderRecordingAttachments()}
    <RecordingsController 
      node={this.props.node} 
      renderSectionHeader={() => this.renderRecordingsSectionHeader()}      
      listData={this.getPrintRecordings.bind(this)}
      match={this.props.match}
      reload={this.state.reloadRecordings}
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
          renderSectionHeader={() => this.renderCommandSectionHeader()}
          node={this.props.node} 
          service={this.props.service} 
          printId={this.props.match.params.printId}
          reload={this.state.reload}
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
            {this.renderConfirmDelete()}
            {this.renderLayerkeep()}
            {this.renderDelete()}

          </Pane>
          
          {this.renderPrintDetails()}
          {this.renderPrinterDetails()}
          {this.renderRecordings()}

          <Pane borderBottom borderLeft borderRight>
            
            
          </Pane>
          
        </Pane>
        <Modal
          component={AuthForm}
          componentProps={{
            node: this.props.node,
            onAuthenticated: (res) => {
              this.setState({
                ...this.state,
                showAuth: false
              })
  
              toaster.success('Succssfully signed in to LayerKeep.com')
            }
          }}
          // requestError={this.state.requestError}
          isActive={this.state.showAuth}
          dismissAction={() => this.setState({showAuth: false}) }
          
        />
      </Pane>
    )
  }	
}

export default PrintShow
