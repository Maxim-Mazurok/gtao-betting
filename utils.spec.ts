import { describe, expect, it } from "vitest";
import { getHorses } from "./fs-utils";
import { adjustChancesLikeOdds, generateLineUp } from "./utils";

describe("generateLineUp", () => {
  it("should generate a line up of horses", async () => {
    // Arrange
    const horses = await getHorses();

    // Act
    const lineUp = generateLineUp(horses);

    // Assert
    expect(lineUp).toBeDefined();
  });

  it("should generate a random line up each time", async () => {
    // Arrange
    const horses = await getHorses();

    // Act
    const lineUp1 = generateLineUp(horses);
    const lineUp2 = generateLineUp(horses);

    // Assert
    expect(lineUp1).not.toEqual(lineUp2);
  });
});

describe("adjustChancesLikeOdds", () => {
  it("works", () => {
    const chances = [10, 20, 30, 40];
    const result = adjustChancesLikeOdds(chances);
    expect(result).toEqual([0.1, 0.2, 0.3, 0.4]);
  });
});
