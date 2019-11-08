
const appReducer = (state = {notifications: {}}, action) => {
  // console.log("APP REDUCER: ", action)
  switch (action.type) {
    case 'RECEIVED_FEATURES':
      return { ...state, ...{ username: action.username, features: action.features }}
    case 'RECEIVED_NOTIFICATION':
      if (!action.content.id) return state
      var notifications = state.notifications
      notifications[action.content.kind] = notifications[action.content.kind] || {}
      var existingNot = notifications[action.content.kind][action.content.id] || {}
      notifications[action.content.kind][action.content.id] = { ...existingNot, ...action.content}
        
      return { ...state, notifications: {...state.notifications, ...notifications}}  

    default:
      return state
  }
}

export default appReducer