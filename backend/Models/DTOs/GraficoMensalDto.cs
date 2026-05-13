using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace backend.Models.DTOs
{
    public class GraficoMensalDto
    {
        public string Mes { get; set; } = string.Empty; // Ex: "Jan", "Fev"
        public decimal Ganho { get; set; }
    }
}