// utils/mailer.js
import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config(); // Load environment variables

// Create a reusable transporter using Amazon SES SMTP
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || "email-smtp.eu-west-1.amazonaws.com",
  port: Number(process.env.EMAIL_PORT) || 587, // SES recommends 587 for TLS
  secure: process.env.EMAIL_SECURE === "true", // false for port 587
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS, // SES SMTP password
  },
  tls: {
    rejectUnauthorized: false, // optional, for self-signed certs
  },
});

// --- Email Templates ---

export function buildAccountCreationEmailTemplate(user) {
  const { first_name, last_name, email, role, trainee_id, password_plain } = user;
  const greeting = first_name ? `Dear ${first_name} ${last_name || ""},` : "Dear User,";
  const year = new Date().getFullYear();

  const credentials =
    role === "trainee"
      ? ` 
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Password:</strong> ${password_plain}</p>
        <p><strong>Trainee ID:</strong> ${trainee_id}</p>
      `
      : ` 
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Password:</strong> ${password_plain}</p>
      `;

  return `
    <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>EndoNurseVR LMS Account Created</title>
  </head>
  <body style="margin:0;padding:0;background-color:#e9f2f5;font-family:Arial,sans-serif;">
    <div style="padding:20px;">
      <div style="max-width:600px;margin:auto;background:#ffffff;border-radius:10px;padding:30px;box-shadow:0 3px 10px rgba(0,0,0,0.1);">
        <div style="text-align:center;margin-bottom:10px;">
          <img src="https://drive.google.com/uc?export=view&id=1ErsoCRSSitylpDB-TZeIXwlU_Js8SMMS"
               alt="EndoNurseVR Logo"
               style="width:120px;height:auto; margin-bottom:10px" />
        </div>
        <h2 style="text-align:center;color:#0c4a6e;margin-bottom:15px;">
          EndoNurseVR Learning Management System
        </h2>
        <p style="color:#333;font-size:15px;line-height:1.6;">${greeting}</p>
        <p style="color:#333;font-size:15px;line-height:1.6;">
          Your account has been successfully created on the EndoNurseVR LMS platform. Below are your login details:
        </p>
        <div style="background-color:#f9fafb;border:1px solid #e0e0e0;border-radius:8px;padding:15px;margin:20px 0;">
          ${credentials}
        </div>
        <p style="color:#333;font-size:15px;line-height:1.6;">
          You can now log in to the system and begin using the platform.
        </p>
        <div style="text-align:center;margin-top:30px;">
          <a href="https://lms-chenai.insightful3d.com"
             style="background-color:#766EA9;color:#ffffff;text-decoration:none;padding:12px 25px;border-radius:6px;font-size:15px;display:inline-block;">
             Go to Login
          </a>
        </div>
        <br/>
        <p style="font-size:13px;color:#555;text-align:center;line-height:1.4;">
          Best Regards,<br/>
          <strong>EndoNurseVR Learning Management System</strong><br/>
          © ${year}
        </p>
      </div>
    </div>
  </body>
  </html>
  `;
}

export function buildPasswordResetEmailTemplate(user, newPassword) {
  const { first_name, last_name, email } = user;
  const greeting = first_name ? `Dear ${first_name} ${last_name || ""},` : "Dear User,";
  const year = new Date().getFullYear();

  return `
   <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Password Reset Notification</title>
  </head>
  <body style="margin:0;padding:0;background-color:#e9f2f5;font-family:Arial,sans-serif;">
    <div style="padding:20px;">
      <div style="max-width:600px;margin:auto;background:#ffffff;border-radius:10px;padding:30px;box-shadow:0 3px 10px rgba(0,0,0,0.1);">
        <div style="text-align:center;margin-bottom:25px;">
          <img src="https://drive.google.com/uc?export=view&id=1ErsoCRSSitylpDB-TZeIXwlU_Js8SMMS"
               alt="EndoNurseVR Logo"
               style="width:120px; height:auto; margin-bottom:10px;" />
        </div>
        <h2 style="text-align:center;color:#0c4a6e;margin-bottom:15px;">
          EndoNurseVR Learning Management System
        </h2>
        <p style="color:#333;font-size:15px;line-height:1.6;">${greeting}</p>
        <p style="color:#333;font-size:15px;line-height:1.6;">
          Your password has been successfully reset. Below are your new login credentials:
        </p>
        <div style="background-color:#f9fafb;border:1px solid #e0e0e0;border-radius:8px;padding:15px;margin:20px 0;">
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>New Password:</strong> ${newPassword}</p>
        </div>
        <p style="color:#333;font-size:15px;line-height:1.6;">
          You can now log in to the system with your new password.
        </p>
        <div style="text-align:center;margin-top:30px;">
          <a href="https://lms-chenai.insightful3d.com"
             style="background-color:#766EA9;color:#ffffff;text-decoration:none;padding:12px 25px;border-radius:6px;font-size:15px;display:inline-block;">
             Go to Login
          </a>
        </div>
        <br/>
        <p style="font-size:13px;color:#555;text-align:center;line-height:1.4;">
          Best Regards,<br/>
          <strong>EndoNurseVR Learning Management System</strong><br/>
          © ${year}
        </p>
      </div>
    </div>
  </body>
  </html>
  `;
}


// Send email for account creation or password reset
export async function sendAccountEmail(user, type, newPassword = null) {
  try {
    let html;
    if (type === "create") {
      html = buildAccountCreationEmailTemplate(user);
    } else if (type === "reset") {
      html = buildPasswordResetEmailTemplate(user, newPassword);
    } else {
      throw new Error("Invalid email type.");
    }

   const mailOptions = {
      from: process.env.EMAIL_FROM || `"EndoNurseVR LMS" <${process.env.EMAIL_USER}>`,
      to: user.email,
      subject: type === "create" 
        ? "Your EndoNurseVR LMS Account Details" 
        : "Your EndoNurseVR LMS Password Has Been Reset",
      html,
    };


    const info = await transporter.sendMail(mailOptions);
    console.log(`${type === "create" ? "Account creation" : "Password reset"} email sent successfully to ${user.email}: ${info.messageId}`);
    
    return { success: true, message: `${type === "create" ? "Account" : "Password reset"} email sent successfully.` };
  } catch (error) {
    console.error(`Failed to send email to ${user.email}:`, error);
    return { success: false, message: error.message };
  }
}
