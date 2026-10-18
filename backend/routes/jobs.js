const express = require("express");
const router = express.Router();
const supabase = require("../supabase");

// Find jobs by customer name
router.get("/customer/:customerName", async (req, res) => {
  try {
    const customerName = req.params.customerName;

    const { data, error } = await supabase
      .from("jobs")
      .select("*")
      .ilike("customer_name", customerName)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Supabase job lookup error:", error);
      return res.status(500).json({ error: error.message });
    }

    res.json(data);
  } catch (err) {
    console.error("Job lookup route error:", err);
    res.status(500).json({ error: "Failed to find jobs" });
  }
});

module.exports = router;