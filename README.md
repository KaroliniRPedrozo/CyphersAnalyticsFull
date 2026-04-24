# <img src="./src/frontend/src/assets/valorant-white-logo.png" width="70" align="center"> Cypher's Analytics

> Uma plataforma web completa para análise de dados e visualização de estatísticas do Valorant, focada em oferecer uma experiência de usuário (UX) fluida e interfaces intuitivas.

![Status do Projeto](https://img.shields.io/badge/Status-Em_Desenvolvimento-yellow?style=for-the-badge)
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![.NET](https://img.shields.io/badge/.NET-5C2D91?style=for-the-badge&logo=.net&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)

## 📋 Sobre o Projeto

O **Cypher's Analytics** é uma aplicação Full Stack desenvolvida para compilar, analisar e exibir métricas e dados do jogo Valorant. O objetivo é fornecer aos jogadores e entusiastas uma ferramenta visualmente agradável e de fácil compreensão para analisar o desempenho de agentes, mapas e composições.

O projeto foi construído pensando em boas práticas de Interação Humano-Computador (IHC) para garantir que a visualização dos dados seja clara e acessível.

## ✨ Funcionalidades

- **Dashboard Interativo:** Visualização de dados gerais, ranks e agentes.
- **Análise de Agentes:** Informações detalhadas sobre habilidades, artworks e ícones.
- **Estatísticas de Mapas:** Dados de performance divididos por mapas do jogo.
- **Integração via API:** Backend robusto para o fornecimento e processamento dos dados.

## 🚀 Tecnologias Utilizadas

O projeto é dividido em duas partes principais:

### Frontend

- **React (com Vite):** Construção da interface de usuário.
- **JavaScript (JSX):** Lógica de componentes e chamadas de API.
- **Figma:** Prototipação e design de interface pré-desenvolvimento.

### Backend & Dados

- **C# / .NET:** Construção da API RESTful (`DesenvWeb.Api`).
- **PostgreSQL:** Banco de dados relacional para armazenamento de estatísticas.

## ⚙️ Como Executar o Projeto

### Pré-requisitos

Antes de começar, você vai precisar ter instalado em sua máquina as seguintes ferramentas:

- [Git](https://git-scm.com)
- [Node.js](https://nodejs.org/en/)
- [.NET SDK](https://dotnet.microsoft.com/download)
- [PostgreSQL](https://www.postgresql.org/)

### 1. Clonando o repositório

```bash
git clone [https://github.com/SEU-USUARIO/CyphersAnalytics.git](https://github.com/SEU-USUARIO/CyphersAnalytics.git)
cd CyphersAnalytics
```

### 2. Rodando o Backend (.NET)

```Bash

# Acesse a pasta da API
cd src/api

# Restaure as dependências
dotnet restore

# Execute o projeto
dotnet run
```

A API estará rodando em <http://localhost:5000> ou <https://localhost:5001> (ou na porta configurada no seu launchSettings.json).

### 3. Rodando o Frontend (React/Vite)

Abra um novo terminal e execute:

```Bash

# Volte para a raiz e acesse a pasta do frontend

cd src/frontend

# Instale as dependências

npm install

# Execute o servidor de desenvolvimento

npm run dev
```

O frontend estará disponível em <http://localhost:5173>.

## 📂 Estrutura de Pastas

```
CyphersAnalytics/
├── src/
│   ├── api/                 # Código fonte do Backend (.NET)
│   └── frontend/            # Código fonte do Frontend (React + Vite)
│       ├── src/
│       │   ├── assets/      # Imagens, ícones (ex: Ranks, Agentes)
│       │   ├── components/  # Componentes reutilizáveis
│       │   ├── pages/       # Telas da aplicação (ex: Dashboard.jsx)
│       │   └── services/    # Arquivos de integração (API calls)
├── .env                     # Variáveis de ambiente
├── .gitignore
└── README.md
```

## ✍️ Autoria

Desenvolvido por Karolini R. Pedrozo.
