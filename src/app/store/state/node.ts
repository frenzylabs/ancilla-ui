import { ServiceState, PrinterState } from './index'



export type NodeState = {  
  name:string,
  apiUrl: string,
  webSocketUrl: string,
  nodepath: string,
  hostname:string,
  port: string,
  services: Array<ServiceState>
}

export function createNodeState(name: string, hostname: string, port: string = "", nodepath: string = "") {
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
    services: []
  }
}
