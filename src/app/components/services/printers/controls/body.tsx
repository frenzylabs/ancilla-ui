//
//  body.tsx
//  ancilla
// 
//  Created by Wess Cope (me@wess.io) on 02/19/20
//  Copyright 2019 Wess Cope
//

import React from 'react'

import {
  Pane,
  Heading,
  IconButton,
  SegmentedControl,
  TextInput,
  Switch
} from 'evergreen-ui'

export default class Controls extends React.Component {
  state = {
    distance: {
      options: [
        {label: '0.1',  value: 0.1},
        {label: '1',    value: 1},
        {label: '10',   value: 10},
        {label: '100',  value: 100},
      ],
      value: 1,
      showCustom: false
    },
    temp: 0.0
  }

  constructor(props) {
    super(props)

    this.incrementTemp  = this.incrementTemp.bind(this)
    this.decrementTemp  = this.decrementTemp.bind(this)
    this.changedTemp    = this.changedTemp.bind(this)
    this.renderLocation = this.renderLocation.bind(this)
    this.renderTemps    = this.renderTemps.bind(this)
    this.renderOffsetXY = this.renderOffsetXY.bind(this)
    this.renderOffsetZ  = this.renderOffsetZ.bind(this)
    this.renderDistance = this.renderDistance.bind(this)
    this.renderFan      = this.renderFan.bind(this)
  }

  changedTemp(e) {
    var val = parseFloat(e.currentTarget.value)
    val = isNaN(val) ? 0 : val

    this.setState({
      temp: val
    })
  }

  incrementTemp() {
    var tmp = ((this.state.temp * 10) + 1) / 10

    this.setState({
      ...this.state,
      temp: tmp
    })
  }

  decrementTemp() {
    if(this.state.temp == 0) return

    var tmp = (this.state.temp * 10) - 1
    tmp     = tmp < 1 ? 0 : (tmp / 10).toFixed(1)

    this.setState({
      ...this.state,
      temp: tmp
    })
  }

  renderOffsetXY() {
    return (
      <Pane display="flex" flexDirection="column" alignItems="center" justifyContent="center" marginRight={10} padding={10}>
        <Heading color="black" size={200} marginBottom={10}>X/Y Offset</Heading>

        <Pane display="flex" flexDirection="column" alignItems="center" justifyContent="center">
          <Pane display="flex" flex={1}>
            <IconButton appearance="minimal" icon="caret-up" iconSize={32}/>
          </Pane>

          <Pane display="flex" flex={1} flexDirection="row" alignItems="center" justifyContent="center">
            <IconButton display="flex" appearance="minimal" icon="caret-left" iconSize={32}/>
            <IconButton display="flex" flex={1} appearance="minimal" icon="home" iconSize={20} marginBottom={5}/>
            <IconButton display="flex" appearance="minimal" icon="caret-right" iconSize={32}/>
          </Pane>

          <Pane display="flex" flex={1}>
            <IconButton appearance="minimal" icon="caret-down" iconSize={32}/>
          </Pane>

        </Pane>
      </Pane>
    )
  }
  
  renderOffsetZ() {
    return (
      <Pane display="flex" flexDirection="column" marginLeft={10} padding={10}>
        <Heading color="black" size={200} marginBottom={10}>Z Offset</Heading>

        <Pane display="flex" flexDirection="column" alignItems="center" justifyContent="center">
          <Pane display="flex" flex={1}>
            <IconButton appearance="minimal" icon="caret-up" iconSize={32}/>
          </Pane>

          <Pane display="flex" flex={1} flexDirection="row" alignItems="center" justifyContent="center">
            <IconButton display="flex" flex={1} appearance="minimal" icon="home" iconSize={20} marginBottom={5}/>
          </Pane>

          <Pane display="flex" flex={1}>
            <IconButton appearance="minimal" icon="caret-down" iconSize={32}/>
          </Pane>

        </Pane>        
      </Pane>
    )
  }

