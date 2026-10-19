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

// Assign a checklist template to a job
router.post("/job/:jobId/assign", async (req, res) => {
  try {
    const { jobId } = req.params;
    const { checklist_id } = req.body;

        // Prevent duplicate checklist assignments
    const { data: existingChecklist } = await supabase
      .from("job_checklists")
      .select("id")
      .eq("job_id", jobId)
      .eq("checklist_id", checklist_id)
      .maybeSingle();

    if (existingChecklist) {
      return res.status(409).json({
        error: "This checklist is already assigned to this job."
      });
    }

    if (!checklist_id) {
      return res.status(400).json({
        error: "checklist_id is required"
      });
    }

    // Create the job checklist assignment
    const { data: jobChecklist, error: checklistError } = await supabase
      .from("job_checklists")
      .insert({
        job_id: jobId,
        checklist_id: checklist_id
      })
      .select()
      .single();

    if (checklistError) {
      console.error("Checklist assignment error:", checklistError);
      return res.status(500).json({
        error: checklistError.message
      });
    }

    // Get all items from the checklist template
    const { data: templateItems, error: itemsError } = await supabase
      .from("checklist_items")
      .select("id")
      .eq("checklist_id", checklist_id)
      .order("sort_order");

    if (itemsError) {
      console.error("Checklist template item error:", itemsError);

      await supabase
        .from("job_checklists")
        .delete()
        .eq("id", jobChecklist.id);

      return res.status(500).json({
        error: itemsError.message
      });
    }

    // Create the job-specific checklist items
    const jobItems = templateItems.map(item => ({
      job_checklist_id: jobChecklist.id,
      checklist_item_id: item.id,
      completed: false
    }));

    if (jobItems.length > 0) {
      const { error: jobItemsError } = await supabase
        .from("job_checklist_items")
        .insert(jobItems);

      if (jobItemsError) {
        console.error("Job checklist item creation error:", jobItemsError);

        await supabase
          .from("job_checklists")
          .delete()
          .eq("id", jobChecklist.id);

        return res.status(500).json({
          error: jobItemsError.message
        });
      }
    }

    res.json({
      message: "Checklist assigned successfully",
      jobChecklist
    });

  } catch (err) {
    console.error("Checklist assignment route error:", err);

    res.status(500).json({
      error: "Failed to assign checklist"
    });
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