# File: backend/scrollvite/orders/email_templates.py
# Create this new file

def get_purchase_email_html(order, invite, frontend_url):
    """Beautiful HTML email template for buyer"""
    
    user_name = order.user.username if order.user.username else order.user.email.split('@')[0]
    
    return f"""
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Your Invitation is Ready!</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Georgia', 'Playfair Display', serif; background-color: #f7f5f2;">
    <table role="presentation" style="width: 100%; border-collapse: collapse;">
        <tr>
            <td align="center" style="padding: 40px 20px;">
                <!-- Main Container -->
                <table role="presentation" style="width: 100%; max-width: 600px; border-collapse: collapse; background-color: #ffffff; border-radius: 20px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.08);">
                    
                    <!-- Header with Golden Gradient -->
                    <tr>
                        <td style="background: linear-gradient(135deg, #D4AF37 0%, #C49A2C 100%); padding: 40px 30px; text-align: center;">
                            <h1 style="margin: 0; color: #2C2416; font-size: 32px; font-weight: 400; letter-spacing: 2px;">
                                ScrollVite
                            </h1>
                            <p style="margin: 10px 0 0 0; color: #2C2416; font-size: 14px; opacity: 0.8; letter-spacing: 1px;">
                                DIGITAL INVITATIONS
                            </p>
                        </td>
                    </tr>
                    
                    <!-- Main Content -->
                    <tr>
                        <td style="padding: 40px 30px;">
                            <h2 style="margin: 0 0 20px 0; color: #2C2416; font-size: 24px; font-weight: 400;">
                                Your Invitation is Ready! ✨
                            </h2>
                            
                            <p style="margin: 0 0 15px 0; color: #444; font-size: 16px; line-height: 1.6;">
                                Hi {user_name},
                            </p>
                            
                            <p style="margin: 0 0 25px 0; color: #444; font-size: 16px; line-height: 1.6;">
                                Thank you for choosing ScrollVite for your special event! Your beautiful digital invitation template is ready to customize.
                            </p>
                            
                            <!-- Order Details Box -->
                            <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #f7f5f2; border-radius: 12px; margin: 25px 0;">
                                <tr>
                                    <td style="padding: 20px;">
                                        <p style="margin: 0 0 10px 0; color: #666; font-size: 14px; text-transform: uppercase; letter-spacing: 1px;">
                                            Order Details
                                        </p>
                                        <p style="margin: 0 0 8px 0; color: #2C2416; font-size: 16px;">
                                            <strong>Template:</strong> {order.template.title}
                                        </p>
                                        <p style="margin: 0; color: #2C2416; font-size: 16px;">
                                            <strong>Amount Paid:</strong> ₹{order.amount}
                                        </p>
                                    </td>
                                </tr>
                            </table>
                            
                            <!-- CTA Button -->
                            <table role="presentation" style="width: 100%; border-collapse: collapse; margin: 30px 0;">
                                <tr>
                                    <td align="center">
                                        <a href="{frontend_url}/editor/{invite.id}" 
                                           style="display: inline-block; background: linear-gradient(135deg, #D4AF37 0%, #C49A2C 100%); color: #2C2416; text-decoration: none; padding: 16px 40px; border-radius: 50px; font-size: 16px; font-weight: 600; box-shadow: 0 4px 15px rgba(212, 175, 55, 0.3);">
                                            Customize Your Invite →
                                        </a>
                                    </td>
                                </tr>
                            </table>
                            
                            <!-- Next Steps -->
                            <div style="margin: 30px 0; padding: 20px; background-color: #fffef8; border-left: 4px solid #D4AF37; border-radius: 8px;">
                                <p style="margin: 0 0 15px 0; color: #2C2416; font-size: 16px; font-weight: 600;">
                                    💡 Next Steps:
                                </p>
                                <ul style="margin: 0; padding-left: 20px; color: #444; font-size: 15px; line-height: 1.8;">
                                    <li>Upload your photos for a personalized touch</li>
                                    <li>Add all your event details and customize the content</li>
                                    <li>Preview and share with your guests</li>
                                </ul>
                            </div>
                            
                            <!-- Public Link -->
                            <p style="margin: 25px 0 10px 0; color: #666; font-size: 14px;">
                                Your public invitation link:
                            </p>
                            <p style="margin: 0 0 30px 0; padding: 12px; background-color: #f7f5f2; border-radius: 8px; word-break: break-all;">
                                <a href="{frontend_url}/invite/{invite.public_slug}" 
                                   style="color: #D4AF37; text-decoration: none; font-size: 14px;">
                                    {frontend_url}/invite/{invite.public_slug}
                                </a>
                            </p>
                            
                            <p style="margin: 30px 0 0 0; color: #444; font-size: 16px; line-height: 1.6;">
                                Need help? Just reply to this email!
                            </p>
                            
                            <p style="margin: 20px 0 0 0; color: #666; font-size: 16px; line-height: 1.6;">
                                With love,<br>
                                <strong style="color: #2C2416;">The ScrollVite Team</strong>
                            </p>
                        </td>
                    </tr>
                    
                    <!-- Footer -->
                    <tr>
                        <td style="background-color: #2C2416; padding: 30px; text-align: center;">
                            <p style="margin: 0 0 10px 0; color: #D4AF37; font-size: 14px; letter-spacing: 2px;">
                                SCROLLVITE
                            </p>
                            <p style="margin: 0; color: #888; font-size: 12px;">
                                © 2026 ScrollVite. All rights reserved.
                            </p>
                        </td>
                    </tr>
                    
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
    """


