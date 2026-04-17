# 🚚 FlexDayle - Gestão Inteligente de Rotas e Entregas

FlexDayle é uma solução completa para otimização de logística, permitindo que motoristas de entrega gerenciem suas rotas, controlem custos de combustível e organizem sua rotina de trabalho de forma eficiente. O sistema integra um backend robusto em .NET 9 com um banco de dados Supabase (PostgreSQL) e uma interface moderna em Angular.

## 🛠️ Tecnologias Utilizadas

### BackendFramework:

- .NET 9
- ORM: Entity Framework Core
- Banco de Dados: Supabase (PostgreSQL)
- Autenticação: JWT (JSON Web Tokens) com integração Supabase Auth
- Documentação: Swagger (OpenAPI)

### Frontend

- Framework: Angular 18+
- Estilização: Tailwind CSS / Angular Material
- Estado: RxJS para gerenciamento de fluxos assíncronos

## 🚀 Funcionalidades Principais

- Autenticação Segura: Cadastro e login de usuários com níveis de acesso (Admin/User)
- Gestão de Rotas: Registro de pontos de coleta, entrega e cálculos de distância.
- Controle Financeiro: Cálculo automático de consumo médio de combustível e gastos por rota.
- Painel Administrativo: Visão geral para gerenciamento de usuários e monitoramento de atividades.
- Arquitetura Escalável: Pronto para deploy em containers (Railway/Docker).

## 💻 Como Rodar o Projeto

### Pré-requisitos

SDK do .NET 9
Node.js & Angular CLI
Instância ativa no Supabase

### Backend

cd backend
dotnet restore
dotnet run

Acesse a documentação em: http://localhost:5153/swagger

## frontend

cd frontend
npm install
ng serve

Acesse a aplicação em: http://localhost:4200
