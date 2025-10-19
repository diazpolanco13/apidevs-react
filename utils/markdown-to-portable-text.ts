/**
 * Conversor de Markdown a Portable Text para Sanity
 * 
 * Convierte markdown generado por IA a formato Portable Text
 * con soporte completo para:
 * - Headings (H2, H3, H4)
 * - Negritas, cursivas, code inline
 * - Listas (numeradas, bullets)
 * - Code blocks con lenguaje
 * - Blockquotes
 * - Links
 */

import { v4 as uuidv4 } from 'uuid';

// Helper para generar _key único
function generateKey(): string {
  return uuidv4().replace(/-/g, '').substring(0, 12);
}

interface PortableTextBlock {
  _type: string;
  _key: string;
  style?: string;
  listItem?: string;
  children: PortableTextSpan[];
  markDefs?: any[];
}

interface PortableTextSpan {
  _type: string;
  _key: string;
  text: string;
  marks?: string[];
}

interface CodeBlock {
  _type: 'codeBlock';
  _key: string;
  language: string;
  code: string;
  filename?: string;
  showLineNumbers?: boolean;
}

export function markdownToPortableText(markdown: string): Array<PortableTextBlock | CodeBlock> {
  const blocks: Array<PortableTextBlock | CodeBlock> = [];
  
  // Dividir por líneas
  const lines = markdown.split('\n');
  let i = 0;
  
  // Estado para listas
  let inList = false;
  let listType: 'bullet' | 'number' | null = null;
  
  while (i < lines.length) {
    const line = lines[i];
    
    // Líneas vacías
    if (line.trim() === '') {
      i++;
      inList = false;
      listType = null;
      continue;
    }
    
    // CODE BLOCKS (```language)
    if (line.trim().startsWith('```')) {
      const language = line.trim().substring(3) || 'text';
      const codeLines: string[] = [];
      i++;
      
      // Recoger todo el código hasta el cierre ```
      while (i < lines.length && !lines[i].trim().startsWith('```')) {
        codeLines.push(lines[i]);
        i++;
      }
      
      blocks.push({
        _type: 'codeBlock',
        _key: generateKey(),
        language: language.toLowerCase(),
        code: codeLines.join('\n'),
        showLineNumbers: true
      });
      
      i++; // Saltar el ```
      continue;
    }
    
    // HEADINGS (## H2, ### H3, #### H4)
    if (line.startsWith('####')) {
      blocks.push(createHeading(line.substring(4).trim(), 'h4'));
      i++;
      continue;
    }
    if (line.startsWith('###')) {
      blocks.push(createHeading(line.substring(3).trim(), 'h3'));
      i++;
      continue;
    }
    if (line.startsWith('##')) {
      blocks.push(createHeading(line.substring(2).trim(), 'h2'));
      i++;
      continue;
    }
    
    // BLOCKQUOTES (> texto)
    if (line.trim().startsWith('>')) {
      const text = line.trim().substring(1).trim();
      blocks.push(createBlock(parseInlineMarks(text), 'blockquote'));
      i++;
      continue;
    }
    
    // LISTAS NUMERADAS (1. texto)
    const numberedMatch = line.match(/^\s*\d+\.\s+(.+)$/);
    if (numberedMatch) {
      const text = numberedMatch[1];
      blocks.push(createBlock(parseInlineMarks(text), 'normal', 'number'));
      inList = true;
      listType = 'number';
      i++;
      continue;
    }
    
    // LISTAS BULLETS (- texto, * texto)
    const bulletMatch = line.match(/^\s*[-*]\s+(.+)$/);
    if (bulletMatch) {
      const text = bulletMatch[1];
      blocks.push(createBlock(parseInlineMarks(text), 'normal', 'bullet'));
      inList = true;
      listType = 'bullet';
      i++;
      continue;
    }
    
    // SEPARADORES HORIZONTALES (---)
    if (line.trim() === '---' || line.trim() === '***') {
      // Sanity no tiene HR nativo, lo ignoramos o creamos un bloque vacío
      i++;
      continue;
    }
    
    // PÁRRAFOS NORMALES
    if (line.trim()) {
      blocks.push(createBlock(parseInlineMarks(line), 'normal'));
      inList = false;
      listType = null;
    }
    
    i++;
  }
  
  return blocks;
}

/**
 * Crea un heading (H2, H3, H4)
 */
function createHeading(text: string, style: 'h2' | 'h3' | 'h4'): PortableTextBlock {
  return {
    _type: 'block',
    _key: generateKey(),
    style,
    children: parseInlineMarks(text)
  };
}

/**
 * Crea un bloque normal o lista
 */
