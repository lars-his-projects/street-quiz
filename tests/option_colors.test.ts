import { expect, test } from "vitest";
import { otherData } from "../src/map";

// After an answer, the map draws the other options: each street has the number of its color (#58).
test("otherData gives each street the number of its color", () => {
  const line: [number, number][][] = [
    [
      [0, 0],
      [1, 1],
    ],
  ];
  const data = otherData([{ lines: line }, { lines: line }]);
  expect(data.features.map((f) => f.properties.other)).toEqual([1, 2]);
  expect(otherData([]).features).toEqual([]);
});
