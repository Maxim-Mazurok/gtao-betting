import Chart, { ChartData } from "chart.js/auto";
import annotationPlugin from "chartjs-plugin-annotation";
import jStat from "jstat";
import {
  calculateChances,
  convertFractionOddsToChance,
  determineWinner,
  generateLineUp,
} from "../../utils";
import { getHistoricalData, getHorses } from "../../fs-utils";

Chart.register(annotationPlugin);

const colors = [
  "#000000",
  "#6A5ACD",
  "#FF0000",
  "#00FF00",
  "#0000FF",
  "#FFFF00",
  "#00FFFF",
  "#FF00FF",
  "#C0C0C0",
  "#808080",
  "#800000",
  "#808000",
  "#008000",
  "#800080",
  "#008080",
  "#000080",
  "#FFA500",
  "#FFD700",
  "#FFC0CB",
  "#A52A2A",
  "#FF7F50",
  "#8A2BE2",
  "#F5DEB3",
  "#32CD32",
  "#87CEEB",
  "#D2691E",
  "#FF6347",
  "#40E0D0",
  "#FF8C00",
  "#DDA0DD",
];

const data1: ChartData = {
  labels: [] as number[],
  datasets: [],
};

for (let i = 0; i < 6; i++) {
  data1.datasets.push({
    label: `#${i}`,
    data: [] as number[],
    borderColor: colors[i],
    backgroundColor: colors[i],
  });
}
for (let i = 0; i < 6; i++) {
  data1.datasets.push({
    label: `#${i} exp`,
    data: [] as number[],
    borderColor: colors[i],
    backgroundColor: colors[i],
    borderDash: [6, 6],
    borderDashOffset: 0,
  });
}

const ctx1 = document.getElementById("chart1") as HTMLCanvasElement;

let paused = localStorage.getItem("paused") === "true";
if (paused) {
  document.getElementById("pause")?.setAttribute("checked", "checked");
}
document.getElementById("pause")?.addEventListener("change", (e) => {
  paused = (e.target as HTMLInputElement).checked;
  localStorage.setItem("paused", paused.toString());
  if (!paused) {
    iterate();
  }
});

const chart1 = new Chart(ctx1, {
  type: "line",
  data: data1,
  options: {
    animation: false,
    elements: {
      point: {
        radius: 0,
      },
    },
    plugins: {
      legend: {
        onClick(e, legendItem, legend) {
          const index = legendItem.datasetIndex;
          const ci = legend.chart;
          if (legendItem.text === "Toggle All") {
            const visibility = !ci.getDatasetMeta(0).hidden; // Toggle based on the first dataset's visibility
            ci.data.datasets.forEach((dataset, i) => {
              ci.setDatasetVisibility(i, !visibility);
            });
          } else {
            // Default toggle behavior
            index !== undefined &&
              ci.setDatasetVisibility(index, !ci.isDatasetVisible(index));
          }
          ci.update();
        },
        labels: {
          generateLabels(chart) {
            // Generate default labels
            const labels =
              Chart.defaults.plugins.legend.labels.generateLabels(chart);
            // Add custom "Toggle All" label
            labels.unshift({
              text: "Toggle All",
              datasetIndex: -1, // Custom index for identification
            });
            return labels;
          },
        },
      },
    },
  },
});

let iterations = 2000;

let games = 0;
let wins = Array.from({ length: 6 }, () => 0);
let expectedWins = Array.from({ length: 6 }, () => 0);
let expectedReturns = Array.from({ length: 6 }, () => 0);

setInterval(() => {
  chart1.update("none");
}, 100);

const iterate = () => {
  const batchSize = 10;
  for (let i = 0; i < batchSize; i++) {
    const gameData = (
      window["historical"] as Awaited<ReturnType<typeof getHistoricalData>>
    ).shift();
    if (!gameData) return;
    const { lineUp, winner } = gameData;

    const chances = calculateChances(lineUp, "proportionate");
    const sortedByChances = [...lineUp]
      .map((x, i) => ({ ...x, chance: chances[i] }))
      .sort((a, b) => b.chance - a.chance);
    lineUp.forEach((horse, i) => {
      const id = sortedByChances.findIndex((x) => x.name === horse.name);
      expectedWins[id] += chances[i];
      expectedReturns[id] += convertFractionOddsToChance(
        horse.oddsNumerator,
        horse.oddsDenominator
      );
    });

    const winnerId = sortedByChances.findIndex((x) => x.name === winner.name);

    games++;
    wins[winnerId]++;
  }

  for (let i = 0; i < 6; i++) {
    data1.datasets[i].data.push(wins[i] / games);
    data1.datasets[i + 6].data.push(expectedReturns[i] / games);
  }

  data1.labels?.push(games);

  iterations--;
  if (iterations >= 0 && !paused) {
    // requestAnimationFrame(iterate);
    setTimeout(iterate);
  }
};

(async () => {
  window["horses"] = (await (await fetch("/api/horses")).json()) as Awaited<
    ReturnType<typeof getHorses>
  >;
  window["historical"] = [];
  window["historical"] = [
    ...window["historical"],
    ...(await (await fetch("/api/historical-data?type=1st")).json()),
  ];
  window["historical"] = [
    ...window["historical"],
    ...(await (await fetch("/api/historical-data?type=3rd")).json()),
  ];

  iterate();
})();
