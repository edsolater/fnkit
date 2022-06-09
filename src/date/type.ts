import { Numberish } from '..';


export type TimeStamp = string | number | Date;
export type TimeStampLiteral = Exclude<TimeStamp, Date>;

export type ParsedDurationInfo = Record<
  'days' | 'hours' | 'minutes' | 'seconds' | 'milliseconds' | 'full'|'exact', number
>;

export type DateInfoAtom = {
  year?: Numberish;
  month?: Numberish;
  calendarDate?: Numberish;
  hours?: Numberish;
  minutes?: Numberish;
  seconds?: Numberish;
  milliseconds?: Numberish;
};

export type DateParam = string | number | Date | undefined | DateInfoAtom;
export type DateNumber = number;
export type DateString = string;
