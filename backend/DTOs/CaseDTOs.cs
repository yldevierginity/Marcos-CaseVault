namespace backend_dotnet.DTOs
{
    public class CaseDto
    {
        public int CaseId { get; set; }
        public int ClientId { get; set; }
        public string CaseTitle { get; set; } = string.Empty;
        public string? CaseType { get; set; }
        public string Status { get; set; } = string.Empty;
        public string? Description { get; set; }
        public string Priority { get; set; } = string.Empty;
        public decimal? EstimatedValue { get; set; }
        public DateTime? StartDate { get; set; }
        public DateTime? EndDate { get; set; }
        public string? LawyerAssigned { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
    }

    public class CreateCaseRequest
    {
        public int ClientId { get; set; }
        public string CaseTitle { get; set; } = string.Empty;
        public string? CaseType { get; set; }
        public string Status { get; set; } = "active";
        public string? Description { get; set; }
        public string Priority { get; set; } = "medium";
        public decimal? EstimatedValue { get; set; }
        public DateTime? StartDate { get; set; }
        public DateTime? EndDate { get; set; }
        public string? LawyerAssigned { get; set; }
    }

    public class UpdateCaseRequest
    {
        public string? CaseTitle { get; set; }
        public string? CaseType { get; set; }
        public string? Status { get; set; }
        public string? Description { get; set; }
        public string? Priority { get; set; }
        public decimal? EstimatedValue { get; set; }
        public DateTime? StartDate { get; set; }
        public DateTime? EndDate { get; set; }
        public string? LawyerAssigned { get; set; }
    }
}
