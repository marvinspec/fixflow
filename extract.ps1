Add-Type -AssemblyName System.IO.Compression.FileSystem

$docxPath = 'C:\Users\Microsoft\.gemini\antigravity\scratch\sistema-controle-servicos\ajustes.docx'
$tempPath = 'C:\Users\Microsoft\.gemini\antigravity\scratch\sistema-controle-servicos\ajustes_temp.docx'
$outPath = 'C:\Users\Microsoft\.gemini\antigravity\scratch\sistema-controle-servicos\docx_text.txt'

# Copy file to avoid file locking by MS Word
Copy-Item -Path $docxPath -Destination $tempPath -Force

$zip = [System.IO.Compression.ZipFile]::OpenRead($tempPath)
$entry = $zip.Entries | Where-Object { $_.FullName -eq 'word/document.xml' }
$stream = $entry.Open()
$reader = New-Object System.IO.StreamReader($stream, [System.Text.Encoding]::UTF8)
$xml = $reader.ReadToEnd()
$reader.Close()
$stream.Close()
$zip.Dispose()

Remove-Item -Path $tempPath -Force

# Replace XML tags to preserve paragraph text
$text = $xml -replace '</w:p>', "`n`n" -replace '<[^>]+>', ''
# Decode HTML entities if any
$decoded = [System.Net.WebUtility]::HtmlDecode($text)

[System.IO.File]::WriteAllText($outPath, $decoded, [System.Text.Encoding]::UTF8)
Write-Output "EXTRACTED_SUCCESSFULLY"
