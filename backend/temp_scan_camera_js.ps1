$urls = @(
    'https://giaothong.hochiminhcity.gov.vn/public/app.js',
    'https://giaothong.hochiminhcity.gov.vn/public/communication.js',
    'https://giaothong.hochiminhcity.gov.vn/public/controller/MapPanel.js',
    'https://giaothong.hochiminhcity.gov.vn/public/controller/CameraTracking.js',
    'https://giaothong.hochiminhcity.gov.vn/public/controller/FilterPanel.js',
    'https://giaothong.hochiminhcity.gov.vn/public/view/MapPanel.js',
    'https://giaothong.hochiminhcity.gov.vn/public/view/CameraPlayer.js',
    'https://giaothong.hochiminhcity.gov.vn/public/view/CameraTracking.js'
)

$pattern = 'ajaxpro/[^"''\s]+|[A-Za-z0-9_.]+\.ashx|camId|Latitude|Longitude|lat\b|lng\b|geojson|coordinates|DisplayName|VideoUrl'

foreach ($u in $urls) {
    try {
        $c = (Invoke-WebRequest -Uri $u -UseBasicParsing).Content
        Write-Output "===== $u ====="
        [regex]::Matches($c, $pattern, 'IgnoreCase') |
            ForEach-Object { $_.Value } |
            Select-Object -Unique |
            Select-Object -First 120
    }
    catch {
        Write-Output "FAILED: $u"
    }
}
