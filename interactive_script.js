const INFO_RENDERING_START = "INFO_RENDERING_START"
const INFO_RENDERING_END = "INFO_RENDERING_END"
const INPUT_RENDERING_START = "INPUT_RENDERING_START"
const INPUT_RENDERING_END = "INPUT_RENDERING_END"
// This interaction will be used with the counter to identify different interaction
// the user may interact multiple time with the widget. In this example i will only use the first interaction
// Depending on your case you may use all, or a specific interaction
const INTERACTION = "INTERACTION"
let interactionCounter = 0

let inputValue = null

// We wait for the DOM to be ready in order to load our script.
// the reason behind this are 2:
// - you don't want to fetch you script tag when it is not there yet.
// - it can be to not affect your integrator's website.
// PS: the API call can be done before the the DOM ready.
document.addEventListener("DOMContentLoaded", async () => {
    
    scirptPlacement = document.getElementsByTagName("weather-script-dynamic")[0]
    insertInteractiveWidget(scirptPlacement)
    // navigator.sendBeacon("THE_URL_FOR_DATA_COLLECTION", metrics);
});

function debounce (func, delay = 1000) {
    let timeoutId

    return function(...arguments) {
        clearTimeout(timeoutId)
    
        timeoutId = setTimeout(() => {
          func(...arguments)
        }, delay)
    }
}

async function handleInputChange(inputEvent) {
    // here i mark the interaction, then increase the number.
    performance.mark(INTERACTION+interactionCounter)
    interactionCounter += 1
    console.log(interactionCounter)
    inputValue = inputEvent.target.value
    // As i did not found an free to use api for weather with city name, i will make a dummy request.
    const API_URL = "https://api.open-meteo.com/v1/forecast?latitude=52.52&longitude=13.41&current_weather=true&hourly=temperature_2m"
    const data = await getWeatherInfo(API_URL)
    insertDataInPlacement(scirptPlacement, data.current_weather.temperature)
    const metrics = getMetrics(API_URL)
    console.log("Metrics:", metrics);
}

// function to fetch weather information
async function getWeatherInfo(apiUrl) {
    response = await fetch(apiUrl)
    return response.json()
}

function insertInteractiveWidget(scriptPlacement) {
    performance.mark(INPUT_RENDERING_START)
    const cityInput = document.createElement("input", {type: "text"})
    deboucedInput = debounce(handleInputChange)
    cityInput.addEventListener("input", (event) => {
        deboucedInput(event)
    })
    const weatherContent = document.createElement("weather-content")
    scriptPlacement.append(cityInput)
    scriptPlacement.append(weatherContent)
    performance.mark(INPUT_RENDERING_END)
}

// function to create an HTML element to show weather information 
function insertDataInPlacement(scriptPlacement, temperature) {
    performance.mark(INFO_RENDERING_START)
    const icon = document.createElement("i")
    icon.className = "fas fa-cloud"
    const p1 = document.createElement("p")
    p1.className = "work-heading"
    p1.innerText = "Weather"
    const p2 = document.createElement("p")
    p2.className = "work-test"
    p2.innerText = `the temperature is ${temperature}`

    scriptPlacement.append(icon)
    scriptPlacement.append(p1)
    scriptPlacement.append(p2)
    performance.mark(INFO_RENDERING_END)
}

// Function to get metrics about your script.
function getMetrics(apiUrl) {
    console.log("metrics")
    // TODO: write your script URL. PS: localfile are not considered.
    scriptUrl = "YOUR_SCRIPT_URL"
    scriptMetrics = performance.getEntriesByType('resource')
       .filter(entry => entry.name.includes(scriptUrl))[0]
    apiMetrics = performance.getEntriesByType('resource')
       .filter(entry => entry.name.includes(apiUrl))[0]

    const startRender = performance.getEntriesByName(INFO_RENDERING_START)[0].startTime
    const endRender = performance.getEntriesByName(INFO_RENDERING_END)[0].startTime
    const startInputRender = performance.getEntriesByName(INPUT_RENDERING_START)[0].startTime
    const endInputRender = performance.getEntriesByName(INPUT_RENDERING_END)[0].startTime
    // here you can see i am only interested in the first interaction.
    const firstInteraction = performance.getEntriesByName(INTERACTION+"0")[0].startTime
    // get all interactions
    const interactions = performance.getEntries().filter(({name}) => name.includes(INTERACTION))

    return {
        script_loading_start: scriptMetrics && scriptMetrics.startTime,
        script_loading_end: scriptMetrics && scriptMetrics.responseEnd,
        request_start: apiMetrics.startTime,
        request_end: apiMetrics.responseEnd,
        startRender,
        endRender,
        startInputRender,
        endInputRender,
        firstInteraction
    }
}