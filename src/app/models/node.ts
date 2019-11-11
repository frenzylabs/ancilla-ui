import { node } from "prop-types"
import Device from "./device"
import Printer from "./printer"
//
//  printer.ts
//  ancilla
// 
//  Created by Wess Cope (me@wess.io) on 11/05/19
//  Copyright 2019 Wess Cope
//

export default class Node {  
  name:string
  apiUrl: string
  webSocketUrl: string
  nodepath: string
  hostname:string
  port: string
  devices: Array<Device> = Array()
  printers: Array<Printer> = Array()
  cameras: Array<{}> = Array()

  constructor(name: string, hostname: string, port: string = "", nodepath: string = "") {
    // ...
    if (!nodepath) {
      nodepath = name
    }

    this.name = name
    this.hostname = hostname
    this.port = port
    this.nodepath = nodepath
    this.apiUrl = document.location.protocol+ "//" + this.hostname
    if (this.port.length > 0)
      this.apiUrl += `:${this.port}`
  }
}
