

export { NodeState, createNodeState } from './node'
export { serviceState, AttachmentModel, ServiceModel, ServiceState } from './service'
export { printerState, PrinterModel, PrinterState } from './printer'
export { printState, PrintModel, PrintState } from './print'
export { cameraState, CameraModel, CameraState } from './camera'

import { createNodeState } from './node'

var localnode: NodeState = createNodeState("localhost", document.location.hostname, "5000")

var nodes = [localnode]
export const initialState = {
  nodes:           nodes,
  activeNode:   nodes[0],
  errors:             {},
  notifications:      [],
  connections:        [/* Connection */]
}
