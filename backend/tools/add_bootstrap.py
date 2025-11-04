from pathlib import Path

PUBLIC_FILES = {
    'login.php',
    'login_new.php',
    'register_resident.php',
    'signup_verification.php',
    'check_email.php',
    'check_user.php',
    'forgot_password.php',
    'check_reference_data.php',
}

BASE_DIR = Path(__file__).resolve().parent.parent / 'api'

for path in BASE_DIR.glob('*.php'):
    if path.name == '_bootstrap.php' or path.name in PUBLIC_FILES:
        continue
    text = path.read_text(encoding='utf-8')
    if "_bootstrap.php" in text:
        continue
    if text.startswith('<?php\n'):
        new_text = text.replace('<?php\n', "<?php\nrequire_once __DIR__ . '/_bootstrap.php';\n", 1)
    elif text.startswith('<?php\r\n'):
        new_text = text.replace('<?php\r\n', "<?php\r\nrequire_once __DIR__ . '/_bootstrap.php';\r\n", 1)
    elif text.startswith('<?php'):
        new_text = text.replace('<?php', "<?php\nrequire_once __DIR__ . '/_bootstrap.php';\n", 1)
    else:
        continue
    path.write_text(new_text, encoding='utf-8')
