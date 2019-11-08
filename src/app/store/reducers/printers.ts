
export function PrinterState(list = {data: [], meta: {}}, project = {}) {
  return {
    list: list,
    project: project
  }
}

export const ProjectAction = {
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

const initialState = PrinterState();

export function PrinterReducer(state = initialState, action) {
  switch(action.type) {
  case 'PROJECT_LIST':
    return {
      ...state, 
      list: action.data
    }
  case 'PROJECT_VIEW':
    return {
      ...state, 
      project: action.data
    }  
  default:
    return state;
  }
}
