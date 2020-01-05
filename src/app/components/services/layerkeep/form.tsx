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
  Spinner,
  Combobox,
  Checkbox,
  toaster
} from 'evergreen-ui'

import layerkeep, {default as request} from '../../../network/layerkeep'

import ErrorModal from '../../modal/error'
import { NodeState, PrinterState }  from '../../../store/state'

type Props = {
  node: NodeState,
  onAuthenticated:Function, 
  onError:Function, 
  loading:boolean
}

type StateProps = {
  creds: any,
  requestError: any,
  isSaving: any  
}

export class Form extends React.Component<Props, StateProps> {
  

  constructor(props:any) {
    super(props)

    
    this.state = {
      creds: {
        username:     '',
        password:     ''        
      },
      isSaving: false,
      requestError: false
    }

    // this.receiveRequest  = this.receiveRequest.bind(this)
    // this.receiveEvent    = this.receiveEvent.bind(this)
    this.signIn    = this.signIn.bind(this)

  }
  

  componentDidMount() {

  }

  signIn() {

    this.setState({isSaving: true})
    layerkeep.sign_in(this.props.node, this.state.creds)
    .then(res => {
      if (this.props.onAuthenticated) {
        this.props.onAuthenticated(res)
      }
      this.setState({isSaving: false})
    })
    .catch((err) => {
      if (this.props.onError) {
        this.props.onError(err)
      } 
      this.setState({isSaving: false, requestError: err})
    })
    
    // this.props.save(this.state.creds)
  }
  renderError() {
    if (this.state.requestError) {
      return (<Pane background="redTint" border marginBottom={10} padding={10}>
        <ErrorModal requestError={this.state.requestError} />
      </Pane>)
    }
  }

  render() {
    if (this.state.isSaving) {
      return <Spinner />
    }
    return (
      <Pane>
        {this.renderError()}
      
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

        <Button marginTop={16} onClick={this.signIn}>
                Sign In
        </Button>

        </Pane>
      </Pane>
    )
  }
}

export default Form