<?php
require_once __DIR__ . '/PHPMailer/PHPMailer.php';
require_once __DIR__ . '/PHPMailer/SMTP.php';
require_once __DIR__ . '/PHPMailer/Exception.php';

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\SMTP;

require_once __DIR__ . '/../config/email.php';

class EmailHelper {
    private $primaryDriver;
    private $fallbackDriver;
    private $allowFallback;

    public function __construct() {
        $this->primaryDriver = defined('SMTP_DRIVER') ? strtolower(SMTP_DRIVER) : 'smtp';
        $this->fallbackDriver = defined('SMTP_FALLBACK_DRIVER') ? strtolower(SMTP_FALLBACK_DRIVER) : 'mail';
        $this->allowFallback = defined('SMTP_ALLOW_FALLBACK') ? (bool)SMTP_ALLOW_FALLBACK : true;
    }

    private function createMailer($driver = null) {
        $driver = $driver ? strtolower($driver) : $this->primaryDriver;
        $this->assertOperationalConfig($driver);
        $mailer = new PHPMailer(true);

        $mailer->CharSet = EMAIL_CHARSET;
        $mailer->Encoding = EMAIL_ENCODING;
        $mailer->setFrom(SMTP_FROM_EMAIL, SMTP_FROM_NAME);

        switch ($driver) {
            case 'sendmail':
                $mailer->isSendmail();
                break;
            case 'mail':
                $mailer->isMail();
                break;
            default:
                $mailer->isSMTP();
                $mailer->Host = SMTP_HOST;
                $mailer->SMTPAuth = true;
                $mailer->Username = SMTP_USERNAME;
                $mailer->Password = SMTP_PASSWORD;
                $mailer->Port = SMTP_PORT;

                $encryption = defined('SMTP_ENCRYPTION') ? strtolower(SMTP_ENCRYPTION) : 'tls';
                if ($encryption === 'ssl') {
                    $mailer->SMTPSecure = PHPMailer::ENCRYPTION_SMTPS;
                } elseif ($encryption === 'none' || $encryption === 'false') {
                    $mailer->SMTPSecure = false;
                } else {
                    $mailer->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
                }

                $mailer->SMTPOptions = [
                    'ssl' => [
                        'verify_peer' => false,
                        'verify_peer_name' => false,
                        'allow_self_signed' => true,
                    ],
                ];

                $mailer->SMTPDebug = defined('SMTP_DEBUG_LEVEL') ? (int)SMTP_DEBUG_LEVEL : 0;
                $mailer->Debugoutput = 'error_log';
                break;
        }

        return $mailer;
    }

    private function resolveTtlMinutes($constantName, $default = 15) {
        if (defined($constantName)) {
            $value = (int)constant($constantName);
            if ($value > 0) {
                return $value;
            }
        }

        return $default;
    }

    private function sendMessage($email, $subject, $htmlBody, $textBody) {
        $drivers = [$this->primaryDriver];
        if ($this->allowFallback && $this->primaryDriver !== $this->fallbackDriver) {
            $drivers[] = $this->fallbackDriver;
        }

        $lastException = null;

        foreach ($drivers as $driver) {
            try {
                $mailer = $this->createMailer($driver);
                $mailer->clearAddresses();
                $mailer->addAddress($email);
                $mailer->Subject = $subject;
                $mailer->isHTML(true);
                $mailer->Body = $htmlBody;
                $mailer->AltBody = $textBody;
                $mailer->send();

                if ($driver !== $this->primaryDriver) {
                    error_log("Email transport fallback succeeded using '{$driver}' driver for {$email}.");
                }

                return [
                    'success' => true,
                    'transport' => $driver,
                ];
            } catch (\Throwable $e) {
                $lastException = $e;
                error_log("Email sending via '{$driver}' driver failed: " . $e->getMessage());
            }
        }

        throw $lastException ?: new \RuntimeException('Unable to deliver email using any configured transport.');
    }

