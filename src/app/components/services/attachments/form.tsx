//
//  print_form.tsx
//  ancilla
// 
//  Created by Kevin Musselman (kmussel@gmail.com) on 11/10/19
//  Copyright 2019 Frenzylabs, LLC
//

import React from 'react'

import {
  Pane,
  TextInput,
  Combobox,
  toaster
} from 'evergreen-ui'

import { ServiceHandler } from '../../../network/'
import { string } from 'prop-types'

import { NodeState, ServiceState, AttachmentModel }  from '../../../store/state'

import ServiceActions from '../../../store/actions/services'



type Props = {
  listAttachments: Function,
  saveAttachment: Function,
  updateAttachments: Function,
  attachmentReceived: Function,
  attachments: Array<AttachmentModel>,
  node: NodeState, 
  service: ServiceState, 
  attachmentKind?: string,
  loading: boolean
}

type StateProps = {
  newAttachment: any,
  services: Array<ServiceState>,
  kind: string
}


export default class AttachmentForm extends React.Component<Props, StateProps> {
  
  constructor(props:any) {
    super(props)
    this.state = {
      newAttachment: {
        parent_id:     '',
        service_id:     ''
      },
      services: [],
      kind: this.props.attachmentKind
    }
  
    this.setServices = this.setServices.bind(this)
  }

  // get values():{name?:string, port:string, baudrate:string} {
  //   return {
  //     name:     this.state.name.length > 0 ? this.state.name : this.state.port,
  //     port:     this.state.port,
  //     baudrate: this.state.baudrate
  //   }
  // }

  // getDevice() {
  //   request.list()
  //   .then((response) => {
  //     if (response.data && response.data.files) {
  //       this.setState({
  //         files: response.data.files.map((fp) => {
  //           return {name: fp.name, id: fp.id}
  //         })
  //       })
  //       // this.setState({files: response.data.files})
  //     }
  //   }).catch((err) => {
  //     toaster.danger(err)
  //   })
  // }

  componentDidMount() {
    this.setServices()
    // console.log(this.props)
  }

  componentDidUpdate(prevProps, prevState) {
    // if (prevProps.attachmentKind != this.props.attachmentKind) 
    // prevProps.node.services.filter
    // var oldservices = prevProps.node.services.map((k) => k.id)
    // if (prevProps.attachmentKind) {
    //   if (k.kind) 
    // }
    // var services = this.props.node.services
    // if (this.props.attachmentKind) {
    if (prevProps.attachmentKind != this.props.attachmentKind) {
      
    }
    if (prevProps.attachments != this.props.attachments ||
        prevProps.attachmentKind != this.props.attachmentKind ||
        prevProps.node.services.length != this.props.node.services.length)  {
      this.setServices()
    }
  }

  setServices() {
    var services = this.props.node.services.filter(s => {
      if (this.props.attachments) {
        var serviceIds = this.props.attachments.map(a => a.attachment.id)
        if (serviceIds.indexOf(s.id) >= 0)
          return false
        // if (serviceIds.includes(s.id))
        //   return false
      }
      if (this.props.attachmentKind) {
        return s.kind == this.props.attachmentKind.toLowerCase()
      }
      return true
    })
    this.setState({services: services, kind: this.props.attachmentKind || "Service"})
  }

  save() {
    // this.props.save(this.values)
  }

  render() {
    return (
      <Pane>
        {/* <TextInput 
          name="name" 
          placeholder="Service Name" 
          marginBottom={4}  
          width="100%" 
          height={48}
          onChange={e => 
            this.setState({
              newAttachment: {
                ...this.state.newAttachment,
                name: e.target.value     
              }
            })
          }
        /> */}

        <Combobox 
          openOnFocus 
          items={this.state.services} 
          itemToString={item => item ? item.name : ''}
          placeholder={this.state.services.length > 0? `Select ${this.state.kind}` : `No ${this.state.kind} Found`} 
          marginTop={4} 
          marginBottom={4}  
          width="100%" 
          height={48}
          isLoading={this.props.loading}
          disabled={this.state.services.length < 1}
          onChange={selected => {
            this.setState({
              newAttachment: {
                ...this.state.newAttachment,
                service_id: (selected && selected.id)
              }
            })
          }
          }
        />
      </Pane>
    )
  }
}
