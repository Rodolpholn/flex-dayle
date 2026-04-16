using backend.Models;
using Microsoft.EntityFrameworkCore;

namespace backend.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

        public DbSet<Usuario> Usuarios { get; set; }
        public DbSet<Rota> Rotas { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            modelBuilder.Entity<Usuario>(entity =>
            {
                entity.ToTable("usuarios");
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Id).ValueGeneratedNever();
                entity.HasIndex(e => e.Email).IsUnique();
                entity.Property(e => e.Role).HasDefaultValue("user");
                entity.Property(e => e.Ativo).HasDefaultValue(true);
            });

            modelBuilder.Entity<Rota>(entity =>
            {
                entity.ToTable("rotas");
                entity.HasKey(e => e.Id);
                entity.Property(e => e.ConsumioMedioVeiculo).HasDefaultValue(10m);
                entity.HasOne(e => e.Usuario)
                      .WithMany(u => u.Rotas)
                      .HasForeignKey(e => e.UserId)
                      .OnDelete(DeleteBehavior.Cascade);
            });
        }
    }
}
