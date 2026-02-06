import { createDate } from "../date/date"

export type MessageChip = {
  timeStamp: Date
  description?: string
}
export function createMessageChip(info?: Omit<MessageChip, "timeStamp">): MessageChip {
  return {
    ...info,
    timeStamp: createDate(),
  }
}
