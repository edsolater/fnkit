import { createDate, type Date } from "../timeTools/date"

export type MessageChip = {
  date: Date
  description?: string
}
export function createMessageChip(info?: Omit<MessageChip, "date">): MessageChip {
  return {
    ...info,
    date: createDate(),
  }
}
