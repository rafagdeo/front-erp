# Nexo Gestão | Frontend

Aplicação React/Vite para gestão de clientes, catálogo, estoque e pedidos. A sessão usa cookie `HttpOnly`; tokens não são persistidos em `localStorage`.

## Executar

1. Instale Node.js 20 ou superior.
2. Copie `.env.example` para `.env` e informe a URL da API.
3. Execute:

```powershell
npm install
npm run dev
```

O front usa `http://localhost:3000` por padrão. Ajuste `VITE_API_URL` se o backend estiver em outro endereço.

## Verificações

```powershell
npm run lint
npm run build
```

## Módulos

- `src/services/api.js`: chamadas HTTP e credenciais de sessão.
- `src/contexts`: sessão autenticada.
- `src/pages`: visão geral, clientes, produtos, pedidos e perfil.
- `src/components`: navegação, modais e avisos reutilizáveis.

No perfil, cada usuário pode salvar sua própria mensagem do WhatsApp. Os placeholders disponíveis são `{nome_cliente}`, `{id_pedido}`, `{produtos}`, `{total}`, `{parcelas}`, `{parcela_pendente}` e `{prazo_pagamento}`.
# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
