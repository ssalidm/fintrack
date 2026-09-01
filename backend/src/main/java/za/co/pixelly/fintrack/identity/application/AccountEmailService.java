package za.co.pixelly.fintrack.identity.application;


import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.util.HtmlUtils;
import za.co.pixelly.fintrack.common.email.EmailSender;
import za.co.pixelly.fintrack.config.email.EmailProperties;

@Service
@RequiredArgsConstructor
public class AccountEmailService {

    private final EmailSender emailSender;
    private final EmailProperties emailProperties;


    public void sendVerificationEmail(
        String recipient,
        String firstName,
        String rawToken
    ) {
        String verificationUrl = emailProperties.frontendBaseUrl() + "/verify-email?token=" + rawToken;

        String safeFirstName = HtmlUtils.htmlEscape(firstName);
        String safeVerificationUrl = HtmlUtils.htmlEscape(verificationUrl);

        String body = """
             <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Verify your Salif email</title>
            </head>

            <body style="
                margin: 0;
                padding: 0;
                background-color: #EFEDE6;
                font-family: Arial, Helvetica, sans-serif;
                color: #101828;
            ">

            <!-- Preheader (hidden) -->
            <div style="display: none; max-height: 0; overflow: hidden; opacity: 0;">
                One click confirms this address and activates your Salif account.
            </div>

            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0"
                   style="background-color: #EFEDE6; padding: 40px 16px;">
                <tr>
                    <td align="center">

                        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0"
                               style="max-width: 560px; background-color: #FAF9F6; border-radius: 4px; overflow: hidden;">

                            <!-- Header -->
                            <tr>
                                <td style="background-color: #101828; padding: 36px 40px 28px;">
                                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                                        <tr>
                                            <td style="
                                                font-family: Arial, Helvetica, sans-serif;
                                                font-size: 21px;
                                                font-weight: 700;
                                                color: #FAF9F6;
                                                letter-spacing: -0.3px;
                                            ">
                                                <img
                                                    src="cid:salif-logo"
                                                    alt="salif"
                                                    width="160"
                                                    style="
                                                        display: block;
                                                        width: 160px;
                                                        max-width: 100%;
                                                        height: auto;
                                                        margin: 0 auto;
                                                        border: 0;
                                                    "
                                                >
                                            </td>
                                        </tr>
                                    </table>
                                </td>
                            </tr>

                            <!-- Content -->
                            <tr>
                                <td style="padding: 40px 40px 8px;">

                                    <h1 style="
                                        margin: 0 0 20px;
                                        font-family: Arial, Helvetica, sans-serif;
                                        font-size: 25px;
                                        font-weight: 700;
                                        letter-spacing: -0.4px;
                                        line-height: 1.3;
                                        color: #101828;
                                    ">
                                        Let's confirm this is you
                                    </h1>

                                    <p style="margin: 0 0 16px; font-size: 15px; line-height: 1.7; color: #101828;">
                                        Hi {{FIRST_NAME}},
                                    </p>

                                    <p style="margin: 0 0 16px; font-size: 15px; line-height: 1.7; color: #5B6472;">
                                        Your Salif account is set up. Before your accounts,
                                        budgets and goals start syncing, we need to confirm this
                                        address belongs to you.
                                    </p>

                                    <p style="margin: 0 0 32px; font-size: 15px; line-height: 1.7; color: #5B6472;">
                                        Verifying takes one click.
                                    </p>

                                    <!-- CTA -->
                                    <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin: 0 0 32px;">
                                        <tr>
                                            <td style="background-color: #1F7A5C; border-radius: 4px;">
                                                <a href="{{VERIFICATION_URL}}" style="
                                                    display: inline-block;
                                                    padding: 13px 30px;
                                                    font-family: Arial, Helvetica, sans-serif;
                                                    font-size: 15px;
                                                    font-weight: 700;
                                                    color: #FAF9F6;
                                                    text-decoration: none;
                                                    border-radius: 4px;
                                                ">
                                                    Verify email address
                                                </a>
                                            </td>
                                        </tr>
                                    </table>

                                    <!-- Ledger stub: link fallback styled as a record, not decoration -->
                                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0"
                                           style="border: 1px dashed #C9C5B8; border-radius: 3px; margin: 0 0 28px;">
                                        <tr>
                                            <td style="padding: 16px 18px;">
                                                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                                                    <tr>
                                                        <td style="font-size: 11px; color: #8A8578; padding-bottom: 6px;">
                                                            Verification link
                                                        </td>
                                                    </tr>
                                                    <tr>
                                                        <td style="
                                                            font-family: 'Courier New', Courier, monospace;
                                                            font-size: 12px;
                                                            line-height: 1.6;
                                                            color: #1F7A5C;
                                                            word-break: break-all;
                                                        ">
                                                            <a href="{{VERIFICATION_URL}}" style="color: #1F7A5C; text-decoration: none;">
                                                                {{VERIFICATION_URL}}
                                                            </a>
                                                        </td>
                                                    </tr>
                                                    <tr>
                                                        <td style="font-size: 11px; color: #8A8578; padding-top: 10px;">
                                                            Single use &middot; expires shortly
                                                        </td>
                                                    </tr>
                                                </table>
                                            </td>
                                        </tr>
                                    </table>

                                    <p style="margin: 0 0 40px; font-size: 13px; line-height: 1.6; color: #8A8578;">
                                        Didn't create a Salif account? You can ignore this
                                        email and nothing will happen.
                                    </p>

                                </td>
                            </tr>

                            <!-- Footer -->
                            <tr>
                                <td style="padding: 0 40px 32px;">
                                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                                        <tr>
                                            <td style="border-top: 1px solid #E4E1D8; padding-top: 20px; font-size: 12px; line-height: 1.7; color: #A6A192;">
                                                Salif &middot; Personal finance, in order.<br>
                                                &copy; 2026 Salif
                                            </td>
                                        </tr>
                                    </table>
                                </td>
                            </tr>

                        </table>

                    </td>
                </tr>
            </table>

            </body>
            </html>
            """
            .replace("{{FIRST_NAME}}", safeFirstName)
            .replace("{{VERIFICATION_URL}}", safeVerificationUrl);

        emailSender.send(
            recipient,
            "Verify your Salif email",
            body
        );
    }


