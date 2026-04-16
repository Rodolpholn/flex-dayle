export interface Usuario {
  id: string;
  nome: string;
  sobrenome: string;
  email: string;
  telefone?: string;
  veiculoMarca?: string;
  veiculoModelo?: string;
  veiculoPlaca?: string;
  role: 'user' | 'admin';
  ativo: boolean;
  createdAt: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  usuario?: Usuario;
}

export interface LoginDto {
  email: string;
  senha: string;
}

export interface RegisterDto {
  nome: string;
  sobrenome: string;
  email: string;
  senha: string;
  telefone?: string;
}

export interface UpdatePerfilDto {
  nome?: string;
  sobrenome?: string;
  telefone?: string;
  veiculoMarca?: string;
  veiculoModelo?: string;
  veiculoPlaca?: string;
}
