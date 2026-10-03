const express = require("express");
const router = express.Router();
const supabase = require("../supabase");

// Get all checklist templates
router.get("/", async (req, res) => {
  try {
    const { data, error } = await supabase
    .from("checklist_templates")
    .select(`
        *,
        checklist_items (
            id,
            item,
            sort_order
        )
    `)
    .order("name");

    if (error) {
      console.error("Supabase checklist error:", error);
      return res.status(500).json({ error: error.message });
    }

    res.json(data);
  } catch (err) {
    console.error("Checklist route error:", err);
    res.status(500).json({ error: "Failed to load checklists" });
  }
});

module.exports = router;