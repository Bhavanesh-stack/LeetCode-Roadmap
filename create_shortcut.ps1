$ws = New-Object -ComObject WScript.Shell
$desktopPath = [Environment]::GetFolderPath('Desktop')
$shortcutPath = Join-Path $desktopPath 'LeetCode Roadmap.lnk'
$sc = $ws.CreateShortcut($shortcutPath)
$sc.TargetPath = 'C:\Users\bhava\OneDrive\Desktop\roadmap\backend\dist\LeetCodeRoadmap.exe'
$sc.WorkingDirectory = 'C:\Users\bhava\OneDrive\Desktop\roadmap'
$sc.Description = 'LeetCode Visual Roadmap'
$sc.Save()
Write-Host "Desktop shortcut created at $shortcutPath"
