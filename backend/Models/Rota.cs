using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace backend.Models
{
    [Table("rotas")]
    public class Rota
    {
        [Key]
        [Column("id")]
        public Guid Id { get; set; } = Guid.NewGuid();

        [Column("user_id")]
        [Required]
        public Guid UserId { get; set; }

        [Column("data_rota")]
        [Required]
        public DateOnly DataRota { get; set; }

        [Column("valor_bruto")]
        public decimal ValorBruto { get; set; } = 0;

        [Column("km_rodado")]
        public decimal KmRodado { get; set; } = 0;

        [Column("litros_abastecidos")]
        public decimal? LitrosAbastecidos { get; set; }

        [Column("valor_abastecimento")]
        public decimal? ValorAbastecimento { get; set; }

        [Column("consumo_medio_veiculo")]
        public decimal ConsumioMedioVeiculo { get; set; } = 10;

        [Column("created_at")]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        [ForeignKey("UserId")]
        public Usuario? Usuario { get; set; }
    }
}
