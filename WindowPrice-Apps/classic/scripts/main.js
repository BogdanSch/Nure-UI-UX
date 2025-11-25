let baseArea = 0;
let currentCost = 0;

const CURRENCY = "грн";

const priceMap = {
  "3_60": 1500,
  "5_70": 1800,
  "7_80": 2100,
  "6_86": 2500,
  single: 1.0,
  double: 1.1,
  sun: 1.4,
  energy: 1.3,
};

const selections = {
  profile: "3_60",
  glass: "single",
  color: "white",
};

const finalPriceDisplay = document.getElementById("finalPrice");
const inputElements = [
  document.getElementById("widthInput"),
  document.getElementById("heightInput"),
  document.getElementById("quantityInput"),
];
const btnCalculateBase = document.getElementById("btnCalculateBase");
const btnReset = document.getElementById("btnReset");

function recalculateTotal() {
  if (baseArea === 0) {
    finalPriceDisplay.textContent = `0.00 ${CURRENCY}`;
    return;
  }

  const basePricePerSqM = priceMap[selections.profile];
  const glassCoef = priceMap[selections.glass];
  const colorCoef = selections.color !== "white" ? 1.3 : 1.0;

  currentCost = baseArea * basePricePerSqM * glassCoef * colorCoef;
  finalPriceDisplay.textContent = currentCost.toFixed(2) + ` ${CURRENCY}`;
}

btnCalculateBase.addEventListener("click", () => {
  const w = parseFloat(inputElements[0].value);
  const h = parseFloat(inputElements[1].value);
  const n = parseInt(inputElements[2].value);

  if (isNaN(w) || isNaN(h) || isNaN(n) || w <= 0 || h <= 0 || n <= 0) {
    alert("Введіть коректні розміри та кількість.");
    return;
  }

  baseArea = w * h * n;

  recalculateTotal();
});

["profile", "glass", "color"].forEach((groupName) => {
  const groupElement = document.getElementById(groupName + "Group");
  groupElement.addEventListener("change", (event) => {
    if (event.target.name === groupName) {
      selections[groupName] = event.target.value;
      recalculateTotal();
    }
  });
});

btnReset.addEventListener("click", () => {
  baseArea = 0;
  currentCost = 0;
  selections.profile = "3_60";
  selections.glass = "single";
  selections.color = "white";
  document.getElementById("p_3_60").checked = true;
  document.getElementById("g_single").checked = true;
  document.getElementById("c_white").checked = true;

  recalculateTotal();
});
