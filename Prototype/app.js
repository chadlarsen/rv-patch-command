// ------------------------------------
// RV PATCH COMMAND - Sprint 1
// ------------------------------------

function showScreen(screenId) {

    // Hide every screen
    const screens = document.querySelectorAll(".screen");

    screens.forEach(screen => {
        screen.classList.add("hidden");
    });

    // Show requested screen
    document.getElementById(screenId).classList.remove("hidden");

    // Update progress bar
    updateProgress(screenId);

}

function updateProgress(screenId){

    const steps = document.querySelectorAll(".step");

    steps.forEach(step=>{
        step.classList.remove("active");
    });

    switch(screenId){

        case "homeScreen":
            steps[0].classList.add("active");
            break;

        case "partsScreen":
        case "toolsScreen":
        case "consumablesScreen":
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