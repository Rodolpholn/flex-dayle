using backend.Data;
using backend.Models;
using backend.Models.DTOs;
using backend.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly ISupabaseAuthService _authService;
        private readonly AppDbContext _context;

        public AuthController(ISupabaseAuthService authService, AppDbContext context)
        {
            _authService = authService;
            _context = context;
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] RegisterDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var existingUser = await _context.Usuarios.FirstOrDefaultAsync(u => u.Email == dto.Email);
            if (existingUser != null)
                return Conflict(new { message = "Email já cadastrado." });

            var result = await _authService.RegisterAsync(dto);
            if (result == null)
                return BadRequest(new { message = "Erro ao criar conta. Verifique os dados e tente novamente." });

            return Ok(new { message = "Conta criada com sucesso! Verifique seu email para confirmar o cadastro.", token = result.AccessToken });
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var result = await _authService.LoginAsync(dto);
            if (result == null)
                return Unauthorized(new { message = "Email ou senha inválidos." });

            // Buscar dados do usuário
            var usuario = await _context.Usuarios.FirstOrDefaultAsync(u => u.Email == dto.Email);
            if (usuario == null)
                return Unauthorized(new { message = "Usuário não encontrado." });

            if (!usuario.Ativo)
                return Unauthorized(new { message = "Conta bloqueada. Entre em contato com o suporte." });

            result.Usuario = new UsuarioDto
            {
                Id = usuario.Id,
                Nome = usuario.Nome,
                Sobrenome = usuario.Sobrenome,
                Email = usuario.Email,
                Telefone = usuario.Telefone,
                VeiculoMarca = usuario.VeiculoMarca,
                VeiculoModelo = usuario.VeiculoModelo,
                VeiculoPlaca = usuario.VeiculoPlaca,
                Role = usuario.Role,
                Ativo = usuario.Ativo,
                CreatedAt = usuario.CreatedAt
            };

            return Ok(result);
        }

        [HttpGet("me")]
        [Authorize]
        public async Task<IActionResult> GetMe()
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value
                      ?? User.FindFirst("sub")?.Value;

            if (string.IsNullOrEmpty(userId))
                return Unauthorized();

            var usuario = await _context.Usuarios.FindAsync(Guid.Parse(userId));
            if (usuario == null)
                return NotFound(new { message = "Usuário não encontrado." });

            return Ok(new UsuarioDto
            {
                Id = usuario.Id,
                Nome = usuario.Nome,
                Sobrenome = usuario.Sobrenome,
                Email = usuario.Email,
                Telefone = usuario.Telefone,
                VeiculoMarca = usuario.VeiculoMarca,
                VeiculoModelo = usuario.VeiculoModelo,
                VeiculoPlaca = usuario.VeiculoPlaca,
                Role = usuario.Role,
                Ativo = usuario.Ativo,
                CreatedAt = usuario.CreatedAt
            });
        }

        [HttpPut("perfil")]
        [Authorize]
        public async Task<IActionResult> UpdatePerfil([FromBody] UpdatePerfilDto dto)
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value
                      ?? User.FindFirst("sub")?.Value;

            if (string.IsNullOrEmpty(userId))
                return Unauthorized();

            var usuario = await _context.Usuarios.FindAsync(Guid.Parse(userId));
            if (usuario == null)
                return NotFound();

            if (!string.IsNullOrEmpty(dto.Nome)) usuario.Nome = dto.Nome;
            if (!string.IsNullOrEmpty(dto.Sobrenome)) usuario.Sobrenome = dto.Sobrenome;
            if (dto.Telefone != null) usuario.Telefone = dto.Telefone;
            if (dto.VeiculoMarca != null) usuario.VeiculoMarca = dto.VeiculoMarca;
            if (dto.VeiculoModelo != null) usuario.VeiculoModelo = dto.VeiculoModelo;
            if (dto.VeiculoPlaca != null) usuario.VeiculoPlaca = dto.VeiculoPlaca;

            await _context.SaveChangesAsync();

            return Ok(new UsuarioDto
            {
                Id = usuario.Id,
                Nome = usuario.Nome,
                Sobrenome = usuario.Sobrenome,
                Email = usuario.Email,
                Telefone = usuario.Telefone,
                VeiculoMarca = usuario.VeiculoMarca,
                VeiculoModelo = usuario.VeiculoModelo,
                VeiculoPlaca = usuario.VeiculoPlaca,
                Role = usuario.Role,
                Ativo = usuario.Ativo,
                CreatedAt = usuario.CreatedAt
            });
        }

        [HttpPost("change-password")]
        [Authorize]
        public async Task<IActionResult> ChangePassword([FromBody] ChangePasswordDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var token = Request.Headers["Authorization"].ToString().Replace("Bearer ", "");
            var success = await _authService.ChangePasswordAsync(token, dto.NovaSenha);

            if (!success)
                return BadRequest(new { message = "Erro ao alterar senha." });

            return Ok(new { message = "Senha alterada com sucesso." });
        }

        [HttpPost("reset-password")]
        public async Task<IActionResult> ResetPassword([FromBody] ResetPasswordRequestDto dto)
        {
            var success = await _authService.SendPasswordResetAsync(dto.Email);
            return Ok(new { message = "Se o email existir, um link de recuperação será enviado." });
        }
    }

    public class ResetPasswordRequestDto
    {
        public string Email { get; set; } = string.Empty;
    }
}
