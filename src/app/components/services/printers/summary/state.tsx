//
//  state.tsx
//  ancilla
// 
//  Created by Wess Cope (me@wess.io) on 11/07/19
//  Copyright 2019 Wess Cope
//

import React from 'react'
import { Link } from 'react-router-dom'
import Dayjs from 'dayjs'

import {
  Pane,
  Heading,
  Text,
  Paragraph,
  Strong,
} from 'evergreen-ui'

import PubSub from 'pubsub-js'

import PrinterAction from '../../../../store/actions/printers'


import { NodeState, PrinterState }  from '../../../../store/state'

type Props = {
  node: NodeState, 
  service: PrinterState,
  match: any,
  dispatch: Function
}


export default class State extends React.Component<Props> {
  requestTopic = ''
  eventTopic = ''
  pubsubRequestToken = null
  pubsubToken        = null

  constructor(props:any) {
    super(props)

    
    this.state = {
      printState: {
        status: "idle",
        print: {}
      },
      connected: false
    }
    
    this.receiveEvent    = this.receiveEvent.bind(this)
    this.setupPrint    = this.setupPrint.bind(this)

    
  }

  componentDidMount() {
    this.setupPrint()
  }

  componentDidUpdate(prevProps, prevState) {
    var prevPrint = prevProps.service.currentPrint
    var curPrint = this.props.service.currentPrint

    if (prevPrint.model != curPrint.model) {
      this.setupPrint()
    }
  }

  setupPrint() {
    if (this.props.service) {
      this.eventTopic = `${this.props.node.uuid}.${this.props.service.identity}.events.printer.print`

      if (this.pubsubToken) {
        PubSub.unsubscribe(this.pubsubToken)
      }
      this.pubsubToken = PubSub.subscribe(this.eventTopic, this.receiveEvent);
    }
  }

  receiveEvent(msg, data) {
    var [to, kind] = msg.split("events.")

    switch(kind) {
      case 'printer.print.state.changed':              
          this.props.dispatch(PrinterAction.updatePrint(this.props.service, data))
          break
      case 'printer.print.started':
          this.props.dispatch(PrinterAction.updatePrint(this.props.service, data))
          break
      case 'printer.print.cancelled':
          this.props.dispatch(PrinterAction.updatePrint(this.props.service, data))
          break
      case 'printer.print.failed':
          this.props.dispatch(PrinterAction.updatePrint(this.props.service, data))
          break
      default:
        break
    }    
  }

  renderRow(key:string, value:any) {
    var valcomp
    if (typeof(value) == 'string') {
      valcomp = (<Text size={400}>{value}</Text>)
    } else {
      valcomp = value
    }
    return (
      <Pane display="flex" marginBottom={6}>
        <Heading size={500} display="flex" flex={1} marginRight={8}>{key}</Heading>
        {valcomp}
      </Pane>
    )
  }

  getProgress() {
    var curprnt = this.props.service.currentPrint.model
    if (curprnt && curprnt.state) {
      let pg = (curprnt.state["pos"] / (curprnt.state["end_pos"] || 1) * 100).toFixed(2)
      return `${pg}%` 
    }
    return ``
  }

  getPrinterTemp() {
    var curprnt = this.props.service
    if (curprnt && curprnt.state) {
      const r = /([T|B|C]\d*):([^\s\/]+)\s*\/([^\s]+)/g
      var temp = curprnt.state["temp"] || ""
      var matches = [...temp.matchAll(r)]

      var alltemps = matches.map((t) => {
        if (t.length < 4) return ""
        return (
          <Paragraph key={t[1]}>
            <Text>{t[1]}:&nbsp;</Text>
            <Text>{t[2]} / {t[3]}</Text>
          </Paragraph>
        )
      })
      return (<Pane>
        {alltemps}
      </Pane>)
    }
    return ``
  }

  renderLastPrint() {    
    var curprnt = this.props.service.currentPrint.model
    if (curprnt && curprnt.name && curprnt.status != "running") {
      var created_at = Dayjs.unix(curprnt.created_at).format('MM.d.YYYY - hh:mm:ss a')
      return (
        <div>
          {this.renderRow("Last Print", <Link to={`/printers/${this.props.service.id}/prints/${curprnt.id}`}>{curprnt.name}</Link>)}
          {this.renderRow("Status", curprnt.status)}
          {this.renderRow("Started On", `${created_at}`)}
          {this.renderRow("Slice File", (curprnt.print_slice && curprnt.print_slice["name"]) || "")}
          {this.renderRow("Duration", `${Math.round(curprnt.duration)}`)}
        </div>
      )
    }
  }

  renderCurrentPrint() {    
    var curprnt = this.props.service.currentPrint.model
    if (curprnt && curprnt.status == "running") {
      var created_at = Dayjs.unix(curprnt.created_at).format('MM.d.YYYY - hh:mm:ss a')
      return (
        <div>
          {this.renderRow("Current Print", curprnt.name)}
          {this.renderRow("Status", curprnt.status)}
          {this.renderRow("Started On", `${created_at}`)}
          {/* {this.renderRow("Filament", "14.41m")}
          {this.renderRow("Est Time", "12.4 hours")}
          {this.renderRow("Time left", "00:00:00")} */}
          {this.renderRow("Slice File", (curprnt.print_slice && curprnt.print_slice["name"]) || "")}
          {this.renderRow("Duration", `${Math.round(curprnt.duration)}`)}
          {this.renderRow("Progress", this.getProgress())}
          
        </div>
      )
    }
  }


  renderLog() {
    return (
      <Pane display="flex" marginBottom={10} marginTop={10}>
        <Link to={`${this.props.match.url}/logs`}>Logs</Link>
      </Pane>
    )
  }

  render() {
    return (
      <Pane display="flex" flex={1} padding={20} margin={10} background="white" border="default" flexDirection="column">
        {this.renderLastPrint()}
        {this.renderCurrentPrint()}
        {this.renderRow("Printer Temp", this.getPrinterTemp())}
        <Pane>
          <Link to={`/printers/${this.props.service.id}/prints`}>All Prints</Link>
        </Pane>
        {this.renderLog()}
      </Pane>
    )
  }
}
