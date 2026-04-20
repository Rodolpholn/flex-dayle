using backend.Models.DTOs;
using backend.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class RotasController : ControllerBase
    {
        private readonly IRotaService _rotaService;

        public RotasController(IRotaService rotaService)
        {
            _rotaService = rotaService;
        }

        private Guid GetUserId()
        {
            // O Supabase coloca o ID no claim 'sub'
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value
                              ?? User.FindFirst("sub")?.Value;

            if (string.IsNullOrEmpty(userIdClaim))
            {
                throw new UnauthorizedAccessException("ID do usuário não encontrado no token.");
            }

            // Tenta converter com segurança para Guid
            if (!Guid.TryParse(userIdClaim, out Guid userGuid))
            {
                throw new UnauthorizedAccessException("Formato de ID de usuário inválido.");
            }

            return userGuid;
        }

        [HttpGet]
        public async Task<IActionResult> GetRotas([FromQuery] int? mes, [FromQuery] int? ano)
        {
            try {
                var userId = GetUserId();
                var rotas = await _rotaService.GetRotasByUserAsync(userId, mes, ano);
                return Ok(rotas);
            } catch (UnauthorizedAccessException) {
                return Unauthorized();
            }
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetRota(Guid id)
        {
            try {
                var userId = GetUserId();
                var rota = await _rotaService.GetRotaByIdAsync(id, userId);
                if (rota == null) return NotFound();
                return Ok(rota);
            } catch (UnauthorizedAccessException) {
                return Unauthorized();
            }
        }

        [HttpPost]
        public async Task<IActionResult> CreateRota([FromBody] CreateRotaDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            try {
                var userId = GetUserId();
                var rota = await _rotaService.CreateRotaAsync(userId, dto);
                return CreatedAtAction(nameof(GetRota), new { id = rota.Id }, rota);
            } catch (UnauthorizedAccessException) {
                return Unauthorized();
            }
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateRota(Guid id, [FromBody] UpdateRotaDto dto)
        {
            try {
                var userId = GetUserId();
                var rota = await _rotaService.UpdateRotaAsync(id, userId, dto);
                if (rota == null) return NotFound();
                return Ok(rota);
            } catch (UnauthorizedAccessException) {
                return Unauthorized();
            }
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteRota(Guid id)
        {
            try {
                var userId = GetUserId();
                var success = await _rotaService.DeleteRotaAsync(id, userId);
                if (!success) return NotFound();
                return NoContent();
            } catch (UnauthorizedAccessException) {
                return Unauthorized();
            }
        }

        [HttpGet("dashboard")]
        public async Task<IActionResult> GetDashboard([FromQuery] int? mes, [FromQuery] int? ano)
        {
            try {
                var userId = GetUserId();
                var dashboard = await _rotaService.GetDashboardAsync(userId, mes, ano);
                return Ok(dashboard);
            } catch (UnauthorizedAccessException) {
                return Unauthorized();
            }
        }
    }
}