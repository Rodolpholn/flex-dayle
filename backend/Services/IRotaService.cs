using backend.Models.DTOs;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace backend.Services
{
    public interface IRotaService
    {
        Task<List<RotaResponseDto>> GetRotasByUserAsync(Guid userId, int? mes, int? ano);
    Task<RotaResponseDto?> GetRotaByIdAsync(Guid id, Guid userId);
    Task<RotaResponseDto> CreateRotaAsync(Guid userId, CreateRotaDto dto);
    Task<RotaResponseDto?> UpdateRotaAsync(Guid id, Guid userId, UpdateRotaDto dto);
    Task<bool> DeleteRotaAsync(Guid id, Guid userId);
    Task<DashboardDto> GetDashboardAsync(Guid userId, int? mes, int? ano);
    // Novo método para o gráfico
    Task<List<GraficoMensalDto>> GetGraficoAnualAsync(Guid userId, int ano);
    }
}