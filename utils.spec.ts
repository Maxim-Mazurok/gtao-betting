import { describe, expect, it } from "vitest";
import { getHorses } from "./fs-utils";
import { generateLineUp } from "./utils";
import { Horse } from ".";

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
