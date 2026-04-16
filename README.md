# LogiTrack - Sistema de Gestão de Rotas e Ganhos

Sistema web responsivo para motoristas de entrega monitorarem ganhos brutos, gastos com combustível e quilometragem.

## 📁 Estrutura do Projeto

```
flex-dayle/
├── frontend/          → Angular 17+ com Tailwind CSS
└── backend/           → .NET 8 Web API
```

---

## 🛠️ Stack Tecnológica

| Camada         | Tecnologia                |
| -------------- | ------------------------- |
| Frontend       | Angular 17+, Tailwind CSS |
| Backend        | .NET 8 Web API (C#)       |
| Banco de Dados | Supabase (PostgreSQL)     |
| Autenticação   | Supabase Auth (JWT)       |

---

## ⚙️ Configuração Inicial

### 1. Supabase

1. Crie um projeto em [supabase.com](https://supabase.com)
2. Execute o SQL abaixo no **SQL Editor** do Supabase:

```sql
-- Tabela de usuários (perfil)
CREATE TABLE IF NOT EXISTS public.usuarios (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  sobrenome TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  telefone TEXT,
  veiculo_marca TEXT,
  veiculo_modelo TEXT,
  veiculo_placa TEXT,
  role TEXT DEFAULT 'user',
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela de rotas
CREATE TABLE IF NOT EXISTS public.rotas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.usuarios(id) ON DELETE CASCADE,
  data_rota DATE NOT NULL,
  valor_bruto DECIMAL(10,2) NOT NULL,
  km_rodado DECIMAL(10,2) NOT NULL,
  litros_abastecidos DECIMAL(10,2),
  valor_abastecimento DECIMAL(10,2),
  consumio_medio_veiculo DECIMAL(10,2) DEFAULT 10,
  custo_por_km DECIMAL(10,4),
  lucro_dia DECIMAL(10,2),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, data_rota)
);

-- RLS (Row Level Security)
ALTER TABLE public.usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rotas ENABLE ROW LEVEL SECURITY;

-- Políticas para usuários
CREATE POLICY "Users can view own profile" ON public.usuarios
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.usuarios
  FOR UPDATE USING (auth.uid() = id);

-- Políticas para rotas
CREATE POLICY "Users can manage own routes" ON public.rotas
  FOR ALL USING (auth.uid() = user_id);

-- Admin pode ver tudo
CREATE POLICY "Admin can view all" ON public.usuarios
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.usuarios WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Admin can view all routes" ON public.rotas
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.usuarios WHERE id = auth.uid() AND role = 'admin')
  );

-- Trigger para criar perfil automaticamente após cadastro
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.usuarios (id, nome, sobrenome, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'nome', ''),
    COALESCE(NEW.raw_user_meta_data->>'sobrenome', ''),
    NEW.email
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

3. Para criar um **usuário admin**, execute:

```sql
UPDATE public.usuarios SET role = 'admin' WHERE email = 'seu-email-admin@exemplo.com';
```

---

### 2. Backend (.NET 8)

1. Edite `backend/appsettings.json` com suas credenciais:

```json
{
  "Supabase": {
    "Url": "https://SEU_PROJECT_ID.supabase.co",
    "AnonKey": "SUA_ANON_KEY",
    "JwtSecret": "SEU_JWT_SECRET"
  },
  "ConnectionStrings": {
    "DefaultConnection": "Host=db.SEU_PROJECT_ID.supabase.co;Port=5432;Database=postgres;Username=postgres;Password=SUA_DB_PASSWORD;SSL Mode=Require;Trust Server Certificate=true"
  }
}
```

> **Onde encontrar:**
>
> - `Url` e `AnonKey`: Supabase → Settings → API
> - `JwtSecret`: Supabase → Settings → API → JWT Settings
> - `DefaultConnection`: Supabase → Settings → Database → Connection string

2. Rodar o backend:

```bash
cd backend
dotnet run
```

O backend estará disponível em `http://localhost:5000`

---

### 3. Frontend (Angular)

1. Edite `frontend/src/environments/environment.ts`:

```typescript
export const environment = {
  production: false,
  apiUrl: "http://localhost:5000/api",
  supabaseUrl: "https://SEU_PROJECT_ID.supabase.co",
  supabaseAnonKey: "SUA_ANON_KEY",
};
```

2. Instalar dependências e rodar:

```bash
cd frontend
npm install
npm start
```

O frontend estará disponível em `http://localhost:4200`

---

## 🚀 Funcionalidades

### Módulo do Motorista

- ✅ **Login / Cadastro** com Supabase Auth
- ✅ **Dashboard** com métricas: Ganho Bruto, Gasto Combustível, Lucro Líquido, Ganho/KM
- ✅ **Calendário de Rotas** - grade mensal interativa com modal de cadastro
- ✅ **Perfil** - edição de dados pessoais, veículo e senha
- ✅ **Dark Mode** persistente

### Módulo Admin (`/admin`)

- ✅ **Dashboard Global** - métricas consolidadas de todos os usuários
- ✅ **Gestão de Usuários** - tabela com busca, bloquear/desbloquear, reset de senha, excluir
- ✅ **AuthGuard + AdminGuard** - proteção de rotas

---

## 🔐 Acesso Admin

A rota `/admin` não possui link visível no site. Acesse diretamente via URL após fazer login com uma conta que tenha `role = 'admin'` no banco de dados.

---

## 📐 Lógica de Cálculo

| Métrica            | Fórmula                                                                    |
| ------------------ | -------------------------------------------------------------------------- |
| Custo por KM       | `Valor Abastecimento / KM Rodado` (ou `Preço Combustível / Consumo Médio`) |
| Lucro do Dia       | `Valor Rota - Custo Combustível`                                           |
| Projeção Mensal    | `Σ Lucro de todos os dias do mês`                                          |
| Ganho por KM       | `Ganho Total / KM Total`                                                   |
| Consumo Médio Real | `KM Rodado / Litros Abastecidos`                                           |
