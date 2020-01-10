import { ServiceState } from '../state'

// export type AttachmentModel = {
//   id: number,
//   settings: object,
//   listeners: object,
//   parent: ServiceModel,
//   attachment: ServiceModel,
//   created_at: number,
//   updated_at: number
// }


// export type ServiceModel = {
//   id: number,
//   name: string,
//   kind: string,
//   settings: object,
//   configuration: object,
//   attachments: Array<AttachmentModel>,
//   event_listeners: object
//   created_at: number,
//   updated_at: number
// }


// export type ServiceState = {
//   id: number,
//   name: string,
//   kind: string,
//   model: ServiceModel,
//   state: object,
//   logs: []  
// }

// export function ServiceState(model: ServiceModel, state: {} = {}, logs: [] = []) {
//   return {
//     id: model.id,
//     name: model.name,
//     kind: model.kind,
//     model: model,
//     state: state,
//     logs: logs
//   }
// }



// const initialState = PrinterState({});

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
        // console.log("PRINTER RECEIVED DATA", action)
        // var logs = printerstate.logs.concat(action.data)
        var logs = [...state.logs, action.data]
        // if (logs.length > 100) {
        //   logs.shift()
        // }
        return {
          ...state,
          logs: logs
        }
    default:
      return state
  }
}
//   case 'PRINTER_PRINT_UPDATED':
//     // console.log("PRINTER RECEIVED PRINT", action)
//     return {
//       ...serviceState,
//       currentPrint: action.data
//     }
//   case 'PRINTER_RECEIVED_PRINTS':
//       console.log("PRINTER RECEIVED PRINTS", action)
//       var prints = action.data.prints.reduce((acc, item) => {
//         acc = acc.concat(printState(item))
//         return acc
//       }, [])
  
//       var newstate = {
//         ...serviceState, 
//         prints: prints
//       }
//       return newstate
//   case 'PRINTER_RECEIVED_LAST_PRINT':
//       console.log("PRINTER RECEIVED PRINT", action)
//       return {
//         ...serviceState,
//         currentPrint: printState(action.data)
//       }
//   case 'PRINTER_RECEIVED_STATE':
//     // console.log("PRINTER RECEIVED STATE", action)
//     return {
//       ...serviceState,
//       state: action.data
//     }
//   case 'PRINTER_RECEIVED_DATA':
//     // console.log("PRINTER RECEIVED DATA", action)
//     // var logs = printerstate.logs.concat(action.data)
//     return {
//       ...serviceState,
//       logs: [...serviceState.logs, action.data]
//     }
    
//   case 'PRINTER_LIST':
//     return {
//       ...serviceState, 
//       list: action.data
//     }
//   case 'RECEIVED_LOGS':
//     return {
//       ...serviceState, 
//       project: action.data
//     }  
//   default:
//     return serviceState;
//   }
// }
