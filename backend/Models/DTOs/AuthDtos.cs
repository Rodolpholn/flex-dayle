using System.ComponentModel.DataAnnotations;

namespace backend.Models.DTOs
{
    public class RegisterDto
    {
        [Required]
        public string Nome { get; set; } = string.Empty;

        [Required]
        public string Sobrenome { get; set; } = string.Empty;

        [Required]
        [EmailAddress]
        public string Email { get; set; } = string.Empty;

        [Required]
        [MinLength(6)]
        public string Senha { get; set; } = string.Empty;

        public string? Telefone { get; set; }
    }

    public class LoginDto
    {
        [Required]
        [EmailAddress]
        public string Email { get; set; } = string.Empty;

        [Required]
        public string Senha { get; set; } = string.Empty;
    }

    public class AuthResponseDto
    {
        public string AccessToken { get; set; } = string.Empty;
        public string RefreshToken { get; set; } = string.Empty;
        public UsuarioDto? Usuario { get; set; }
    }

    public class UsuarioDto
    {
        public Guid Id { get; set; }
        public string Nome { get; set; } = string.Empty;
        public string Sobrenome { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string? Telefone { get; set; }
        public string? VeiculoMarca { get; set; }
        public string? VeiculoModelo { get; set; }
        public string? VeiculoPlaca { get; set; }
        public string Role { get; set; } = "user";
        public bool Ativo { get; set; }
        public DateTime CreatedAt { get; set; }
    }

    public class UpdatePerfilDto
    {
        public string? Nome { get; set; }
        public string? Sobrenome { get; set; }
        public string? Telefone { get; set; }
        public string? VeiculoMarca { get; set; }
        public string? VeiculoModelo { get; set; }
        public string? VeiculoPlaca { get; set; }
    }

    public class ChangePasswordDto
    {
        [Required]
        [MinLength(6)]
        public string NovaSenha { get; set; } = string.Empty;
    }
}
