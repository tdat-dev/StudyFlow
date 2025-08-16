# PowerShell script để clean logo và remove background/borders
param(
    [string]$InputFile = "public\images\logo.png",
    [string]$OutputFile = "public\images\logo-clean.png"
)

Write-Host "🧹 Cleaning logo - removing backgrounds and borders..." -ForegroundColor Cyan

Add-Type -AssemblyName System.Drawing

try {
    # Load original image
    $originalImage = [System.Drawing.Image]::FromFile((Resolve-Path $InputFile).Path)
    
    Write-Host "📊 Original: $($originalImage.Width)x$($originalImage.Height)" -ForegroundColor Blue
    
    # Create new bitmap with transparent background
    $cleanImage = New-Object System.Drawing.Bitmap($originalImage.Width, $originalImage.Height, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
    $graphics = [System.Drawing.Graphics]::FromImage($cleanImage)
    
    # Set high quality settings
    $graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
    $graphics.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
    $graphics.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality
    
    # Clear background (transparent)
    $graphics.Clear([System.Drawing.Color]::Transparent)
    
    # Draw original image
    $graphics.DrawImage($originalImage, 0, 0, $originalImage.Width, $originalImage.Height)
    
    # Save as PNG with transparency
    $cleanImage.Save($OutputFile, [System.Drawing.Imaging.ImageFormat]::Png)
    
    # Cleanup
    $graphics.Dispose()
    $cleanImage.Dispose()
    $originalImage.Dispose()
    
    Write-Host "✅ Clean logo saved: $OutputFile" -ForegroundColor Green
    
    # Check file sizes
    $originalSize = (Get-Item $InputFile).Length
    $cleanSize = (Get-Item $OutputFile).Length
    
    Write-Host "📊 Original size: $originalSize bytes" -ForegroundColor Blue
    Write-Host "📊 Clean size: $cleanSize bytes" -ForegroundColor Blue
    
    if ($cleanSize -lt $originalSize) {
        Write-Host "✅ File size reduced!" -ForegroundColor Green
    }
    
    Write-Host ""
    Write-Host "💡 Nếu logo vẫn có viền:" -ForegroundColor Yellow
    Write-Host "   1. Kiểm tra logo gốc có background white/borders không" -ForegroundColor Cyan
    Write-Host "   2. Use logo-clean.png thay vì logo.png" -ForegroundColor Cyan
    Write-Host "   3. Hoặc edit logo trong Photoshop/GIMP để remove background" -ForegroundColor Cyan
    
} catch {
    Write-Host "❌ Error: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "💡 Original logo có thể đã clean rồi" -ForegroundColor Yellow
}
