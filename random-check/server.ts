import express from "express";
import { getHistoricalData, getHorses } from "../fs-utils";

const app = express();

app.get("/historical-data", async (req, res) => {
  const type = req.query.type;
  const isValidType = (type: unknown): type is "1st" | "3rd" =>
    typeof type === "string" && ["1st", "3rd"].includes(type);

  if (!isValidType(type)) return res.status(400).send("Invalid type");

  return res.json(await getHistoricalData(type));
});

app.get("/horses", async (_, res) => {
  return res.json(await getHorses());
});

app.listen(3000, () => console.log("Server is listening..."));
