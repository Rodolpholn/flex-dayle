using backend.Data;
using backend.Models;
using backend.Models.DTOs;
using Microsoft.EntityFrameworkCore;
using System.Globalization;

namespace backend.Services
{
    public class RotaService : IRotaService
    {
        private readonly AppDbContext _context;

        public RotaService(AppDbContext context)
        {
            _context = context;
        }

        private static decimal CalcularCustoPorKm(Rota rota)
        {
            if (rota.KmRodado <= 0) return 0;

            if (rota.ValorAbastecimento.HasValue && rota.ValorAbastecimento > 0)
            {
                return rota.ValorAbastecimento.Value / rota.KmRodado;
            }

            decimal precoMedioLitro = 6.0m;
            decimal litrosUsados = rota.KmRodado / rota.ConsumioMedioVeiculo;
            return (litrosUsados * precoMedioLitro) / rota.KmRodado;
        }

        private static decimal CalcularLucroDia(Rota rota)
        {
            decimal custoCombustivel;

            if (rota.ValorAbastecimento.HasValue && rota.ValorAbastecimento > 0)
            {
                custoCombustivel = rota.ValorAbastecimento.Value;
            }
            else
            {
                decimal precoMedioLitro = 6.0m;
                decimal litrosUsados = rota.KmRodado / rota.ConsumioMedioVeiculo;
                custoCombustivel = litrosUsados * precoMedioLitro;
            }

            return rota.ValorBruto - custoCombustivel;
        }

        private static RotaResponseDto MapToDto(Rota rota)
        {
            return new RotaResponseDto
            {
                Id = rota.Id,
                UserId = rota.UserId,
                DataRota = rota.DataRota,
                ValorBruto = rota.ValorBruto,
                KmRodado = rota.KmRodado,
                LitrosAbastecidos = rota.LitrosAbastecidos,
                ValorAbastecimento = rota.ValorAbastecimento,
                ConsumioMedioVeiculo = rota.ConsumioMedioVeiculo,
                CustoPorKm = CalcularCustoPorKm(rota),
                LucroDia = CalcularLucroDia(rota),
                CreatedAt = rota.CreatedAt
            };
        }

        public async Task<List<RotaResponseDto>> GetRotasByUserAsync(Guid userId, int? mes, int? ano)
        {
            var query = _context.Rotas.Where(r => r.UserId == userId);

            if (mes.HasValue && ano.HasValue)
                query = query.Where(r => r.DataRota.Month == mes.Value && r.DataRota.Year == ano.Value);
            else if (ano.HasValue)
                query = query.Where(r => r.DataRota.Year == ano.Value);

            var rotas = await query.OrderBy(r => r.DataRota).ToListAsync();
            return rotas.Select(MapToDto).ToList();
        }

        public async Task<RotaResponseDto?> GetRotaByIdAsync(Guid id, Guid userId)
        {
            var rota = await _context.Rotas.FirstOrDefaultAsync(r => r.Id == id && r.UserId == userId);
            return rota == null ? null : MapToDto(rota);
        }

        public async Task<RotaResponseDto> CreateRotaAsync(Guid userId, CreateRotaDto dto)
        {
            var rota = new Rota
            {
                Id = Guid.NewGuid(),
                UserId = userId,
                DataRota = dto.DataRota,
                ValorBruto = dto.ValorBruto,
                KmRodado = dto.KmRodado,
                LitrosAbastecidos = dto.LitrosAbastecidos,
                ValorAbastecimento = dto.ValorAbastecimento,
                ConsumioMedioVeiculo = dto.ConsumioMedioVeiculo,
                CreatedAt = DateTime.UtcNow
            };

            _context.Rotas.Add(rota);
            await _context.SaveChangesAsync();
            return MapToDto(rota);
        }

        public async Task<RotaResponseDto?> UpdateRotaAsync(Guid id, Guid userId, UpdateRotaDto dto)
        {
            var rota = await _context.Rotas.FirstOrDefaultAsync(r => r.Id == id && r.UserId == userId);
            if (rota == null) return null;

            if (dto.ValorBruto.HasValue) rota.ValorBruto = dto.ValorBruto.Value;
            if (dto.KmRodado.HasValue) rota.KmRodado = dto.KmRodado.Value;
            if (dto.LitrosAbastecidos.HasValue) rota.LitrosAbastecidos = dto.LitrosAbastecidos;
            if (dto.ValorAbastecimento.HasValue) rota.ValorAbastecimento = dto.ValorAbastecimento;
            if (dto.ConsumioMedioVeiculo.HasValue) rota.ConsumioMedioVeiculo = dto.ConsumioMedioVeiculo.Value;

            await _context.SaveChangesAsync();
            return MapToDto(rota);
        }

