const INFO_RENDERING_START = "INFO_RENDERING_START"
const INFO_RENDERING_END = "INFO_RENDERING_END"

// We wait for the DOM to be ready in order to load our script.
// the reason behind this are 2:
// - you don't want to fetch you script tag when it is not there yet.
// - it can be to not affect your integrator's website.
// PS: the API call can be done before the the DOM ready.
document.addEventListener("DOMContentLoaded", async () => {
    const API_URL = "https://api.open-meteo.com/v1/forecast?latitude=52.52&longitude=13.41&current_weather=true&hourly=temperature_2m,relativehumidity_2m,windspeed_10m"
    scirptPlacement = document.getElementsByTagName("weather-script-static")[0]

    const data = await getWeatherInfo(API_URL)
    insertDataInPlacement(scirptPlacement, data.current_weather.temperature)
    const metrics = getMetrics(API_URL)
    console.log("Metrics:". metrics);
    navigator.sendBeacon("THE_URL_FOR_DATA_COLLECTION", metrics);
});

// function to fetch weather information
async function getWeatherInfo(apiUrl) {
    response = await fetch(apiUrl)
    return response.json()
}

// function to create an HTML element to show weather information 
function insertDataInPlacement(scirptPlacement, temperature) {
    performance.mark(INFO_RENDERING_START)
    const icon = document.createElement("i")
    icon.className = "fas fa-cloud"
    const p1 = document.createElement("p")
    p1.className = "work-heading"
    p1.innerText = "Weather"
    const p2 = document.createElement("p")
    p2.className = "work-test"
    p2.innerText = `the temperature is ${temperature}`

    scirptPlacement.append(icon)
    scirptPlacement.append(p1)
    scirptPlacement.append(p2)
    performance.mark(INFO_RENDERING_END)
}

// Function to get metrics about your script.
function getMetrics(apiUrl) {
    // TODO: write your script URL. PS: localfile are not considered.
    scriptUrl = "YOUR_SCRIPT_URL"
    scriptMetrics = performance.getEntriesByType('resource')
       .filter(entry => entry.name.includes(scriptUrl))[0]
    apiMetrics = performance.getEntriesByType('resource')
       .filter(entry => entry.name.includes(apiUrl))[0]

    const startRender = performance.getEntriesByName(INFO_RENDERING_START)[0].startTime
    const endRender = performance.getEntriesByName(INFO_RENDERING_END)[0].startTime

    return {
        script_loading_start: scriptMetrics && scriptMetrics.startTime,
        script_loading_end: scriptMetrics && scriptMetrics.responseEnd,
        request_start: apiMetrics.startTime,
        request_end: apiMetrics.responseEnd,
        startRender,
        endRender
    }
}