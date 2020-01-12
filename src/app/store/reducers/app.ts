
import { initialState, NodeState, NodeNetworkModel, createNodeState } from '../state'

import { nodeReducer } from './nodes'

const appReducer = (state = initialState, action) => {
  // console.log("APP REDUCER: ", action)
  switch (action.type) {
    case 'RECEIVED_FEATURES': {
      return { ...state, ...{ username: action.username, features: action.features }}
    }
    case 'RECEIVED_NODE_MODEL': {
      // console.log("RECEIVED NODE MODEL", action)
      var activeNode = state.activeNode
      if (activeNode.uuid == action.node.uuid) {
        activeNode = {...activeNode, model: action.data.node, uuid: action.data.node.uuid,  name: action.data.node.name}
      }
      let nodes = state.nodes.map((item) => {
        // console.log("RECEIVED NODE MODEL", item.uuid, action.data.node.uuid)

        if (item.uuid == action.data.node.uuid) {
          var anode = {...item, model: action.data.node, name: action.data.node.name}
          
          // return aNode
          // return serviceReducer(item, action)
        }
        return item
      })
      return {...state, nodes: nodes, activeNode: activeNode}
    }
    case 'RECEIVED_NODES': {
      var activeNode = state.activeNode
      var nodes = (action.data.nodes || []).map((node) => {        
        // console.log("NodesActiveNode= ", activeNode)
        // console.log("NodesNode= ", ns)
        if (activeNode.uuid == node.uuid) {
          node.hostname = activeNode.hostname
          var ns = createNodeState(node)
          
          activeNode = {...activeNode, ...ns}
          return activeNode
        }
        return createNodeState(node)        
      })
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
        // console.log("NodeReduce", action)
      var aNode = nodeReducer(state.activeNode, action)
      let nodes = state.nodes.map((item) => {
        // console.log("ITEM, activeNode", item.uuid, state.activeNode.uuid)
        if (item.uuid == state.activeNode.uuid) {
          // console.log("ITEM = activeNode")
          return aNode
          // return serviceReducer(item, action)
        }
        return item
      })
      return {...state, nodes: nodes, activeNode: aNode}
    }
      // return state
  }
}

export default appReducer