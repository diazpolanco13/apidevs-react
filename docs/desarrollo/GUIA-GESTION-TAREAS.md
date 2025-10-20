# 📋 Guía de Gestión de Tareas - APIDevs

**Sistema recomendado**: GitHub Projects + Markdown Docs  
**Última actualización**: 20 de Octubre de 2025

---

## 🎯 **SISTEMA ELEGIDO: GitHub Projects**

### **¿Por qué GitHub Projects?**

✅ **100% GRATIS** - Ya lo tienes con GitHub  
✅ **Integración nativa** - Con repos, PRs, issues, commits  
✅ **Sin setup** - No necesitas otra cuenta  
✅ **Markdown docs** - Versionados en el repo  
✅ **Automation** - GitHub Actions  

---

## 🚀 **SETUP INICIAL (15 minutos)**

### **Paso 1: Crear GitHub Project**

1. Ve a tu repo: `github.com/tuuser/apidevs-react`
2. Tab "Projects" → "New project"
3. Template: **"Feature"** o **"Board"**
4. Nombre: `APIDevs Development Roadmap`

### **Paso 2: Configurar Views**

**View 1: Board (Kanban)**
```
┌──────────┬──────────┬──────────┬──────────┐
│ 🆕 Backlog│ 🚧 Doing │ 👀 Review│ ✅ Done  │
├──────────┼──────────┼──────────┼──────────┤
│ Issue #1 │ Issue #5 │ Issue #9 │ Issue #12│
│ Issue #2 │ Issue #6 │          │ Issue #13│
│ Issue #3 │          │          │          │
└──────────┴──────────┴──────────┴──────────┘
```

**View 2: Table**
- Columns: Title, Priority, Area, Assignee, Status, Estimate
- Sort by: Priority (Critical → Low)
- Group by: Area

**View 3: Roadmap**
- Timeline view
- Group by: Milestone
- Filtros: Q4 2025, Q1 2026

---

## 🏷️ **SISTEMA DE LABELS**

### **Copiar/pegar en GitHub Settings → Labels**

```bash
# PRIORIDADES
🔴 priority:critical    #d73a4a
🟠 priority:high        #ff6b35
🟡 priority:medium      #fbca04
🟢 priority:low         #0e8a16

# ÁREAS
🤖 area:ia-asistente    #8b5cf6
✍️ area:content-creator #06b6d4
📊 area:admin-panel     #8b5cf6
🎨 area:frontend        #3b82f6
⚙️ area:backend         #10b981
📚 area:docs            #6b7280

# ESTADO
🚧 status:in-progress   #1d76db
⏸️ status:blocked       #d73a4a
✅ status:done          #0e8a16
❌ status:wont-do       #6b7280

# TIPO
🐛 type:bug             #d73a4a
✨ type:feature         #a371f7
🔧 type:improvement     #0075ca
📝 type:docs            #0075ca
🧪 type:testing         #fbca04

# ESFUERZO
⏱️ effort:small         #cfd3d7  # < 2h
⏱️ effort:medium        #cfd3d7  # 2-6h
⏱️ effort:large         #cfd3d7  # > 6h
```

---

## 📝 **CREAR ISSUES**

### **Opción A: Usar el script automático**

```bash
# 1. Dar permisos de ejecución
chmod +x scripts/create-github-issues.sh

# 2. Instalar GitHub CLI (si no lo tienes)
sudo apt install gh

# 3. Autenticarte
gh auth login

# 4. Ejecutar script
./scripts/create-github-issues.sh
```

Este script crea automáticamente todos los issues prioritarios basados en el análisis.

---

### **Opción B: Crear manualmente**

**Template de Issue**:

```markdown
## 🎯 Descripción
[Descripción breve de la feature/fix]

## 💡 Objetivo
[Por qué es necesario]

## ✅ Tareas
- [ ] Tarea 1
- [ ] Tarea 2
- [ ] Tarea 3

## 📊 Impacto
- [Beneficio 1]
- [Beneficio 2]

## 📁 Archivos afectados
- `ruta/archivo1.ts`
- `ruta/archivo2.tsx`

## ⏱️ Estimación
[X-Y horas]

## 🔗 Referencias
- Link a docs
- Link a issue relacionado
```

---

## 🔄 **WORKFLOW DIARIO**

### **1. Mañana (5 min)**
```bash
# Ver issues asignados hoy
gh issue list --assignee @me --state open

# O en el Project Board
# Ver columna "Doing"
```

### **2. Durante el día**
```bash
# Crear branch desde issue
gh issue develop 123 --checkout

# Commit con referencia al issue
git commit -m "feat: implementar persistencia de conversaciones (#123)"

# Push y crear PR
git push origin feature/persistencia-conversaciones
gh pr create --fill
```

### **3. Al completar**
```bash
# Merge del PR (cierra issue automáticamente si usas "closes #123" en PR)
gh pr merge --squash

# O cerrar issue manualmente
gh issue close 123 --comment "Completado! ✅"
```

---

## 📊 **AUTOMATIZACIONES CON GITHUB ACTIONS**

### **Auto-mover issues según estado**

Crear `.github/workflows/project-automation.yml`:

