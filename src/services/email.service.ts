import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export class EmailService {
  static async sendStaffInvitation({
    email,
    fullName,
    clinicName,
    inviteUrl,
  }: {
    email: string;
    fullName: string;
    clinicName: string;
    inviteUrl: string;
  }) {
    try {
      const { data, error } = await resend.emails.send({
        from: 'Neoliva <onboarding@resend.dev>', // In production, use a verified domain
        to: [email],
        subject: `Invitation to join ${clinicName} on Neoliva`,
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; rounded: 10px;">
            <h2 style="color: #333;">Welcome to Neoliva, ${fullName}!</h2>
            <p style="color: #666; font-size: 16px;">
              You have been invited to join the staff at <strong>${clinicName}</strong>.
            </p>
            <p style="color: #666; font-size: 16px;">
              Click the button below to accept your invitation and set up your account:
            </p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${inviteUrl}" style="background-color: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
                Accept Invitation
              </a>
            </div>
            <p style="color: #999; font-size: 12px;">
              If you didn't expect this invitation, you can safely ignore this email.
              The link will expire in 7 days.
            </p>
            <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;" />
            <p style="color: #ccc; font-size: 10px; text-align: center;">
              Powered by Neoliva Enterprise Security
            </p>
          </div>
        `,
      });

      if (error) {
        console.error('[EmailService.sendStaffInvitation] Error:', error);
        return { success: false, error };
      }

      return { success: true, data };
    } catch (error) {
      console.error('[EmailService.sendStaffInvitation] Exception:', error);
      return { success: false, error };
    }
  }
}
