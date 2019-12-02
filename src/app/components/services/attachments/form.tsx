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

export default class AttachmentForm extends React.Component {
  state = {
    newAttachment: {
      parent_id:     '',
      attachment_id:     ''
    },
    files: Array<{}>(),
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
    // this.getFiles()
    console.log(this.props)
  }

  save() {
    // this.props.save(this.values)
  }

  render() {
    return (
      <Pane>
        <TextInput 
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
        />

        {/* <Combobox 
          openOnFocus 
          items={this.props.node.services} 
          itemToString={item => item ? item.name : ''}
          placeholder={this.state.files.length > 0? "Select Service" : "No Services Found"} 
          marginTop={4} 
          marginBottom={4}  
          width="100%" 
          height={48}
          isLoading={this.props.loading}
          disabled={this.props.node.services.length < 1}
          onChange={selected => {
            this.setState({
              newAttachment: {
                ...this.state.newAttachment,
                attachment_id: (selected && selected.id)
              }
            })
          }
          }
        /> */}
      </Pane>
    )
  }
}