    public void sendPasswordResetEmail(
        String recipient,
        String firstName,
        String rawToken
    ) {
        String resetUrl = emailProperties.frontendBaseUrl() + "/reset-password?token=" + rawToken;
        String safeFirstName = HtmlUtils.htmlEscape(firstName);
        String safeResetUrl = HtmlUtils.htmlEscape(resetUrl);

        String body = """
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Reset your Salif password</title>
            </head>

            <body style="
                margin: 0;
                padding: 0;
                background-color: #EFEDE6;
                font-family: Arial, Helvetica, sans-serif;
                color: #101828;
            ">

            <!-- Preheader (hidden) -->
            <div style="display: none; max-height: 0; overflow: hidden; opacity: 0;">
                A password reset was requested for your Salif account.
            </div>

            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0"
                   style="background-color: #EFEDE6; padding: 40px 16px;">
                <tr>
                    <td align="center">

                        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0"
                               style="max-width: 560px; background-color: #FAF9F6; border-radius: 4px; overflow: hidden;">

                            <!-- Header -->
                            <tr>
                                <td style="background-color: #101828; padding: 36px 40px 28px;">
                                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                                        <tr>
                                            <td style="
                                                font-family: Arial, Helvetica, sans-serif;
                                                font-size: 21px;
                                                font-weight: 700;
                                                color: #FAF9F6;
                                                letter-spacing: -0.3px;
                                            ">
                                                <img
                                                    src="cid:salif-logo"
                                                    alt="salif"
                                                    width="160"
                                                    style="
                                                        display: block;
                                                        width: 160px;
                                                        max-width: 100%;
                                                        height: auto;
                                                        margin: 0 auto;
                                                        border: 0;
                                                    "
                                                >
                                            </td>
                                        </tr>
                                    </table>
                                </td>
                            </tr>

                            <!-- Content -->
                            <tr>
                                <td style="padding: 40px 40px 8px;">

                                    <h1 style="
                                        margin: 0 0 20px;
                                        font-family: Arial, Helvetica, sans-serif;
                                        font-size: 25px;
                                        font-weight: 700;
                                        letter-spacing: -0.4px;
                                        line-height: 1.3;
                                        color: #101828;
                                    ">
                                        Reset your password
                                    </h1>

                                    <p style="margin: 0 0 16px; font-size: 15px; line-height: 1.7; color: #101828;">
                                        Hi {{FIRST_NAME}},
                                    </p>

                                    <p style="margin: 0 0 16px; font-size: 15px; line-height: 1.7; color: #5B6472;">
                                        We received a request to reset the password on your
                                        Salif account. Click below to choose a new one.
                                    </p>

                                    <p style="margin: 0 0 32px; font-size: 15px; line-height: 1.7; color: #5B6472;">
                                        This link works once and expires shortly, so you'll
                                        want to use it soon.
                                    </p>

                                    <!-- CTA -->
                                    <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin: 0 0 32px;">
                                        <tr>
                                            <td style="background-color: #1F7A5C; border-radius: 4px;">
                                                <a href="{{RESET_URL}}" style="
                                                    display: inline-block;
                                                    padding: 13px 30px;
                                                    font-family: Arial, Helvetica, sans-serif;
                                                    font-size: 15px;
                                                    font-weight: 700;
                                                    color: #FAF9F6;
                                                    text-decoration: none;
                                                    border-radius: 4px;
                                                ">
                                                    Reset password
                                                </a>
                                            </td>
                                        </tr>
                                    </table>

                                    <!-- Ledger stub: link fallback styled as a record, not decoration -->
                                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0"
                                           style="border: 1px dashed #C9C5B8; border-radius: 3px; margin: 0 0 28px;">
                                        <tr>
                                            <td style="padding: 16px 18px;">
                                                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                                                    <tr>
                                                        <td style="font-size: 11px; color: #8A8578; padding-bottom: 6px;">
                                                            Reset link
                                                        </td>
                                                    </tr>
                                                    <tr>
                                                        <td style="
                                                            font-family: 'Courier New', Courier, monospace;
                                                            font-size: 12px;
                                                            line-height: 1.6;
                                                            color: #1F7A5C;
                                                            word-break: break-all;
                                                        ">
                                                            <a href="{{RESET_URL}}" style="color: #1F7A5C; text-decoration: none;">
                                                                {{RESET_URL}}
                                                            </a>
                                                        </td>
                                                    </tr>
                                                    <tr>
                                                        <td style="font-size: 11px; color: #8A8578; padding-top: 10px;">
                                                            Single use &middot; expires shortly
                                                        </td>
                                                    </tr>
                                                </table>
                                            </td>
                                        </tr>
                                    </table>

                                    <div style="
                                        padding: 16px 18px;
                                        background-color: #F4F2EC;
                                        border-radius: 3px;
                                        margin: 0 0 40px;
                                    ">
                                        <p style="margin: 0; font-size: 13px; line-height: 1.6; color: #5B6472;">
                                            Didn't request this? Your password hasn't been
                                            changed. You can ignore this email, or
                                            <a href="{{SUPPORT_URL}}" style="color: #1F7A5C; text-decoration: underline;">contact support</a>
                                            if you're concerned about your account.
                                        </p>
                                    </div>

                                </td>
                            </tr>

                            <!-- Footer -->
                            <tr>
                                <td style="padding: 0 40px 32px;">
                                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                                        <tr>
                                            <td style="border-top: 1px solid #E4E1D8; padding-top: 20px; font-size: 12px; line-height: 1.7; color: #A6A192;">
                                                Salif &middot; Personal finance, in order.<br>
                                                &copy; 2026 Salif
                                            </td>
                                        </tr>
                                    </table>
                                </td>
                            </tr>

                        </table>

                    </td>
                </tr>
            </table>

            </body>
            </html>
            """
            .replace("{{FIRST_NAME}}", safeFirstName)
            .replace("{{RESET_URL}}", safeResetUrl);


        emailSender.send(
            recipient,
            "Reset your Salif password",
            body
        );
    }
}
