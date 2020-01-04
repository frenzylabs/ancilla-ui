

export { NodeState } from './node'
export { serviceState, AttachmentModel, ServiceModel, ServiceState } from './service'
export { printerState, PrinterModel, PrinterState } from './printer'
export { printState, PrintModel, PrintState } from './print'
export { cameraState, CameraModel, CameraState } from './camera'

import { createNodeState } from './node'

var localnode = createNodeState("localhost", document.location.hostname, "5000")

export const initialState = {
  nodes:           [localnode],
  activeNode:   localnode,
  errors:             {},
  notifications:      [],
  connections:        [/* Connection */]
}