$apiDir = "C:\xampp\htdocs\kolektrash\backend\api"

Get-ChildItem -Path $apiDir -Filter *.php -File -Recurse | ForEach-Object {
  $path = $_.FullName
  $content = Get-Content -Raw -LiteralPath $path

  if ($content -match "_bootstrap\.php") {
    return
  }

  if ($content -match "^\s*<\?php") {
    $new = [regex]::Replace($content, "^\s*<\?php", "<?php`r`nrequire_once __DIR__ . '/_bootstrap.php';")
  } else {
    $new = "require_once __DIR__ . '/_bootstrap.php';`r`n" + $content
  }

  Set-Content -LiteralPath $path -Value $new -NoNewline
}



