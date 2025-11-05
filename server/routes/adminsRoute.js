import { Router } from "express";
import jwt from "jsonwebtoken";
import { login, me } from "../controllers/authControllers.js";
import { listAdmins, createAdmin, deleteAdmin, updateAdmin } from "../controllers/adminControllers.js";
import { listCategories, createCategory, updateCategory, deleteCategory } from "../controllers/categoryControllers.js";
import { createFeedback, listFeedbacks, updateFeedbackStatus, deleteFeedback } from "../controllers/feedbackControllers.js";
import { createShowroomCustomer } from "../controllers/showroomControllers.js";
import { getMessageSettings, updateMessageSettings } from "../controllers/settingsControllers.js";

const router = Router();

router.post("/login", login);
router.get("/me", me);

// Simple auth middleware
const requireAuth = (req, res, next) => {
  try {
    const auth = req.headers.authorization || "";
    const token = auth.startsWith("Bearer ") ? auth.slice(7) : "";
    if (!token) return res.status(401).json({ message: "Unauthorized" });
    const payload = jwt.verify(token, process.env.JWT_SECRET || "dev_secret");
    req.user = payload;
    next();
  } catch (e) {
    return res.status(401).json({ message: "Unauthorized" });
  }
};

const requireAdmin = (req, res, next) => {
  if (req.user?.role !== "admin") return res.status(403).json({ message: "Forbidden" });
  next();
};

const requireShowroomOrAdmin = (req, res, next) => {
  const role = req.user?.role;
  if (role === "admin" || role === "showroom") return next();
  return res.status(403).json({ message: "Forbidden" });
};

// Admin management routes (admin-only)
router.get("/admins", requireAuth, requireAdmin, listAdmins);
router.post("/admins", requireAuth, requireAdmin, createAdmin);
router.delete("/admins/:id", requireAuth, requireAdmin, deleteAdmin);
router.put("/admins/:id", requireAuth, requireAdmin, updateAdmin);

// Category management routes (admin-only)
router.get("/categories", requireAuth, requireAdmin, listCategories);
router.post("/categories", requireAuth, requireAdmin, createCategory);
router.put("/categories/:id", requireAuth, requireAdmin, updateCategory);
router.delete("/categories/:id", requireAuth, requireAdmin, deleteCategory);

// Public categories listing (for feedback form)
router.get("/categories-public", listCategories);

// Feedback routes
// Public submit endpoint
router.post("/feedback", createFeedback);
// Admin-only listing endpoint
router.get("/feedbacks", requireAuth, requireAdmin, listFeedbacks);

// Admin-only management endpoints
router.put("/feedbacks/:id/status", requireAuth, requireAdmin, updateFeedbackStatus);
router.delete("/feedbacks/:id", requireAuth, requireAdmin, deleteFeedback);

// Showroom: add customer and send SMS
router.post("/showroom/customers", requireAuth, requireShowroomOrAdmin, createShowroomCustomer);

// Admin: message settings (SMS provider/API key/Sender ID/Feedback URL)
router.get("/message-settings", requireAuth, requireAdmin, getMessageSettings);
router.put("/message-settings", requireAuth, requireAdmin, updateMessageSettings);

export default router;

