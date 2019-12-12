// import {
//   Table,
//   Popover,
//   Position,
//   Menu,
//   Avatar,
//   Text,
//   IconButton,
//   TextDropdownButton
//   // eslint-disable-next-line import/no-unresolved
// } from 'evergreen-ui'

// import React from 'react'
// import Dayjs from 'dayjs'


// export default class LayerkeepSliceFileView extends React.Component {

//   state = {
//     dialog: {
//       layerkeep: 	false,
//       local: 			false,
//       sd: 				false
//     },
//     isSaving: false,
//     sections: {
//       'all': [],
//       // 'LayerKeep': [
//       // 	'layerkeep-file-1',
//       // 	'layerkeep-file-2',
//       // 	'layerkeep-file-3',
//       // 	'layerkeep-file-4',
//       // 	'layerkeep-file-5',
//       // ],
//       'Local': [
//         /* {name:, id:, updated_at} */
//       ],
//       // 'SD Card': [
//       // 	'sd-card-file-1',
//       // 	'sd-card-file-2',
//       // 	'sd-card-file-3',
//       // 	'sd-card-file-4',
//       // 	'sd-card-file-5',
//       // ]
//     },

//     currentSection: 0
//   }

//   form:Form = {}
  
//   constructor(props:any) {
//     super(props)

//     this.listLocal      = this.listLocal.bind(this)
//     this.selectSection	= this.selectSection.bind(this)
//     this.deleteFile     = this.deleteFile.bind(this)
//     this.saveFile				= this.saveFile.bind(this)
//     this.toggleDialog		= this.toggleDialog.bind(this)
//     this.renderRow 			= this.renderRow.bind(this)
//     this.renderGroup 		= this.renderGroup.bind(this)
//     this.renderGroups		= this.renderGroups.bind(this)
//     this.renderTopBar		= this.renderTopBar.bind(this)
//     this.renderSection	= this.renderSection.bind(this)
//   }

//   componentDidMount() {
//     this.listLocal()
//   }