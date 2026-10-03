// ------------------------------------
// RV PATCH COMMAND - Sprint 1
// ------------------------------------

let calendarAppointments = [];
let activeAppointment = null;


// ------------------------------------
// PREP CHECKLIST STORAGE
// ------------------------------------

function getPrepStorageKey() {

    if (!activeAppointment || !activeAppointment.id) {
        return null;
    }

    return `rvpatch-prep-${activeAppointment.id}`;
}


function loadPrepState() {

    const key = getPrepStorageKey();

    if (!key) {
        prepState = {
            parts: [],
            tools: [],
            consumables: []
        };

        updatePrepCheckboxes();

        return;
    }

    const saved = localStorage.getItem(key);

    if (saved) {

        try {

            prepState = JSON.parse(saved);

        } catch (error) {

            console.error("Unable to load prep state:", error);

            prepState = {
                parts: [],
                tools: [],
                consumables: []
            };

        }

    } else {

        prepState = {
            parts: [],
            tools: [],
            consumables: []
        };

    }

    updatePrepCheckboxes();

}


function savePrepState() {

    const key = getPrepStorageKey();

    if (!key) {
        return;
    }

    localStorage.setItem(
        key,
        JSON.stringify(prepState)
    );

}


function updatePrepCheckboxes() {

    const checkboxes =
        document.querySelectorAll(
            "input[data-prep][data-item]"
        );

    checkboxes.forEach(checkbox => {

        const category =
            checkbox.dataset.prep;

        const item =
            checkbox.dataset.item;

        checkbox.checked =
            prepState[category]?.includes(item) || false;

    });

}


function handlePrepCheckbox(event) {

    const checkbox = event.target;

    const category =
        checkbox.dataset.prep;

    const item =
        checkbox.dataset.item;

    if (!prepState[category]) {
        prepState[category] = [];
    }

    if (checkbox.checked) {

        if (!prepState[category].includes(item)) {

            prepState[category].push(item);

        }

    } else {

        prepState[category] =
            prepState[category].filter(
                existingItem => existingItem !== item
            );

    }

    savePrepState();

    console.log("Prep state:", prepState);

}

// ------------------------------------
// SCREEN NAVIGATION
// ------------------------------------

function showScreen(screenId) {

    // Hide every screen
    const screens = document.querySelectorAll(".screen");

    screens.forEach(screen => {
        screen.classList.add("hidden");
    });

    // Show requested screen
    const requestedScreen = document.getElementById(screenId);

    if (!requestedScreen) {
        console.error("Screen not found:", screenId);
        return;
    }

    requestedScreen.classList.remove("hidden");

    // Update progress bar
    updateProgress(screenId);

    // Load Google Calendar when Schedule is opened
if (screenId === "scheduleScreen") {
    loadAppointments();
}


// Load selected appointment address when Drive is opened
if (screenId === "driveScreen") {

    const driveAddress =
        document.getElementById("driveAddress");

    const driveNavigateButton =
        document.getElementById("driveNavigateButton");

        if (activeAppointment) {

        const address =
            activeAppointment.location || "No address provided";

        if (driveAddress) {
            driveAddress.innerHTML =
                `📍 ${escapeHtml(address)}`;
        }

        if (driveNavigateButton) {

            driveNavigateButton.onclick = function () {

                const mapsUrl =
                    "https://www.google.com/maps/search/?api=1&query=" +
                    encodeURIComponent(address);

                window.open(mapsUrl, "_blank");

            };

        }

    }

}   // closes driveScreen IF

}   // closes showScreen FUNCTION


// ------------------------------------
// PROGRESS BAR
// ------------------------------------


// ------------------------------------
// PROGRESS BAR
// ------------------------------------

function updateProgress(screenId) {

    const steps = document.querySelectorAll(".step");

    steps.forEach(step => {
        step.classList.remove("active");
    });

    switch (screenId) {

        case "homeScreen":
case "prepScreen":
case "scheduleScreen":
    steps[0].classList.add("active");
    break;

        case "driveScreen":
            steps[1].classList.add("active");
            break;

        case "onsiteScreen":
            steps[2].classList.add("active");
            break;

        case "finishScreen":
            steps[3].classList.add("active");
            break;
    }

}


// ------------------------------------
// GOOGLE CALENDAR
// ------------------------------------

