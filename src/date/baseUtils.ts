import { createDate } from "./parseDate"
import type { DateParam } from "./type"

export const createTimeSStamp = (date?: DateParam) => Math.floor(createDate(date).getTime() / 1000)
