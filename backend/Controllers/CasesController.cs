using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using backend_dotnet.Data;
using backend_dotnet.DTOs;
using backend_dotnet.Models;

namespace backend_dotnet.Controllers
{
    [ApiController]
    [Route("api/cases")]
    [Authorize]
    public class CasesController : ControllerBase
    {
        private readonly CaseVaultContext _context;

        public CasesController(CaseVaultContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<CaseDto>>> GetCases(
            [FromQuery] string? status = null,
            [FromQuery] int? clientId = null,
            [FromQuery] string? lawyerAssigned = null)
        {
            var query = _context.Cases.AsQueryable();

            if (!string.IsNullOrEmpty(status))
                query = query.Where(c => c.Status == status);

            if (clientId.HasValue)
                query = query.Where(c => c.ClientId == clientId.Value);

            if (!string.IsNullOrEmpty(lawyerAssigned))
                query = query.Where(c => c.LawyerAssigned == lawyerAssigned);

            var cases = await query
                .Select(c => new CaseDto
                {
                    CaseId = c.CaseId,
                    ClientId = c.ClientId,
                    CaseTitle = c.CaseTitle,
                    CaseType = c.CaseType,
                    Status = c.Status,
                    Description = c.Description,
                    Priority = c.Priority,
                    EstimatedValue = c.EstimatedValue,
                    StartDate = c.StartDate,
                    EndDate = c.EndDate,
                    LawyerAssigned = c.LawyerAssigned,
                    CreatedAt = c.CreatedAt,
                    UpdatedAt = c.UpdatedAt
                })
                .ToListAsync();

            return Ok(cases);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<CaseDto>> GetCase(int id)
        {
            var @case = await _context.Cases.FindAsync(id);

            if (@case == null)
            {
                return NotFound();
            }

            var caseDto = new CaseDto
            {
                CaseId = @case.CaseId,
                ClientId = @case.ClientId,
                CaseTitle = @case.CaseTitle,
                CaseType = @case.CaseType,
                Status = @case.Status,
                Description = @case.Description,
                Priority = @case.Priority,
                EstimatedValue = @case.EstimatedValue,
                StartDate = @case.StartDate,
                EndDate = @case.EndDate,
                LawyerAssigned = @case.LawyerAssigned,
                CreatedAt = @case.CreatedAt,
                UpdatedAt = @case.UpdatedAt
            };

            return Ok(caseDto);
        }

        [HttpPost]
        public async Task<ActionResult<CaseDto>> CreateCase([FromBody] CreateCaseRequest request)
        {
            var @case = new Case
            {
                ClientId = request.ClientId,
                CaseTitle = request.CaseTitle,
                CaseType = request.CaseType,
                Status = request.Status,
                Description = request.Description,
                Priority = request.Priority,
                EstimatedValue = request.EstimatedValue,
                StartDate = request.StartDate,
                EndDate = request.EndDate,
                LawyerAssigned = request.LawyerAssigned
            };

            _context.Cases.Add(@case);
            await _context.SaveChangesAsync();

            var caseDto = new CaseDto
            {
                CaseId = @case.CaseId,
                ClientId = @case.ClientId,
                CaseTitle = @case.CaseTitle,
                CaseType = @case.CaseType,
                Status = @case.Status,
                Description = @case.Description,
                Priority = @case.Priority,
                EstimatedValue = @case.EstimatedValue,
                StartDate = @case.StartDate,
                EndDate = @case.EndDate,
                LawyerAssigned = @case.LawyerAssigned,
                CreatedAt = @case.CreatedAt,
                UpdatedAt = @case.UpdatedAt
            };

            return CreatedAtAction(nameof(GetCase), new { id = @case.CaseId }, caseDto);
        }

        [HttpPut("{id}")]
        public async Task<ActionResult<CaseDto>> UpdateCase(int id, [FromBody] UpdateCaseRequest request)
        {
            var @case = await _context.Cases.FindAsync(id);

            if (@case == null)
            {
                return NotFound();
            }

            if (!string.IsNullOrEmpty(request.CaseTitle)) @case.CaseTitle = request.CaseTitle;
            if (request.CaseType != null) @case.CaseType = request.CaseType;
            if (!string.IsNullOrEmpty(request.Status)) @case.Status = request.Status;
            if (request.Description != null) @case.Description = request.Description;
            if (!string.IsNullOrEmpty(request.Priority)) @case.Priority = request.Priority;
            if (request.EstimatedValue.HasValue) @case.EstimatedValue = request.EstimatedValue;
            if (request.StartDate.HasValue) @case.StartDate = request.StartDate;
            if (request.EndDate.HasValue) @case.EndDate = request.EndDate;
            if (request.LawyerAssigned != null) @case.LawyerAssigned = request.LawyerAssigned;

            await _context.SaveChangesAsync();

            var caseDto = new CaseDto
            {
                CaseId = @case.CaseId,
                ClientId = @case.ClientId,
                CaseTitle = @case.CaseTitle,
                CaseType = @case.CaseType,
                Status = @case.Status,
                Description = @case.Description,
                Priority = @case.Priority,
                EstimatedValue = @case.EstimatedValue,
                StartDate = @case.StartDate,
                EndDate = @case.EndDate,
                LawyerAssigned = @case.LawyerAssigned,
                CreatedAt = @case.CreatedAt,
                UpdatedAt = @case.UpdatedAt
            };

            return Ok(caseDto);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteCase(int id)
        {
            var @case = await _context.Cases.FindAsync(id);

            if (@case == null)
            {
                return NotFound();
            }

            _context.Cases.Remove(@case);
            await _context.SaveChangesAsync();

            return NoContent();
        }
    }
}
