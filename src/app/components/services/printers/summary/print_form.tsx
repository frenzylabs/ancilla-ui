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
  Tooltip,
  Icon,
  Paragraph,
  toaster
} from 'evergreen-ui'

import fuzzaldrin from 'fuzzaldrin-plus'

import Combobox from '../../../utils/combobox'
import AutocompleteItem from '../../../utils/autocompleteItem'

import request from '../../../../network/files'

export default class PrintForm extends React.Component<{save:Function, loading:boolean}> {
  state = {
    newPrint: {
      name:     '',
      file_id:     '',
      baud_rate: ''
    },
    selectedFile: null,
    files: Array<{}>(),
  }

  getFiles() {
    request.listLocal()
    .then((response) => {
      if (response.data && response.data.files) {
        this.setState({
          files: response.data.files.map((fp) => {
            return {key: fp.id, name: fp.name, id: fp.id, description: fp.description}
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
          isLoading={this.props.loading}
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
      </Pane>
    )
  }
}
