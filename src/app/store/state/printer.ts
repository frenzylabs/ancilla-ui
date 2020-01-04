import { ServiceModel, ServiceState, serviceState } from './service'
import { PrintState } from './print'

export type PrinterModel = {
  baud_rate: string,
  created_at: number,
  service: object,
  id: number,
  name: string,
  port: string,
  updated_at: number
}

export type PrinterServiceModel = ServiceModel & { model: PrinterModel}

export type PrinterState = ServiceState & {
  model: PrinterServiceModel,
  currentPrint?: PrintState
}


export function printerState(model: PrinterServiceModel, state: {} = {}, logs: [] = [], currentPrint = {}) {
  var res = serviceState.call(this, ...arguments)  
  res["currentPrint"] = currentPrint
  return res
  // return {
  //   id: model.id,
  //   name: model.name,
  //   model: model,
  //   state: state,
  //   logs: logs,
  //   currentPrint: currentPrint
  // }
}