  renderDistance() {
    return (
      <Pane display="flex" flex={1}>
        <SegmentedControl
          width="100%"
          options={this.state.distance.options}
          value={this.state.distance.value}
          onChange={value => {
            this.setState({
              distance: {
                ...this.state.distance,
                value: value
              }
            })
          }}
        />
      </Pane>
    )
  }

  renderLocation() {
    return (
      <Pane display="flex" flexDirection="column" padding={10}>
        <Pane display="flex" flexDirection="column">
          <Pane display="flex" flex={1} flexDirection="row" justifyContent="center" padding={10} >
            {this.renderOffsetXY()}
            {this.renderOffsetZ()}
          </Pane>

          <Pane display="flex" flex={1} flexDirection="row" justifyContent="center" padding={10} >
            {this.renderDistance()}
          </Pane>
        </Pane>
      </Pane>
    )
  }

  renderHotendTemp() {
    return (
      <Pane display="flex" flex={1} flexDirection="row" alignItems="center">
        <Pane display="flex" flexDirection="column" marginRight={44}>
          <Heading color="black" size={200}>Hotend: 0.0&deg;</Heading>
        </Pane>

        <Pane display="flex" flexDirection="row">
          <Pane>
            <TextInput width={80} value={this.state.temp} placeholder="0.0"  onChange={this.changedTemp} />
          </Pane>

          <Pane display="flex" flex={1} flexDirection="column" paddingLeft={4}>
            <IconButton icon="caret-up" height={16} onClick={this.incrementTemp} />
            <IconButton icon="caret-down" height={16} onClick={this.decrementTemp} />
          </Pane>
        </Pane>

      </Pane>
    )
  }

  renderBedTemp() {
    return (
      <Pane display="flex" flex={1} flexDirection="row" alignItems="center">
        <Pane display="flex" flexDirection="column" marginRight={64}>
          <Heading color="black" size={200}>Bed: 0.0&deg;</Heading>
        </Pane>

        <Pane display="flex" flexDirection="row">
          <Pane>
            <TextInput width={80} value={this.state.temp} placeholder="0.0"  onChange={this.changedTemp} />
          </Pane>

          <Pane display="flex" flex={1} flexDirection="column" paddingLeft={4}>
            <IconButton icon="caret-up" height={16} onClick={this.incrementTemp} />
            <IconButton icon="caret-down" height={16} onClick={this.decrementTemp} />
          </Pane>
        </Pane>

      </Pane>
    )
  }

  renderTemps() {
    return (
      <Pane display="flex" flexDirection="column" padding={10} paddingTop={10}>
        <Pane display="flex" flexDirection="column">
          <Pane display="flex" flex={1} flexDirection="column" justifyContent="center" padding={10} >
            {this.renderHotendTemp()}
            <br/>
            {this.renderBedTemp()}
          </Pane>
        </Pane>
      </Pane>
    )
  }

  renderFan() {
    return (
      <Pane display="flex" flexDirection="row" alignItems="center" padding={10} paddingLeft={20} paddingTop={10} paddingRight={18}>
        <Pane display="flex" flex={1} flexDirection="row" alignItems="center">
          <Pane marginRight={10}>
            <Heading color="black" size={200}>Fan:</Heading>
          </Pane>

          <Pane><Switch height={18} /></Pane>
        </Pane>

        <Pane display="flex" flexDirection="row" alignItems="center">
          <Pane marginRight={10}>
            <Heading color="black" size={200}>Motors:</Heading>
          </Pane>

          <Pane><Switch height={18} /></Pane>
        </Pane>
      </Pane>
    )
  }

  render() {
    return(
      <React.Fragment>
        <Pane display="flex" width="100%" padding={8} background="#fff">
          <Heading size={400}>Controls</Heading>
        </Pane>

        
        <Pane display="flex" flexDirection="row" width="100%" background="#fff" border="default" alignItems="center">
          <Pane display="flex" flexDirection="column">
            {this.renderLocation()}
            
            <Pane marginRight={10} marginLeft={10} borderBottom></Pane>

            {this.renderTemps()}

            <Pane marginRight={10} marginLeft={10} borderBottom></Pane>

            {this.renderFan()}
          </Pane>

        </Pane>
      </React.Fragment>
    )
  }
}
