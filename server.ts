import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import nodemailer from "nodemailer";
import dotenv from "dotenv";
import cors from "cors";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(cors());
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));

  // Helper to create SMTP transporter with robust settings
  const createTransporter = () => {
    const smtpHost = process.env.SMTP_HOST;
    const smtpPort = parseInt(process.env.SMTP_PORT || "587");
    const isSecure = process.env.SMTP_SECURE === "true" || smtpPort === 465;

    console.log(`[SMTP] Initializing connection to ${smtpHost}:${smtpPort} (Secure: ${isSecure})`);

    const transporter = nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: isSecure,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
      // Maximum reliability settings for restricted environments
      connectionTimeout: 60000, // 60 seconds
      greetingTimeout: 60000,   // 60 seconds
      socketTimeout: 90000,     // 90 seconds
      dnsTimeout: 20000,        // 20 seconds
      pool: false,
      debug: true,
      logger: true,
      tls: {
        rejectUnauthorized: false,
        minVersion: 'TLSv1.2',
        ciphers: 'HIGH:!aNULL:!MD5'
      },
      // Force STARTTLS if using port 587
      requireTLS: smtpPort === 587,
    } as any);

    return transporter;
  };

  // API routes
  app.post("/api/send-confirmation", async (req, res) => {
    console.log("Received request to /api/send-confirmation:", req.body);
    const { email, orderId, items, total } = req.body;

    if (!email || !orderId || !items || !total) {
      return res.status(400).json({ error: "Missing required order details" });
    }

    try {
      const transporter = createTransporter();

      // Verify connection configuration
      try {
        console.log("[SMTP] Verifying connection...");
        await transporter.verify();
        console.log("[SMTP] Connection verified successfully");
      } catch (verifyError: any) {
        console.error("[SMTP] Verification failed:", verifyError);
        // We continue anyway, as verify() can sometimes fail even if sendMail() works, 
        // but it gives us better logs.
      }

      const itemsHtml = items
        .map(
          (item: any) =>
            `<li>${item.name} x${item.quantity} - PHP ${(item.price * item.quantity).toFixed(2)}</li>`
        )
        .join("");

      const mailOptions = {
        from: `"Tindahang Envergista" <${process.env.SMTP_USER}>`,
        to: email,
        subject: `Order Confirmation - #${orderId}`,
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: auto; border: 1px solid #eee; padding: 20px;">
            <h1 style="color: #800000; text-align: center;">TINDAHANG ENVERGISTA</h1>
            <p style="text-align: center; font-size: 10px; font-weight: bold; letter-spacing: 2px;">DIGITAL MARKET PLACE FOR STUDENT ENTREPRENEURS</p>
            <hr style="border: 0; border-top: 1px solid #800000; margin: 20px 0;">
            <h2>Thank you for your order!</h2>
            <p>Your order <strong>#${orderId}</strong> has been successfully placed and is being prepared.</p>
            <h3>Order Summary:</h3>
            <ul>
              ${itemsHtml}
            </ul>
            <p style="font-size: 18px; font-weight: bold; color: #800000;">Total: PHP ${total.toFixed(2)}</p>
            <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
            <p style="font-size: 12px; color: #666; text-align: center;">
              Empowering Student Entrepreneurs of Everga Candelaria.
            </p>
          </div>
        `,
      };

      // Check if SMTP is configured
      if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
        console.warn("SMTP is not configured. Email will not be sent, but request will succeed for demo purposes.");
        return res.json({ success: true, message: "Email simulation successful (SMTP not configured)" });
      }

      await transporter.sendMail(mailOptions);
      res.json({ success: true, message: "Confirmation email sent successfully" });
    } catch (error: any) {
      console.error("Detailed Error sending email:", {
        code: error.code,
        command: error.command,
        response: error.response,
        responseCode: error.responseCode,
        stack: error.stack
      });
      
      let errorMessage = "Failed to send confirmation email";
      if (error.code === 'ETIMEDOUT') {
        errorMessage = "Connection timed out. Please check your SMTP_HOST and SMTP_PORT. Ensure your firewall allows outbound traffic on this port.";
      } else if (error.code === 'EAUTH') {
        errorMessage = "Authentication failed. Please check your SMTP_USER and SMTP_PASS (use App Passwords for Gmail).";
      } else if (error.command === 'CONN') {
        errorMessage = "Could not connect to the SMTP server. The host might be unreachable or the port is blocked.";
      }

      res.status(500).json({ 
        error: errorMessage,
        details: error.message
      });
    }
  });

  app.post("/api/send-admin-request", async (req, res) => {
    console.log("Received request to /api/send-admin-request:", req.body);
    const { adminEmail, userEmail, requestType, timestamp } = req.body;

    if (!adminEmail || !userEmail || !requestType) {
      return res.status(400).json({ error: "Missing required request details" });
    }

    try {
      const transporter = createTransporter();

      // Verify connection configuration
      try {
        console.log("[SMTP] Verifying connection for admin request...");
        await transporter.verify();
        console.log("[SMTP] Admin connection verified successfully");
      } catch (verifyError: any) {
        console.error("[SMTP] Admin verification failed:", verifyError);
      }

      const mailOptions = {
        from: `"Tindahang Envergista System" <${process.env.SMTP_USER}>`,
        to: adminEmail,
        subject: `ADMIN REQUEST: ${requestType}`,
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: auto; border: 1px solid #eee; padding: 20px;">
            <h1 style="color: #800000; text-align: center;">ADMIN REQUEST</h1>
            <p style="text-align: center; font-size: 10px; font-weight: bold; letter-spacing: 2px;">TINDAHANG ENVERGISTA SYSTEM</p>
            <hr style="border: 0; border-top: 1px solid #800000; margin: 20px 0;">
            <p>A new request has been submitted by a user:</p>
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 10px; border: 1px solid #eee; font-weight: bold;">User Email:</td>
                <td style="padding: 10px; border: 1px solid #eee;">${userEmail}</td>
              </tr>
              <tr>
                <td style="padding: 10px; border: 1px solid #eee; font-weight: bold;">Request Type:</td>
                <td style="padding: 10px; border: 1px solid #eee;">${requestType}</td>
              </tr>
              <tr>
                <td style="padding: 10px; border: 1px solid #eee; font-weight: bold;">Timestamp:</td>
                <td style="padding: 10px; border: 1px solid #eee;">${timestamp}</td>
              </tr>
            </table>
            <p style="margin-top: 20px;">Please take appropriate action regarding this request.</p>
            <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
            <p style="font-size: 12px; color: #666; text-align: center;">
              Automated System Notification - Tindahang Envergista
            </p>
          </div>
        `,
      };

      if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
        console.warn("SMTP not configured for admin request. Mocking success.");
        return res.json({ success: true, message: "Admin request simulated successfully" });
      }

      await transporter.sendMail(mailOptions);
      res.json({ success: true, message: "Admin request sent successfully" });
    } catch (error: any) {
      console.error("Error sending admin request:", error);
      
      let errorMessage = "Failed to send admin request";
      if (error.code === 'ETIMEDOUT') {
        errorMessage = "Connection timed out. Please check your SMTP_HOST and SMTP_PORT.";
      } else if (error.code === 'EAUTH') {
        errorMessage = "Authentication failed. Please check your SMTP_USER and SMTP_PASS.";
      }

      res.status(500).json({ 
        error: errorMessage,
        details: error.message
      });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
