const { google } = require("googleapis");
const fs = require("fs");
const path = require("path");

const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
);

const SCOPES = [
    "https://www.googleapis.com/auth/calendar.readonly"
];

// Where we will store the Google authorization tokens
const TOKEN_PATH = path.join(__dirname, "../google-tokens.json");

function getAuthorizationUrl() {

    return oauth2Client.generateAuthUrl({
        access_type: "offline",
        scope: SCOPES,
        prompt: "consent"
    });

}

async function getTokens(code) {

    const { tokens } = await oauth2Client.getToken(code);

    return tokens;

}

// Save Google tokens to disk
function saveTokens(tokens) {

    fs.writeFileSync(
        TOKEN_PATH,
        JSON.stringify(tokens, null, 2)
    );

    console.log("Google OAuth tokens saved.");

}

// Load saved Google tokens when the server starts
function loadTokens() {

    if (!fs.existsSync(TOKEN_PATH)) {
        console.log("No saved Google OAuth tokens found.");
        return false;
    }

    const tokens = JSON.parse(
        fs.readFileSync(TOKEN_PATH, "utf8")
    );

    oauth2Client.setCredentials(tokens);

    console.log("Saved Google OAuth tokens loaded.");

    return true;

}

// Try to load existing tokens immediately
loadTokens();

module.exports = {
    oauth2Client,
    getAuthorizationUrl,
    getTokens,
    saveTokens
};