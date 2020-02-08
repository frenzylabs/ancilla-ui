//
//  cameras.ts
//  ancilla
// 
//  Created by Kevin Musselman (kevin@frenzylabs.com) on 01/08/20
//  Copyright 2019 FrenzyLabs, LLC.
//


import types from './types'
import Camera from '../../network/camera'

export const CameraAction = {
  listRecording(serviceState) {
    return (dispatch, getState) => {
      // console.log("LIST Recordings NODE ACTION state", getState())
      let activeNode = getState().activeNode
      var cancelRequest    = Camera.cancelSource();  
      // dispatch(requestFeatures(username, cancelRequest))
      if (serviceState.model) {
        return Camera.recordings(activeNode, serviceState.model, {cancelToken: cancelRequest.token})
            .then((response) => {
              dispatch(CameraAction.updateRecordings(activeNode, serviceState, response.data.recordings || []))
            })
      }
    }
  },

  startRecording: (node, serviceState, params) => {
    return (dispatch, getState) => {
      // let activeNode = getState().activeNode
      var cancelRequest    = Camera.cancelSource();  
      // dispatch(requestFeatures(username, cancelRequest))
      if (serviceState.id) {
        return Camera.startRecording(node, serviceState.id, params, {cancelToken: cancelRequest.token})
            .then((response) => {
              dispatch(CameraAction.updateRecordings(node, serviceState, response.data.service_model))
              return response
            })
      }
    }
  },

  updateCurrentRecording: (node, service, recording) => ({
    type: 'CAMERA_RECEIVED_RECORDING',
    node: node,
    service: service,
    data: recording
  }),

  updateRecordings: (node, service, recordings) => ({    
    type: 'CAMERA_RECEIVED_RECORDINGS',
    node: node,
    service: service,
    data: recordings
  }),
}

export default CameraAction