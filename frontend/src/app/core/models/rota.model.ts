export interface Rota {
  id: string;
  userId: string;
  dataRota: string;
  valorBruto: number;
  kmRodado: number;
  litrosAbastecidos?: number;
  valorAbastecimento?: number;
  consumioMedioVeiculo: number;
  custoPorKm: number;
  lucroDia: number;
  createdAt: string;
}

export interface CreateRotaDto {
  dataRota: string;
  valorBruto: number;
  kmRodado: number;
  litrosAbastecidos?: number;
  valorAbastecimento?: number;
  consumioMedioVeiculo?: number;
}

export interface UpdateRotaDto {
  valorBruto?: number;
  kmRodado?: number;
  litrosAbastecidos?: number;
  valorAbastecimento?: number;
  consumioMedioVeiculo?: number;
}

export interface DashboardData {
  ganhoTotalBruto: number;
  gastoTotalCombustivel: number;
  lucroLiquido: number;
  mediaGanhoPorKm: number;
  mediaConsumoReal: number;
  kmTotalRodado: number;
  totalRotas: number;
  projecaoMensal: number;
}

export interface AdminDashboard {
  totalUsuarios: number;
  volumeGanhosTotal: number;
  kmTotalSistema: number;
  ticketMedioPorKm: number;
  cadastrosPorMes: { mes: string; total: number }[];
}
