import { supabase } from '../lib/supabase';

export interface EmailData {
  to: string;
  subject: string;
  html: string;
  from?: string;
}

/**
 * Global function to send emails
 * This uses Supabase to store emails and would typically call an email service
 */
export const sendEmail = async (emailData: EmailData): Promise<boolean> => {
  try {
    // In a real implementation, this would call a Supabase Edge Function or email service
    console.log('Sending email:', emailData);
    
    // Save the email to Supabase
    const { error } = await supabase
      .from('emails')
      .insert([
        {
          to_email: emailData.to,
          from_email: emailData.from || 'noreply@gsdt.com',
          subject: emailData.subject,
          html: emailData.html,
          sent_at: new Date().toISOString()
        }
      ]);
    
    if (error) {
      console.error('Error saving email to Supabase:', error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error sending email:', error);
    return false;
  }
};

/**
 * Email template for contact form submissions
 */
export const getContactFormEmailTemplate = (
  name: string,
  email: string,
  subject: string,
  message: string
): string => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>New Contact Form Submission</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 600px;
          margin: 0 auto;
        }
        .container {
          padding: 20px;
          border: 1px solid #ddd;
          border-radius: 5px;
        }
        .header {
          background-color: #4c1d95;
          color: white;
          padding: 10px 20px;
          border-radius: 5px 5px 0 0;
          margin-top: 0;
        }
        .content {
          padding: 20px;
        }
        .field {
          margin-bottom: 15px;
        }
        .label {
          font-weight: bold;
          margin-bottom: 5px;
        }
        .value {
          padding: 10px;
          background-color: #f9f9f9;
          border-radius: 3px;
        }
        .footer {
          margin-top: 20px;
          font-size: 12px;
          color: #666;
          text-align: center;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <h1 class="header">New Contact Form Submission</h1>
        <div class="content">
          <div class="field">
            <div class="label">Name:</div>
            <div class="value">${name}</div>
          </div>
          <div class="field">
            <div class="label">Email:</div>
            <div class="value">${email}</div>
          </div>
          <div class="field">
            <div class="label">Subject:</div>
            <div class="value">${subject}</div>
          </div>
          <div class="field">
            <div class="label">Message:</div>
            <div class="value">${message}</div>
          </div>
        </div>
        <div class="footer">
          This email was sent from the GSDT website contact form.
        </div>
      </div>
    </body>
    </html>
  `;
};

/**
 * Email template for replying to contact form submissions
 */
export const getContactReplyTemplate = (
  name: string,
  originalSubject: string,
  replyMessage: string
): string => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Response to Your Inquiry</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 600px;
          margin: 0 auto;
        }
        .container {
          padding: 20px;
          border: 1px solid #ddd;
          border-radius: 5px;
        }
        .header {
          background-color: #4c1d95;
          color: white;
          padding: 10px 20px;
          border-radius: 5px 5px 0 0;
          margin-top: 0;
        }
        .content {
          padding: 20px;
        }
        .message {
          margin-bottom: 20px;
          line-height: 1.6;
        }
        .footer {
          margin-top: 20px;
          font-size: 12px;
          color: #666;
          text-align: center;
          border-top: 1px solid #eee;
          padding-top: 20px;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <h1 class="header">Response to Your Inquiry</h1>
        <div class="content">
          <p>Dear ${name},</p>
          <p>Thank you for contacting us regarding "${originalSubject}".</p>
          <div class="message">
            ${replyMessage.replace(/\n/g, '<br>')}
          </div>
          <p>If you have any further questions, please don't hesitate to contact us again.</p>
          <p>Best regards,<br>GSDT Support Team</p>
        </div>
        <div class="footer">
          <p>This email is in response to your inquiry submitted through the GSDT website.</p>
          <p>© ${new Date().getFullYear()} Global South Digital Token. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;
};