async function loadAppointments() {

    const container = document.getElementById("appointments");

    if (!container) return;

    container.innerHTML = "Loading appointments...";

    try {

        const response = await fetch("/google/appointments");

        if (!response.ok) {
            throw new Error("Unable to load appointments.");
        }

        const appointments = await response.json();

        calendarAppointments = appointments;

        if (!appointments.length) {

            container.innerHTML = "<p>No upcoming appointments.</p>";

            return;
        }

        container.innerHTML = appointments.map((event, index) => {

            const start = event.start;
const end = event.end;

            const startDate = new Date(start);
            const endDate = new Date(end);

            const validStart = !isNaN(startDate.getTime());
            const validEnd = !isNaN(endDate.getTime());

            const startTime = validStart
                ? startDate.toLocaleString([], {
                    weekday: "short",
                    month: "short",
                    day: "numeric",
                    hour: "numeric",
                    minute: "2-digit"
                })
                : "Unknown time";

            const endTime = validEnd
                ? endDate.toLocaleTimeString([], {
                    hour: "numeric",
                    minute: "2-digit"
                })
                : "";

            return `
                <div
                    class="appointment"
                    onclick="selectAppointment(${index})"
                    style="cursor:pointer;"
                >

                    <h3>${escapeHtml(event.customer || "Unknown Customer")}</h3>

                    <p>🕐 ${startTime}${endTime ? ` – ${endTime}` : ""}</p>

                    ${event.location
                        ? `<p>📍 ${escapeHtml(event.location)}</p>`
                        : ""
                    }

                    <p>👉 Tap to select</p>

                </div>
            `;

        }).join("");

    } catch (error) {

        console.error("Appointment loading error:", error);

        container.innerHTML =
            "<p>Unable to load appointments.</p>";

    }

}


// ------------------------------------
// SELECT APPOINTMENT
// ------------------------------------

function selectAppointment(index) {

    const event = calendarAppointments[index];

    if (!event) {
        console.error("Appointment not found:", index);
        return;
    }

    activeAppointment = event;

    loadPrepState();

    console.log("Active appointment:", activeAppointment);

    // --------------------------------
    // CUSTOMER / JOB NAME
    // --------------------------------

    const summary = event.customer || "Unknown Customer";
    let customerName = summary;
    let repairDescription = "";

    // Expected format:
    // Customer Name - Repair Description

    if (summary.includes(" - ")) {

        const parts = summary.split(" - ");

        customerName = parts.shift().trim();
        repairDescription = parts.join(" - ").trim();

    }

    // --------------------------------
    // ADDRESS
    // --------------------------------

    const address = event.location || "No address provided";

    // --------------------------------
    // PHONE NUMBER
    // --------------------------------

    const phone = extractPhoneNumber(event.description || "");

    // --------------------------------
    // UPDATE HEADER
    // --------------------------------

    const customerElement =
        document.getElementById("customerName");

    const repairElement =
        document.getElementById("repairDescription");

    const addressElement =
        document.getElementById("jobAddress");

    const vehicleElement =
        document.getElementById("vehicleInfo");

    if (customerElement) {
        customerElement.textContent = customerName;
    }

    if (repairElement) {
        repairElement.textContent =
            repairDescription || "Appointment";
    }

    if (addressElement) {
        addressElement.innerHTML =
            `📍 ${escapeHtml(address)}`;
    }

    if (vehicleElement) {
        vehicleElement.textContent =
            "RV information not yet connected";
    }

    // --------------------------------
    // QUICK ACTIONS
    // --------------------------------

    const callButton =
        document.getElementById("callButton");

    const textButton =
        document.getElementById("textButton");

    const navigateButton =
        document.getElementById("navigateButton");

    if (callButton) {

        if (phone) {

            callButton.disabled = false;

            callButton.onclick = function () {
                window.location.href = `tel:${phone}`;
            };

        } else {

            callButton.disabled = true;

        }

    }

    if (textButton) {

        if (phone) {

            textButton.disabled = false;

            textButton.onclick = function () {
                window.location.href = `sms:${phone}`;
            };

        } else {

            textButton.disabled = true;

        }

    }

    if (navigateButton) {

        navigateButton.onclick = function () {

            const mapsUrl =
                "https://www.google.com/maps/search/?api=1&query=" +
                encodeURIComponent(address);

            window.open(mapsUrl, "_blank");

        };

    }

    // --------------------------------
    // RETURN TO MAIN SCREEN
    // --------------------------------

    showScreen("homeScreen");

}


// ------------------------------------
// EXTRACT PHONE FROM EVENT DESCRIPTION
// ------------------------------------

function extractPhoneNumber(description) {

    if (!description) {
        return null;
    }

    // Look for something like:
    // Phone: (801) 555-1234
    // Phone: 801-555-1234
    // Phone: 8015551234

    const match = description.match(
        /Phone:\s*([+()\d\s.-]{7,})/i
    );

    if (!match) {
        return null;
    }

    return match[1].trim();

}


// ------------------------------------
// HTML SAFETY
// ------------------------------------

function escapeHtml(value) {

    if (value === null || value === undefined) {
        return "";
    }

    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

}

document.addEventListener("change", function(event) {

    if (
        event.target.matches(
            "input[data-prep][data-item]"
        )
    ) {

        handlePrepCheckbox(event);

    }

});