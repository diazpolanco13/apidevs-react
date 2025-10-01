import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';
import { config } from 'dotenv';

// Cargar variables de entorno
config({ path: path.join(process.cwd(), '.env') });

// Configuración de Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

interface InvalidUser {
  email: string;
  zbStatus: string;
  zbSubStatus: string;
}

// Función para parsear CSV manualmente
function parseCSV(filePath: string): InvalidUser[] {
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n');
  
  // Eliminar la primera línea (header) y la última si está vacía
  const dataLines = lines.slice(1).filter(line => line.trim().length > 0);
  
  const invalidUsers: InvalidUser[] = [];
  
  for (const line of dataLines) {
    try {
      // Parsear CSV teniendo en cuenta comillas - regex más flexible
      const match = line.match(/^"([^"]+)","[^"]*","[^"]*","([^"]*)","([^"]*)"/);
      if (match) {
        const email = match[1];
        const zbStatus = match[2] || '';
        const zbSubStatus = match[3] || '';
        
        // Validar que el email sea válido
        if (email && email.includes('@') && email.length > 5) {
          invalidUsers.push({
            email,
            zbStatus,
            zbSubStatus
          });
        }
      }
    } catch (error) {
      // Silenciosamente ignorar líneas problemáticas
      continue;
    }
  }
  
  return invalidUsers;
}

async function main() {
  try {
    console.log('🔍 Verificando usuarios restantes en listas problemáticas\n');

    const csvFiles = [
      'usuarios simplificados_abuse.csv',
      'usuarios simplificados_catch_all.csv', 
      'usuarios simplificados_donotmail.csv',
      'usuarios simplificados_spamtrap.csv',
      'usuarios simplificados_unknown.csv'
    ];

    for (const fileName of csvFiles) {
      const csvPath = path.join(process.cwd(), 'app', 'mail', fileName);
      
      if (!fs.existsSync(csvPath)) {
        console.log(`⚠️  No se encontró: ${fileName}\n`);
        continue;
      }

      const users = parseCSV(csvPath);
      const emails = users.map(u => u.email);

      console.log(`📄 ${fileName}`);
      console.log(`   Emails en el CSV: ${emails.length}`);

      if (emails.length === 0) {
        console.log(`   ⚠️  No se pudieron parsear emails de este archivo\n`);
        continue;
      }

      // Verificar cuántos de estos emails existen en la base de datos
      const { data, error } = await supabase
        .from('legacy_users')
        .select('email')
        .in('email', emails);

      if (error) {
        console.log(`   ❌ Error al consultar: ${error.message}\n`);
        continue;
      }

      const existingEmails = data?.length || 0;
      console.log(`   Usuarios que aún existen en DB: ${existingEmails}`);
      console.log(`   Ya eliminados o no existían: ${emails.length - existingEmails}\n`);

      if (existingEmails > 0 && existingEmails <= 10) {
        console.log(`   📧 Emails restantes:`);
        data?.forEach(u => console.log(`      ${u.email}`));
        console.log('');
      }
    }

    // Estado actual de la base de datos
    const { count } = await supabase
      .from('legacy_users')
      .select('*', { count: 'exact', head: true });

    console.log('='.repeat(60));
    console.log(`📊 Total de usuarios legacy en la base de datos: ${count}`);
    console.log('='.repeat(60));

  } catch (error) {
    console.error('\n❌ Error:', error);
    process.exit(1);
  }
}

main();

