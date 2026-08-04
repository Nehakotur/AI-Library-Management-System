$response = Invoke-RestMethod -Uri "http://localhost:5000/api/auth/login" -Method POST -ContentType "application/json" -Body '{"email":"neha@test.com","password":"newpass123"}'
$global:token = $response.token
$global:headers = @{ Authorization = "Bearer $token" }
Write-Host "Logged in! Token ready."