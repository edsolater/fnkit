import { assert } from '../oldMethodsMagic'

export type TreeNode<T extends object> = {
  info: T
  /**
   * if it's root, it has no parents
   */
  parentInfo?: TreeNode<T>
  children: TreeNode<T>[]
}

export type TreeRootNode<T extends object> = TreeNode<T>

function createTreeNode<T extends object>(info: T, parent?: T) {
  return {
    info: info,
    parentInfo: parent,
    children: []
  } as TreeNode<T>
}

export class TreeStructure<T extends object> {
  rootNode: TreeRootNode<T> | undefined = undefined
  nodes: WeakMap<T, TreeNode<T>> = new WeakMap()

  private getNode(info: T, parent?: T) {
    return this.nodes.has(info) ? this.nodes.get(info)! : createTreeNode(info, parent)
  }
  private getCachedNode(info: T) {
    return this.nodes.get(info)
  }

  private recordeNode(node: TreeNode<T>) {
    this.nodes.set(node.info, node)
  }

  private updateParentChildren(childNode: TreeNode<T>, parentInfo: T) {
    const cachedParent = this.getCachedNode(parentInfo)
    assert(cachedParent, 'to avoid create multi tree, parent must exist')
    if (!cachedParent.children.includes(childNode)) cachedParent.children.push(childNode)
  }

  setRoot(info: T) {
    const node = this.getNode(info)
    this.recordeNode(node)
    assert(!this.rootNode, 'root already fullfilled!')
    this.rootNode = node
  }

  addNode(info: T, parent: T) {
    const node = this.getNode(info, parent)
    this.updateParentChildren(node, parent)
    this.recordeNode(node)
  }

  *readByBFS() {
    assert(this.rootNode, 'root not exist!')
    let toTravel = [this.rootNode]
    while (toTravel.length > 0) {
      const currentList = [...toTravel]
      toTravel = []
      for (const node of currentList) {
        toTravel.push(...node.children)
        yield node.info
      }
    }
  }

  *readByDFS() {
    yield* this.readByBFS()
  }

  getPathTo(info: T): [root: T, ...middle: T[], self: T] | [root: T] {
    const self = this.getCachedNode(info)
    assert(self, 'node is not recored or is not exist')

    const pathNodes = [] as T[]
    let toTravel = self
    while (toTravel.parentInfo) {
      pathNodes.unshift(toTravel.info)
      toTravel = toTravel.parentInfo
    }
    return pathNodes as [root: T, ...middle: T[], self: T] | [root: T]
  }
}
