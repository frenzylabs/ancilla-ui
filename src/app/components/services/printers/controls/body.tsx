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
  Button,
  IconButton,
  SegmentedControl,
  TextInput,
  Switch
} from 'evergreen-ui'

import PubSub from 'pubsub-js'

import { NodeState, PrinterState }  from '../../../../store/state'

type Props = {
  node: NodeState, 
  service: PrinterState
}

enum Direction {
  Up,
  Right,
  Down,
  Left,
  Extrude,
  Home,
  ZUp,
  ZDown,
  ZHome,
  HomeAll
}

enum Target {
  Hotend,
  Bed
}

export default class Controls extends React.Component<Props> {
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
    temp: {
      hotend: 0.0,
      bed:    0.0
    }
  }

  constructor(props) {
    super(props)

    this.incrementTemp    = this.incrementTemp.bind(this)
    this.decrementTemp    = this.decrementTemp.bind(this)
    this.changedTemp      = this.changedTemp.bind(this)
    this.renderLocation   = this.renderLocation.bind(this)
    this.renderTemps      = this.renderTemps.bind(this)
    this.renderOffsetXY   = this.renderOffsetXY.bind(this)
    this.renderOffsetZ    = this.renderOffsetZ.bind(this)
    this.renderDistance   = this.renderDistance.bind(this)
    this.renderFan        = this.renderFan.bind(this)
    this.move             = this.move.bind(this)
    this.parseTemp        = this.parseTemp.bind(this)
    this.changedBedTemp   = this.changedBedTemp.bind(this)
    this.incrementBedTemp = this.incrementBedTemp.bind(this)
    this.decrementBedTemp = this.decrementBedTemp.bind(this)  
  }

  getCurrentPosition() {
    let cmd = [this.props.service.name, "send_command", { cmd: "M114", nowait: false, skip_queue: true}]
    
    PubSub.make_request(this.props.node, cmd)
  }

  changedTemp(e) {
    var val = parseFloat(e.currentTarget.value)
    val     = isNaN(val) ? 0 : val

    this.setState({
      temp: {
        ...this.state.temp,
        hotend: val
      }
    })

    this.sendTemp(Target.Hotend)
  }

  incrementTemp() {
    var tmp = ((this.state.temp.hotend * 10) + 1) / 10

    this.setState({
      ...this.state,
      temp: {
        ...this.state.temp,
        hotend: tmp
      }
    })

    this.sendTemp(Target.Hotend)
  }

  decrementTemp() {
    if(this.state.temp.hotend == 0) return

    var tmp = (this.state.temp.hotend * 10) - 1
    tmp     = tmp < 1 ? 0 : parseFloat((tmp / 10).toFixed(1))

    this.setState({
      ...this.state,
      temp: {
        ...this.state.temp,
        hotend: tmp
      }
    })

    this.sendTemp(Target.Hotend)
  }

  changedBedTemp(e) {
    var val = parseFloat(e.currentTarget.value)
    val = isNaN(val) ? 0 : val

    this.setState({
      temp: {
        ...this.state.temp,
        bed: val
      }
    })

    this.sendTemp(Target.Bed)
  }

  incrementBedTemp() {
    var tmp = ((this.state.temp.hotend * 10) + 1) / 10

    this.setState({
      ...this.state,
      temp: {
        ...this.state.temp,
        bed: tmp
      }
    })

    this.sendTemp(Target.Bed)
  }

  decrementBedTemp() {
    if(this.state.temp.hotend == 0) return

    var tmp = (this.state.temp.hotend * 10) - 1
    tmp     = tmp < 1 ? 0 : parseFloat((tmp / 10).toFixed(1))

    this.setState({
      ...this.state,
      temp: {
        ...this.state.temp,
        bed: tmp
      }
    })

    this.sendTemp(Target.Bed)
  }

  sendTemp(target:Target) {
    let gcode = target == Target.Hotend ? `M104 S${this.state.temp.hotend}` : `M140 S${this.state.temp.bed}`
    let cmd   = [this.props.service.name, "send_command", { cmd: gcode.trim(), nowait: true, skip_queue: true}]

    PubSub.make_request(this.props.node, cmd)
  }

  move(direction:Direction) {
    let gcode:string

    switch(direction) {
      case Direction.Up:
        gcode = `G0 Y${this.state.distance.value}`
        break
      case Direction.Right:
        gcode = `G0 X${this.state.distance.value}`
        break
      case Direction.Down:
        gcode = `G0 Y-${this.state.distance.value}`
        break
      case Direction.Left:
        gcode = `G0 X-${this.state.distance.value}`
        break
      case Direction.Extrude:
        gcode = `G0 E${this.state.distance.value}`
        break
      case Direction.Home:
        gcode = 'G8 X Y'
        break
      case Direction.ZUp:
        gcode = `G0 Z${this.state.distance.value}`
        break
      case Direction.ZDown:
        gcode = `G0 Z-${this.state.distance.value}`
        break
      case Direction.ZHome:
        gcode = 'G28 Z'
        break
      case Direction.HomeAll:
        gcode = 'G8'
        break
    }

    let cmd = [this.props.service.name, "send_command", { cmd: gcode.trim(), nowait: true, skip_queue: true}]
    PubSub.make_request(this.props.node, cmd)
  }

  parseTemp() {
    const r     = /([T|B|C]\d*):([^\s\/]+)\s*\/([^\s]+)/g
    var temp    = this.props.service.state['temp'] || ""
    var matches = [...temp.matchAll(r)]
    let hotend  = (matches.filter((item) => (item[1] || "").startsWith("T"))[0] || [])
    let bed     = (matches.filter((item) => (item[1] || "").startsWith("B"))[0] || [])

    

    
    return {
      hotend: {
        current: hotend[2],
        requested: hotend[1]
      },
      bed: {
        current: bed[2],
        requested: bed[1]
      },
    }
  }

  renderOffsetXY() {
    return (
      <Pane display="flex" flexDirection="column" alignItems="center" justifyContent="center" marginRight={10} padding={10}>
        <Heading color="black" size={200} marginBottom={10}>X/Y Offset</Heading>

        <Pane display="flex" flexDirection="column" alignItems="center" justifyContent="center">
          <Pane display="flex" flex={1}>
            <IconButton data-stepper="up" appearance="minimal" icon="caret-up" iconSize={32} onClick={() => this.move(Direction.Up)}/>
          </Pane>

          <Pane display="flex" flex={1} flexDirection="row" alignItems="center" justifyContent="center">
            <IconButton data-stepper="left" display="flex" appearance="minimal" icon="caret-left" iconSize={32} onClick={() => this.move(Direction.Left)}/>
            <IconButton display="flex" flex={1} appearance="minimal" icon="home" iconSize={20} marginBottom={5} onClick={() => this.move(Direction.Home)}/>
            <IconButton data-stepper="right" display="flex" appearance="minimal" icon="caret-right" iconSize={32} onClick={() => this.move(Direction.Right)}/>
          </Pane>

          <Pane display="flex" flex={1}>
            <IconButton data-stepper="down" appearance="minimal" icon="caret-down" iconSize={32} onClick={() => this.move(Direction.Down)}/>
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
            <IconButton appearance="minimal" icon="caret-up" iconSize={32} onClick={() => this.move(Direction.ZUp)}/>
          </Pane>

          <Pane display="flex" flex={1} flexDirection="row" alignItems="center" justifyContent="center">
            <IconButton display="flex" flex={1} appearance="minimal" icon="home" iconSize={20} marginBottom={5} onClick={() => this.move(Direction.ZHome)}/>
          </Pane>

          <Pane display="flex" flex={1}>
            <IconButton appearance="minimal" icon="caret-down" iconSize={32} onClick={() => this.move(Direction.ZDown)}/>
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
    const {hotend} = this.parseTemp()

    return (
      <Pane display="flex" flex={1} flexDirection="row" alignItems="center">
        <Pane display="flex" flexDirection="column" marginRight={44}>
          <Heading color="black" size={200}>Hotend: {hotend.current}&deg;</Heading>
        </Pane>

        <Pane display="flex" flexDirection="row">
          <Pane>
            <TextInput width={80} value={this.state.temp.hotend} placeholder="0.0"  onChange={this.changedTemp} />
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
    const {bed} = this.parseTemp()

    return (
      <Pane display="flex" flex={1} flexDirection="row" alignItems="center">
        <Pane display="flex" flexDirection="column" marginRight={64}>
          <Heading color="black" size={200}>Bed: {bed.current}&deg;</Heading>
        </Pane>

        <Pane display="flex" flexDirection="row">
          <Pane>
            <TextInput width={80} value={this.state.temp.bed} placeholder="0.0"  onChange={this.changedBedTemp} />
          </Pane>

          <Pane display="flex" flex={1} flexDirection="column" paddingLeft={4}>
            <IconButton icon="caret-up" height={16} onClick={this.incrementBedTemp} />
            <IconButton icon="caret-down" height={16} onClick={this.decrementBedTemp} />
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

          <Pane display="flex" flex={1} flexDirection="row" alignItems="center" justifyContent="center">
            <Button iconBefore="home" marginTop={8} marginBottom={8} marginRight={10} marginLeft={10} onClick={() => this.move(Direction.Down)}>Home All</Button>
          </Pane>

            <Pane marginRight={10} marginLeft={10} borderBottom></Pane>
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
