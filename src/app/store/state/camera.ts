
import { ServiceModel, ServiceState, serviceState } from './service'


export type CameraRecordingModel = {  
  id: number,
  task_name: string,
  settings: object,
  status: string,
  created_at: number,
  updated_at: number
}

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
  currentRecording?: CameraRecordingModel
}


export function cameraState(model: CameraServiceModel, state: {} = {}, logs: [] = [], currentRecording = {}, config = {}, settings = {}) {
  var res = serviceState.call(this, ...arguments)  
  res["currentRecording"] = currentRecording
  return res
}