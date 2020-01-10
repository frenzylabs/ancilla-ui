import { ServiceState, PrinterState } from './index'



export type NodeState = {  
  name:string,
  apiUrl: string,
  url: string,
  // webSocketUrl: string,
  hostname:string,
  port: string,
  services: Array<ServiceState>
}

export function createNodeState(name: string, hostname: string, port: string = "", services: Array<ServiceState> = []) {
  // ...

  var url = document.location.protocol+ "//" + hostname  
  if (port.length > 0)
    url += `:${port}`

  var apiUrl = url + "/api"

  return {
    name: name,
    hostname: hostname,
    port: port,
    url: url,
    apiUrl: apiUrl,
    services: services
  }
}
