
const headingDisplay = document.getElementById("heading");
const directionDisplay = document.getElementById("direction");
const degreeDisplay = document.getElementById("degree");
const cardinalDisplay = document.getElementById("cardinal");
const statusDisplay = document.getElementById("status");
const startBtn = document.getElementById("startBtn");

const compass = document.querySelector(".compass");

let compassStarted = false;

// Convert degrees into one of eight directions
function getDirection(degrees) {
    const directions = [
        "N", "NE", "E", "SE",
        "S", "SW", "W", "NW"
    ];

    const index = Math.round(degrees / 45) % 8;

    return directions[index];
}

// Update the compass interface
function updateCompass(degrees) {
    if (!Number.isFinite(degrees)) return;

    // Normalize heading between 0 and 359
    degrees = ((degrees % 360) + 360) % 360;

    const direction = getDirection(degrees);

    headingDisplay.textContent = `${degrees.toFixed(0)}°`;
    directionDisplay.textContent = direction;

    degreeDisplay.textContent = `${degrees.toFixed(0)}°`;
    cardinalDisplay.textContent = direction;

    // Rotate the compass dial opposite to device movement
    compass.style.transform = `rotate(${-degrees}deg)`;
    
    // Keep the needle and labels readable by not rotating them
    compass.querySelectorAll(".compass-label, .needle, .center-dot")
        .forEach(element => {
            element.style.transform = element.classList.contains("needle")
                ? "translate(-50%, -50%)"
                : element.classList.contains("center-dot")
                ? "translate(-50%, -50%)"
                : "translate(-50%, -50%)";
        });

    statusDisplay.textContent = "Compass active";
}

// Handle device orientation
function handleOrientation(event) {
    let heading = null;

    // iPhone and some other devices
    if (typeof event.webkitCompassHeading === "number") {
        heading = event.webkitCompassHeading;
    }

    // Android and other supported browsers
    else if (event.absolute === true && event.alpha !== null) {
        heading = 360 - event.alpha;
    }

    if (heading !== null) {
        updateCompass(heading);
    } else {
        statusDisplay.textContent =
            "Absolute compass heading unavailable on this device.";
    }
}

// Start the compass
async function startCompass() {

    if (compassStarted) return;

    if (!window.isSecureContext) {
        statusDisplay.textContent =
            "Please open this app using HTTPS or localhost.";
        return;
    }

    if (!("DeviceOrientationEvent" in window)) {
        statusDisplay.textContent =
            "Device orientation is not supported.";
        return;
    }

    // iOS requires permission through a user interaction
    if (typeof DeviceOrientationEvent.requestPermission === "function") {
        try {
            const permission =
                await DeviceOrientationEvent.requestPermission();

            if (permission !== "granted") {
                statusDisplay.textContent =
                    "Motion sensor permission was denied.";
                return;
            }
        } catch (error) {
            statusDisplay.textContent =
                "Unable to request sensor permission.";
            return;
        }
    }

    window.addEventListener(
        "deviceorientationabsolute",
        handleOrientation
    );

    window.addEventListener(
        "deviceorientation",
        handleOrientation
    );

    compassStarted = true;
    startBtn.textContent = "Compass Started";
    statusDisplay.textContent = "Waiting for sensor readings...";
}

// Button event
startBtn.addEventListener("click", startCompass);