    public function sendPasswordResetCode($email, $username, $resetCode, $expiryTime) {
        $htmlBody = $this->getPasswordResetHTML($username, $resetCode, $expiryTime);
        $textBody = $this->getPasswordResetText($username, $resetCode, $expiryTime);
        try {
            return $this->sendMessage($email, 'Password Reset Code - KolekTrash System', $htmlBody, $textBody);
        } catch (\Throwable $e) {
            throw new \RuntimeException('Failed to send email: ' . $e->getMessage(), 0, $e);
        }
    }

    public function sendSignupVerificationCode($email, $name, $verificationCode, $expiryTime) {
        $htmlBody = $this->getSignupVerificationHTML($name, $verificationCode, $expiryTime);
        $textBody = $this->getSignupVerificationText($name, $verificationCode, $expiryTime);
        try {
            return $this->sendMessage($email, 'Verify Your KolekTrash Email Address', $htmlBody, $textBody);
        } catch (\Throwable $e) {
            throw new \RuntimeException('Failed to send email: ' . $e->getMessage(), 0, $e);
        }
    }
    
    private function getPasswordResetHTML($username, $resetCode, $expiryTime) {
        $ttlMinutes = $this->resolveTtlMinutes('RESET_CODE_TTL_MINUTES');
        $ttlLabel = $ttlMinutes === 1 ? 'minute' : 'minutes';
        return <<<HTML
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset='UTF-8'>
            <meta name='viewport' content='width=device-width, initial-scale=1.0'>
            <title>Password Reset Code</title>
            <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background: #10B981; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
                .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
                .code-box { background: #333; color: white; padding: 20px; text-align: center; font-size: 24px; font-weight: bold; letter-spacing: 5px; border-radius: 8px; margin: 20px 0; }
                .warning { background: #FEF3C7; border: 1px solid #F59E0B; padding: 15px; border-radius: 8px; margin: 20px 0; }
                .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
            </style>
        </head>
        <body>
            <div class='container'>
                <div class='header'>
                    <h1>🔐 Password Reset Request</h1>
                </div>
                <div class='content'>
                    <p>Hello <strong>{$username}</strong>,</p>
                    
                    <p>We received a request to reset your password for your KolekTrash System account.</p>
                    
                    <p>Your password reset code is:</p>
                    
                    <div class='code-box'>
                        {$resetCode}
                    </div>
                    
                    <div class='warning'>
                        <strong>⚠️ Important:</strong>
                        <ul>
                            <li>This code will expire in {$ttlMinutes} {$ttlLabel}</li>
                            <li>If you didn't request this, please ignore this email</li>
                            <li>Never share this code with anyone</li>
                        </ul>
                    </div>
                    
                    <p><strong>Expires at:</strong> {$expiryTime}</p>
                    
                    <p>Enter this code in the password reset form to continue with your password reset.</p>
                    
                    <p>If you have any questions, please contact our support team.</p>
                    
                    <p>Best regards,<br>
                    <strong>KolekTrash System Team</strong></p>
                </div>
                <div class='footer'>
                    <p>This is an automated message. Please do not reply to this email.</p>
                </div>
            </div>
        </body>
        </html>
        HTML;
    }
    
    private function getPasswordResetText($username, $resetCode, $expiryTime) {
        $ttlMinutes = $this->resolveTtlMinutes('RESET_CODE_TTL_MINUTES');
        $ttlLabel = $ttlMinutes === 1 ? 'minute' : 'minutes';

        return <<<TEXT
Password Reset Request - KolekTrash System

Hello {$username},

We received a request to reset your password for your KolekTrash System account.

Your password reset code is: {$resetCode}

IMPORTANT:
- This code will expire in {$ttlMinutes} {$ttlLabel}
- If you didn't request this, please ignore this email
- Never share this code with anyone

Expires at: {$expiryTime}

Enter this code in the password reset form to continue with your password reset.

If you have any questions, please contact our support team.

Best regards,
KolekTrash System Team

This is an automated message. Please do not reply to this email.
TEXT;
    }

    private function getSignupVerificationHTML($name, $verificationCode, $expiryTime) {
        $displayName = $name ?: 'there';
        $ttlMinutes = $this->resolveTtlMinutes('SIGNUP_CODE_TTL_MINUTES');
        $ttlLabel = $ttlMinutes === 1 ? 'minute' : 'minutes';

        return <<<HTML
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset='UTF-8'>
            <meta name='viewport' content='width=device-width, initial-scale=1.0'>
            <title>Email Verification Code</title>
            <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background: #059669; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
                .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
                .code-box { background: #111827; color: white; padding: 20px; text-align: center; font-size: 26px; font-weight: bold; letter-spacing: 6px; border-radius: 8px; margin: 20px 0; }
                .info { background: #ECFDF5; border: 1px solid #10B981; padding: 15px; border-radius: 8px; margin: 20px 0; }
                .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
            </style>
        </head>
        <body>
            <div class='container'>
                <div class='header'>
                    <h1>Verify Your Email</h1>
                </div>
                <div class='content'>
                    <p>Hello <strong>{$displayName}</strong>,</p>
                    <p>Welcome to the KolekTrash community! To complete your registration, please enter the verification code below in the signup portal.</p>
                    <div class='code-box'>
                        {$verificationCode}
                    </div>
                    <div class='info'>
                        <strong>Important:</strong>
                        <ul>
                            <li>This code will expire in {$ttlMinutes} {$ttlLabel}.</li>
                            <li>If you didn't create an account, please ignore this email.</li>
                            <li>Never share this code with anyone.</li>
                        </ul>
                    </div>
                    <p><strong>Expires at:</strong> {$expiryTime}</p>
                    <p>Once verified, you'll be able to access resident services and track waste collection schedules.</p>
                    <p>Need help? Feel free to reply to this email or contact support.</p>
                    <p>Best regards,<br>
                    <strong>The KolekTrash Team</strong></p>
                </div>
                <div class='footer'>
                    <p>This is an automated message. Please do not reply to this email.</p>
                </div>
            </div>
        </body>
        </html>
HTML;
    }

    private function getSignupVerificationText($name, $verificationCode, $expiryTime) {
        $displayName = $name ?: 'there';
        $ttlMinutes = $this->resolveTtlMinutes('SIGNUP_CODE_TTL_MINUTES');
        $ttlLabel = $ttlMinutes === 1 ? 'minute' : 'minutes';

        return <<<TEXT
Email Verification - KolekTrash System

Hello {$displayName},

Welcome to the KolekTrash community! To complete your registration, please enter this verification code in the signup portal:

Verification Code: {$verificationCode}

IMPORTANT:
- This code will expire in {$ttlMinutes} {$ttlLabel}.
- If you didn't create an account, please ignore this email.
- Never share this code with anyone.

Expires at: {$expiryTime}

Once verified, you'll be able to access our resident services and waste collection updates.

If you need help, please contact our support team.

Best regards,
The KolekTrash Team

This is an automated message. Please do not reply to this email.
TEXT;
    }

    private function assertOperationalConfig($driver) {
        if ($driver !== 'smtp') {
            return;
        }

        $username = SMTP_USERNAME ?? '';
        $password = SMTP_PASSWORD ?? '';
        $fromEmail = SMTP_FROM_EMAIL ?? '';

        $placeholderUser = stripos($username, 'YOUR-GMAIL-ADDRESS@') === 0;
        $placeholderPassword = stripos($password, 'YOUR-16-CHARACTER-APP-PASSWORD') === 0;

        if ($placeholderUser || empty($username)) {
            throw new \RuntimeException('SMTP_USERNAME is missing or still using the placeholder value. Update the .env file with your actual email account.');
        }

        if ($placeholderPassword || empty($password)) {
            throw new \RuntimeException('SMTP_PASSWORD is missing or still using the placeholder value. Generate an app password for your mail provider and place it in the .env file.');
        }

        if (!filter_var($fromEmail, FILTER_VALIDATE_EMAIL)) {
            throw new \RuntimeException('SMTP_FROM_EMAIL is not a valid email address. Verify the .env configuration.');
        }
    }
}
?>
