import { assert } from '../oldMethodsMagic'

export type TreeNode<T extends object> = {
  info: T
  /**
   * if it's root, it has no parents
   */
  parent?: TreeNode<T>
  children: TreeNode<T>[]
}

export type TreeRootNode<T extends object> = TreeNode<T>

function createTreeNode<T extends object>(info: T) {
  return {
    info: info,
    parent: undefined, // not added yet
    children: [] // not added yet
  } as TreeNode<T>
}

export class TreeStructure<T extends object> {
  rootNode: TreeRootNode<T> | undefined = undefined
  nodes: WeakMap<T, TreeNode<T>> = new WeakMap()

  private getNode(info: T) {
    return this.nodes.has(info) ? this.nodes.get(info)! : createTreeNode(info)
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

  private updateSelfParentProperty(node: TreeNode<T>, parentInfo: T) {
    const cachedParent = this.getCachedNode(parentInfo)
    assert(cachedParent, 'to avoid create multi tree, parent must exist')
    node.parent = cachedParent
  }

  private updateRootNode(node: TreeNode<T>) {
    assert(!this.rootNode, 'root already fullfilled!')
    this.rootNode = node
  }

  setRoot(info: T) {
    const node = this.getNode(info)
    this.recordeNode(node)
    this.updateRootNode(node)
  }

  addNode(info: T, parent: T) {
    const node = this.getNode(info)
    this.updateParentChildren(node, parent)
    this.updateSelfParentProperty(node, parent)
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

  getPathTo(info: T): [root: T, ...middle: T[], self: T] | [self: T] {
    const self = this.getCachedNode(info)
    assert(self, 'node is not recored or is not exist')
    console.log('self: ', self)
    const pathNodes = [] as T[]
    let toTravel = self
    while (true) {
      pathNodes.unshift(toTravel.info)
      const newToTravel = toTravel.parent
      if (!newToTravel) break
      toTravel = newToTravel
    }
    return pathNodes as [root: T, ...middle: T[], self: T] | [self: T]
  }
}
