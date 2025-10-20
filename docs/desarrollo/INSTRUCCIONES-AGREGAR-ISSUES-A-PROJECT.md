# 📋 Cómo Agregar Issues al GitHub Project

**Proyecto**: APIDevs Development Roadmap (#3)  
**Issues creados**: #2, #3, #4, #5, #6

---

## 🎯 **OPCIÓN A: Interfaz Web (MÁS FÁCIL - 2 minutos)**

### **Paso 1: Ir a tu proyecto**
```
https://github.com/users/diazpolanco13/projects/3
```

### **Paso 2: Agregar issues**

**Método 1: Drag & Drop** (Recomendado)
1. En la parte inferior del project, verás: **"Add items"** o un botón **"+"**
2. Click ahí
3. Buscar: `#2` (o escribir "Persistencia")
4. Click en el issue
5. Se agregará automáticamente
6. Repetir para #3, #4, #5, #6

**Método 2: Desde el Issue**
1. Ve a un issue: https://github.com/diazpolanco13/apidevs-react/issues/2
2. En la barra lateral derecha → **"Projects"**
3. Click en el selector
4. Elegir: **"APIDevs Development Roadmap"**
5. El issue se agregará automáticamente
6. Repetir para cada issue

---

## 🎯 **OPCIÓN B: GitHub CLI (Requiere permisos adicionales)**

### **Paso 1: Actualizar permisos del token**

```bash
# Esto abrirá el navegador para autorizar
gh auth refresh -s project -h github.com

# Seguir las instrucciones en el navegador
# Autorizar los nuevos permisos
```

### **Paso 2: Agregar issues al proyecto**

```bash
# Agregar cada issue
gh project item-add 3 --owner diazpolanco13 --url https://github.com/diazpolanco13/apidevs-react/issues/2
gh project item-add 3 --owner diazpolanco13 --url https://github.com/diazpolanco13/apidevs-react/issues/3
gh project item-add 3 --owner diazpolanco13 --url https://github.com/diazpolanco13/apidevs-react/issues/4
gh project item-add 3 --owner diazpolanco13 --url https://github.com/diazpolanco13/apidevs-react/issues/5
gh project item-add 3 --owner diazpolanco13 --url https://github.com/diazpolanco13/apidevs-react/issues/6
```

---

## 📊 **OPCIÓN C: Script Automático (Después de autorizar permisos)**

He creado un script que lo hace automáticamente:

```bash
./scripts/add-issues-to-project.sh
```

---

## 🎨 **CONFIGURAR VIEWS DEL PROYECTO**

Una vez agregados los issues, configura las vistas:

### **View 1: Board (Kanban)** - Como Linear

1. En tu proyecto → Click "New view" (o editar la existente)
2. Tipo: **Board**
3. Group by: **Status**
4. Columnas:
   - 📝 **Todo** (Status: No status)
   - 🚧 **In Progress** (Status: In Progress)
   - 👀 **In Review** (Status: In Review)
   - ✅ **Done** (Status: Done)

### **View 2: Table** - Vista Completa

1. New view → Tipo: **Table**
2. Columnas visibles:
   - Title
   - Status
   - Priority (custom field)
   - Area (custom field)
   - Assignees
   - Estimate (custom field)
3. Sort by: **Priority** (Critical → Low)
4. Group by: **Area**

### **View 3: Roadmap** - Timeline Visual

1. New view → Tipo: **Roadmap**
2. Date field: **Target date** (custom field que debes crear)
3. Group by: **Milestone** o **Priority**
4. Zoom: Por semana o por mes

---

## 🎯 **CUSTOM FIELDS RECOMENDADOS**

Agregar estos campos personalizados a tu proyecto:

### **1. Priority** (Single select)
- 🔴 Critical
- 🟠 High
- 🟡 Medium
- 🟢 Low

### **2. Area** (Single select)
- 🤖 IA Asistente
- ✍️ Content Creator
- 📊 Admin Panel
- 🎨 Frontend
- ⚙️ Backend
- 📚 Docs

### **3. Estimate** (Number)
- Horas estimadas (2, 4, 6, 8, etc.)

### **4. Target Date** (Date)
- Fecha objetivo de completar

**Cómo agregar**:
1. En tu proyecto → Settings (⚙️)
2. Custom fields → Add field
3. Configurar según arriba

---

## 🚀 **RESULTADO FINAL**

Tu proyecto se verá exactamente como Linear:

```
┌─────────────────────────────────────────────────────┐
│ 📊 APIDevs Development Roadmap                      │
├─────────────────────────────────────────────────────┤
│ [Board] [Table] [Roadmap] [+ New view]             │
├─────────────────────────────────────────────────────┤
│                                                      │
│  📝 Todo          🚧 In Progress    ✅ Done         │
│ ┌──────────────┐ ┌──────────────┐ ┌─────────────┐ │
│ │ #3 Tab Conv  │ │ #2 Persist.  │ │             │ │
│ │ 🔴 Critical  │ │ 🔴 Critical  │ │             │ │
│ │ 📊 Admin     │ │ 🤖 IA        │ │             │ │
│ │ ⏱️ 4-6h      │ │ ⏱️ 6-8h      │ │             │ │
│ ├──────────────┤ └──────────────┘ └─────────────┘ │
│ │ #4 Tools Mod │                                   │
│ │ 🟠 High      │                                   │
│ │ 🤖 IA        │                                   │
│ │ ⏱️ 8-10h     │                                   │
│ └──────────────┘                                   │
└─────────────────────────────────────────────────────┘
```

---

## 💡 **TIPS**

### **Mover Issues entre Columnas**
- Drag & drop en Board view
- O click en issue → Status → Cambiar

### **Filtrar por Prioridad**
```
En el proyecto:
Filter → Label → priority:critical
```

### **Ver Solo tus Issues**
```
Filter → Assignee → @me
```

### **Keyboard Shortcuts** (como Linear)
- `c` → Create new issue
- `/` → Focus search
- `e` → Edit item
- `i` → Toggle sidebar

---

## 🔗 **ENLACES ÚTILES**

- **Tu Proyecto**: https://github.com/users/diazpolanco13/projects/3
- **Issues**: https://github.com/diazpolanco13/apidevs-react/issues
- **Labels**: https://github.com/diazpolanco13/apidevs-react/labels
- **Docs GitHub Projects**: https://docs.github.com/en/issues/planning-and-tracking-with-projects

---

## ✅ **CHECKLIST DE SETUP**

- [ ] Agregar issues #2, #3, #4, #5, #6 al proyecto
- [ ] Configurar View "Board" (Kanban)
- [ ] Configurar View "Table" (Detallada)
- [ ] Configurar View "Roadmap" (Timeline)
- [ ] Crear custom field "Priority"
- [ ] Crear custom field "Area"
- [ ] Crear custom field "Estimate"
- [ ] Mover issue #2 a "In Progress"
- [ ] Asignar target dates a issues críticos

---

**¡Empieza con la OPCIÓN A (Interfaz Web)!** Es la más rápida 🚀


