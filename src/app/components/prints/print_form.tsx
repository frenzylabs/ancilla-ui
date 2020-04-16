//
//  print_form.tsx
//  ancilla
// 
//  Created by Kevin Musselman (kmussel@gmail.com) on 11/10/19
//  Copyright 2019 Frenzylabs, LLC
//

import React from 'react'
import Link from 'react-router-dom'

import {
  Pane,
  TextInput,
  Checkbox,
  Button,
  SelectMenu,
  Dialog,
  Tooltip,
  Icon,
  Paragraph,
  IconButton,
  toaster
} from 'evergreen-ui'

import fuzzaldrin from 'fuzzaldrin-plus'

import Combobox from '../utils/combobox'
import AutocompleteItem from '../utils/autocompleteItem'

import FileHandler from '../../network/files'
import CameraHandler from '../../network/camera'
import PrinterHandler from '../../network/printer'

import FileForm from '../files/sections/local/file_form'

import { NodeState, ServiceState }  from '../../store/state'

import PropTypes from 'prop-types'
import Loader from '../loader'

import Modal from '../modal/index'
import AuthForm from '../services/layerkeep/form'

const optionPropTypes = {    
  // node: PropTypes.object,
  service: PropTypes.object,
  printer: PropTypes.object.isRequired,  
  loading: PropTypes.bool,
  match: PropTypes.shape({url: PropTypes.string})
}

const statePropTypes = {
  
  newPrint: PropTypes.shape({
    name:     PropTypes.string,
      file_id:     PropTypes.string,
      baud_rate: PropTypes.string,
      settings: PropTypes.shape({
        record_print: PropTypes.bool,
        cameras: PropTypes.object
      }),      
      layerkeep_sync: PropTypes.bool
  }),
  selectedFile: PropTypes.any,
  showingAddFile: PropTypes.bool,

  filesLoading: PropTypes.bool,
  showAuth: PropTypes.bool
}

type PrintProps = PropTypes.InferProps<typeof optionPropTypes> & { 
  node: NodeState,
  printerService?: ServiceState 
}
type PrintStateProps = PropTypes.InferProps<typeof statePropTypes> & {
  files: Array<ServiceState>,
  printers: Array<ServiceState>,
  cameras: Array<ServiceState>,
  attachedCams: object
}

export default class PrintForm extends React.Component<PrintProps> {
  state = {
    newPrint: {
      name:     '',
      file_id:     '',
      baud_rate: '',
      settings: {
        record_print: false,
        cameras: {}
      },
      
      layerkeep_sync: false
    },
    showAuth: false,
    showingAddFile: false,
    savingFile: false,
    selectedFile: null,
    files: Array(),
    cameras: Array(),
    printers: Array(),
    filesLoading: true,
    attachedCams: {},
    filter: {
      name: ""
    },
    search: {
      page: 1, 
      per_page: 5,
      q: {
        name: "",
        print_id: 0
      }
    }
  }

  addForm       = null
  timer         = null
  cancelRequest = null

  componentDidMount() {
    this.getFiles()
    this.getCameras()
    this.getPrinters()
    this.setupAttachedCameras()
  }

  setupAttachedCameras() {
    var checkedCams = {}
    var checkedCams = this.props.printerService.model.attachments.filter((att) => att.attachment.kind == "camera")
                        .reduce((acc, item) => { acc[item.attachment.id] = true; return acc}, {})

    var recordPrint = this.state.newPrint.settings.record_print
    if (Object.keys(checkedCams).length > 0)  {
      recordPrint = true
    }

    var newstate = {...this.state.newPrint, settings: {...this.state.newPrint.settings, 
      cameras: checkedCams, record_print: recordPrint}}
    this.setState({newPrint: newstate})
  }

  filterList() {
    if (this.state.filesLoading && this.cancelRequest) {
      this.cancelRequest.cancel()
    }
    var search = this.state.search

    this.setState({ 
      search: {
        ...search, 
        page: 1, 
        q: {
          ...search.q, 
          ...this.state.filter
        } 
      }
    })

    this.getFiles()
  }

  handleFilterChange(val) {
    if(this.timer) {
      clearTimeout(this.timer)
    }

    this.timer = setTimeout(this.filterList.bind(this), 500)

    this.setState({
      filter: {
        ...this.state.filter,
        name: val
      }
    })
  }

  getFiles() {
    this.setState({filesLoading: true})
    FileHandler.listLocal(this.props.node, {qs: this.state.search})
    .then((response) => {
      if (response.data && response.data.data) {
        this.setState({
          filesLoading: false,
          files: response.data.data.map((fp) => {
            return {key: fp.id, name: fp.name, id: fp.id, description: fp.description}
          })
        })
      }
    }).catch((err) => {
      toaster.danger(err)
      this.setState({filesLoading: false})

    })
  }

  getPrinters() {
    var printers = this.props.node.services.filter(s => {
        return s.kind == 'printer'
    })
    this.setState({printers: printers})    
  }

  getCameras() {
    var cameras = this.props.node.services.filter(s => {
        return s.kind == 'camera'
    })
    this.setState({cameras: cameras})    
  }



  save() {
  }

