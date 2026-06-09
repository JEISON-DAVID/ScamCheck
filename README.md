
# ScamCheck 🛡️

Detector de estafas digitales impulsado por IA. Analiza mensajes, correos, SMS y enlaces sospechosos en segundos.

## 🚀 Demo

[scam-check-gray.vercel.app](https://scam-check-gray.vercel.app)

## ✨ Características

- Análisis de riesgo con porcentaje (0-100%)
- Detección de señales de estafa
- Recomendaciones personalizadas
- Modo oscuro/claro
- Diseño responsive mobile-first
- Casos reales de estafas comunes

## 🛠️ Tecnologías

- React 18
- Vite
- Tailwind CSS
- Groq API (LLaMA 3.3 70B)
- Vercel Serverless Functions

## 📦 Instalación local

```bash
git clone https://github.com/JEISON-DAVID/ScamCheck.git
cd ScamCheck
npm install
npm run dev
```

## ⚙️ Variables de entorno

Crea un archivo `.env` en la raíz:

```
GROQ_API_KEY=tu_api_key_de_groq
```

## 🚀 Deploy

El proyecto está configurado para desplegarse automáticamente en Vercel al hacer push a la rama `main`.

## 📱 Tipos de estafas detectadas

- Phishing bancario
- WhatsApp falso
- Inversiones fraudulentas
- Suplantación de identidad
- Links maliciosos
- Urgencia artificial

## 📄 Licencia

MIT © 2026 Jeison David
```
