# Copy favicon và cập nhật manifest
Write-Host "📋 Sao chép favicon.ico từ logo-32.png..." -ForegroundColor Cyan

# Tạo favicon.ico từ logo-32.png bằng .NET
Add-Type -AssemblyName System.Drawing

try {
    $logo32Path = "public\images\logo-32.png"
    $faviconPath = "public\favicon.ico"
    
    if (Test-Path $logo32Path) {
        # Load logo-32.png
        $image = [System.Drawing.Image]::FromFile((Resolve-Path $logo32Path).Path)
        
        # Save as ICO format
        $image.Save($faviconPath, [System.Drawing.Imaging.ImageFormat]::Icon)
        $image.Dispose()
        
        Write-Host "✅ Tạo favicon.ico thành công!" -ForegroundColor Green
    } else {
        # Fallback: copy logo-32.png as favicon.ico
        Copy-Item $logo32Path $faviconPath
        Write-Host "⚠️  Copy logo-32.png làm favicon.ico" -ForegroundColor Yellow
    }
    
    # Hiển thị kết quả
    if (Test-Path $faviconPath) {
        $faviconSize = (Get-Item $faviconPath).Length
        Write-Host "✅ favicon.ico: $faviconSize bytes" -ForegroundColor Green
    }
    
} catch {
    Write-Host "❌ Lỗi: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "💡 Sử dụng online tool: https://convertio.co/png-ico/" -ForegroundColor Yellow
}
