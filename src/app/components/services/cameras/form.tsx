//
//  form.tsx
//  ancilla
// 
//  Created by Wess Cope (me@wess.io) on 11/08/19
//  Copyright 2019 Wess Cope
//

import React from 'react'

import {
  Pane,
  TextInput,
  Button
} from 'evergreen-ui'



export default class Form extends React.Component<{save:Function, loading:boolean}> {
  state = {
    newCamera: {
      name:     '',
      endpoint:     ''
    }    
  }

  componentDidMount() {  
  }

  save() {
    this.props.save(this.values)
  }

  render() {
    return (
      <Pane>
        <TextInput 
          name="name" 
          placeholder="Camera name" 
          marginBottom={4}  
          width="100%" 
          height={48}
          onChange={e => 
            this.setState({
              newCamera: {
                ...this.state.newCamera,
                name: e.target.value     
              }
            })
          }
        />
        <TextInput 
          name="url" 
          placeholder="Camera endpoint" 
          marginBottom={4}  
          width="100%" 
          height={48}
          onChange={e => 
            this.setState({
              newCamera: {
                ...this.state.newCamera,
                endpoint: e.target.value     
              }
            })
          }
        />

        <Pane display="flex" marginTop={20}>
          <Pane display="flex" flex={1}>
          </Pane>
          
          <Pane paddingTop={6}>
            <Button appearance="primary" onClick={this.save}>Save</Button>
          </Pane>
        </Pane>
      </Pane>
    )
  }
}