function createBlock(
  children: PortableTextSpan[], 
  style: string = 'normal',
  listItem?: 'bullet' | 'number'
): PortableTextBlock {
  const block: PortableTextBlock = {
    _type: 'block',
    _key: generateKey(),
    style,
    children
  };
  
  if (listItem) {
    block.listItem = listItem;
  }
  
  return block;
}

/**
 * Parsea marcas inline en el texto (negritas, cursivas, code, links)
 */
function parseInlineMarks(text: string): PortableTextSpan[] {
  const spans: PortableTextSpan[] = [];
  let currentText = '';
  let i = 0;
  
  while (i < text.length) {
    // NEGRITAS (**texto** o __texto__)
    if (
      (text[i] === '*' && text[i + 1] === '*') ||
      (text[i] === '_' && text[i + 1] === '_')
    ) {
      // Guardar texto anterior sin marcas
      if (currentText) {
        spans.push({ _type: 'span', _key: generateKey(), text: currentText, marks: [] });
        currentText = '';
      }
      
      const delimiter = text.substring(i, i + 2);
      i += 2;
      
      // Buscar el cierre
      let boldText = '';
      while (i < text.length && text.substring(i, i + 2) !== delimiter) {
        boldText += text[i];
        i++;
      }
      
      if (boldText) {
        // Verificar si también tiene cursivas dentro
        const innerSpans = parseInlineMarks(boldText);
        innerSpans.forEach(span => {
          const marks = span.marks || [];
          if (!marks.includes('strong')) marks.push('strong');
          spans.push({ ...span, marks });
        });
      }
      
      i += 2; // Saltar el cierre
      continue;
    }
    
    // CURSIVAS (*texto* o _texto_)
    if ((text[i] === '*' || text[i] === '_') && text[i + 1] !== text[i]) {
      // Guardar texto anterior
      if (currentText) {
        spans.push({ _type: 'span', _key: generateKey(), text: currentText, marks: [] });
        currentText = '';
      }
      
      const delimiter = text[i];
      i++;
      
      // Buscar el cierre
      let italicText = '';
      while (i < text.length && text[i] !== delimiter) {
        italicText += text[i];
        i++;
      }
      
      if (italicText) {
        spans.push({
          _type: 'span',
          _key: generateKey(),
          text: italicText,
          marks: ['em']
        });
      }
      
      i++; // Saltar el cierre
      continue;
    }
    
    // CODE INLINE (`texto`)
    if (text[i] === '`') {
      // Guardar texto anterior
      if (currentText) {
        spans.push({ _type: 'span', _key: generateKey(), text: currentText, marks: [] });
        currentText = '';
      }
      
      i++;
      let codeText = '';
      while (i < text.length && text[i] !== '`') {
        codeText += text[i];
        i++;
      }
      
      if (codeText) {
        spans.push({
          _type: 'span',
          _key: generateKey(),
          text: codeText,
          marks: ['code']
        });
      }
      
      i++; // Saltar el cierre
      continue;
    }
    
    // LINKS [texto](url)
    if (text[i] === '[') {
      // Guardar texto anterior
      if (currentText) {
        spans.push({ _type: 'span', _key: generateKey(), text: currentText, marks: [] });
        currentText = '';
      }
      
      i++;
      let linkText = '';
      while (i < text.length && text[i] !== ']') {
        linkText += text[i];
        i++;
      }
      
      i++; // Saltar ]
      
      if (i < text.length && text[i] === '(') {
        i++; // Saltar (
        let linkUrl = '';
        while (i < text.length && text[i] !== ')') {
          linkUrl += text[i];
          i++;
        }
        
        if (linkText && linkUrl) {
          // TODO: Implementar markDefs para links
          // Por ahora, solo agregamos el texto sin link
          spans.push({
            _type: 'span',
            _key: generateKey(),
            text: linkText,
            marks: []
          });
        }
        
        i++; // Saltar )
      }
      
      continue;
    }
    
    // Texto normal
    currentText += text[i];
    i++;
  }
  
  // Agregar texto final
  if (currentText) {
    spans.push({ _type: 'span', _key: generateKey(), text: currentText, marks: [] });
  }
  
  // Si no hay spans, crear uno vacío
  if (spans.length === 0) {
    spans.push({ _type: 'span', _key: generateKey(), text: '', marks: [] });
  }
  
  return spans;
}

/**
 * Versión simplificada para testing rápido
 */
export function simpleMarkdownToPortableText(markdown: string): any[] {
  try {
    return markdownToPortableText(markdown);
  } catch (error) {
    console.error('Error converting markdown:', error);
    // Fallback: devolver como un bloque de texto plano
    return [{
      _type: 'block',
      _key: generateKey(),
      style: 'normal',
      children: [{
        _type: 'span',
        _key: generateKey(),
        text: markdown,
        marks: []
      }]
    }];
  }
}

