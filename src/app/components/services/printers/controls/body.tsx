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
      raw: null,
      hotend: {
        current: 0,
        requested: ""
      },
      bed: {
        current: 0,
        requested: ""
      },
      lastUpdate: null
    },
    position: {
      pending: null, // {x: <value>}
      current: {
        x: 0,
        y: 0,
        z: 0
      }
    }
  }

  private relativeModeCommand = [this.props.service.name, "send_command", { cmd: "G91", nowait: false, skip_queue: false}]
  private absoluteModeCommand = [this.props.service.name, "send_command", { cmd: "G90", nowait: false, skip_queue: false}]

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
    this.changedBedTemp   = this.changedBedTemp.bind(this)
    this.incrementBedTemp = this.incrementBedTemp.bind(this)
    this.decrementBedTemp = this.decrementBedTemp.bind(this)  
    this.requestTemp      = this.requestTemp.bind(this)
  }


  componentDidMount() {
    this.getCurrentPosition()
    
    if(Object.keys(this.props.service.state).indexOf('temp') > -1) {
      return
    }

    this.requestTemp()
  }

  componentDidUpdate(prevProps, prevState) {
    if (prevProps.service.state["temp"] != this.props.service.state["temp"]) {
      this.setState({temp: Controls.parseTemp(this.props, this.state)})
    }
    if (prevProps.service.state["position"] != this.props.service.state["position"]) {
      this.setState({position: {...this.state.position, current: Controls.parsePosition(this.props, this.state)}})
    }
    var connected = this.props.service.state['connected']
    if (connected && prevProps.service.state['connected'] != connected) {
      this.getCurrentPosition()
    }
  }


  static parseTemp(props, state) {
    const r     = /([T|B|C]\d*):([^\s\/]+)\s*\/([^\s]+)/g
    var temp    = props.service.state['temp'] || ""
    var matches = [...temp.matchAll(r)]
    let hotend  = (matches.filter((item) => (item[1] || "").startsWith("T"))[0] || [])
    let bed     = (matches.filter((item) => (item[1] || "").startsWith("B"))[0] || [])
    
    return {
      raw: temp,
      hotend: {
        current:    hotend[2] || 0,
        requested:  hotend[3] || 0
      },
      bed: {
        current:    bed[2] || 0,
        requested:  bed[3] || 0
      },
    }
  }

  static parsePosition(props, state) {
    const r     = /([X|Y|Z]):(\d+\.?\d*)/g
    let pos     = (props.service.state['position'] || 'Count').split('Count')[0]
    let matches = [...pos.matchAll(r)]
    let x       = (matches.filter((item) => (item[1] || "").startsWith("X"))[0] || [])
    let y       = (matches.filter((item) => (item[1] || "").startsWith("Y"))[0] || [])
    let z       = (matches.filter((item) => (item[1] || "").startsWith("Z"))[0] || [])

    return {
      raw:  props.service.state['position'] || '',
      x:    x[2] || 0,
      y:    y[2] || 0,
      z:    z[2] || 0
    }
  }


  sendCommand(code:string, nowait:boolean = false, skipQueue:boolean = false) {
    if((this.props.service.state['connected'] || false) == false) { return }

    let cmd = [this.props.service.name, "send_command", { cmd: code.trim(), nowait: nowait, skip_queue: skipQueue}]
    PubSub.make_request(this.props.node, cmd)
  }

  getCurrentPosition() {
    this.sendCommand("M114")
  }

  requestTemp() {
    if(this.props.service.state['printing']) { return }

    this.sendCommand("M105")
  }

  changedTemp(e) {    
    var t = e.target.value
    if (t.length > 0 && isNaN(t)) {
      return
    } 
    this.sendTemp(Target.Hotend, t)
    
  }

  incrementTemp() {
    let frm = parseFloat(this.state.temp.hotend.requested) || 0
    var temp  = (((frm * 10) + 10) / 10).toFixed(2)

    this.sendTemp(Target.Hotend, temp)
  }

  decrementTemp() {
    let frm = parseFloat(this.state.temp.hotend.requested) || 0
    
    var temp  = frm >= 1 ? (((frm * 10) - 10) / 10).toFixed(2) : '0'

    this.sendTemp(Target.Hotend, temp)
  }


  changedBedTemp(e) {
    var t = e.target.value
    if (t.length > 0 && isNaN(t)) {
      return
    } 

    this.sendTemp(Target.Bed, t)
  }

  incrementBedTemp() {
    let frm = parseFloat(this.state.temp.bed.requested) || 0
    var temp  = (((frm * 10) + 10) / 10).toFixed(2)

    this.sendTemp(Target.Bed, temp)
  }

  decrementBedTemp() {
    let frm = parseFloat(this.state.temp.bed.requested) || 0
    var temp  = frm >= 1 ? (((frm * 10) - 10) / 10).toFixed(2) : '0'

    this.sendTemp(Target.Bed, temp)
  }

  sendTemp(target:Target, temp:string) {
    var _temp = this.state.temp
    _temp[(target == Target.Hotend ? 'hotend' : 'bed')]['requested'] = temp

    this.setState({
      ...this.state,
      temp: _temp
    })

    let gcode = target == Target.Hotend ? `M104 S${temp}` : `M140 S${temp}`

    this.sendCommand(gcode.trim(), false, false)
  }

  setRelative(enable:boolean = true) {
    if((this.props.service.state['connected'] || false) == false) { return }

    PubSub.make_request(this.props.node, enable ? this.relativeModeCommand : this.absoluteModeCommand)
  }

  sendMovementCommand(cmd) {
    if(
      (this.props.service.state['connected'] || false) == false ||
      (this.props.service.state['printing'] || false) == true
    ) { return }

    this.setRelative()

    PubSub.make_request(this.props.node, cmd)

    this.setRelative(false)
  }

  move(direction:Direction) {
    var command:Array<any> = ['G1']

    switch(direction) {
      case Direction.Up:
        command = command.concat([
          'Y',
          this.state.distance.value
        ])
        break
      case Direction.Right:
        command = command.concat([
          'X',
          this.state.distance.value > 0 ? -(this.state.distance.value) : 0
        ])
        break
      case Direction.Down:
        command = command.concat([
          'Y',
          this.state.distance.value > 0 ? -(this.state.distance.value) : 0
        ])
        break
      case Direction.Left:
        command = command.concat([
          'X',
          this.state.distance.value
        ])
        break
      case Direction.Extrude:
        command = command.concat([
          'E',
          this.state.distance.value
        ])
        break
      case Direction.ZUp:
        command = command.concat([
          `Z${this.state.distance.value}`,
          
        ])
        break
      case Direction.ZDown:
        command = command.concat([
          `Z-${this.state.distance.value}`
        ])
        break
      case Direction.Home:
        command = ['G28', 'X', 'Y']
        break
      case Direction.ZHome:
        command = ['G28', 'Z']
        break
      case Direction.HomeAll:
        command = ['G28']
        break
    }

    let gcode = command.join(" ")
    let cmd   = [this.props.service.name, "send_command", { cmd: gcode.trim(), nowait: false, skip_queue: false}]

    this.sendMovementCommand(cmd)    
  }

  toggleFan(on:boolean = true) {
    this.sendCommand(on ? "M106" : "M106 S0")
  }

  toggleMotor(on:boolean = true) {
    this.sendCommand(on ? "M17" : "M18")
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
    const current   = this.state.temp.hotend.current
    const requested = this.state.temp.hotend.requested

    return (
      <Pane display="flex" flexDirection="row" alignItems="center">
        <Pane display="flex" flex={1} flexDirection="column" >
          <Heading color="black" size={200}>Hotend: {current}&deg;</Heading>
        </Pane>

        <Pane display="flex" flexDirection="row" alignItems="right" justifyContent="right">
          <Pane>
            <TextInput disabled={!(this.props.service.state['connected'] || false)} width={80} value={requested} placeholder="0.0"  onChange={this.changedTemp} />
          </Pane>

          <Pane display="flex" flexDirection="column" paddingLeft={4}>
            <IconButton disabled={!(this.props.service.state['connected'] || false)} icon="caret-up" height={16} onClick={this.incrementTemp} />
            <IconButton disabled={!(this.props.service.state['connected'] || false)} icon="caret-down" height={16} onClick={this.decrementTemp} />
          </Pane>
        </Pane>

      </Pane>
    )
  }

  renderBedTemp() {
    const current   = this.state.temp.bed.current
    const requested = this.state.temp.bed.requested

    return (
      <Pane display="flex" flex={1} flexDirection="row" alignItems="center">
        <Pane display="flex" flex={1} flexDirection="column" marginRight={64}>
          <Heading color="black" size={200}>Bed: {current}&deg;</Heading>
        </Pane>

        <Pane display="flex" flexDirection="row">
          <Pane>
            <TextInput disabled={!(this.props.service.state['connected'] || false)} width={80} value={requested} placeholder="0.0"  onChange={this.changedBedTemp} />
          </Pane>

          <Pane display="flex" flexDirection="column" paddingLeft={4}>
            <IconButton disabled={!(this.props.service.state['connected'] || false)} icon="caret-up" height={16} onClick={this.incrementBedTemp} />
            <IconButton disabled={!(this.props.service.state['connected'] || false)} icon="caret-down" height={16} onClick={this.decrementBedTemp} />
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
    const enableMotors = !((this.props.service.state['connected'] || false) || (this.props.service.state['printing'] || false))

    return (
      <Pane display="flex" flexDirection="row" alignItems="center" padding={10} paddingLeft={20} paddingTop={10} paddingRight={18}>
        <Pane display="flex" flex={1} flexDirection="row" alignItems="center">
          <Pane marginRight={10}>
            <Heading color="black" size={200}>Fan:</Heading>
          </Pane>

          <Pane className="fan-toggle">
            <Button disabled={!(this.props.service.state['connected'] || false)} height={24} onClick={() => this.toggleFan(true)}>On</Button>
            <Button disabled={!(this.props.service.state['connected'] || false)} height={24} onClick={() => this.toggleFan(false)}>Off</Button>
          </Pane>
        </Pane>

        <Pane display="flex" flexDirection="row" alignItems="center">
          <Pane marginRight={10}>
            <Heading color="black" size={200}>Motors:</Heading>
          </Pane>

          <Pane className="motor-toggle">
            <Button disabled={enableMotors} height={24} onClick={() => this.toggleMotor(true)}>On</Button>
            <Button disabled={enableMotors} height={24} onClick={() => this.toggleMotor(false)}>Off</Button>
          </Pane>
        </Pane>
      </Pane>
    )
  }

  render() {
    const status = ((this.props.service.state['connected'] || false) && (this.props.service.state['printing'] || false))

    return(
      <React.Fragment>
        <Pane display="flex" flexDirection="column" width="100%" padding={8} background="#fff">
          <Heading size={400}>Controls</Heading>
          
          {status == true && (
            <Heading size={300} marginTop={5} color="red">Movement and Motor controls are disabled during printing</Heading>
          )}
          
        </Pane>

        
        <Pane display="flex" flexDirection="row" width="100%" background="#fff" border="default" alignItems="center">
          <Pane display="flex" flexDirection="column">

            <Pane display="flex" flex={1} flexDirection="row" alignItems="center" justifyContent="center">
              <Button disabled={!(this.props.service.state['connected'] || false)} iconBefore="home" marginTop={8} marginBottom={8} marginRight={10} marginLeft={10} onClick={() => this.move(Direction.HomeAll)}>Home All</Button>
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
