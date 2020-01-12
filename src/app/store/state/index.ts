

export { NodeState, NodeNetworkModel, createNodeState } from './node'
export { serviceState, AttachmentModel, ServiceModel, ServiceState } from './service'
export { printerState, PrinterModel, PrinterState } from './printer'
export { printState, PrintModel, PrintState } from './print'
export { cameraState, CameraModel, CameraState } from './camera'

import { createNodeState, NodeState } from './node'
import Loader from '../../components/loader'

var networkNode = {    
  "name": "Ancilla",  
  "port": "5000",
  "hostname": document.location.hostname
}

  // server?:string,  
  // uuid?: string,
  // ip?: string,
  
  // addresses?: Array<string>
var localnode: NodeState = createNodeState(networkNode)
localnode.services = []
// var localnode: NodeState = createNodeState("0", "localhost", "Ancilla", document.location.hostname, "5000")

var nodes = [localnode]
export const initialState = {
  nodes:           nodes,
  activeNode:   nodes[0],
  activeNodeIndex:    0,
  errors:             {},
  notifications:      [],
  connections:        [/* Connection */]
}
