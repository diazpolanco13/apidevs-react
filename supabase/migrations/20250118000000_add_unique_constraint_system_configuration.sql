-- Agregar restricción única a la columna 'key' en system_configuration
-- Esto permitirá usar upsert correctamente

-- Primero eliminar duplicados si existen
WITH duplicates AS (
  SELECT key, MIN(id) as keep_id
  FROM system_configuration
  GROUP BY key
  HAVING COUNT(*) > 1
)
DELETE FROM system_configuration
WHERE id NOT IN (SELECT keep_id FROM duplicates)
AND key IN (SELECT key FROM duplicates);

-- Agregar restricción única
ALTER TABLE system_configuration 
ADD CONSTRAINT system_configuration_key_unique UNIQUE (key);

-- Agregar índice para mejor rendimiento
CREATE INDEX IF NOT EXISTS idx_system_configuration_key ON system_configuration(key);
CREATE INDEX IF NOT EXISTS idx_system_configuration_category ON system_configuration(category);
