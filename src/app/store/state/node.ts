import { ServiceState, PrinterState } from './index'



export type NodeState = {  
  name:string,
  network_name:string,
  apiUrl: string,
  url: string,
  // webSocketUrl: string,
  hostname:string,
  port: string,
  settings: any,
  services: Array<ServiceState>
  
}

export function createNodeState(network_name: string, name: string, hostname: string, port: string = "", settings: any = {}, services: Array<ServiceState> = []) {
  // ...

  var url = document.location.protocol+ "//" + hostname  
  if (port.length > 0)
    url += `:${port}`

  var apiUrl = url + "/api"

  return {
    network_name: network_name,
    name: name,
    hostname: hostname,
    port: port,
    url: url,
    apiUrl: apiUrl,
    settings: settings,
    services: services
  }
}
