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
  usuario?: Usuario; // Contém o objeto Usuario com a propriedade 'role'
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
  // Adicionados como opcionais para permitir cadastro completo desde o início
  veiculoMarca?: string;
  veiculoModelo?: string;
  veiculoPlaca?: string;
}

export interface UpdatePerfilDto {
  nome?: string;
  sobrenome?: string;
  telefone?: string;
  veiculoMarca?: string;
  veiculoModelo?: string;
  veiculoPlaca?: string;
}

/**
 * Interface adicional para facilitar a gestão de usuários
 * na tela de Admin que você mostrou no Swagger.
 */
export interface AdminUsuarioResumo extends Usuario {
  totalRotas?: number;
  ganhosTotais?: number;
}
