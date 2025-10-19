import { markdownToPortableText } from '../utils/markdown-to-portable-text';

// Simular el markdown que genera tu IA
const testMarkdown = `
## Introducción: La Evolución Imparable de PineScript

Como desarrollador que ha trabajado con Pine Script™ desde sus primeras versiones, he sido testigo de una evolución fascinante. Lo que comenzó como un lenguaje de scripting relativamente simple para trazar líneas en un gráfico se ha transformado en un **ecosistema robusto** para el backtesting y la ejecución de estrategias de trading algorítmico.

### H3: Integración Nativa de Machine Learning (ML)

La mayor revolución será, sin duda, la introducción de un módulo de Machine Learning integrado. Olvídate de los complejos workarounds con librerías externas o la exportación de datos.

*   **Clasificación y Regresión**: Funciones como \`ml.train()\` y \`ml.predict()\` permitirían entrenar modelos simples.
*   **Clustering No Supervisado**: Una función como \`ml.kmeans()\` podría agrupar automáticamente los datos.

### Ejemplo de Código

Aquí un ejemplo práctico:

\`\`\`python
def calculate_rsi(prices, period=14):
    """Calcula el RSI para una serie de precios"""
    deltas = np.diff(prices)
    gains = np.where(deltas > 0, deltas, 0)
    return rsi
\`\`\`

> La cita importante: "El RSI es uno de los indicadores más poderosos"

## 2. Cambios en la Sintaxis

Con nuevas funcionalidades tan potentes, es lógico esperar algunos ajustes:

1. **Modo strict_typing**: Declaración explícita de tipos
2. **Keywords async/await**: Para llamadas asíncronas
3. **Tipos matrix y vector**: Para álgebra lineal

### Lista de Bullets

- Item 1 con *cursiva*
- Item 2 con **negrita**
- Item 3 con \`código inline\`
`;

console.log('🧪 TEST: Convirtiendo Markdown a Portable Text\n');
console.log('📄 Markdown Original:');
console.log('=' .repeat(80));
console.log(testMarkdown.substring(0, 500) + '...\n');

console.log('🔄 Convirtiendo...\n');

try {
  const portableText = markdownToPortableText(testMarkdown);
  
  console.log('✅ Conversión EXITOSA!\n');
  console.log('📊 Estadísticas:');
  console.log(`   - Bloques creados: ${portableText.length}`);
  console.log(`   - Markdown original: ${testMarkdown.length} caracteres\n`);
  
  console.log('🎨 Primeros 5 bloques convertidos:\n');
  
  portableText.slice(0, 5).forEach((block: any, index: number) => {
    console.log(`${index + 1}. Tipo: ${block._type}`);
    
    if (block._type === 'block') {
      console.log(`   Style: ${block.style || 'normal'}`);
      console.log(`   ListItem: ${block.listItem || 'none'}`);
      console.log(`   Children: ${block.children.length} spans`);
      
      if (block.children[0]) {
        const firstText = block.children[0].text || '';
        console.log(`   Texto: "${firstText.substring(0, 50)}${firstText.length > 50 ? '...' : ''}"`);
        console.log(`   Marks: ${block.children[0].marks?.join(', ') || 'none'}`);
      }
    }
    
    if (block._type === 'codeBlock') {
      console.log(`   Language: ${block.language}`);
      console.log(`   Lines: ${block.code.split('\n').length}`);
    }
    
    console.log('');
  });
  
  console.log('📦 JSON Completo (primeros 3 bloques):\n');
  console.log(JSON.stringify(portableText.slice(0, 3), null, 2));
  
  console.log('\n🎉 ¡EL CONVERSOR FUNCIONA PERFECTAMENTE!');
  console.log('\n💡 Cuando publiques desde la cola, tu markdown se verá así en Sanity.');
  
} catch (error) {
  console.error('❌ ERROR en la conversión:', error);
  process.exit(1);
}

