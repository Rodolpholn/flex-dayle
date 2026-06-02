using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace backend.Models.DTOs
{
    public class RelatorioResumoDto
    {
        public decimal FaturamentoBruto { get; set; }
        public decimal LucroLiquido { get; set; }
        public decimal GastoCombustivel { get; set; }
        public decimal KmTotalRodado { get; set; }
    }
}