/** `npm run migrate`: aplica as migrations pendentes e mostra o que existe no banco. */
import { initDatabase } from '../src/config/init.js'
import { db } from '../src/config/database.js'

const { applied } = initDatabase()
console.log(applied.length ? `Migrations aplicadas: ${applied.join(', ')}` : 'Banco já está atualizado.')
const all = db.prepare('SELECT name, applied_at FROM schema_migrations ORDER BY name').all()
for (const m of all) console.log(`  ✓ ${m.name}  (${m.applied_at})`)
