import { EditorState, TextSelection, AllSelection } from "prosemirror-state";
import * as commands from "prosemirror-commands";
import { undo, redo } from "prosemirror-history";
import type { Transaction } from "prosemirror-state";

/**
 * Basic implementation to split the editor state at the current selection
 * @param editorState
 * @return {EditorState}
 */
export const split = (editorState: EditorState) => {
  const transaction = editorState.tr;

  transaction.split(editorState.selection.from);

  // if text is selected split before and after the text
  if (!editorState.selection.empty) {
    transaction.split(transaction.mapping.map(editorState.selection.to));
  }

  return editorState.apply(transaction);
};

/**
 * Apply a selection to the editor state
 * @param editorState {EditorState}
 * @param from {number}
 * @param to {number}
 */
export const selectText = (editorState: EditorState, from: number, to: number) => {
  const selection = TextSelection.create(editorState.doc, from, to);
  const transaction = editorState.tr;
  transaction.setSelection(selection);
  return editorState.apply(transaction);
};

/**
 * Clear the given editor state (keeping the history)
 * @param editorState
 * @returns {EditorState}
 */
export const clear = (editorState: EditorState) => {
  const selection = new AllSelection(editorState.doc);
  const transaction = editorState.tr;
  transaction.setSelection(selection);
  transaction.deleteSelection().scrollIntoView();
  return editorState.apply(transaction);
};

/**
 * Select all content of the given editor state
 * @param editorState
 * @returns {EditorState}
 */
export const selectAll = (editorState: EditorState) => {
  const selection = new AllSelection(editorState.doc);
  const transaction = editorState.tr;
  transaction.setSelection(selection);
  return editorState.apply(transaction);
};

/**
 * Delete the current selection
 * @param editorState
 * @returns {EditorState}
 */
export const deleteSelection = (editorState: EditorState) => {
  if (editorState.selection.empty) return editorState;
  const transaction = editorState.tr;
  transaction.deleteSelection().scrollIntoView();
  return editorState.apply(transaction);
};

/**
 * Replace text at the given positions with a new text
 * @param editorState {EditorState} The current editor state
 * @param from {number} Start position for replacing the text
 * @param to {number} End position for replacing the text
 * @param newText {string} New text to insert
 * @param setSelection {boolean} Update the selection to select the changed content
 * @return {EditorState}
 */
export const replaceTextAtPosition = (editorState: EditorState, from: number, to: number, newText: string, setSelection = false) => {
  const transaction = editorState.tr;

  transaction.replaceWith(from, to, editorState.schema.text(newText));

  if (setSelection) {
    const selection = TextSelection.create(transaction.doc, from, from + newText.length);
    transaction.setSelection(selection);
  }

  return editorState.apply(transaction);
};

/**
 * Toggle the Mark for the given editor state
 * @param editorState {EditorState}
 * @param type {String}
 * @param attrs {Object}
 * @returns {EditorState}
 */
export const toggleMark = (editorState: EditorState, type: string, attrs = null): EditorState => {
  let newEditorState: EditorState;

  const markType = editorState.schema.marks[type];
  const dispatch = (tr: Transaction) => newEditorState = editorState.apply(tr);

  if (commands.toggleMark(markType, attrs)(editorState, dispatch)) {
    //@ts-ignore
    return newEditorState;
  }
  else return editorState;
};

/**
 * Toggle the bold (strong) Mark for the given editor state
 * @param editorState {EditorState}
 * @returns {EditorState}
 */
export const toggleBold = (editorState: EditorState) => {
  return toggleMark(editorState, "strong", null);
};

/**
 * Toggle the italic (em) Mark for the given editor state
 * @param editorState {EditorState}
 * @returns {EditorState}
 */
export const toggleItalic = (editorState: EditorState) => {
  return toggleMark(editorState, "em", null);
};

/**
 * Set the block type for the given editor state
 * @param editorState {EditorState}
 * @param type {String}
 * @param attrs {Object}
 * @returns {EditorState}
 */
export const setBlockType = (editorState: EditorState, type: string, attrs: Object): EditorState => {
  let newEditorState: EditorState;

  const nodeType = editorState.schema.nodes[type];
  const dispatch = (tr: Transaction) => newEditorState = editorState.apply(tr);

  if (commands.setBlockType(nodeType, attrs)(editorState, dispatch)) {
    //@ts-ignore
    return newEditorState;
  }
  else {
    return editorState;
  }
};

/**
 *
 * @param editorState {EditorState}
 * @param attrs {Object}
 * @param from {number|null}
 * @param to {number|null}
 * @returns {EditorState}
 */
export const insertImage = (editorState: EditorState, attrs: Object, from: number | null = null, to: number | null = null) => {

  if (from === null) from = editorState.selection.anchor;
  if (to === null) to = editorState.selection.head;

  const imageNode = editorState.schema.nodes.image.create(attrs);

  const transaction = editorState.tr;
  transaction.replaceWith(from, to, imageNode);

  return editorState.apply(transaction);
};

/**
 * Sets the seleccion with underline tag
 * @param editorState 
 * @param attrs 
 * @returns 
 */
export const toggleUnderline = (editorState: EditorState, attrs = null): EditorState => {
  let newEditorState;
  const dispatch = (tr: Transaction) => newEditorState = editorState.apply(tr);
  const markType = editorState.schema.marks["underline"];
  if (commands.toggleMark(markType, attrs)(editorState, dispatch)) {
    //@ts-ignore
    return newEditorState;
  }
  else {
    return editorState;
  }
}

/**
 * Handler for prosemirror-history's undo command
 * @param editorState current editor state
 * @returns new editor State
 */
export const handleUndo = (editorState: EditorState): EditorState => {
  let newEditorState: EditorState;
  const dispatch = (tr: Transaction) => (newEditorState = editorState.apply(tr));

  if (undo(editorState, dispatch)) {
    //@ts-ignore
    return newEditorState;
  }
  else {
    return editorState;
  }

}

/**
 * Handler for prosemirror-history's redo command
 * @param editorState current editor state
 * @returns new editor State
 */
export const handleRedo = (editorState: EditorState): EditorState => {

  let newEditorState: EditorState;
  const dispatch = (tr: Transaction) => (newEditorState = editorState.apply(tr));

  if (redo(editorState, dispatch)) {
    //@ts-ignore
    return newEditorState;
  }
  else {
    return editorState;
  }

}