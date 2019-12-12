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
  Button,
  Combobox,
  Checkbox,
  toaster
} from 'evergreen-ui'

import layerkeep, {default as request} from '../../../network/layerkeep'

export class Form extends React.Component<{onSave:Function, onError:Function, loading:boolean}> {
  

  constructor(props:any) {
    super(props)

    
    this.state = {
      creds: {
        username:     '',
        password:     ''
      }    
    }

    // this.receiveRequest  = this.receiveRequest.bind(this)
    // this.receiveEvent    = this.receiveEvent.bind(this)
    this.save    = this.save.bind(this)

  }
  

  componentDidMount() {
    // printer.ports()
    // .then(res => {
    //   let ports = res.data['ports'] || []

    //   this.setState({
    //     ports: ports
    //   })
    // })
    // .catch((err) => {
    //   console.log(err)
    // })

    // this.setState({
    //   printers: this.props.printers.data['printers'].map((printer) => {
    //     return {name: printer.name, port: printer.port, id: printer.id}
    //   })
    // })

    // printer.list(this.props.)
    // .then(res => {
    //   this.setState({
    //     printers: res.data['printers'].map((printer) => {
    //       return {name: printer.name, port: printer.port, id: printer.id}
    //     })
    //   })
    // })
    // .catch((err) => {
    //   toaster.danger(err)
    // })
  }

  save() {
    // layerkeep.sign_in(this.props.node, this.state.creds)
    console.log("SAVE LK")
    if (this.props.onSave) {
      this.props.onSave("tada")
    }
    // this.props.save(this.state.creds)
  }

  render() {
    return (
      <Pane>
        <TextInput 
          name="username" 
          placeholder="Username" 
          marginBottom={4}  
          width="100%" 
          height={48}
          onChange={e => 
            this.setState({
              creds: {
                ...this.state.creds,
                username: e.target.value     
              }
            })
          }
        />


        <TextInput 
          name="password" 
          placeholder="Password" 
          type={"password"}
          marginBottom={4}  
          width="100%" 
          height={48}
          onChange={e => 
            this.setState({
              creds: {
                ...this.state.creds,
                password: e.target.value     
              }
            })
          }
        />

      <Button marginTop={16} onClick={this.save}>
              Save
      </Button>

      </Pane>
    )
  }
}

export default Form