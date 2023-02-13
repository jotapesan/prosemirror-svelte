import type { EditorState } from "prosemirror-state"
import type { Mark, NodeType } from "prosemirror-model"
import type { MarkType } from "prosemirror-model"
import type { ResolvedPos } from "prosemirror-model"

const mapFromMarks = (marks:readonly Mark[]|null):{[key: string]: Mark}|null => {
  if(!marks) return null
  
  const map:{[key: string]: Mark} = {}
  for (let i = 0; i < marks.length; i++) {
    map[marks[i].type.name] = marks[i]
  }
  return map
}

const getMarksForResolvedPosition = (resolvedPosition:ResolvedPos) => {
  const marks = resolvedPosition.marks()
  return mapFromMarks(marks)
}

/**
 * Get an array of the current active marks
 * @param editorState {EditorState}
 * @return {{activeMarks: Object<string,Mark>, marksInSelection: Object<string,Mark>,, marksAtHead: Object<string,Mark>, storedMarks: Object}}
 */
export const getCurrentMarks = (editorState:EditorState) => {
  const {$head, empty, from, to} = editorState.selection
  
  let marksInSelection:{[key: string]: Mark} = {}
  
  const storedMarks = mapFromMarks(editorState.storedMarks)
  const marksAtHead = getMarksForResolvedPosition($head)
  
  if (!empty) {
    editorState.doc.nodesBetween(from, to, (node) => {
      node.marks.forEach((mark) => {
        marksInSelection[mark.type.name] = mark
      })
    })
  }
  
  const activeMarks = storedMarks ? storedMarks : Object.assign({}, marksInSelection, marksAtHead)
  
  return {
    activeMarks,
    marksInSelection,
    marksAtHead,
    storedMarks
  }
}

/**
 * Get the type of node at the selection head
 * @param editorState {EditorState}
 * @returns {{type: NodeType, attrs: Object}}
 */
export const getNodeTypeAtSelectionHead = (editorState:EditorState) => {
  const {$head} = editorState.selection
  const node = $head.node()
  
  return {
    type: node.type,
    attrs: node.attrs
  }
}
