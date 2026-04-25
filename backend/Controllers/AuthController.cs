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

            try
            {
                // Verifica se o banco de dados está acessível e se o usuário já existe
                var existingUser = await _context.Usuarios.FirstOrDefaultAsync(u => u.Email == dto.Email);
                if (existingUser != null)
                    return Conflict(new { message = "Email já cadastrado no banco de dados local." });

                // Tenta o registro no serviço de autenticação do Supabase
                var result = await _authService.RegisterAsync(dto);
                if (result == null)
                    return BadRequest(new { message = "Erro ao criar conta no serviço de autenticação. Verifique se o e-mail é válido." });

                // --- INICIO DA ATUALIZAÇÃO: GRAVAÇÃO NO BANCO LOCAL ---
                var novoUsuario = new Usuario
                {
                    Id = Guid.NewGuid(),
                    Nome = dto.Nome,
                    Sobrenome = dto.Sobrenome,
                    Email = dto.Email,
                    Telefone = dto.Telefone,
                    Role = dto.Role ?? "driver", // Define driver como padrão se vier nulo
                    Ativo = true,
                    CreatedAt = DateTime.UtcNow
                };

                _context.Usuarios.Add(novoUsuario);
                await _context.SaveChangesAsync();
                // --- FIM DA ATUALIZAÇÃO ---

                return Ok(new { message = "Conta criada com sucesso!", token = result.AccessToken });
            }
            catch (Exception ex)
            {
                // Retorna o erro detalhado para facilitar o debug
                return StatusCode(500, new 
                { 
                    message = "Erro interno ao processar o registro.", 
                    error = ex.Message, 
                    innerError = ex.InnerException?.Message 
                });
            }
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            try
            {
                var result = await _authService.LoginAsync(dto);
                if (result == null)
                    return Unauthorized(new { message = "Email ou senha inválidos no Supabase Auth." });

                // Buscar dados do usuário no banco local
                var usuario = await _context.Usuarios.FirstOrDefaultAsync(u => u.Email == dto.Email);
                if (usuario == null)
                    return Unauthorized(new { message = "Usuário autenticado, mas não encontrado no banco de dados local." });

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
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Erro interno ao processar o login.", error = ex.Message });
            }
        }

        [HttpGet("me")]
        [Authorize]
        public async Task<IActionResult> GetMe()
        {
            try
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
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Erro ao buscar dados do perfil.", error = ex.Message });
            }
        }

        [HttpPut("perfil")]
        [Authorize]
        public async Task<IActionResult> UpdatePerfil([FromBody] UpdatePerfilDto dto)
        {
            try
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
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Erro ao atualizar perfil.", error = ex.Message });
            }
        }

        [HttpPost("change-password")]
        [Authorize]
        public async Task<IActionResult> ChangePassword([FromBody] ChangePasswordDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            try
            {
                var token = Request.Headers["Authorization"].ToString().Replace("Bearer ", "");
                var success = await _authService.ChangePasswordAsync(token, dto.NovaSenha);

                if (!success)
                    return BadRequest(new { message = "Erro ao alterar senha no Supabase." });

                return Ok(new { message = "Senha alterada com sucesso." });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Erro ao processar alteração de senha.", error = ex.Message });
            }
        }

        [HttpPost("reset-password")]
        public async Task<IActionResult> ResetPassword([FromBody] ResetPasswordRequestDto dto)
        {
            try
            {
                var success = await _authService.SendPasswordResetAsync(dto.Email);
                return Ok(new { message = "Se o email existir, um link de recuperação será enviado." });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Erro ao processar solicitação de recuperação.", error = ex.Message });
            }
        }
    }

    public class ResetPasswordRequestDto
    {
        public string Email { get; set; } = string.Empty;
    }
}