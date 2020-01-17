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
  Label,
  Checkbox,
  Button,
  toaster
} from 'evergreen-ui'

import Combobox from '../utils/combobox'

import { WifiHandler } from '../../network'
import { NodeState, PrinterState }  from '../../store/state'

type Props = {
  node: NodeState,
  save?:Function, 
  data?: any, 
  onSave?: Function, 
  onError?: Function
}

export default class Form extends React.Component<Props> {
  state = {
    wifiAttrs: {
      ssid:     '',
      psk: ''
    },
    loading: false,
    selectedNetwork: null,
    networks: [],
    networksLoading: false

  }
  cancelRequest = null

  constructor(props:any) {
    super(props)

    this.connectToWifi = this.connectToWifi.bind(this)
    this.cancelRequest = WifiHandler.cancelSource();
    // this.saveNode = this.savePrinter.bind(this)
  }

  componentWillUnmount() {
    if (this.cancelRequest) 
      this.cancelRequest.cancel("Left wifi form")
  }

  componentDidMount() {
    this.loadNetworks()
  }



  loadNetworks() {
    this.setState({networksLoading: true})
    WifiHandler.networks(this.props.node, { cancelToken: this.cancelRequest.token })
    .then((response) => {
        var networks = []
        if (response.data.data && response.data.data.payload) {
          networks = Object.values(response.data.data.payload)
        }
        this.setState({networksLoading: false, networks: networks})
    })
    .catch((error) => {
        console.log(error)
        this.setState({networksLoading: false})
    })
  }

  // get values():{name?:string, port:string, baudrate:string} {
  //   return {
  //     name:     this.state.name.length > 0 ? this.state.name : this.state.port,
  //     description:   this.state.description,
  //     settings: this.state.settings
  //   }
  // }

  // componentDidMount() {
  //   if (this.props.data) {
  //     var data = this.props.data || {}
  //     if (!data.description)
  //       data.description = ""
      
  //     this.setState({nodeAttrs: {...this.state.nodeAttrs, ...data}})
  //   }
  // }

  // componentDidUpdate(prevProps, prevState) {    
  //   if (!prevProps.data && this.props.data) {
  //     var data = this.props.data || {}
  //     if (!data.description)
  //       data.description = ""
  //     this.setState({nodeAttrs: {...this.state.nodeAttrs, ...data}})
  //   }
  // }

  connectToWifi() {
    this.setState({
      loading: true
    })
    WifiHandler.connect(this.props.node, this.state.wifiAttrs)
    .then((response) => {
      console.log(response.data)
      toaster.success(`Wifi has been added`)
      this.setState({
        loading: false
      })
    })
    .catch((error) => {
      console.log(error)
      if (this.props.onError) {
        this.props.onError(error)
      }
      else {
        var errors = [""]
        if (error.response && error.response.data && error.response.data.errors) {
            errors = Object.keys(error.response.data.errors).map((key, index) => {
              return  `${key} : ${error.response.data.errors[key]}\n`
            })
        }

        toaster.danger(
          `Unable to save wifi connection`, 
          {description: errors}
        )
      }
      this.setState({
        loading: false
      })
    })
  }


  render() {
    return (
      <Pane width={"100%"}>
        <Label
            htmlFor="name"
            marginBottom={4}
            display="block"
          >
            Wifi SSID
          </Label>
          <Combobox 
          openOnFocus 
          items={this.state.networks} 
          itemToString={item => item ? `${item.ssid}` : ''}
          selectedItem={this.state.selectedNetwork ? this.state.selectedNetwork : ''}
          placeholder={this.state.networks.length > 0? "SSID" : "No Networks Found"} 
          inputProps={{
            onChange: (e) => {
              var val = e.target.value.trim()
              var sn = null
              if (val) {
                sn = {ssid: val}
              }
              this.setState({
                selectedNetwork: sn,
                wifiAttrs: {
                  ...this.state.wifiAttrs,
                  ssid: val
                }
              })
            }
          }}
          // autocompleteProps={{
          //   renderItem: this.renderItem.bind(this)
          // }}
          marginTop={4} 
          marginBottom={4}  
          width="100%" 
          height={48}
          isLoading={this.state.networksLoading}
          // disabled={this.state.networks.length < 1}
          onChange={selected => {
            if (selected) {
              this.setState({
                selectedNetwork: selected,
                wifiAttrs: {
                  ...this.state.wifiAttrs,
                  ssid: (selected && selected.ssid)
                }
              })
            }
          }
          }
        />
        
        <Label
            htmlFor="Passphrase"
            marginBottom={4}
            display="block"
          >
            Wifi Passphrase
          </Label>
        <TextInput 
          name="psk" 
          placeholder="Passphrase" 
          marginBottom={4}  
          width="100%" 
          height={48}
          value={this.state.wifiAttrs.psk}
          onChange={e => 
            this.setState({
              wifiAttrs: {
                ...this.state.wifiAttrs,
                psk: e.target.value     
              }
            })
          }
        />

        
        <Pane padding={15}>
            <Button isLoading={this.state.loading} appearance="primary" onClick={this.connectToWifi}>Connect</Button>
          </Pane>
      </Pane>
    )
  }
}
