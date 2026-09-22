# 🃏 Planning Poker em Tempo Real (Scrum Poker)

Aplicação colaborativa de **Planning Poker** desenvolvida especialmente para equipes ágeis realizarem estimativas de tarefas e histórias de usuário de forma rápida, sem atritos de cadastro e com sincronização instantânea via WebSockets.

---

## ✨ Funcionalidades Principais

- **Entrada Zero-Atrito**: Basta compartilhar o link da sala. Os membros escolhem seu nome, avatar emoji e papel (Votante ou Observador) e entram instantaneamente.
- **Votação em Tempo Real Segura**: Os votos permanecem estritamente secretos no servidor e nas telas dos participantes até o momento da revelação (impossibilitando trapaça e viés de ancoragem).
- **Cartas com Animação 3D**: Efeito realista de virada simultânea quando o facilitador clica em *Revelar Cartas*.
- **Cálculo Inteligente de Métricas**:
  - Média aritmética e Mediana calculadas instantaneamente.
  - Taxa de concordância percentual.
  - **Destaque de Divergências**: Identifica automaticamente quem votou no menor e no maior valor para direcionar discussões objetivas.
  - **Celebração de Consenso**: Disparo de confetes e efeitos sonoros harmônicos em caso de 100% de acordo.
- **Gestão de Histórias / Backlog da Sessão**:
  - Cadastro de tarefas com título, descrição e link do Jira.
  - Atribuição direta da pontuação estimada à história.
  - **Exportação em Markdown**: Botão para copiar a tabela de estimativas e colar direto na documentação ou ata de sprint no Jira/Confluence.
- **Múltiplos Baralhos Suportados**:
  - Scrum Adaptado (0, 0.5, 1, 2, 3, 5, 8, 13, 20, 40, 100, ?, ☕)
  - Fibonacci Clássico (0, 1, 2, 3, 5, 8, 13, 21, 34, 55, 89, ?, ☕)
  - T-Shirt Sizes (XS, S, M, L, XL, XXL, ?, ☕)
  - Potências de 2 (0, 1, 2, 4, 8, 16, 32, 64, ?, ☕)
- **Efeitos Sonoros Nativos**: Síntese via Web Audio API (sem dependências de arquivos de áudio externos) com controle de mudo no topo.
- **Controles de Facilitador**: Permite passar o papel de facilitador para outro participante ou liberar o botão de revelação para qualquer membro.

---

## 🚀 Como Executar Localmente

### Pré-requisitos
- **Node.js**: Versão 18+ (testado na v24)
- **npm**: Versão 9+

### 1. Iniciar Frontend e Backend Juntos (Recomendado)
Na raiz do projeto:
```bash
npm run dev
```

Isso iniciará:
- O **Servidor Backend** (Express + Socket.io) em: `http://localhost:4000`
- O **Frontend** (React + Vite + Tailwind CSS) em: `http://localhost:3000`

Abra o seu navegador em [http://localhost:3000](http://localhost:3000).

---

## 🧪 Rodando os Testes

Para rodar os testes automatizados da lógica de cálculo e do gerenciador de salas:
```bash
npm test
```

---

## 🛠️ Tecnologias Utilizadas

- **Frontend**: React 19, TypeScript, Vite, Tailwind CSS v4, Lucide React, Canvas Confetti.
- **Backend**: Node.js, Express, Socket.io, TypeScript, tsx.
- **Áudio**: Web Audio API nativo do navegador.
