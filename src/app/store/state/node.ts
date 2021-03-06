import { ServiceState, PrinterState } from './index'


export type NodeModel = {  
  id: number,
  name: string,  
  original_name: string,  
  uuid: string,
  settings: object,
  created_at: number,
  updated_at: number
}


export type NodeNetworkModel = {    
  name:string,  
  port?: string,
  hostname?:string,
  network_name?:string,
  uuid?: string,
  ip?: string,  
  server?:string,  
  addresses?: Array<string>
  // apiUrl: string,
  // url: string,
  // hostname:string,
  
}


export type NodeState = {  
  uuid: string,
  name:string,
  networkName:string,
  apiUrl: string,
  url: string,
  hostname:string,
  port: any,
  ip?: string,
  ipUrl?: string,
  server?:string,  
  model?: NodeModel,
  services?: Array<ServiceState>
}


// export function createNodeState(uuid: string, network_name: string, name: string, hostname: string, port: string = "", services: Array<ServiceState> = []) {
  // ...
export function createNodeState(networkModel: NodeNetworkModel, nodeModel: NodeModel = null) {
  
  if (!networkModel.port)
    networkModel.port = process.env.API_PORT || document.location.port

  var hostname = ""
  var server = ""
  if (networkModel.hostname)
    hostname = networkModel.hostname
  else if (networkModel.server && networkModel.server.length > 1)
    hostname = networkModel.server
  else if (networkModel.ip) {
    hostname = networkModel.ip
  }
  else if (networkModel.addresses && networkModel.addresses.length > 0) {
    hostname = networkModel.addresses[0]
  }
  var url = document.location.protocol+ "//" + hostname  

  var networkUrl = document.location.protocol+ "//" + (networkModel.server ? networkModel.server : hostname)
  if (!networkModel.ip && networkModel.addresses && networkModel.addresses.length > 0) {
    networkModel.ip = networkModel.addresses[0]
  }
  var ipUrl = networkModel.ip ? document.location.protocol+ "//" + networkModel.ip : null
  if (networkModel.port && `${networkModel.port}`.length > 1)
    url += `:${networkModel.port}`
    networkUrl += `:${networkModel.port}`
    if (ipUrl)
      ipUrl += `:${networkModel.port}`

  var apiUrl = url + "/api"

  
  var ns = {
    uuid: networkModel.uuid || "0",
    networkName: (networkModel.network_name ? networkModel.network_name : networkModel.name),
    networkUrl: networkUrl,
    name: (networkModel.name ? networkModel.name : networkModel.network_name),
    port: networkModel.port,    
    hostname: hostname,
    url: url,
    apiUrl: apiUrl
  }
  if (nodeModel) {
    ns["model"] = nodeModel
  }
  if (ipUrl) {
    ns["ip"] = networkModel.ip
    ns["ipUrl"] = ipUrl
  }
  if (networkModel.server)
    ns["server"] = networkModel.server
  
  return ns
  // return {
  //   uuid: uuid,
  //   network_name: network_name,
  //   name: name,
  //   hostname: hostname,
  //   port: port,
  //   url: url,
  //   apiUrl: apiUrl,
  //   // settings: settings,
  //   services: services
  // }
}