        public async Task<bool> DeleteRotaAsync(Guid id, Guid userId)
        {
            var rota = await _context.Rotas.FirstOrDefaultAsync(r => r.Id == id && r.UserId == userId);
            if (rota == null) return false;

            _context.Rotas.Remove(rota);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<DashboardDto> GetDashboardAsync(Guid userId, int? mes, int? ano)
        {
            var query = _context.Rotas.Where(r => r.UserId == userId);

            if (mes.HasValue && ano.HasValue)
                query = query.Where(r => r.DataRota.Month == mes.Value && r.DataRota.Year == ano.Value);
            else if (ano.HasValue)
                query = query.Where(r => r.DataRota.Year == ano.Value);

            var rotas = await query.ToListAsync();

            if (!rotas.Any())
                return new DashboardDto();

            decimal ganhoTotal = rotas.Sum(r => r.ValorBruto);
            decimal gastoTotal = rotas.Sum(r => r.ValorAbastecimento ?? 0);
            decimal kmTotal = rotas.Sum(r => r.KmRodado);
            decimal litrosTotal = rotas.Sum(r => r.LitrosAbastecidos ?? 0);

            var mesAtual = DateTime.UtcNow.Month;
            var anoAtual = DateTime.UtcNow.Year;
            var rotasMes = rotas.Where(r => r.DataRota.Month == mesAtual && r.DataRota.Year == anoAtual).ToList();
            decimal projecaoMensal = rotasMes.Sum(r => CalcularLucroDia(r));

            return new DashboardDto
            {
                GanhoTotalBruto = ganhoTotal,
                GastoTotalCombustivel = gastoTotal,
                LucroLiquido = ganhoTotal - gastoTotal,
                MediaGanhoPorKm = kmTotal > 0 ? Math.Round(ganhoTotal / kmTotal, 2) : 0,
                MediaConsumoReal = litrosTotal > 0 ? Math.Round(kmTotal / litrosTotal, 2) : 0,
                KmTotalRodado = kmTotal,
                TotalRotas = rotas.Count,
                ProjecaoMensal = projecaoMensal
            };
        }

        public async Task<List<GraficoMensalDto>> GetGraficoAnualAsync(Guid userId, int ano)
        {
            var rotasAno = await _context.Rotas
                .Where(r => r.UserId == userId && r.DataRota.Year == ano)
                .ToListAsync();

            var mesesReferencia = Enumerable.Range(1, 12).Select(m => new
            {
                Numero = m,
                Nome = CultureInfo.CurrentCulture.DateTimeFormat.GetAbbreviatedMonthName(m).ToUpper().Replace(".", "")
            });

            var resultado = mesesReferencia.Select(m => new GraficoMensalDto
            {
                Mes = m.Nome,
                Ganho = rotasAno
                    .Where(r => r.DataRota.Month == m.Numero)
                    .Sum(r => r.ValorBruto)
            }).ToList();

            return resultado;
        }

        // ==========================================
        // NOVO MÉTODO: RELATÓRIO MENSAL CONSOLIDADO
        // ==========================================
        public async Task<RelatorioResumoDto> ObterRelatorioMensalAsync(Guid userId, int mes, int ano)
        {
            // Filtra as rotas no banco pelo usuário, mês e ano selecionados
            var rotasPeriodo = await _context.Rotas
                .Where(r => r.UserId == userId && 
                            r.DataRota.Month == mes && 
                            r.DataRota.Year == ano)
                .ToListAsync();

            // Retorna zerado de forma segura se não houver registros
            if (!rotasPeriodo.Any())
            {
                return new RelatorioResumoDto();
            }

            // Agrega os dados com base nas propriedades reais da sua Entidade
            decimal faturamentoBruto = rotasPeriodo.Sum(r => r.ValorBruto);
            decimal kmTotalRodado = rotasPeriodo.Sum(r => r.KmRodado);
            
            // Segue a mesma lógica do seu dashboard para computar combustíveis preenchidos explicitamente
            decimal gastoCombustivel = rotasPeriodo.Sum(r => r.ValorAbastecimento ?? 0);
            
            // Soma o Lucro de cada dia usando a sua função interna de cálculo estimado
            decimal lucroLiquido = rotasPeriodo.Sum(r => CalcularLucroDia(r));

            return new RelatorioResumoDto
            {
                FaturamentoBruto = faturamentoBruto,
                LucroLiquido = lucroLiquido,
                GastoCombustivel = gastoCombustivel,
                KmTotalRodado = kmTotalRodado
            };
        }
    }
}