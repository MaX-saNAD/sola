import fs from 'node:fs'
// tiny .env loader for local dev (Vercel injects env vars itself)
if (fs.existsSync('.env')) {
  for (const line of fs.readFileSync('.env', 'utf8').split('\n')) {
    const m = line.match(/^\s*([A-Z_]+)\s*=\s*(.*)\s*$/)
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2]
  }
}
const { default: app } = await import('./app.js')
const { usingSupabase } = await import('./store.js')
const port = process.env.PORT || 3001
app.listen(port, () => {
  console.log(`API on http://localhost:${port}`)
  console.log(usingSupabase ? 'Using Supabase' : 'No Supabase env found: using in-memory demo data (resets on restart). Admin password: admin123')
})
