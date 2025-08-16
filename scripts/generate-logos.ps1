# PowerShell script để resize logo không cần ImageMagick hay Sharp
# Sử dụng .NET System.Drawing để resize images

param(
    [string]$InputFile = "public\images\logo.png",
    [string]$OutputDir = "public\images"
)

# Kiểm tra file logo có tồn tại không
if (-not (Test-Path $InputFile)) {
    Write-Host "❌ Không tìm thấy $InputFile" -ForegroundColor Red
    Write-Host "📥 Vui lòng copy logo.png vào thư mục public\images" -ForegroundColor Yellow
    exit 1
}

Write-Host "✅ Tìm thấy logo.png!" -ForegroundColor Green
Write-Host "🎨 Đang tạo các kích thước logo bằng PowerShell..." -ForegroundColor Cyan

# Load .NET assemblies for image processing
Add-Type -AssemblyName System.Drawing

try {
    # Load original image
    $originalImage = [System.Drawing.Image]::FromFile((Resolve-Path $InputFile).Path)
    
    Write-Host "📊 Kích thước gốc: $($originalImage.Width)x$($originalImage.Height)" -ForegroundColor Blue
    
    # Danh sách sizes cần tạo
    $sizes = @(
        @{Width=16; Height=16; Name="logo-16.png"},
        @{Width=32; Height=32; Name="logo-32.png"},
        @{Width=48; Height=48; Name="logo-48.png"},
        @{Width=72; Height=72; Name="logo-72.png"},
        @{Width=96; Height=96; Name="logo-96.png"},
        @{Width=120; Height=120; Name="logo-120.png"},
        @{Width=144; Height=144; Name="logo-144.png"},
        @{Width=152; Height=152; Name="logo-152.png"},
        @{Width=180; Height=180; Name="logo-180.png"},
        @{Width=192; Height=192; Name="logo-192.png"}
    )
    
    foreach ($size in $sizes) {
        $outputPath = Join-Path $OutputDir $size.Name
        
        # Create new bitmap with target size
        $newImage = New-Object System.Drawing.Bitmap($size.Width, $size.Height)
        $graphics = [System.Drawing.Graphics]::FromImage($newImage)
        
        # Set high quality settings
        $graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
        $graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
        $graphics.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
        $graphics.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality
        
        # Draw resized image
        $graphics.DrawImage($originalImage, 0, 0, $size.Width, $size.Height)
        
        # Save as PNG
        $newImage.Save($outputPath, [System.Drawing.Imaging.ImageFormat]::Png)
        
        # Cleanup
        $graphics.Dispose()
        $newImage.Dispose()
        
        Write-Host "✅ Tạo $($size.Name) ($($size.Width)x$($size.Height))" -ForegroundColor Green
    }
    
    # Cleanup original image
    $originalImage.Dispose()
    
    Write-Host "🎉 Hoàn thành! Đã tạo tất cả logo sizes." -ForegroundColor Green
    Write-Host "📁 Files được tạo trong $OutputDir" -ForegroundColor Blue
    
    # List created files
    Get-ChildItem -Path $OutputDir -Filter "logo-*.png" | ForEach-Object {
        Write-Host "   ✓ $($_.Name)" -ForegroundColor White
    }
    
    Write-Host ""
    Write-Host "💡 Lưu ý: Để tạo favicon.ico, sử dụng online tool:" -ForegroundColor Yellow
    Write-Host "   https://convertio.co/png-ico/" -ForegroundColor Cyan
    
} catch {
    Write-Host "❌ Lỗi khi xử lý ảnh: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "💡 Thử các alternatives khác:" -ForegroundColor Yellow
    Write-Host "   1. Online tools: https://favicon.io/favicon-converter/" -ForegroundColor Cyan
    Write-Host "   2. Cài ImageMagick: https://imagemagick.org/script/download.php#windows" -ForegroundColor Cyan
}
