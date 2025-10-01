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

// Función para eliminar usuarios en lotes
async function deleteUsersInBatches(emails: string[], batchSize: number = 100) {
  const totalEmails = emails.length;
  let deletedCount = 0;
  let errorCount = 0;
  const errors: Array<{ email: string; error: string }> = [];

  console.log(`\n🗑️  Iniciando eliminación de ${totalEmails} usuarios con emails inválidos...\n`);

  for (let i = 0; i < totalEmails; i += batchSize) {
    const batch = emails.slice(i, i + batchSize);
    const batchNumber = Math.floor(i / batchSize) + 1;
    const totalBatches = Math.ceil(totalEmails / batchSize);

    console.log(`📦 Procesando lote ${batchNumber}/${totalBatches} (${batch.length} emails)...`);

    try {
      const { data, error } = await supabase
        .from('legacy_users')
        .delete()
        .in('email', batch)
        .select('email');

      if (error) {
        console.error(`❌ Error en lote ${batchNumber}:`, error.message);
        errorCount += batch.length;
        batch.forEach(email => errors.push({ email, error: error.message }));
      } else {
        const deleted = data?.length || 0;
        deletedCount += deleted;
        console.log(`✅ Lote ${batchNumber} completado: ${deleted} usuarios eliminados`);
      }
    } catch (error) {
      console.error(`❌ Error inesperado en lote ${batchNumber}:`, error);
      errorCount += batch.length;
      batch.forEach(email => errors.push({ 
        email, 
        error: error instanceof Error ? error.message : 'Error desconocido' 
      }));
    }

    // Pequeña pausa entre lotes para no saturar la base de datos
    if (i + batchSize < totalEmails) {
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  }

  return { deletedCount, errorCount, errors };
}

async function main() {
  try {
    console.log('🚀 Iniciando limpieza de usuarios legacy con emails problemáticos\n');

    // Definir los archivos CSV a procesar
    const csvFiles = [
      'usuarios simplificados_abuse.csv',
      'usuarios simplificados_catch_all.csv', 
      'usuarios simplificados_donotmail.csv',
      'usuarios simplificados_spamtrap.csv',
      'usuarios simplificados_unknown.csv'
    ];

    const allInvalidUsers: InvalidUser[] = [];
    const fileStats: Record<string, number> = {};

    // Leer todos los archivos CSV
    console.log('📄 Leyendo archivos CSV...\n');
    
    for (const fileName of csvFiles) {
      const csvPath = path.join(process.cwd(), 'app', 'mail', fileName);
      
      if (!fs.existsSync(csvPath)) {
        console.log(`⚠️  No se encontró: ${fileName}`);
        continue;
      }

      const users = parseCSV(csvPath);
      allInvalidUsers.push(...users);
      fileStats[fileName] = users.length;
      
      console.log(`✅ ${fileName}: ${users.length} usuarios`);
    }

    console.log(`\n📊 Total de usuarios a eliminar: ${allInvalidUsers.length}\n`);

    // Mostrar distribución por archivo
    console.log('📈 Distribución por archivo:');
    Object.entries(fileStats).forEach(([file, count]) => {
      console.log(`   ${file}: ${count}`);
    });

    const emails = allInvalidUsers.map(u => u.email);

    console.log('\n📈 Distribución de razones:');
    
    // Agrupar por razón
    const statusCounts: Record<string, number> = {};
    allInvalidUsers.forEach(user => {
      const key = user.zbStatus || user.zbSubStatus || 'unknown';
      statusCounts[key] = (statusCounts[key] || 0) + 1;
    });

    Object.entries(statusCounts)
      .sort((a, b) => b[1] - a[1])
      .forEach(([status, count]) => {
        console.log(`   ${status}: ${count}`);
      });

    // Confirmar antes de proceder
    console.log('\n⚠️  Esta operación eliminará permanentemente estos usuarios de la base de datos.');
    console.log('Presiona Ctrl+C para cancelar o espera 5 segundos para continuar...\n');
    
    await new Promise(resolve => setTimeout(resolve, 5000));

    // Obtener estadísticas antes de eliminar
    const { count: countBefore } = await supabase
      .from('legacy_users')
      .select('*', { count: 'exact', head: true });

    console.log(`\n📊 Usuarios legacy actuales en la base de datos: ${countBefore}\n`);

    // Eliminar usuarios
    const result = await deleteUsersInBatches(emails, 100);

    // Obtener estadísticas después de eliminar
    const { count: countAfter } = await supabase
      .from('legacy_users')
      .select('*', { count: 'exact', head: true });

    // Resumen final
    console.log('\n' + '='.repeat(60));
    console.log('📊 RESUMEN DE ELIMINACIÓN');
    console.log('='.repeat(60));
    console.log(`Usuarios antes:           ${countBefore}`);
    console.log(`Usuarios después:         ${countAfter}`);
    console.log(`Usuarios eliminados:      ${result.deletedCount}`);
    console.log(`Errores:                  ${result.errorCount}`);
    console.log(`Usuarios restantes:       ${(countBefore || 0) - result.deletedCount}`);
    console.log('='.repeat(60));

    if (result.errors.length > 0) {
      console.log('\n⚠️  Errores encontrados:');
      result.errors.slice(0, 10).forEach(({ email, error }) => {
        console.log(`   ${email}: ${error}`);
      });
      if (result.errors.length > 10) {
        console.log(`   ... y ${result.errors.length - 10} errores más`);
      }
    }

    if (result.deletedCount > 0) {
      console.log('\n✅ Limpieza completada exitosamente!');
    } else {
      console.log('\n⚠️  No se eliminaron usuarios. Verifica los errores.');
    }

  } catch (error) {
    console.error('\n❌ Error fatal:', error);
    process.exit(1);
  }
}

main();

