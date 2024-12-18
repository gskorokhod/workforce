import { parseZonedDateTime } from "@internationalized/date";
import { datetime } from "rrule";
import { expect, test } from "vitest";
import * as Util from "./utils";

test("Convert UTC ZonedDateTime to Date", () => {
  const zdt = parseZonedDateTime("2024-01-01T00:00[UTC]");
  const date = datetime(2024, 1, 1, 0, 0, 0);

  expect(Util.toUTCDate(zdt).valueOf).toEqual(date.valueOf);
});

test("Convert local ZonedDateTime to UTC Date", () => {
  const zdt = parseZonedDateTime("2024-01-01T00:00[America/New_York]");
  const utc = datetime(2024, 1, 1, 5, 0, 0);

  expect(Util.toUTCDate(zdt).valueOf).toEqual(utc.valueOf);
});

test("dateToUTC with an already UTC date", () => {
  const date = new Date("2024-01-01T00:00Z");

  expect(Util.localToUTC(date).valueOf).toEqual(date.valueOf);
});

test("dateToUTC with a local date", () => {
  const date = new Date("2024-01-01T00:00-0500");
  const utc = new Date("2024-01-01T05:00Z");

  expect(Util.localToUTC(date).valueOf).toEqual(utc.valueOf);
});

test("hasDate with a date in the list", () => {
  const date = new Date("2024-01-01T00:00Z");
  const dates = [new Date("2024-01-01T00:00Z")];

  expect(Util.hasDate(date, dates)).toBe(true);
});

test("hasDate with a date not in the list", () => {
  const date = new Date("2024-01-01T00:00Z");
  const dates = [new Date("2024-01-02T00:00Z")];

  expect(Util.hasDate(date, dates)).toBe(false);
});

test("hasDate with an equivalent local date", () => {
  const date = new Date("2024-01-01T00:00-0500");
  const dates = [new Date("2024-01-01T05:00Z")];

  expect(Util.hasDate(date, dates)).toBe(true);
});

test("durationBetween with same dates", () => {
  const zdt1 = parseZonedDateTime("2024-01-01T00:00[UTC]");
  const zdt2 = parseZonedDateTime("2024-01-01T00:00[UTC]");
  const duration = Util.dtDurationBetween(zdt1, zdt2);
  expect(duration).toEqual({ days: 0, hours: 0, minutes: 0, seconds: 0, milliseconds: 0 });
});

test("durationBetween with different dates", () => {
  const zdt1 = parseZonedDateTime("2024-01-01T00:00[UTC]");
  const zdt2 = parseZonedDateTime("2024-01-02T01:01[UTC]");
  const duration = Util.dtDurationBetween(zdt1, zdt2);
  expect(duration).toEqual({ days: 1, hours: 1, minutes: 1, seconds: 0, milliseconds: 0 });
});

test("calendarDaysBetween with same dates", () => {
  const zdt1 = parseZonedDateTime("2024-01-01T00:00[UTC]");
  const zdt2 = parseZonedDateTime("2024-01-01T00:00[UTC]");
  const days = Util.calendarDaysBetween(zdt1, zdt2);
  expect(days).toBe(0);
});

test("calendarDaysBetween with different dates", () => {
  const zdt1 = parseZonedDateTime("2024-01-01T00:00[UTC]");
  const zdt2 = parseZonedDateTime("2024-01-03T00:00[UTC]");
  const days = Util.calendarDaysBetween(zdt1, zdt2);
  expect(days).toBe(2);
});

test("calendarDaysBetween with New Year", () => {
  const zdt1 = parseZonedDateTime("2024-12-31T00:00[UTC]");
  const zdt2 = parseZonedDateTime("2025-01-01T00:00[UTC]");
  const days = Util.calendarDaysBetween(zdt1, zdt2);
  expect(days).toBe(1);
});

test("calendarDaysBetween with inverse order", () => {
  const zdt1 = parseZonedDateTime("2024-01-03T00:00[UTC]");
  const zdt2 = parseZonedDateTime("2024-01-01T00:00[UTC]");
  const days = Util.calendarDaysBetween(zdt1, zdt2);
  expect(days).toBe(-2);
});

test("calendarMonthsBetween with same month", () => {
  const zdt1 = parseZonedDateTime("2024-01-01T00:00[UTC]");
  const zdt2 = parseZonedDateTime("2024-01-31T00:00[UTC]");
  const months = Util.calendarMonthsBetween(zdt1, zdt2);
  expect(months).toBe(0);
});

test("calendarMonthsBetween with different months", () => {
  const zdt1 = parseZonedDateTime("2024-01-01T00:00[UTC]");
  const zdt2 = parseZonedDateTime("2024-03-01T00:00[UTC]");
  const months = Util.calendarMonthsBetween(zdt1, zdt2);
  expect(months).toBe(2);
});

test("calendarMonthsBetween with New Year", () => {
  const zdt1 = parseZonedDateTime("2024-12-31T00:00[UTC]");
  const zdt2 = parseZonedDateTime("2025-01-01T00:00[UTC]");
  const months = Util.calendarMonthsBetween(zdt1, zdt2);
  expect(months).toBe(1);
});

test("calendarMonthsBetween with leap year", () => {
  const zdt1 = parseZonedDateTime("2024-02-29T00:00[UTC]");
  const zdt2 = parseZonedDateTime("2024-03-01T00:00[UTC]");
  const months = Util.calendarMonthsBetween(zdt1, zdt2);
  expect(months).toBe(1);
});

test("calendarMonthsBetween with exactly a year", () => {
  const zdt1 = parseZonedDateTime("2024-01-01T00:00[UTC]");
  const zdt2 = parseZonedDateTime("2025-01-01T00:00[UTC]");
  const months = Util.calendarMonthsBetween(zdt1, zdt2);
  expect(months).toBe(12);
});

test("calendarMonthsBetween with a year and a month", () => {
  const zdt1 = parseZonedDateTime("2024-01-01T00:00[UTC]");
  const zdt2 = parseZonedDateTime("2025-02-01T00:00[UTC]");
  const months = Util.calendarMonthsBetween(zdt1, zdt2);
  expect(months).toBe(13);
});

test("calendarMonthsBetween with inverse order", () => {
  const zdt1 = parseZonedDateTime("2024-03-01T00:00[UTC]");
  const zdt2 = parseZonedDateTime("2024-01-01T00:00[UTC]");
  const months = Util.calendarMonthsBetween(zdt1, zdt2);
  expect(months).toBe(-2);
});

test("cycle within range", () => {
  const result = Util.cycle(5, 3, 0, 10);
  expect(result).toBe(8);
});

test("cycle to minimum", () => {
  const result = Util.cycle(2, -2, 0, 10);
  expect(result).toBe(0);
});

test("cycle to maximum", () => {
  const result = Util.cycle(8, 2, 0, 10);
  expect(result).toBe(10);
});

test("cycle with wrap around", () => {
  const result = Util.cycle(8, 3, 0, 10);
  expect(result).toBe(0);
});

test("cycle with negative wrap around", () => {
  const result = Util.cycle(0, -1, 0, 10);
  expect(result).toBe(10);
});
