import Node from '../../models/node'

import { PrinterState } from './printers'

// const apiUrl = document.location.protocol+ "//" + document.location.hostname + ":5000"
// var localnode = new Node("localhost", document.location.hostname, "5000")

type NodeState = {  
  name:string,
  apiUrl: string,
  webSocketUrl: string,
  nodepath: string,
  hostname:string,
  port: string,
  devices: Array<{}>,
  printers: Array<PrinterState>,
  cameras: Array<{}>
}

function createNodeState(name: string, hostname: string, port: string = "", nodepath: string = "") {
  // ...
  if (!nodepath) {
    nodepath = name
  }

  var apiUrl = document.location.protocol+ "//" + hostname
  if (port.length > 0)
    apiUrl += `:${port}`

  return {
    name: name,
    hostname: hostname,
    port: port,
    nodepath: nodepath,
    apiUrl: apiUrl,
    devices: [],
    printers: [],
    cameras: []
  }
}


var localnode = createNodeState("localhost", document.location.hostname, "5000")

// this.name = name
// this.hostname = hostname
// this.port = port
// this.nodepath = nodepath
// this.apiUrl = document.location.protocol+ "//" + this.hostname
// if (this.port.length > 0)
//   this.apiUrl += `:${this.port}`

// localnode = {
//   name: "localhost"
//   apiUrl: document.location.protocol+ "//" + document.location.hostname,
//   webSocketUrl: string,
//   nodepath: "localhost",
//   hostname: document.location.hostname
//   port: "5000"
//   devices: []
//   printers: Array<Printer> = Array()
//   cameras: Array<{}> = Array()
// }

export const initialState = {
  nodes:           [localnode],
  activeNode:   localnode,
  errors:             {},
  notifications:      [],
  connections:        [/* Connection */]
}