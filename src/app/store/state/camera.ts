
import { ServiceModel, ServiceState, serviceState } from './service'

export type CameraModel = {  
  id: number,
  name: string,
  endpoint: string,
  created_at: number,
  updated_at: number,
  service: object
}


export type CameraServiceModel = ServiceModel & { model: CameraModel}

export type CameraState = ServiceState & {
  model: CameraServiceModel,
  currentRecording?: object
}


export function cameraState(model: CameraModel, state: {} = {}, logs: [] = [], currentRecording = {}, config = {}, settings = {}) {
  var res = serviceState.call(this, ...arguments)  
  res["currentRecording"] = currentRecording
  return res
}