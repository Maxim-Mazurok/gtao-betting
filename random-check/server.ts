import express from "express";
import { getHistoricalData, getHorses } from "../fs-utils";
import { isValidDataSource } from "../utils";

const app = express();

app.get("/historical-data", async (req, res) => {
  const type = req.query.type;

  if (!isValidDataSource(type)) return res.status(400).send("Invalid type");

  return res.json(await getHistoricalData(type));
});

app.get("/horses", async (_, res) => {
  return res.json(await getHorses());
});

app.listen(3000, () => console.log("Server is listening..."));
