
# 🛡️ ScamCheck



![Vercel](https://img.shields.io/badge/Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white)




![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)




![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)




![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)




![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)



> **Detecta estafas digitales con IA en segundos.** Analiza mensajes, correos, SMS y enlaces sospechosos antes de caer en la trampa.

[

![Demo](https://img.shields.io/badge/🚀_Ver_Demo-2563EB?style=for-the-badge)

](https://scam-check-gray.vercel.app)

---

## ⚡ ¿Qué hace?

Pega cualquier mensaje sospechoso y ScamCheck te dice al instante:

- 🔴 **Nivel de riesgo** (0-100%)
- ⚠️ **Señales de estafa detectadas**
- ✅ **Recomendación clara** de qué hacer
- 🏷️ **Tipo de estafa** identificada

---

## 🎯 Casos detectados

| Tipo | Ejemplo |
|------|---------|
| 🏦 Phishing bancario | "Tu cuenta será suspendida..." |
| 📱 WhatsApp falso | "Tu cuenta fue bloqueada..." |
| 💰 Inversión falsa | "Gana $3000 en 24 horas..." |
| 📦 Falso courier | "Paga $2 para liberar tu paquete..." |
| 🎁 Premio falso | "Ganaste un iPhone, reclamalo aquí..." |

---

## 🛠️ Stack tecnológico

```

Frontend    → React 18 + Vite + Tailwind CSS
Backend     → Vercel Serverless Functions
IA          → Groq API (LLaMA 3.3 70B)
Deploy      → Vercel (CI/CD automático)
```

---

## 📦 Instalación local

```bash
# Clonar repositorio
git clone https://github.com/JEISON-DAVID/ScamCheck.git
cd ScamCheck

# Instalar dependencias
npm install

# Variables de entorno
echo "GROQ_API_KEY=tu_api_key" > .env

# Iniciar servidor de desarrollo
npm run dev
```

---

## 🔑 Variables de entorno

| Variable | Descripción | Obtener |
|----------|-------------|---------|
| `GROQ_API_KEY` | API key de Groq | [console.groq.com](https://console.groq.com) |

---

## 📁 Estructura del proyecto

```
ScamCheck/
├── api/
│   └── analyze.js       # Serverless function
├── src/
│   ├── App.jsx          # Componente principal
│   ├── main.jsx         # Entry point
│   └── index.css        # Estilos globales
├── index.html
├── vercel.json
└── package.json
```

---

## 🚀 Deploy en Vercel

1. Fork este repositorio
2. Importa en [vercel.com](https://vercel.com)
3. Agrega `GROQ_API_KEY` en Environment Variables
4. ¡Listo!

---

## 📄 Licencia

MIT © 2026 [Jeison David](https://github.com/JEISON-DAVID)

---

<div align="center">
  <strong>Hecho con ❤️ en Barranquilla, Colombia 🇨🇴</strong>
</div>
