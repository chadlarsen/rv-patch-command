const express = require("express");
const cors = require("cors");
const path = require("path");
require('dotenv').config({ path: __dirname + '/.env' });
const app = express();

app.use(cors());
app.use(express.json());


// ------------------------------------
// SERVE RV PATCH COMMAND FRONT END
// ------------------------------------

app.use(express.static(path.join(__dirname, "..")));


// ------------------------------------
// GOOGLE ROUTES
// ------------------------------------

const googleRoutes = require("./routes/google");
const checklistRoutes = require("./routes/checklists");
const jobRoutes = require("./routes/jobs");

app.use("/google", googleRoutes);
app.use("/checklists", checklistRoutes);
app.use("/jobs", jobRoutes);


// ------------------------------------
// START SERVER
// ------------------------------------

const PORT = 3000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});