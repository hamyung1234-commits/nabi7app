$env:VERCEL_TOKEN = "7eMKhSOh2b4lB2p3aV7f4g8h9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6a7b8c9d0"
Write-Host "Token set, deploying..."
npx vercel deploy dist/ --yes 2>&1