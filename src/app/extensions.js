//
//  extensions.ts
//  ancilla
// 
//  Created by Wess Cope (wess@frenzylabs.com) on 01/02/20
//  Copyright 2019 FrenzyLabs, LLC.
//

import PubSub from 'pubsub-js'

(function() {
  Object.toMap = function(obj) {
    const _map = new Map()
    
    Object.keys(obj).forEach(k => _map.set(k, obj[k]))
  
    return _map
  }
  
  Object.hasKey = function(obj, key) {
    return Object.keys(obj).indexOf(key) > -1
  }  

  Object.getValue = function(obj, key, defaultValue = null) {
    if(Object.hasKey(obj, key) == false) { return defaultValue }

    return obj['key']
  }

  PubSub.make_request = function(node, data) {
    PubSub.publish(node.uuid + ".request", data)
  }
  
})()
