//
//  printer.js
//  ancilla
// 
//  Created by Kevin Musselman (kmussel@gmail.com) on 11/12/19
//  Copyright 2019 Frenzylabs, LLC
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
              dispatch(CameraAction.updateRecordings(serviceState, response.data.recordings || []))
            })
      }
    }
  },

  updateRecordings: (service, recordings) => ({
    type: 'CAMERA_RECEIVED_RECORDINGS',
    service: service,
    data: recordings
  }),
}

export default CameraAction