  toggleCamera(cam, checked) {
    var cameras = this.state.newPrint.settings.cameras

    if (checked) {
      cameras = {...cameras, [cam.id]: checked }
    }
    else {
      cameras = (Object.keys(cameras) || []).filter((k) => k != `${cam.id}` ).reduce((map, c) => { map[c] = cameras[c]; return map }, {})
    }
      
    var newstate = {...this.state.newPrint, settings: {...this.state.newPrint.settings, 
        cameras: cameras}}
    this.setState({newPrint: newstate})
  }

  cameraChecked(cam) {
    var res = (this.state.newPrint.settings.cameras && this.state.newPrint.settings.cameras[cam.id])
    return res
      
  }

  onFileSave(file) {
    var files = this.state.files
    files.unshift({key: file.id, name: file.name, id: file.id, description: file.description})
    
    this.setState({
      files: files,
      showingAddFile: false,
      selectedFile: files[0],
      newPrint: {
        ...this.state.newPrint,
        file_id: (files[0].id)
      }
    })

  }

  onFileError(err) {
    
  }

  renderAuth() {
    return(
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
    )
  }

  renderPrinter() {
    return (
      <Pane>
        Send to Printer:  {this.props.printerService ? this.props.printerService.model.name : ""}
      </Pane>
    )
  }

  renderItem(props) {
    var item = props.item
    return (
      <AutocompleteItem {...props} children={
          <Pane display="flex" flex={1}>
            <Pane display="flex" flex={1}>{item.name} </Pane>
            <Pane>
              <Tooltip align="right"
                content={
                  <Paragraph margin={10}>{item.description}</Paragraph>
                }
                appearance="card"
              >
                <Icon size={12} marginLeft={4} icon="help" />
              </Tooltip>
            </Pane>
          </Pane>
        } 
      />
    )
  }


  renderCameraOptions() {
    if (this.state.cameras.length > 0) {
      return this.state.cameras.map((c) => {
        return (
          <Pane display="flex" key={c.id} marginLeft={30}>
            <Pane display="flex" flex={1}>
              <Checkbox
                label={c.name}
                checked={this.cameraChecked(c)}
                onChange={e => this.toggleCamera(c, e.target.checked) }              
              />
            </Pane>
          </Pane>
        )
      })
    } else {
      return (
        <Pane display="flex" marginTop={10}>
          <Pane display="flex" flex={1}>
            No cameras have been added.  
            Go <Link to={{pathname: `/cameras/new`, state: {redirectTo: this.props.match.url}}}>Here</Link> 
            to add a new camera.
          </Pane>
        </Pane>
      )
    }
  }

  renderAddFile() {
    return (
      <React.Fragment>
        <Dialog
          isShown={this.state.showingAddFile}
          title="Add File"
          isConfirmLoading={this.state.savingFile}
          confirmLabel={this.state.savingFile ? "Saving..." : "Save"}
          onCloseComplete={() => this.setState({...this.state, showingAddFile: false})}
          onConfirm={() => this.addForm.save()}
        >
          <FileForm
            ref={f => this.addForm = f}
            loading={this.state.savingFile}
            node={this.props.node}
            onSave={this.onFileSave.bind(this)}
            onError={this.onFileError.bind(this)}
            onAuthError={(err) => this.setState({showAuth: true})}

          />
        </Dialog>

        <IconButton appearance='minimal' icon="add" onClick={() => {this.setState({...this.state, showingAddFile: true})}}/>
      </React.Fragment>
    )
  }

  render() {
    if (this.props.loading) {
      return (<Loader />)
    }
    
    if (this.state.showingAddFile) {
      return (
        <Pane>
          {this.renderAuth()}
          {this.renderAddFile()}
        </Pane>
      )
    }
    return (
      <Pane>
        {this.renderPrinter()}

        <Pane display="flex" flex={1}>
        <Combobox 
          openOnFocus 
          items={this.state.files} 
          itemToString={item => item ? `${item.name}` : ''}
          selectedItem={this.state.selectedFile}
          placeholder={this.state.files.length > 0? "File" : "No Files Found"} 
          autocompleteProps={{
            renderItem: this.renderItem.bind(this)
          }}
          inputProps={{
            onChange:(e) => this.handleFilterChange((e.target.value || '').trim())
          }}
          marginTop={4} 
          marginBottom={4}  
          marginRight={10}  
          width="100%" 
          height={48}
          onChange={selected => {
            this.setState({
              selectedFile: selected,
              newPrint: {
                ...this.state.newPrint,
                file_id: (selected && selected.id)
              }
            })
          }
          }
        />
        <Pane display="flex" marginLeft={10} style={{"whiteSpace": "nowrap", "alignItems": "center"}}>
          <Button width="100%" display="block" onClick={() => this.setState({...this.state, showingAddFile: true})} >Upload File</Button>
        </Pane>
      </Pane>

        <TextInput 
          name="name" 
          placeholder="Print Name" 
          marginBottom={4}  
          width="100%" 
          height={48}
          onChange={e => 
            this.setState({
              newPrint: {
                ...this.state.newPrint,
                name: e.target.value     
              }
            })
          }
        />


        <Pane marginTop={10}>
          <Pane >
            <Checkbox
              label="Use Camera to Record"
              checked={this.state.newPrint.settings.record_print}
              onChange={e => 
                this.setState({
                  newPrint: {
                    ...this.state.newPrint,
                    settings: {...this.state.newPrint.settings, record_print: e.target.checked}
                  }
                })
              }
            />
          </Pane>
          {this.state.newPrint.settings.record_print ? this.renderCameraOptions() : null}
        </Pane>
      </Pane>
    )
  }
}
