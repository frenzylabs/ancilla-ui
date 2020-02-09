//
//  print_form.tsx
//  ancilla
// 
//  Created by Kevin Musselman (kmussel@gmail.com) on 11/10/19
//  Copyright 2019 Frenzylabs, LLC
//

import React from 'react'
import Dayjs from 'dayjs'

import {
  Pane,
  Tooltip,
  Icon,
  Paragraph,
  toaster
} from 'evergreen-ui'

import Combobox from '../utils/combobox'
import AutocompleteItem from '../utils/autocompleteItem'

import { CameraHandler } from '../../network/'
import { isCancel }       from '../../network/request'
import { string } from 'prop-types'

import { NodeState, ServiceState, AttachmentModel }  from '../../store/state'

import ServiceActions from '../../store/actions/services'



type Props = {
  node: NodeState, 
  service: ServiceState, 
  loading?: boolean,
  saveAttachment?: Function
}

type StateProps = {
  newAttachment: any,
  cameras: Array<ServiceState>,
  kind: string
}


export default class AttachmentForm extends React.Component<Props> {
  state = {
    newAttachment: {
      recording_id:     '',
      camera_id:     ''
    },
    filter: {
      name: ""
    },
    search: {
      page: 1, 
      per_page: 5,
      q: {name: "", print_id: 0} 
    },
    loading: false,
    camera: null,
    selectedRecording: null,
    cameras: [],
    recordings: [],
    kind: 'camera'
  }

  cancelRequest = null
  timer = null
  constructor(props:any) {
    super(props)
  
    this.setCameras = this.setCameras.bind(this)

    this.cancelRequest = CameraHandler.cancelSource();
  }

  componentDidMount() {
    this.setCameras()
  }

  componentDidUpdate(prevProps, prevState) {
    
    if (prevState.newAttachment.camera_id != this.state.newAttachment.camera_id) {
      if (this.state.newAttachment.recording_id) {
        this.setState({selectedRecording: null, newAttachment: {...this.state.newAttachment, recording_id: ''}})        
      }
      this.listRecordings()
    }
    else if (JSON.stringify(this.state.search) != JSON.stringify(prevState.search)) {
      this.listRecordings()
    }

    
    if (prevProps.node.services.length != this.props.node.services.length)  {
      this.setCameras()
    }
  }

  setCameras() {
    var cameras = this.props.node.services.filter(s => {
      
      return s.kind == 'camera'
    })
    this.setState({cameras: cameras})
  }

  listRecordings() {
    if (!this.state.camera) return
    CameraHandler.recordings(this.props.node, this.state.camera, {qs: this.state.search, cancelToken: this.cancelRequest.token})
    .then((resp) => {
      this.setState({recordings: resp.data.data})
    })
    .catch((error) => {
      this.cancelRequest = CameraHandler.cancelSource();
      if (isCancel(error)) return

        // this.setState({requestError: error})
        // toaster.danger(<ErrorModal requestError={error} />)
      this.setState({
        ...this.state,
        isLoading: false
      })
      
    })
  }

  filterList() {
    if (this.state.loading && this.cancelRequest) {
      this.cancelRequest.cancel()
    }
    var search = this.state.search
    this.setState({ search: {...search, page: 1, q: {...search.q, ...this.state.filter} }})
  }

  handleFilterChange(val) {
    if (this.timer) {
      clearTimeout(this.timer)
    }
    this.timer = setTimeout(this.filterList.bind(this), 500);
    this.setState({ filter: {...this.state.filter, name: val}})
  }

  
  renderItem(props) {
    var item = props.item
    return <AutocompleteItem {...props} children={
    <Pane display="flex" flex={1}>
      <Pane display="flex" flex={1}>
        {item.task_name} 
      </Pane>
      <Pane display="flex" flex={1}>
        {item.status} 
      </Pane>
      <Pane display="flex" flex={1}>
        {Dayjs.unix(item.created_at).format('MM.d.YYYY - hh:mm:ss a')}
      </Pane>
      {/* <Pane>
        <Tooltip align="right"
          content={
            <Paragraph margin={10}>{item.description}</Paragraph>
          }
          appearance="card"
        >
          <Icon size={12} marginLeft={4} icon="help" />
        </Tooltip>
      </Pane> */}
   </Pane>} />
  }

  save() {
    // this.props.save(this.values)
  }

  render() {
    return (
      <Pane>

        <Combobox 
          openOnFocus 
          items={this.state.cameras} 
          itemToString={item => item ? item.name : ''}
          selectedItem={this.state.camera}
          placeholder={this.state.cameras.length > 0? `Select Camera` : `No Camera Found`} 
          marginTop={4} 
          marginBottom={4}  
          width="100%" 
          height={48}
          isLoading={this.props.loading}
          disabled={this.state.cameras.length < 1}
          onChange={selected => {
            this.setState({
              camera: selected,
              newAttachment: {
                ...this.state.newAttachment,
                camera_id: (selected && selected.id)
              }
            })
          }
          }
        />

        <Combobox 
          openOnFocus 
          items={this.state.recordings} 
          itemToString={item => item ? item.task_name : ''}
          selectedItem={this.state.selectedRecording}
          placeholder={this.state.recordings.length > 0 ? `Select Recording` : `No Recording Found`} 
          marginTop={4} 
          marginBottom={4}  
          width="100%" 
          height={48}
          isLoading={this.state.loading}
          disabled={this.state.camera == null}
          autocompleteProps={{
            renderItem: this.renderItem.bind(this)
          }}
          inputProps={{
            onChange: (e) => {
              var val = e.target.value.trim()
              this.handleFilterChange(val)
            }
          }}
          onChange={selected => {
            this.setState({
              selectedRecording: selected,
              newAttachment: {
                ...this.state.newAttachment,
                recording_id: (selected && selected.id)
              }
            })
          }
          }
        />
      </Pane>
    )
  }
}
