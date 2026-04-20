using backend.Data;
using backend.Models;
using backend.Models.DTOs;
using Microsoft.EntityFrameworkCore;

namespace backend.Services
{
    public interface IAdminService
    {
        Task<AdminDashboardDto> GetAdminDashboardAsync();
        Task<List<UsuarioDto>> GetAllUsuariosAsync(string? search);
        Task<UsuarioDto?> GetUsuarioByIdAsync(Guid id);
        Task<bool> BlockUsuarioAsync(Guid id);
        Task<bool> UnblockUsuarioAsync(Guid id);
        Task<bool> DeleteUsuarioAsync(Guid id);
        // Caso precise de um método para verificar se o email é admin via banco:
        Task<bool> IsAdminAsync(string email);
    }

    public class AdminService : IAdminService
    {
        private readonly AppDbContext _context;
        private readonly ISupabaseAuthService _authService;

        public AdminService(AppDbContext context, ISupabaseAuthService authService)
        {
            _context = context;
            _authService = authService;
        }

        public async Task<bool> IsAdminAsync(string email)
        {
            return await _context.Usuarios.AnyAsync(u => u.Email == email && u.Role == "admin");
        }

        public async Task<AdminDashboardDto> GetAdminDashboardAsync()
        {
            var totalUsuarios = await _context.Usuarios.CountAsync(u => u.Role != "admin");
            var rotas = await _context.Rotas.ToListAsync();

            decimal volumeGanhos = rotas.Sum(r => r.ValorBruto);
            decimal kmTotal = rotas.Sum(r => r.KmRodado);
            decimal ticketMedio = kmTotal > 0 ? Math.Round(volumeGanhos / kmTotal, 2) : 0;

            // Cadastros por mês (últimos 6 meses)
            var cadastrosPorMes = await _context.Usuarios
                .Where(u => u.Role != "admin" && u.CreatedAt >= DateTime.UtcNow.AddMonths(-6))
                .GroupBy(u => new { u.CreatedAt.Year, u.CreatedAt.Month })
                .Select(g => new CadastrosMesDto
                {
                    Mes = $"{g.Key.Month:D2}/{g.Key.Year}",
                    Total = g.Count()
                })
                .OrderBy(c => c.Mes)
                .ToListAsync();

            return new AdminDashboardDto
            {
                TotalUsuarios = totalUsuarios,
                VolumeGanhosTotal = volumeGanhos,
                KmTotalSistema = kmTotal,
                TicketMedioPorKm = ticketMedio,
                CadastrosPorMes = cadastrosPorMes
            };
        }

        public async Task<List<UsuarioDto>> GetAllUsuariosAsync(string? search)
        {
            // Filtra para não listar outros admins na gestão de usuários comum
            var query = _context.Usuarios.Where(u => u.Role != "admin");

            if (!string.IsNullOrWhiteSpace(search))
            {
                search = search.ToLower();
                query = query.Where(u =>
                    u.Nome.ToLower().Contains(search) ||
                    u.Sobrenome.ToLower().Contains(search) ||
                    u.Email.ToLower().Contains(search));
            }

            var usuarios = await query.OrderByDescending(u => u.CreatedAt).ToListAsync();
            return usuarios.Select(MapToDto).ToList();
        }

        public async Task<UsuarioDto?> GetUsuarioByIdAsync(Guid id)
        {
            var usuario = await _context.Usuarios.FindAsync(id);
            return usuario == null ? null : MapToDto(usuario);
        }

        public async Task<bool> BlockUsuarioAsync(Guid id)
        {
            var usuario = await _context.Usuarios.FindAsync(id);
            if (usuario == null) return false;

            usuario.Ativo = false;
            await _context.SaveChangesAsync();
            await _authService.BlockUserAsync(id.ToString());
            return true;
        }

        public async Task<bool> UnblockUsuarioAsync(Guid id)
        {
            var usuario = await _context.Usuarios.FindAsync(id);
            if (usuario == null) return false;

            usuario.Ativo = true;
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> DeleteUsuarioAsync(Guid id)
        {
            var usuario = await _context.Usuarios.FindAsync(id);
            if (usuario == null) return false;

            _context.Usuarios.Remove(usuario);
            await _context.SaveChangesAsync();
            await _authService.DeleteUserAsync(id.ToString());
            return true;
        }

        private static UsuarioDto MapToDto(Usuario u) => new()
        {
            Id = u.Id,
            Nome = u.Nome,
            Sobrenome = u.Sobrenome,
            Email = u.Email,
            Telefone = u.Telefone,
            VeiculoMarca = u.VeiculoMarca,
            VeiculoModelo = u.VeiculoModelo,
            VeiculoPlaca = u.VeiculoPlaca,
            Role = u.Role,
            Ativo = u.Ativo,
            CreatedAt = u.CreatedAt
        };
    }
}