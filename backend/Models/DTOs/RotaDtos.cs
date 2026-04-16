using System.ComponentModel.DataAnnotations;

namespace backend.Models.DTOs
{
    public class CreateRotaDto
    {
        [Required]
        public DateOnly DataRota { get; set; }

        [Required]
        [Range(0.01, double.MaxValue, ErrorMessage = "Valor bruto deve ser maior que zero")]
        public decimal ValorBruto { get; set; }

        [Required]
        [Range(0.01, double.MaxValue, ErrorMessage = "KM rodado deve ser maior que zero")]
        public decimal KmRodado { get; set; }

        public decimal? LitrosAbastecidos { get; set; }
        public decimal? ValorAbastecimento { get; set; }
        public decimal ConsumioMedioVeiculo { get; set; } = 10;
    }

    public class UpdateRotaDto
    {
        public decimal? ValorBruto { get; set; }
        public decimal? KmRodado { get; set; }
        public decimal? LitrosAbastecidos { get; set; }
        public decimal? ValorAbastecimento { get; set; }
        public decimal? ConsumioMedioVeiculo { get; set; }
    }

    public class RotaResponseDto
    {
        public Guid Id { get; set; }
        public Guid UserId { get; set; }
        public DateOnly DataRota { get; set; }
        public decimal ValorBruto { get; set; }
        public decimal KmRodado { get; set; }
        public decimal? LitrosAbastecidos { get; set; }
        public decimal? ValorAbastecimento { get; set; }
        public decimal ConsumioMedioVeiculo { get; set; }
        public decimal CustoPorKm { get; set; }
        public decimal LucroDia { get; set; }
        public DateTime CreatedAt { get; set; }
    }

    public class DashboardDto
    {
        public decimal GanhoTotalBruto { get; set; }
        public decimal GastoTotalCombustivel { get; set; }
        public decimal LucroLiquido { get; set; }
        public decimal MediaGanhoPorKm { get; set; }
        public decimal MediaConsumoReal { get; set; }
        public decimal KmTotalRodado { get; set; }
        public int TotalRotas { get; set; }
        public decimal ProjecaoMensal { get; set; }
    }

    public class AdminDashboardDto
    {
        public int TotalUsuarios { get; set; }
        public decimal VolumeGanhosTotal { get; set; }
        public decimal KmTotalSistema { get; set; }
        public decimal TicketMedioPorKm { get; set; }
        public List<CadastrosMesDto> CadastrosPorMes { get; set; } = new();
    }

    public class CadastrosMesDto
    {
        public string Mes { get; set; } = string.Empty;
        public int Total { get; set; }
    }
}
