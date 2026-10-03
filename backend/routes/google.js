const express = require("express");
const { google } = require("googleapis");
const {
    oauth2Client,
    getAuthorizationUrl,
    getTokens,
    saveTokens
} = require("../services/googleAuth");

const router = express.Router();


// ------------------------------------
// GOOGLE LOGIN
// ------------------------------------

router.get("/login", (req, res) => {

    const authorizationUrl = getAuthorizationUrl();

    res.redirect(authorizationUrl);

});


// ------------------------------------
// GOOGLE CALLBACK
// ------------------------------------

router.get("/callback", async (req, res) => {

    try {

        const code = req.query.code;

        if (!code) {
            return res.status(400).send("Missing Google authorization code.");
        }

        const tokens = await getTokens(code);

oauth2Client.setCredentials(tokens);

saveTokens(tokens);

res.send("Google Calendar connected successfully!");

    } catch (error) {

        console.error("Google OAuth error:", error);

        res.status(500).send("Google authentication failed.");

    }

});



// ------------------------------------
// GOOGLE APPOINTMENTS
// ------------------------------------

router.get("/appointments", async (req, res) => {

    try {

        const calendar = google.calendar({
            version: "v3",
            auth: oauth2Client
        });

        const response = await calendar.events.list({

            calendarId: "primary",

            timeMin: new Date().toISOString(),

            maxResults: 20,

            singleEvents: true,

            orderBy: "startTime"

        });

        const appointments = response.data.items.map(event => {

            const start = event.start?.dateTime || event.start?.date || null;
            const end = event.end?.dateTime || event.end?.date || null;

            return {
                id: event.id,
                customer: event.summary || "Unknown Customer",
                start,
                end,
                location: event.location || "",
                description: event.description || "",
                status: event.status || "",
                htmlLink: event.htmlLink || ""
            };

        });

        res.json(appointments);

    } catch (error) {

        console.error("Calendar error:", error);

        res.status(500).send("Unable to retrieve Google Calendar.");

    }

});


module.exports = router;