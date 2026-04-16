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
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value
                      ?? User.FindFirst("sub")?.Value;
            return Guid.Parse(userId!);
        }

        [HttpGet]
        public async Task<IActionResult> GetRotas([FromQuery] int? mes, [FromQuery] int? ano)
        {
            var userId = GetUserId();
            var rotas = await _rotaService.GetRotasByUserAsync(userId, mes, ano);
            return Ok(rotas);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetRota(Guid id)
        {
            var userId = GetUserId();
            var rota = await _rotaService.GetRotaByIdAsync(id, userId);
            if (rota == null) return NotFound();
            return Ok(rota);
        }

        [HttpPost]
        public async Task<IActionResult> CreateRota([FromBody] CreateRotaDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var userId = GetUserId();
            var rota = await _rotaService.CreateRotaAsync(userId, dto);
            return CreatedAtAction(nameof(GetRota), new { id = rota.Id }, rota);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateRota(Guid id, [FromBody] UpdateRotaDto dto)
        {
            var userId = GetUserId();
            var rota = await _rotaService.UpdateRotaAsync(id, userId, dto);
            if (rota == null) return NotFound();
            return Ok(rota);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteRota(Guid id)
        {
            var userId = GetUserId();
            var success = await _rotaService.DeleteRotaAsync(id, userId);
            if (!success) return NotFound();
            return NoContent();
        }

        [HttpGet("dashboard")]
        public async Task<IActionResult> GetDashboard([FromQuery] int? mes, [FromQuery] int? ano)
        {
            var userId = GetUserId();
            var dashboard = await _rotaService.GetDashboardAsync(userId, mes, ano);
            return Ok(dashboard);
        }
    }
}
