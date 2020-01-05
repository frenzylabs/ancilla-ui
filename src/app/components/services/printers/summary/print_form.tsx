// //
// //  print_form.tsx
// //  ancilla
// // 
// //  Created by Kevin Musselman (kmussel@gmail.com) on 11/10/19
// //  Copyright 2019 Frenzylabs, LLC
// //

// import React from 'react'
// import Link from 'react-router-dom'

// import {
//   Pane,
//   TextInput,
//   Checkbox,
//   Tooltip,
//   Icon,
//   Paragraph,
//   toaster
// } from 'evergreen-ui'

// import fuzzaldrin from 'fuzzaldrin-plus'

// import Combobox from '../../../utils/combobox'
// import AutocompleteItem from '../../../utils/autocompleteItem'

// import request from '../../../../network/files'
// import CameraHandler from '../../../../network/camera'

// export default class PrintForm extends React.Component<{save:Function, loading:boolean}> {
//   state = {
//     newPrint: {
//       name:     '',
//       file_id:     '',
//       baud_rate: '',
//       settings: {
//         record_print: false,
//         cameras: {}
//       },
      
//       layerkeep_sync: false
//     },
//     selectedFile: null,
//     files: Array<{}>(),
//     cameras: Array<{}>(),
//     filesLoading: true
//   }

//   getFiles() {
//     this.setState({filesLoading: true})
//     request.listLocal(this.props.node)
//     .then((response) => {
//       if (response.data && response.data.data) {
//         this.setState({
//           filesLoading: false,
//           files: response.data.data.map((fp) => {
//             return {key: fp.id, name: fp.name, id: fp.id, description: fp.description}
//           })
//         })
//         // this.setState({files: response.data.files})
//       }
//     }).catch((err) => {
//       toaster.danger(err)
//       this.setState({filesLoading: false})

//     })
//   }

//   getCameras() {
//     var cameras = this.props.node.services.filter(s => {
//         console.log(s)
//         return s.kind == 'camera'
//     })
//     this.setState({cameras: cameras})    
//   }

//   componentDidMount() {
//     window.pf = this
//     this.getFiles()
//     this.getCameras()
//   }

//   save() {
//     // this.props.save(this.values)
//   }



//   toggleCamera(cam, checked) {
//     // if(this.state.newPrint.settings.cameras && this.state.newPrint.settings.cameras[cam.id])
//     var cameras = this.state.newPrint.settings.cameras
//     // var camid = cam.id
//     console.log("toggle cam", cam)
//     if (checked) {
//       cameras = {...cameras, [cam.id]: checked }
//       console.log("cameras checked ", cameras)
//     }
//     else {
//       cameras = (Object.keys(cameras) || []).filter((k) => k != `${cam.id}` ).reduce((map, c) => { map[c] = cameras[c]; return map }, {})
//       console.log("cameras = ", cameras)
//     }
      
//     var newstate = {...this.state.newPrint, settings: {...this.state.newPrint.settings, 
//         cameras: cameras}}
//     console.log("toggle newstate", newstate)
//     this.setState({newPrint: newstate})
//   }
//   cameraChecked(cam) {
//     var res = (this.state.newPrint.settings.cameras && this.state.newPrint.settings.cameras[cam.id])
//     console.log("cam checked = ", res)
//     return res
      
//   }


    
//   renderItem(props) {
//     var item = props.item
//     return <AutocompleteItem {...props} children={
//     <Pane display="flex" flex={1}>
//       <Pane display="flex" flex={1}>
//       {item.name} 
//       </Pane>
//       <Pane>
//         <Tooltip align="right"
//           content={
//             <Paragraph margin={10}>{item.description}</Paragraph>
//           }
//           appearance="card"
//         >
//           <Icon size={12} marginLeft={4} icon="help" />
//         </Tooltip>
//       </Pane>
//    </Pane>} />
//   }


//   renderCameraOptions() {
//     console.log("render Cam options")
//     if (this.state.cameras.length > 0) {
//       return this.state.cameras.map((c) => {
//         return (
//           <Pane display="flex" key={c.id} marginLeft={30}>
//             <Pane display="flex" flex={1}>
//               <Checkbox
//                 label={c.name}
//                 checked={this.cameraChecked(c)}
//                 onChange={e => this.toggleCamera(c, e.target.checked) }              
//               />
//             </Pane>
//           </Pane>
//         )
//       })
//     } else {
//       return (
//         <Pane display="flex" marginTop={10}>
//           <Pane display="flex" flex={1}>
//             No cameras have been added.  
//             Go <Link to={{pathname: `/cameras/new`, state: {redirectTo: this.props.match.url}}}>Here</Link> 
//             to add a new camera.
//           </Pane>
//         </Pane>
//       )
//     }
//   }

//   render() {
//     return (
//       <Pane>

//         <Combobox 
//           openOnFocus 
//           items={this.state.files} 
//           itemToString={item => item ? `${item.name}` : ''}
//           selectedItem={this.state.selectedFile}
//           placeholder={this.state.files.length > 0? "File" : "No Files Found"} 
//           autocompleteProps={{
//             renderItem: this.renderItem.bind(this)
//           }}
//           marginTop={4} 
//           marginBottom={4}  
//           width="100%" 
//           height={48}
//           isLoading={this.state.filesLoading}
//           disabled={this.state.files.length < 1}
//           onChange={selected => {
//             this.setState({
//               selectedFile: selected,
//               newPrint: {
//                 ...this.state.newPrint,
//                 file_id: (selected && selected.id)
//               }
//             })
//           }
//           }
//         />

//         <TextInput 
//           name="name" 
//           placeholder="Print Name" 
//           marginBottom={4}  
//           width="100%" 
//           height={48}
//           onChange={e => 
//             this.setState({
//               newPrint: {
//                 ...this.state.newPrint,
//                 name: e.target.value     
//               }
//             })
//           }
//         />


//         <Pane marginTop={10}>
//           <Pane >
//             <Checkbox
//               label="Use Camera to Record"
//               checked={this.state.newPrint.settings.record_print}
//               onChange={e => 
//                 this.setState({
//                   newPrint: {
//                     ...this.state.newPrint,
//                     settings: {...this.state.newPrint.settings, record_print: e.target.checked}
//                   }
//                 })
//               }
//             />
//           </Pane>
//           {this.state.newPrint.settings.record_print ? this.renderCameraOptions() : null}
//         </Pane>

//         <Pane display="flex" marginTop={10}>
//           <Pane display="flex" flex={1}>
//             <Checkbox
//               label="Sync To LayerKeep"
//               checked={this.state.newPrint.layerkeep_sync}
//               onChange={e => 
//                 this.setState({
//                   newPrint: {
//                     ...this.state.newPrint,
//                     layerkeep_sync: e.target.checked
//                   }
//                 })
//               }
//             />
//           </Pane>
//         </Pane>
//       </Pane>
//     )
//   }
// }
