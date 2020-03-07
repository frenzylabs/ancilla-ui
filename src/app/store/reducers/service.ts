import { ServiceState } from '../state'


export function serviceReducer(state: ServiceState, action) {
  switch(action.type) {
    case 'SERVICE_RECEIVED_ATTACHMENTS':
      return {
        ...state,
        model: {...state.model, attachments: action.data}
      }
    case 'SERVICE_RECEIVED_ATTACHMENT': {
        var isNew = true
        var attachments = state.model.attachments.map((item) => {
          if (item.id == action.data.id) {
            isNew = false
            return action.data
          }
          return item
        })
        // let curAttachment = state.model.attachments.find((a) => a.id == action.data.id)
        // if (curAttachment) {
        //   var isUpdate = false
          
        //   state.model.attachments
        //   return state
        // } 
        if (isNew)
          attachments.push(action.data)
        // var attachments = [...state.model.attachments, action.data]
        return {
          ...state,
          model: {...state.model, attachments: attachments}
        }  
    }
    case 'SERVICE_RECEIVED_STATE': {
        return {
          ...state,
          state: action.data
        }
    }
    case 'SERVICE_RECEIVED_DATA':
        var logs = [...state.logs, action.data]
        if (logs.length > 100) {
          logs.shift()
        }
        return {
          ...state,
          logs: logs
        }
    default:
      return state
  }
}

