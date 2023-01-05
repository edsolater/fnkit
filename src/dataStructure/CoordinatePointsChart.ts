import { insertAt } from '../oldMethodsArray'

type Point = {
  x: number
  y: number
}

interface CoordinatePointsChart {
  points: Point[]
  addPoint(point: Point): void
  addPoints(points: Point[]): void
  getY(inputX: number): number
}

export function createCoordinatePointsChart(): CoordinatePointsChart {
  let coordinateList: Point[] = []

  function addPoint(point: Point) {
    const atIndex = getTargetIndex(coordinateList, point.x)
    coordinateList = insertAt(coordinateList, atIndex, point)
  }

  function addPoints(points: Point[]) {
    points.map((point) => addPoint(point))
  }

  function getY(inputX: number) {
    coordinateList
    if (coordinateList.length === 0) return NaN // list have no point, so return NaN
    if (coordinateList.length === 1) return coordinateList[0]?.x === inputX ? coordinateList[0].y : NaN // list have only 1 points, so return NaN
    const middleIndex = getTargetIndex(coordinateList, inputX)
    const [point1, point2] = (() => {
      const right = coordinateList[middleIndex]
      const left = coordinateList[middleIndex - 1]
      if (!left) return coordinateList.slice(0, 2)
      if (!right) return coordinateList.slice(-2)
      return [left, right]
    })()

    if (inputX === point1.x) return point1.y
    if (inputX === point2.x) return point2.y
    return getPredicatedY(inputX, point1, point2)
  }

  const coordinateMatrix = {
    points: coordinateList,
    addPoint,
    addPoints,
    getY
  }
  
  return coordinateMatrix
}

function getPredicatedY(x: number, point1: Point, point2: Point) {
  const { x: x1, y: y1 } = point1
  const { x: x2, y: y2 } = point2
  if (x === x1) return y1
  if (x === x2) return y2
  return ((y1 - y2) * (x - x1)) / (x1 - x2) + y1
}

function getTargetIndex(sortedList: Point[], targetX: Point['x']) {
  if (!sortedList.length) return 0

  let determined = false
  let at = Math.floor(sortedList.length / 2)
  let step = Math.floor(sortedList.length / 2)
  while (!determined) {
    const leftX = sortedList[at - 1]?.x ?? -Infinity
    const rightX = sortedList[at]?.x ?? Infinity
    if (leftX > targetX) {
      step = Math.floor(step / 2)
      at = Math.min(Math.floor(at - step), at - 1)
    } else if (rightX <= targetX) {
      step = Math.floor(step / 2)
      at = Math.max(Math.floor(at + step), at + 1)
    } else {
      determined = true
    }
  }
  return at
}