def get_admin_notification_email_html(order):
    """HTML email template for admin notification"""
    
    return f"""
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>New Purchase</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Georgia', serif; background-color: #f7f5f2;">
    <table role="presentation" style="width: 100%; border-collapse: collapse;">
        <tr>
            <td align="center" style="padding: 40px 20px;">
                <table role="presentation" style="width: 100%; max-width: 600px; border-collapse: collapse; background-color: #ffffff; border-radius: 12px; overflow: hidden;">
                    
                    <!-- Header -->
                    <tr>
                        <td style="background-color: #2C2416; padding: 25px 30px; text-align: center;">
                            <h1 style="margin: 0; color: #D4AF37; font-size: 24px; font-weight: 400;">
                                🎉 New Purchase Alert
                            </h1>
                        </td>
                    </tr>
                    
                    <!-- Content -->
                    <tr>
                        <td style="padding: 30px;">
                            <p style="margin: 0 0 20px 0; color: #444; font-size: 16px;">
                                A new purchase has been made!
                            </p>
                            
                            <table role="presentation" style="width: 100%; border-collapse: collapse;">
                                <tr>
                                    <td style="padding: 12px; border-bottom: 1px solid #f0f0f0;">
                                        <strong style="color: #666; font-size: 14px;">Customer:</strong>
                                    </td>
                                    <td style="padding: 12px; border-bottom: 1px solid #f0f0f0; text-align: right;">
                                        <span style="color: #2C2416; font-size: 14px;">{order.user.email}</span>
                                    </td>
                                </tr>
                                <tr>
                                    <td style="padding: 12px; border-bottom: 1px solid #f0f0f0;">
                                        <strong style="color: #666; font-size: 14px;">Template:</strong>
                                    </td>
                                    <td style="padding: 12px; border-bottom: 1px solid #f0f0f0; text-align: right;">
                                        <span style="color: #2C2416; font-size: 14px;">{order.template.title}</span>
                                    </td>
                                </tr>
                                <tr>
                                    <td style="padding: 12px; border-bottom: 1px solid #f0f0f0;">
                                        <strong style="color: #666; font-size: 14px;">Amount:</strong>
                                    </td>
                                    <td style="padding: 12px; border-bottom: 1px solid #f0f0f0; text-align: right;">
                                        <span style="color: #D4AF37; font-size: 16px; font-weight: 600;">₹{order.amount}</span>
                                    </td>
                                </tr>
                                <tr>
                                    <td style="padding: 12px; border-bottom: 1px solid #f0f0f0;">
                                        <strong style="color: #666; font-size: 14px;">Order ID:</strong>
                                    </td>
                                    <td style="padding: 12px; border-bottom: 1px solid #f0f0f0; text-align: right;">
                                        <span style="color: #2C2416; font-size: 14px; font-family: monospace;">{order.id}</span>
                                    </td>
                                </tr>
                                <tr>
                                    <td style="padding: 12px;">
                                        <strong style="color: #666; font-size: 14px;">Date:</strong>
                                    </td>
                                    <td style="padding: 12px; text-align: right;">
                                        <span style="color: #2C2416; font-size: 14px;">{order.created_at.strftime('%B %d, %Y at %I:%M %p')}</span>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                    
                    <!-- Footer -->
                    <tr>
                        <td style="background-color: #f7f5f2; padding: 20px; text-align: center;">
                            <p style="margin: 0; color: #888; font-size: 12px;">
                                ScrollVite Admin Notification
                            </p>
                        </td>
                    </tr>
                    
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
    """