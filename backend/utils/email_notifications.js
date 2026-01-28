const { createBrevoClient } = require('../config/brevo');
const brevo = require('@getbrevo/brevo');
const logger = require('../config/logger');
const User = require('../models/User');

// Helper function to check if an email belongs to a test user
const isTestUserEmail = async (email) => {
    try {
        // Test users are identified by the isTestUser flag in the database
        const user = await User.findOne({ email: email });
        
        if (!user) {
            logger.warn('User not found for email check', { email });
            return false;
        }
        
        // Check the isTestUser flag (users who logged in via test endpoint)
        const isTestUser = user.isTestUser === true;
        
        logger.info('Test user check result', {
            email: email,
            username: user.username,
            isTestUser: isTestUser
        });
        
        return isTestUser;
    } catch (error) {
        logger.error('Error checking if user is test user', { email, error: error.message });
        return false;
    }
};

exports.sendEmailNotification = async ({ message, email }) => {
    try {
        // Handle comma-separated emails
        const emails = email.split(',').map(e => e.trim()).filter(e => e);
        
        // Filter out test user emails
        const nonTestEmails = [];
        for (const emailAddr of emails) {
            const isTestUser = await isTestUserEmail(emailAddr);
            if (!isTestUser) {
                nonTestEmails.push(emailAddr);
            } else {
                logger.info('Skipping email notification for test user', {
                    recipient: emailAddr,
                    message: 'Test user - email not sent'
                });
            }
        }
        
        // If all recipients are test users, skip sending
        if (nonTestEmails.length === 0) {
            logger.info('All recipients are test users - no emails sent', {
                originalRecipients: emails.length
            });
            return { success: true, skipped: true, reason: 'all_test_users' };
        }

        // Get Brevo API client
        const apiInstance = createBrevoClient();
        
        // Create email object
        const sendSmtpEmail = new brevo.SendSmtpEmail();
        
        sendSmtpEmail.sender = { 
            email: process.env.BREVO_SENDER_EMAIL || 'rideshare.pesu@gmail.com',
            name: 'RideShare'
        };
        
        // Send to non-test users only
        sendSmtpEmail.to = nonTestEmails.map(e => ({ email: e }));
        sendSmtpEmail.subject = 'Update on your ride!';
        sendSmtpEmail.htmlContent = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 5px;">
                <h2 style="color: #4285f4;">RideShare Notification</h2>
                <p style="font-size: 16px; line-height: 1.5;">${message}</p>
                <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
                <p style="color: #666; font-size: 12px;">This is an automated message from RideShare. Please do not reply to this email.</p>
            </div>
        `;
        
        // Send email via Brevo
        const result = await apiInstance.sendTransacEmail(sendSmtpEmail);
        
        logger.info('Email notification sent successfully', {
            recipients: nonTestEmails,
            skippedTestUsers: emails.length - nonTestEmails.length,
            messageId: result.messageId,
            subject: 'Update on your ride!'
        });
        
        return { success: true, messageId: result.messageId };
    } catch (error) {
        logger.error('Failed to send email notification', {
            recipient: email,
            error: error.message,
            errorDetails: error.response?.text || error.toString()
        });
        
        return { success: false, error: error.message };
    }
};
