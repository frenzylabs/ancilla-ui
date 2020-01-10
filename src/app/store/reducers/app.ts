
import { initialState, NodeState, createNodeState } from '../state'

import { nodeReducer } from './nodes'

const appReducer = (state = initialState, action) => {
  // console.log("APP REDUCER: ", action)
  switch (action.type) {
    case 'RECEIVED_FEATURES': {
      return { ...state, ...{ username: action.username, features: action.features }}
    }
    case 'RECEIVED_NODES': {
      console.log("NODES = ", action)
      var activeNode = state.activeNode
      var nodes = Object.keys(action.data.nodes).map((name) => {
        var node = action.data.nodes[name]
        // NodeState()
        var hostname = "" //node.addresses ? node.addresses[0]
        if (node.server && node.server.length > 1)
          hostname = node.server
        else if (node.addresses && node.addresses.length > 0) {
          hostname = node.addresses[0]
        }
        

        
        if(activeNode.hostname == hostname) {
          var nstate = createNodeState(name, hostname, `${node.port}`, activeNode.services)
          activeNode = {...state.activeNode, ...nstate}
          return activeNode
        } else {
          return createNodeState(name, hostname, `${node.port}`)
        }
        // {"addresses": ["192.168.1.129"], "port": 5000, "server": "ancilla.local.", "type": "_ancilla._tcp.local."}
      })

      // let services = state.services.map((item) => {
      //   if (item.id == action.service.id) {
      //     return {...item, ...action.data}
      //     // return serviceReducer(item, action)
      //   }
      //   return item
      // })
      console.log("RECEiveD NODES ", nodes)
      return {...state, nodes: nodes, activeNode: activeNode}      
    }
    case 'RECEIVED_NOTIFICATION':
      if (!action.content.id) return state
      var notifications = state.notifications
      notifications[action.content.kind] = notifications[action.content.kind] || {}
      var existingNot = notifications[action.content.kind][action.content.id] || {}
      notifications[action.content.kind][action.content.id] = { ...existingNot, ...action.content}
        
      return { ...state, notifications: {...state.notifications, ...notifications}}  

    default: {
        // note: since state doesn't have "user",
        // so it will return undefined when you access it.
        // this will allow you to use default value from actually reducer.
      var activeNode = nodeReducer(state.activeNode, action)
      let nodes = state.nodes.map((item) => {
        if (item == state.activeNode) {
          return activeNode
          // return serviceReducer(item, action)
        }
        return item
      })
      return {...state, nodes: nodes, activeNode: activeNode}
    }
      // return state
  }
}

export default appReducer