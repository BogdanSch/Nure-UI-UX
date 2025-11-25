const TOTAL_STEPS = 5;
const DEFAULT_PROFILE = "3_60";

let currentStep = 1;
const data = {};

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

const summaryList = document.getElementById("summaryList");
const finalPriceContainer = document.getElementById("finalPrice");
const progressBar = document.querySelector(".progress-bar");

function updateProgress() {
  const percent = ((currentStep - 1) / (TOTAL_STEPS - 1)) * 100;
  progressBar.style.width = percent + "%";
  progressBar.setAttribute("aria-valuenow", percent);
}

function showStep(step) {
  currentStep = step;
  document
    .querySelectorAll(".wizard-step")
    .forEach((el) => el.classList.remove("active-step"));
  document.getElementById("step" + step).classList.add("active-step");
  updateProgress();
}

function selectOption(dataType, value, element) {
  data[dataType] = value;

  element.parentNode
    .querySelectorAll(".option-card")
    .forEach((card) => card.classList.remove("selected-card"));
  element.querySelector(".option-card").classList.add("selected-card");

  document.getElementById(dataType + "Selection").value = value;
}

function validateStep(step) {
  switch (step) {
    case 1:
      const w = parseFloat(document.getElementById("widthInput").value);
      const h = parseFloat(document.getElementById("heightInput").value);
      const n = parseInt(document.getElementById("quantityInput").value);
      if (!w || !h || !n || w <= 0 || h <= 0 || n <= 0) {
        alert("Будь ласка, введіть коректні розміри та кількість.");
        return false;
      }
      data.width = w;
      data.height = h;
      data.quantity = n;
      break;
    case 2:
      if (!data.profile) {
        alert("Будь ласка, оберіть тип профілю.");
        return false;
      }
      break;
    case 3:
      if (!data.color) {
        alert("Будь ласка, оберіть колір ламінації.");
        return false;
      }
      break;
    case 4:
      if (!data.glass) {
        alert("Будь ласка, оберіть тип склопакета.");
        return false;
      }
      break;
    default:
      break;
  }
  return true;
}

function nextStep() {
  if (currentStep > TOTAL_STEPS) return;
  if (!validateStep(currentStep)) return;

  showStep(currentStep + 1);
}

function prevStep() {
  if (currentStep <= 1) return;
  showStep(currentStep - 1);
}

function calculateFinal() {
  if (!validateStep(4)) return;

  const totalArea = data.width * data.height * data.quantity;
  const basePricePerSqM = priceMap[data.profile] || priceMap[DEFAULT_PROFILE];
  const glassMultiplier = priceMap[data.glass] || 1;
  const colorMultiplier = data.color !== "white" ? 1.3 : 1.0;

  const finalPrice =
    totalArea * basePricePerSqM * glassMultiplier * colorMultiplier;

  summaryList.innerHTML = `
            <li class="list-group-item">Розміри: ${data.width}м x ${
    data.height
  }м</li>
            <li class="list-group-item">Кількість: ${data.quantity} шт.</li>
            <li class="list-group-item">Профіль: ${
              document.querySelector(
                `#profileOptions div[onclick*="${data.profile}"] h5`
              ).textContent
            }</li>
            <li class="list-group-item">Колір: ${
              document.querySelector(
                `#colorOptions div[onclick*="${data.color}"] h5`
              ).textContent
            }</li>
            <li class="list-group-item">Склопакет: ${
              document.querySelector(
                `#glassOptions div[onclick*="${data.glass}"] h5`
              ).textContent
            }</li>
        `;

  finalPriceContainer.textContent = finalPrice.toFixed(2);
  showStep(5);
}

showStep(1);
