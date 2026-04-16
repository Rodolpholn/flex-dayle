using backend.Models.DTOs;
using backend.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize(Policy = "AdminOnly")]
    public class AdminController : ControllerBase
    {
        private readonly IAdminService _adminService;
        private readonly ISupabaseAuthService _authService;

        public AdminController(IAdminService adminService, ISupabaseAuthService authService)
        {
            _adminService = adminService;
            _authService = authService;
        }

        [HttpGet("dashboard")]
        public async Task<IActionResult> GetDashboard()
        {
            var dashboard = await _adminService.GetAdminDashboardAsync();
            return Ok(dashboard);
        }

        [HttpGet("usuarios")]
        public async Task<IActionResult> GetUsuarios([FromQuery] string? search)
        {
            var usuarios = await _adminService.GetAllUsuariosAsync(search);
            return Ok(usuarios);
        }

        [HttpGet("usuarios/{id}")]
        public async Task<IActionResult> GetUsuario(Guid id)
        {
            var usuario = await _adminService.GetUsuarioByIdAsync(id);
            if (usuario == null) return NotFound();
            return Ok(usuario);
        }

        [HttpPut("usuarios/{id}/bloquear")]
        public async Task<IActionResult> BlockUsuario(Guid id)
        {
            var success = await _adminService.BlockUsuarioAsync(id);
            if (!success) return NotFound();
            return Ok(new { message = "Usuário bloqueado com sucesso." });
        }

        [HttpPut("usuarios/{id}/desbloquear")]
        public async Task<IActionResult> UnblockUsuario(Guid id)
        {
            var success = await _adminService.UnblockUsuarioAsync(id);
            if (!success) return NotFound();
            return Ok(new { message = "Usuário desbloqueado com sucesso." });
        }

        [HttpDelete("usuarios/{id}")]
        public async Task<IActionResult> DeleteUsuario(Guid id)
        {
            var success = await _adminService.DeleteUsuarioAsync(id);
            if (!success) return NotFound();
            return Ok(new { message = "Usuário removido com sucesso." });
        }

        [HttpPost("usuarios/{id}/reset-senha")]
        public async Task<IActionResult> ResetSenha(Guid id)
        {
            var usuario = await _adminService.GetUsuarioByIdAsync(id);
            if (usuario == null) return NotFound();

            var success = await _authService.SendPasswordResetAsync(usuario.Email);
            if (!success) return BadRequest(new { message = "Erro ao enviar email de recuperação." });

            return Ok(new { message = "Email de recuperação enviado com sucesso." });
        }
    }
}