```yaml
name: Project Automation

on:
  issues:
    types: [opened, labeled]
  pull_request:
    types: [opened, closed]

jobs:
  auto-assign:
    runs-on: ubuntu-latest
    steps:
      - name: Add to Project
        uses: actions/add-to-project@v0.4.0
        with:
          project-url: https://github.com/users/TUUSER/projects/1
          github-token: ${{ secrets.GITHUB_TOKEN }}
      
      - name: Move to In Progress
        if: github.event.pull_request
        run: |
          # Mover issue a "Doing" cuando se crea PR
```

---

## 📈 **MÉTRICAS Y REPORTING**

### **Dashboard de Progreso**

GitHub Projects te da automáticamente:
- 📊 **Insights**: Burn down, velocity, cumulative flow
- 📅 **Roadmap**: Timeline visual
- 📈 **Charts**: Progreso por área, por persona

### **Export a CSV**

```bash
# Exportar issues a CSV
gh issue list --state all --json number,title,state,labels --limit 1000 > issues.json

# Convertir a CSV con jq
jq -r '.[] | [.number, .title, .state, (.labels | map(.name) | join(","))] | @csv' issues.json > issues.csv
```

---

## 🗂️ **ESTRUCTURA DE DOCUMENTACIÓN**

Tu repo ya tiene esta estructura recomendada:

```
docs/
├── desarrollo/
│   ├── ROADMAP.md              ← Visión general (ya creado ✅)
│   ├── PRIORIDADES.md          ← Lista detallada (ya creado ✅)
│   ├── GUIA-GESTION-TAREAS.md  ← Esta guía (ya creado ✅)
│   ├── CHANGELOG.md            ← Qué se completó (crear)
│   └── areas/
│       ├── ia-asistente.md     ← Status por área (crear)
│       ├── content-creator.md
│       ├── admin-panel.md
│       └── blog.md
│
├── ia/
│   ├── SISTEMA-IA-COMPLETO.md  ← Ya existe ✅
│   └── CONTENT-CREATOR-PROGRESS.md ← Ya existe ✅
│
└── apis/
    ├── stripe-webhooks.md
    └── tradingview-api.md
```

---

## 🎨 **ALTERNATIVAS EVALUADAS**

### **Linear** ($8-10/mes)
- ✅ UI ultra-rápida
- ✅ Shortcuts everywhere
- ❌ Costo mensual
- ❌ Overkill para 1 persona

**Veredicto**: Bueno para equipos 5+, innecesario para ti.

---

### **Notion** (Gratis)
- ✅ Documentación excelente
- ✅ Flexible
- ❌ Lento con muchos datos
- ❌ Integración Git débil

**Veredicto**: Mejor como Wiki, no como task manager.

---

### **Markdown en repo** (Gratis)
- ✅ Simple
- ✅ Version control
- ❌ Sin visualizaciones
- ❌ Sin automatización

**Veredicto**: Buen complemento, no principal.

---

## ✅ **TU SISTEMA FINAL**

```
┌─────────────────────────────────────────┐
│     GitHub Projects (Task Manager)      │
│  - Board Kanban                         │
│  - Table con prioridades                │
│  - Roadmap timeline                     │
│  - Automation con Actions               │
└─────────────────────────────────────────┘
              ↓
┌─────────────────────────────────────────┐
│   Markdown Docs (Documentación)         │
│  - ROADMAP.md (visión general)          │
│  - PRIORIDADES.md (detalle)             │
│  - CHANGELOG.md (historial)             │
│  - Areas/ (status por módulo)           │
└─────────────────────────────────────────┘
              ↓
┌─────────────────────────────────────────┐
│      GitHub Issues (Tareas)             │
│  - Labels: Priority, Area, Type         │
│  - Milestones: Q4 2025, Q1 2026         │
│  - Templates para bugs/features         │
└─────────────────────────────────────────┘
```

---

## 🚀 **PRÓXIMOS PASOS**

### **Hoy (30 min)**
- [ ] Crear GitHub Project
- [ ] Configurar labels
- [ ] Ejecutar script de issues (o crear manualmente los 5 críticos)

### **Esta semana**
- [ ] Agregar todos los issues al project
- [ ] Asignar prioridades
- [ ] Mover a "Doing" los 2 críticos
- [ ] Crear PR para primer issue

### **Próximo mes**
- [ ] Actualizar ROADMAP.md semanalmente
- [ ] Crear CHANGELOG.md con completados
- [ ] Exportar métricas mensuales

---

## 📚 **RECURSOS ÚTILES**

- [GitHub Projects Docs](https://docs.github.com/en/issues/planning-and-tracking-with-projects)
- [GitHub CLI Docs](https://cli.github.com/manual/)
- [Markdown Guide](https://www.markdownguide.org/)

---

## 💡 **TIPS**

1. **Commits semánticos**:
   ```bash
   feat: nueva feature
   fix: bug corregido
   docs: actualizar documentación
   refactor: refactorización
   test: añadir tests
   ```

2. **Referencias automáticas**:
   ```bash
   # Esto cierra el issue automáticamente al hacer merge
   git commit -m "feat: persistencia conversaciones (closes #123)"
   ```

3. **Templates de commit**:
   ```bash
   git config commit.template .gitmessage
   ```

4. **Alias útiles**:
   ```bash
   gh alias set issues 'issue list --assignee @me --state open'
   gh alias set prs 'pr list --author @me'
   ```

---

**¿Preguntas?** Revisa los docs o pregunta en el chat de desarrollo.

---

**Mantenido por**: Carlos Diaz  
**Última revisión**: 20 de Octubre de 2025

