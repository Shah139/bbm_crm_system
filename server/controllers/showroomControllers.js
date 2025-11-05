import { sendSMS } from "../services/smsService.js";
import { Settings } from "../models/settingsModel.js";

function normalizeBdPhone(number) {
  if (!number) return number;
  const digits = ("" + number).replace(/\D+/g, "");
  if (digits.startsWith("880")) return digits; // already in intl
  if (digits.startsWith("01")) return "88" + digits; // add country code
  if (digits.startsWith("1")) return "880" + digits; // if missing leading 0
  if (digits.startsWith("0")) return "88" + digits.slice(0); // add 88
  return digits;
}

export const createShowroomCustomer = async (req, res) => {
  try {
    const { customerName, phoneNumber, category, showroomBranch } = req.body || {};
    if (!customerName || !phoneNumber || !category || !showroomBranch) {
      return res.status(400).json({ message: "customerName, phoneNumber, category, showroomBranch are required" });
    }

    // Load message settings from DB (with environment fallbacks)
    const s = (await Settings.findOne({})) || {};
    const feedbackBase = s.feedbackUrl || process.env.FEEDBACK_URL || "http://localhost:3000/user/feedback";
    const provider = s.smsProvider || process.env.SMS_PROVIDER;
    const apiKey = s.smsApiKey || process.env.SMS_API_KEY;
    const senderId = s.smsSenderId || process.env.SMS_SENDER_ID;

    const msg = `Dear Sir/Madam, thank you for visiting ${showroomBranch}. You showed interest in ${category}. Please share your feedback here: ${feedbackBase}`;

    const to = normalizeBdPhone(phoneNumber);
    const smsResult = await sendSMS(to, msg, { provider, apiKey, senderId });

    // You can persist the customer entry later if needed
    return res.status(201).json({
      message: "Customer recorded and SMS sent",
      sms: smsResult,
    });
  } catch (err) {
    console.error("createShowroomCustomer error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};
