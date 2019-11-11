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

import {default as request} from '../../../network/files'

export default class PrintForm extends React.Component<{save:Function, loading:boolean}> {
  state = {
    newPrint: {
      name:     '',
      file_id:     '',
      baud_rate: ''
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

  getFiles() {
    request.list()
    .then((response) => {
      if (response.data && response.data.files) {
        this.setState({
          files: response.data.files.map((fp) => {
            return {name: fp.name, id: fp.id}
          })
        })
        // this.setState({files: response.data.files})
      }
    }).catch((err) => {
      toaster.danger(err)
    })
  }

  componentDidMount() {
    this.getFiles()
  }

  save() {
    // this.props.save(this.values)
  }

  render() {
    return (
      <Pane>
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

        <Combobox 
          openOnFocus 
          items={this.state.files} 
          itemToString={item => item ? item.name : ''}
          placeholder={this.state.files.length > 0? "File" : "No Files Found"} 
          marginTop={4} 
          marginBottom={4}  
          width="100%" 
          height={48}
          isLoading={this.props.loading}
          disabled={this.state.files.length < 1}
          onChange={selected => {
            this.setState({
              newPrint: {
                ...this.state.newPrint,
                file_id: (selected && selected.id)
              }
            })
          }
          }
        />
      </Pane>
    )
  }
}
