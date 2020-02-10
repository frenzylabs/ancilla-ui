export type PrintModel = {
  id: number,
  created_at: number,
  updated_at: number
  name: string,
  status: string,
  state: object,
  printer_snapshot: object,
  print_slice: object,
  duration: number,
  layerkeep_id?: number
}

export type PrintState = {
  id: number,
  model: PrintModel,
  status: string
}


export function printState(model: PrintModel, status: string = "") {
  if (status.length == 0)
    status = model.status
  return {
    id: model.id,
    model: model,
    status: status,
  }
}
