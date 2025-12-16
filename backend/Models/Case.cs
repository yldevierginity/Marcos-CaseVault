using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace backend_dotnet.Models
{
    public class Case
    {
        [Key]
        [Column("case_id")]
        public int CaseId { get; set; }

        [Required]
        [Column("client_id")]
        public int ClientId { get; set; }

        [Required]
        [MaxLength(255)]
        [Column("case_title")]
        public string CaseTitle { get; set; } = string.Empty;

        [MaxLength(100)]
        [Column("case_type")]
        public string? CaseType { get; set; }

        [Required]
        [MaxLength(50)]
        [Column("status")]
        public string Status { get; set; } = "active";

        [Column("description")]
        public string? Description { get; set; }

        [MaxLength(20)]
        [Column("priority")]
        public string Priority { get; set; } = "medium";

        [Column("estimated_value", TypeName = "decimal(15,2)")]
        public decimal? EstimatedValue { get; set; }

        [Column("start_date")]
        public DateTime? StartDate { get; set; }

        [Column("end_date")]
        public DateTime? EndDate { get; set; }

        [MaxLength(255)]
        [Column("lawyer_assigned")]
        public string? LawyerAssigned { get; set; }

        [Column("created_at")]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        [Column("updated_at")]
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

        [ForeignKey("ClientId")]
        public virtual Client Client { get; set; } = null!;
    }
}
