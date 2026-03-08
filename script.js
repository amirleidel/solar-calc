document.getElementById("to-anlage").addEventListener("click", function () {

  const tabTrigger = document.querySelector('a[href="#tab-top-2"]');
  const tab = new bootstrap.Tab(tabTrigger);

  tab.show();

});


// model storing all the vars
const model = {
  persons: 1,
  consumption: 2000,
  state: null,
  latitude: null,
  sun_hours: null
};

const usageByPeople = {
  1: 2000,
  2: 3100,
  3: 4200,
  4: 4700,
  5: 5200,
  6: 5400,
  7: 5600,
  8: 5800,
  9: 6000
};

function estimateConsumption(persons) {

  estimatedUsage  = usageByPeople[persons] ?? usageByPeople[9];
  model.consumption = estimatedUsage;
    
  // display in input field
  const inputField = document.getElementById("consumption-input");
  inputField.value = estimatedUsage;
  
  return estimatedUsage;

}

// default is one person
estimateConsumption(1);

// all radio buttons
const radios = document.querySelectorAll('input[name="btn-radio-dropdown"]');
const dropdownRadio = document.getElementById("btn-radio-dropdown-dropdown");

radios.forEach(radio => {

  radio.addEventListener("change", function () {
    
    // 1. read dropdown value
    const inhabitants = parseInt(this.value);
    
    // 2. print value
    model.persons = inhabitants;
    estimateConsumption(inhabitants);

  });

});

// dropdown items
const dropdownItems = document.querySelectorAll(".dropdown-item");

dropdownItems.forEach(item => {

  item.addEventListener("click", function () {

    // 1. deselect all radio buttons
    radios.forEach(radio => {
      if (radio.id !== "btn-radio-dropdown-dropdown") {
        radio.checked = false;
      }
    });

    // select the dropdown radio
    dropdownRadio.checked = true;

    // 2. read dropdown value
    const inhabitants = parseInt(this.getAttribute("value"));
    model.persons = inhabitants;
    
    // 3. print value
    estimateConsumption(inhabitants);
    
  });

});

// solar interpolation constants
const maxSunHours = 1900;
const maxSunHeight = 48.14;

const minSunHours = 1500;
const minSunHeight = 54.32;

// latitude lookup using your select values (German order)
const stateLatitudes = {
  1: 48.78, // Baden-Württemberg
  2: 48.14, // Bayern
  3: 52.52, // Berlin
  4: 52.39, // Brandenburg
  5: 53.08, // Bremen
  6: 53.55, // Hamburg
  7: 50.08, // Hessen
  8: 53.63, // Mecklenburg-Vorpommern
  9: 52.37, // Niedersachsen
  10: 51.23, // Nordrhein-Westfalen
  11: 50.00, // Rheinland-Pfalz
  12: 49.24, // Saarland
  13: 51.05, // Sachsen
  14: 52.13, // Sachsen-Anhalt
  15: 54.32, // Schleswig-Holstein
  16: 50.98  // Thüringen
};

// optional state names for the model
const stateNames = {
  1: "Baden-Württemberg",
  2: "Bayern",
  3: "Berlin",
  4: "Brandenburg",
  5: "Bremen",
  6: "Hamburg",
  7: "Hessen",
  8: "Mecklenburg-Vorpommern",
  9: "Niedersachsen",
  10: "Nordrhein-Westfalen",
  11: "Rheinland-Pfalz",
  12: "Saarland",
  13: "Sachsen",
  14: "Sachsen-Anhalt",
  15: "Schleswig-Holstein",
  16: "Thüringen"
};

// interpolation function
function interpolateHours(height) {

  const m = (maxSunHours - minSunHours) / (maxSunHeight - minSunHeight);
  const t = minSunHours - m * minSunHeight;

  return Math.round(m * height + t);

}

// listen to dropdown changes
document.getElementById("state-select").addEventListener("change", function () {

  const stateValue = parseInt(this.value);

  const latitude = stateLatitudes[stateValue];

  const sunHours = interpolateHours(latitude);

  // update model
  model.state = stateNames[stateValue];
  model.latitude = latitude;
  model.sun_hours = sunHours;

  console.log(model);

});

// document.getElementById(peak-power-select).value


