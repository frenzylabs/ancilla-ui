import Node from '../../models/node'

// const apiUrl = document.location.protocol+ "//" + document.location.hostname + ":5000"
var localnode = new Node("localhost", document.location.hostname, "5000")

export const initialState = {
  nodes:           [localnode],
  activeNode:   localnode,
  errors:             {},
  notifications:      [],
  connections:        [/* Connection */]
}