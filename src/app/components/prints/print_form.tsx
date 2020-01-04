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
  Tooltip,
  Icon,
  Paragraph,
  toaster
} from 'evergreen-ui'

import fuzzaldrin from 'fuzzaldrin-plus'

import Combobox from '../utils/combobox'
import AutocompleteItem from '../utils/autocompleteItem'

import FileHandler from '../../network/files'
import CameraHandler from '../../network/camera'
import PrinterHandler from '../../network/printer'



import { NodeState, ServiceState }  from '../../store/state'

import PropTypes from 'prop-types'
import Loader from '../loader'

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
  // files: PropTypes.array,
  // printers: PropTypes.shape(ServiceState),
  // cameras: PropTypes.array,
  filesLoading: PropTypes.bool
}

type PrintProps = PropTypes.InferProps<typeof optionPropTypes> & { 
  node: NodeState,
  printerService?: ServiceState 
}
type PrintStateProps = PropTypes.InferProps<typeof statePropTypes> & {
  files: Array<ServiceState>,
  printers: Array<ServiceState>,
  cameras: Array<ServiceState>
}

export default class PrintForm extends React.Component<PrintProps, PrintStateProps> {
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
    selectedFile: null,
    files: Array(),
    cameras: Array(),
    printers: Array(),
    filesLoading: true
  }

  getFiles() {
    this.setState({filesLoading: true})
    FileHandler.listLocal(this.props.node)
    .then((response) => {
      if (response.data && response.data.data) {
        this.setState({
          filesLoading: false,
          files: response.data.data.map((fp) => {
            return {key: fp.id, name: fp.name, id: fp.id, description: fp.description}
          })
        })
        // this.setState({files: response.data.files})
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

  componentDidMount() {
    this.getFiles()
    this.getCameras()
    this.getPrinters()
  }

  save() {
    // this.props.save(this.values)
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

  renderPrinter() {
    return (
      <Pane>
        Send to Printer:  {this.props.printerService ? this.props.printerService.model.name : ""}
      </Pane>
    )
  }


  // renderPrinters() {
  //   return (
  //   <SelectMenu
  //     isMultiSelect
  //     title="Select printer"
  //     options={this.state.printers}
  //     selected={this.state.selected}
  //     onSelect={item => {
  //       const selected = [...state.selected, item.value]
  //       const selectedItems = selected
  //       const selectedItemsLength = selectedItems.length
  //       let selectedNames = ''
  //       if (selectedItemsLength === 0) {
  //         selectedNames = ''
  //       } else if (selectedItemsLength === 1) {
  //         selectedNames = selectedItems.toString()
  //       } else if (selectedItemsLength > 1) {
  //         selectedNames = selectedItemsLength.toString() + ' selected...'
  //       }
  //       setState({
  //         selected,
  //         selectedNames
  //       })
  //     }}
  //     onDeselect={item => {
  //       const deselectedItemIndex = state.selected.indexOf(item.value)
  //       const selectedItems = state.selected.filter(
  //         (_item, i) => i !== deselectedItemIndex
  //       )
  //       const selectedItemsLength = selectedItems.length
  //       let selectedNames = ''
  //       if (selectedItemsLength === 0) {
  //         selectedNames = ''
  //       } else if (selectedItemsLength === 1) {
  //         selectedNames = selectedItems.toString()
  //       } else if (selectedItemsLength > 1) {
  //         selectedNames = selectedItemsLength.toString() + ' selected...'
  //       }
  //       setState({ selected: selectedItems, selectedNames })
  //     }}
  //   >
  //     <Button>{state.selectedNames || 'Select multiple...'}</Button>
  //   </SelectMenu>)
  // }
    
  renderItem(props) {
    var item = props.item
    return <AutocompleteItem {...props} children={
    <Pane display="flex" flex={1}>
      <Pane display="flex" flex={1}>
      {item.name} 
      </Pane>
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
   </Pane>} />
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

  render() {
    if (this.props.loading) {
      return (<Loader />)
    }
    return (
      <Pane>
        {this.renderPrinter()}

        <Combobox 
          openOnFocus 
          items={this.state.files} 
          itemToString={item => item ? `${item.name}` : ''}
          selectedItem={this.state.selectedFile}
          placeholder={this.state.files.length > 0? "File" : "No Files Found"} 
          autocompleteProps={{
            renderItem: this.renderItem.bind(this)
          }}
          marginTop={4} 
          marginBottom={4}  
          width="100%" 
          height={48}
          isLoading={this.state.filesLoading}
          disabled={this.state.files.length < 1}
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

        <Pane display="flex" marginTop={10}>
          <Pane display="flex" flex={1}>
            <Checkbox
              label="Sync To LayerKeep"
              checked={this.state.newPrint.layerkeep_sync}
              onChange={e => 
                this.setState({
                  newPrint: {
                    ...this.state.newPrint,
                    layerkeep_sync: e.target.checked
                  }
                })
              }
            />
          </Pane>
        </Pane>
      </Pane>
    )
  }
}
