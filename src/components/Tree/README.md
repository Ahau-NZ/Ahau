# Tree

Instead of having everything from generating, drawing and re-orientating nodes and links in one file, I have instead split them up into different components.

## Tree Component

Handles turning the treeData into an array of nodes and links.

* Nodes: holds all information about a person stored within treeData.
  > The nodes have been customized.
* Links: holds information about the line between the parent and the child node.
  > The links have been customized.

---

## Node Component

Handles drawing a `<circle>`, but currently the parent element handles positioning it.

---
 
## Link Componenent

Handles drawing a `<path>` from Parent(x1,y1) to Child(x2,y2).

It also holds methods to draw the elbow lines horizontally or vertically. 

---