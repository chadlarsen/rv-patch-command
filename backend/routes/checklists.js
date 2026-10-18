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

// Get checklists for a specific job
router.get("/job/:jobId", async (req, res) => {
  try {
    const { jobId } = req.params;

    const { data, error } = await supabase
      .from("job_checklists")
      .select(`
        id,
        job_id,
        checklist_id,
        checklist_templates (
          id,
          name,
          description
        ),
        job_checklist_items (
          id,
          checklist_item_id,
          completed,
          completed_at,
          checklist_items (
            id,
            item,
            sort_order
          )
        )
      `)
      .eq("job_id", jobId);

    if (error) {
      console.error("Supabase job checklist error:", error);
      return res.status(500).json({ error: error.message });
    }

    res.json(data);
  } catch (err) {
    console.error("Job checklist route error:", err);
    res.status(500).json({ error: "Failed to load job checklists" });
  }
});

// Update completion status for a job checklist item
router.patch("/job-item/:itemId", async (req, res) => {
  try {
    const { itemId } = req.params;
    const { completed } = req.body;

    const { data, error } = await supabase
      .from("job_checklist_items")
      .update({
        completed: completed,
        completed_at: completed ? new Date().toISOString() : null
      })
      .eq("id", itemId)
      .select()
      .single();

    if (error) {
      console.error("Supabase checklist item update error:", error);
      return res.status(500).json({ error: error.message });
    }

    res.json(data);

  } catch (err) {
    console.error("Checklist item update route error:", err);
    res.status(500).json({ error: "Failed to update checklist item" });
  }
});

// Update a job checklist item
router.patch("/job-item/:itemId", async (req, res) => {
  try {
    const { itemId } = req.params;
    const { completed } = req.body;

    const { data, error } = await supabase
      .from("job_checklist_items")
      .update({
        completed,
        completed_at: completed ? new Date().toISOString() : null
      })
      .eq("id", itemId)
      .select()
      .single();

    if (error) {
      console.error("Supabase checklist item update error:", error);
      return res.status(500).json({ error: error.message });
    }

    res.json(data);
  } catch (err) {
    console.error("Checklist item update route error:", err);
    res.status(500).json({ error: "Failed to update checklist item" });
  }
});

// Update completion status for a job checklist item
router.patch("/job-item/:itemId", async (req, res) => {
  try {
    const { itemId } = req.params;
    const { completed } = req.body;

    const { data, error } = await supabase
      .from("job_checklist_items")
      .update({
        completed: completed,
        completed_at: completed ? new Date().toISOString() : null
      })
      .eq("id", itemId)
      .select()
      .single();

    if (error) {
      console.error("Supabase checklist item update error:", error);
      return res.status(500).json({ error: error.message });
    }

    res.json(data);

  } catch (err) {
    console.error("Checklist item update route error:", err);
    res.status(500).json({
      error: "Failed to update checklist item"
    });
  }
});

module.exports = router;