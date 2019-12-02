
//
//  node.ts
//  ancilla
// 
//  Created by Kevin Musselman (kmussel@gmail.com) on 11/05/19
//  Copyright Frenzylabs, LLC 2019
//


import { node } from "prop-types"
import Service from "./service"
import Printer from "./printer"

export default class Node {  
  name:string
  apiUrl: string
  webSocketUrl: string
  nodepath: string
  hostname:string
  port: string
  services: Array<Service> = Array()
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
