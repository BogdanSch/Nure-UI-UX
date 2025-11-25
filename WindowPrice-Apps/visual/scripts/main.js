const widthSlider = document.getElementById("widthSlider");
const heightSlider = document.getElementById("heightSlider");
const quantitySlider = document.getElementById("quantitySlider");

const widthValueDisplay = document.getElementById("widthValue");
const heightValueDisplay = document.getElementById("heightValue");
const quantityValueDisplay = document.getElementById("quantityValue");
const windowDimensionsDisplay = document.getElementById("windowDimensions");

const windowFrame = document.getElementById("windowFrame");
const glassSurface = document.querySelector(".glass-surface");
const profileSelect = document.getElementById("profileSelect");
const glassSelect = document.getElementById("glassSelect");
const colorPalette = document.getElementById("colorPalette");
const finalPriceDisplay = document.getElementById("finalPrice");

const CURRENCY = "грн";
const SIZE_FACTOR = 40;
const BASE_SIZE = 250;

const priceMap = {
  "3_60": 1500,
  "5_70": 1800,
  "7_80": 2100,
  "6_86": 2500,
  single: 1.0,
  double: 1.1,
  energy: 1.3,
  sun: 1.4,
};

let selections = {
  profile: "5_70",
  glass: "single",
  color: "white",
  width: 1.2,
  height: 1.5,
  quantity: 1,
};

function updateVisuals() {
  windowDimensionsDisplay.textContent = `${selections.width}м x ${selections.height}м`;

  let newWidth = BASE_SIZE + SIZE_FACTOR * selections.width;
  let newHeight = BASE_SIZE + SIZE_FACTOR * selections.height;

  windowFrame.style.width = `${newWidth}px`;
  windowFrame.style.height = `${newHeight}px`;

  switch (selections.glass) {
    case "sun":
      glassSurface.classList.remove("thick");
      glassSurface.classList.add("sun-reflective");
      break;
    case "energy":
    case "double":
      glassSurface.classList.remove("sun-reflective");
      glassSurface.classList.add("thick");
      break;
    default:
      glassSurface.classList.remove("sun-reflective");
      glassSurface.classList.remove("thick");
      break;
  }

  const colorValue = document.querySelector(
    `.configurator__color-option[data-color="${selections.color}"]`
  ).style.backgroundColor;
  windowFrame.style.borderColor = colorValue;
}

function calculateFinalPrice() {
  const baseArea = selections.width * selections.height * selections.quantity;

  const basePricePerSqM = priceMap[selections.profile];
  const glassCoef = priceMap[selections.glass];
  const colorCoef = selections.color !== "white" ? 1.3 : 1.0;

  const finalPrice = baseArea * basePricePerSqM * glassCoef * colorCoef;
  finalPriceDisplay.textContent = finalPrice.toFixed(2) + ` ${CURRENCY}`;
}

[widthSlider, heightSlider, quantitySlider].forEach((slider) => {
  slider.addEventListener("input", () => {
    const value = parseFloat(slider.value);
    const unit = slider.id.includes("quantity") ? " шт" : " м";

    if (slider.id === "widthSlider") {
      selections.width = value;
      widthValueDisplay.textContent = value + unit;
    } else if (slider.id === "heightSlider") {
      selections.height = value;
      heightValueDisplay.textContent = value + unit;
    } else {
      selections.quantity = value;
      quantityValueDisplay.textContent = value + unit;
    }
    updateVisuals();
  });
});

colorPalette.addEventListener("click", (event) => {
  const button = event.target.closest(".configurator__color-option");
  if (button) {
    selections.color = button.dataset.color;
    updateVisuals();
  }
});

profileSelect.addEventListener("change", (event) => {
  selections.profile = event.target.value;
});

glassSelect.addEventListener("change", (event) => {
  selections.glass = event.target.value;
  updateVisuals();
});

document
  .getElementById("btnCalculate")
  .addEventListener("click", calculateFinalPrice);

updateVisuals();
calculateFinalPrice();
