export type AttachmentModel = {
  id: number,
  settings: object,
  listeners: object,
  parent: ServiceModel,
  attachment: ServiceModel,
  created_at: number,
  updated_at: number
}


export type ServiceModel = {
  id: number,
  name: string,
  kind: string,
  settings: object,
  configuration: object,
  attachments: Array<AttachmentModel>,
  event_listeners: object
  created_at: number,
  updated_at: number
}

export type ServiceState = {
  id: number,
  name: string,
  kind: string,
  model: ServiceModel,
  state: object,
  logs: []  
}


export function serviceState(model: ServiceModel, state: {} = {}, logs: [] = []) {
  return {
    id: model.id,
    name: model.name,
    kind: model.kind,
    model: model,
    state: state,
    logs: logs
  }
}
