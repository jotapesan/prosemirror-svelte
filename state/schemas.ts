import { Schema } from 'prosemirror-model';
import { nodes, marks } from 'prosemirror-schema-basic';
import { tableNodes } from 'prosemirror-tables';

/**
 * Schema to represent a single line of plain text
 * @type {Schema}
 */
export const singleLineSchema = new Schema({
  nodes: {
    doc: { content: "text*" },
    text: { inline: true }
  }
});

/**
 * Schema to represent multiple lines of plain text
 * @type {Schema}
 */
export const multiLineSchema = new Schema({
  nodes: {
    doc: {
      content: "paragraph+"
    },
    paragraph: {
      content: "text*",
      parseDOM: [{ tag: "p" }],
      toDOM: () => ["p", 0]
    },
    text: {
      inline: true
    }
  }
});

let customMarks = marks;
//@ts-ignore
customMarks.underline = {
  parseDOM: [
    { tag: "u" }, { tag: "underline" },
    { style: "text-decoration=underline" }
  ],
  toDOM() { return ["u", 0]; }
};

let customNodes = nodes;
//@ts-ignore
customNodes.tableNodes = tableNodes({
  tableGroup: 'block',
  cellContent: 'block+',
  cellAttributes: {
    background: {
      default: null,
      getFromDOM(dom) {
        return dom.style.backgroundColor || null;
      },
      setDOMAttr(value, attrs) {
        if (value)
          attrs.style = (attrs.style || '') + `background-color: ${value};`;
      },
    },
  },
});

/**
 * Schema to represent rich text
 * @type {Schema}
 */
export const richTextSchema = new Schema({
  nodes: customNodes,  
  marks: customMarks
});
