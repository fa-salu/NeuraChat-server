export const generateVerificationEmail = (otp: string) => `
  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
    <h2 style="color: #333; text-align: center; border-bottom: 1px solid #eee; padding-bottom: 10px;">Email Verification</h2>
    <p>Hello,</p>
    <p>Thank you for registering. Please use the following verification code:</p>
    <div style="background-color: #f5f5f5; padding: 15px; text-align: center; border-radius: 4px; margin: 20px 0;">
      <h1 style="color: #2c7be5; font-size: 32px; letter-spacing: 6px; margin: 0;">${otp}</h1>
      <p style="color: #777; margin-top: 10px; font-size: 14px;">This code will expire in 5 minutes</p>
    </div>
    <p>If you did not request this verification, please ignore this email.</p>
    <p>Best regards,<br>The Support Team</p>
  </div>
`;

export const generateResendOtpEmail = (otp: string) => `
  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
    <h2 style="color: #333; text-align: center; border-bottom: 1px solid #eee; padding-bottom: 10px;">Resend OTP</h2>
    <p>Hello,</p>
    <p>Here is your new verification code:</p>
    <div style="background-color: #f5f5f5; padding: 15px; text-align: center; border-radius: 4px; margin: 20px 0;">
      <h1 style="color: #2c7be5; font-size: 32px; letter-spacing: 6px; margin: 0;">${otp}</h1>
      <p style="color: #777; margin-top: 10px; font-size: 14px;">This code will expire in 5 minutes</p>
    </div>
    <p>If you did not request this, please ignore this email.</p>
    <p>Best regards,<br>The Support Team</p>
  </div>
`;
