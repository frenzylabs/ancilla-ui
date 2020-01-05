//
//  printer.js
//  ancilla
// 
//  Created by Kevin Musselman (kmussel@gmail.com) on 11/12/19
//  Copyright 2019 Frenzylabs, LLC
//

import types from './types'
import Service from '../../network/service'

export const ServiceAction = {
  listAttachments(node, serviceState) {
    return (dispatch, getState) => {
      console.log("LIST PRINTS NODE ACTION state", getState())

      var cancelRequest    = Service.cancelSource();  
      // dispatch(requestFeatures(username, cancelRequest))
      if (serviceState.model) {
        return Service.attachments(node, serviceState.model, {cancelToken: cancelRequest.token})
            .then((response) => {
              dispatch(ServiceAction.updateAttachments(node, serviceState, response.data.attachments || []))
              return response
            })
      }
    }
  },

  saveAttachment(node, serviceState, params) {
    return (dispatch, getState) => {      
      return Service.addAttachment(node, serviceState, params)
        .then((response) => {
          dispatch(ServiceAction.attachmentReceived(node, serviceState, response.data.attachment))
          return response
        })      
    }
  },


  deleteService: (node, serviceState) => {
    return (dispatch, getState) => {
      console.log("DELETE SERVICE NODE ACTION state", getState())
      // let activeNode = getState().activeNode
      var cancelRequest    = Service.cancelSource();  
      // dispatch(requestFeatures(username, cancelRequest))
      if (serviceState.model) {
        return Service.delete(node, serviceState.model, {cancelToken: cancelRequest.token})
            .then((response) => {
              dispatch(ServiceAction.removeService(node, serviceState))
              return response
            })
      }
    }
  },


  updateService: (node, serviceState, params) => {
    return (dispatch, getState) => {
      console.log("UPDATE SERVICE NODE ACTION state", getState())
      // let activeNode = getState().activeNode
      var cancelRequest    = Service.cancelSource();  
      // dispatch(requestFeatures(username, cancelRequest))
      if (serviceState.id) {
        return Service.update(node, serviceState.id, params, {cancelToken: cancelRequest.token})
            .then((response) => {
              dispatch(ServiceAction.serviceUpdated(node, serviceState, response.data.service_model))
              return response
            })
      }
    }
  },


  
      //     var f = response.data.attachment
      //     attachments = attachments.concat(f)
      //     this.setState({
      //       loading: false,
      //       attachments: attachments
      //     })

      // toaster.success(`Attachment ${f.attachment.name} has been successfully added`)
      // closeDialog()
    // })
    // .catch((error) => {
    //   console.log(error)      
    //   this.setState({
    //     loading: false,
    //   })
    //   let errors = Object.keys(error.response.data.errors).map((key, index) => {
    //     return  `${key} : ${error.response.data.errors[key]}<br/>`
    //   })

    //   toaster.danger(
    //     `Unable to save attachment ${JSON.stringify(attachment)}`, 
    //     {description: errors}
    //   )
    // })
    // DeviceHandler.addAttachment(this.props.node, this.props.device.id)
    //   .then((response) => {

    //   }).catch((err) => {
    //     console.log(err)
    //   })
  // }
  // lastPrint(printerState) {
  //   return (dispatch, getState) => {
  //     console.log("LAST PRINT NODE ACTION state", getState())
  //     let activeNode = getState().activeNode
  //     var cancelRequest    = Printer.cancelSource();  
  //     // dispatch(requestFeatures(username, cancelRequest))
  //     console.log("PRINTER STATE =", printerState)
  //     if (printerState.model) {
  //       return Printer.lastPrint(activeNode, printerState.model, {cancelToken: cancelRequest.token})
  //             .then((response) => {
  //               console.log("LAST PRINT = ", response.data.prints)
  //               dispatch(PrinterAction.updateLastPrint(printerState, response.data.prints[0] || {}))
  //             })
  //     }
  //   }
  // },

  attachmentReceived: (node, service, attachment) => ({
    type: 'SERVICE_RECEIVED_ATTACHMENT',
    node: node,
    service: service,
    data: attachment
  }),

  updateAttachments: (node, service, attachments) => ({
    type: 'SERVICE_RECEIVED_ATTACHMENTS',
    node: node,
    service: service,
    data: attachments
  }),

  
  serviceUpdated: (node, service, data) => ({
    type: 'SERVICE_UPDATED',
    node: node,
    service: service,
    data: data
  }),
  // updatePrints: (printer, prnts) => ({
  //   type: 'PRINTER_RECEIVED_PRINTS',
  //   printer: printer,
  //   data: prnts
  // }),

  // updateLastPrint: (printer, prnt) => ({
  //   type: 'PRINTER_RECEIVED_LAST_PRINT',
  //   printer: printer,
  //   data: prnt
  // }),

  getState(node, serviceState) {
    return (dispatch, getState) => {
      // console.log("NODE ACTION state", getState())
      // let activeNode = getState().activeNode
      var cancelRequest    = Service.cancelSource();  
      // dispatch(requestFeatures(username, cancelRequest))
      // console.log(printerState)
      if (serviceState.model) {
        return Service.state(node, serviceState.model, {cancelToken: cancelRequest.token})
              .then((response) => {
                // dispatch(PrinterAction.updateState(printer, {...printer.state, connected: false}))
                dispatch(ServiceAction.updateState(node, serviceState, response.data || {}))
              })
      }
    }
  },

  removeService: (node, service) => ({
    type: 'SERVICE_DELETED',
    node: node,
    data: service
  }),
  
  updateState: (node, service, service_state) => ({
    type: 'SERVICE_RECEIVED_STATE',
    node: node,
    service: service,
    data: service_state
  }),

  updateLogs: (service, log) => ({
    type: 'SERVICE_RECEIVED_DATA',
    service: service,
    data: log
  }),
  

  list: (list = {data: [], meta: {}}) => {
    return {
      type: 'PROJECT_LIST',
      data: list
    }
  },

  view: (project = {}) => {
    return {
      type: 'PROJECT_VIEW',
      data: project
    }
  }
}

export default ServiceAction