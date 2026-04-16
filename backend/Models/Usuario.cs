using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace backend.Models
{
    [Table("usuarios")]
    public class Usuario
    {
        [Key]
        [Column("id")]
        public Guid Id { get; set; }

        [Column("nome")]
        [Required]
        public string Nome { get; set; } = string.Empty;

        [Column("sobrenome")]
        [Required]
        public string Sobrenome { get; set; } = string.Empty;

        [Column("email")]
        [Required]
        public string Email { get; set; } = string.Empty;

        [Column("telefone")]
        public string? Telefone { get; set; }

        [Column("veiculo_marca")]
        public string? VeiculoMarca { get; set; }

        [Column("veiculo_modelo")]
        public string? VeiculoModelo { get; set; }

        [Column("veiculo_placa")]
        public string? VeiculoPlaca { get; set; }

        [Column("role")]
        public string Role { get; set; } = "user";

        [Column("ativo")]
        public bool Ativo { get; set; } = true;

        [Column("created_at")]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public ICollection<Rota> Rotas { get; set; } = new List<Rota>();
    }
}
