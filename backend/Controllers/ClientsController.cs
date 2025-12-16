using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using backend_dotnet.Data;
using backend_dotnet.DTOs;
using backend_dotnet.Models;

namespace backend_dotnet.Controllers
{
    [ApiController]
    [Route("api/clients")]
    [Authorize]
    public class ClientsController : ControllerBase
    {
        private readonly CaseVaultContext _context;

        public ClientsController(CaseVaultContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<ClientDto>>> GetClients()
        {
            var clients = await _context.Clients
                .Select(c => new ClientDto
                {
                    ClientId = c.ClientId,
                    FirstName = c.FirstName,
                    MiddleName = c.MiddleName,
                    LastName = c.LastName,
                    DateOfBirth = c.DateOfBirth,
                    CivilStatus = c.CivilStatus,
                    PhoneNumber = c.PhoneNumber,
                    Email = c.Email,
                    Street = c.Street,
                    City = c.City,
                    State = c.State,
                    ZipCode = c.ZipCode,
                    OpposingParties = c.OpposingParties,
                    Notes = c.Notes,
                    CreatedAt = c.CreatedAt,
                    UpdatedAt = c.UpdatedAt
                })
                .ToListAsync();

            return Ok(clients);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<ClientDto>> GetClient(int id)
        {
            var client = await _context.Clients.FindAsync(id);

            if (client == null)
            {
                return NotFound();
            }

            var clientDto = new ClientDto
            {
                ClientId = client.ClientId,
                FirstName = client.FirstName,
                MiddleName = client.MiddleName,
                LastName = client.LastName,
                DateOfBirth = client.DateOfBirth,
                CivilStatus = client.CivilStatus,
                PhoneNumber = client.PhoneNumber,
                Email = client.Email,
                Street = client.Street,
                City = client.City,
                State = client.State,
                ZipCode = client.ZipCode,
                OpposingParties = client.OpposingParties,
                Notes = client.Notes,
                CreatedAt = client.CreatedAt,
                UpdatedAt = client.UpdatedAt
            };

            return Ok(clientDto);
        }

        [HttpPost]
        public async Task<ActionResult<ClientDto>> CreateClient([FromBody] CreateClientRequest request)
        {
            var client = new Client
            {
                FirstName = request.FirstName,
                MiddleName = request.MiddleName,
                LastName = request.LastName,
                DateOfBirth = request.DateOfBirth,
                CivilStatus = request.CivilStatus,
                PhoneNumber = request.PhoneNumber,
                Email = request.Email,
                Street = request.Street,
                City = request.City,
                State = request.State,
                ZipCode = request.ZipCode,
                OpposingParties = request.OpposingParties,
                Notes = request.Notes
            };

            _context.Clients.Add(client);
            await _context.SaveChangesAsync();

            var clientDto = new ClientDto
            {
                ClientId = client.ClientId,
                FirstName = client.FirstName,
                MiddleName = client.MiddleName,
                LastName = client.LastName,
                DateOfBirth = client.DateOfBirth,
                CivilStatus = client.CivilStatus,
                PhoneNumber = client.PhoneNumber,
                Email = client.Email,
                Street = client.Street,
                City = client.City,
                State = client.State,
                ZipCode = client.ZipCode,
                OpposingParties = client.OpposingParties,
                Notes = client.Notes,
                CreatedAt = client.CreatedAt,
                UpdatedAt = client.UpdatedAt
            };

            return CreatedAtAction(nameof(GetClient), new { id = client.ClientId }, clientDto);
        }

        [HttpPut("{id}")]
        public async Task<ActionResult<ClientDto>> UpdateClient(int id, [FromBody] UpdateClientRequest request)
        {
            var client = await _context.Clients.FindAsync(id);

            if (client == null)
            {
                return NotFound();
            }

            if (!string.IsNullOrEmpty(request.FirstName)) client.FirstName = request.FirstName;
            if (request.MiddleName != null) client.MiddleName = request.MiddleName;
            if (!string.IsNullOrEmpty(request.LastName)) client.LastName = request.LastName;
            if (request.DateOfBirth.HasValue) client.DateOfBirth = request.DateOfBirth;
            if (request.CivilStatus != null) client.CivilStatus = request.CivilStatus;
            if (request.PhoneNumber != null) client.PhoneNumber = request.PhoneNumber;
            if (request.Email != null) client.Email = request.Email;
            if (request.Street != null) client.Street = request.Street;
            if (request.City != null) client.City = request.City;
            if (request.State != null) client.State = request.State;
            if (request.ZipCode != null) client.ZipCode = request.ZipCode;
            if (request.OpposingParties != null) client.OpposingParties = request.OpposingParties;
            if (request.Notes != null) client.Notes = request.Notes;

            await _context.SaveChangesAsync();

            var clientDto = new ClientDto
            {
                ClientId = client.ClientId,
                FirstName = client.FirstName,
                MiddleName = client.MiddleName,
                LastName = client.LastName,
                DateOfBirth = client.DateOfBirth,
                CivilStatus = client.CivilStatus,
                PhoneNumber = client.PhoneNumber,
                Email = client.Email,
                Street = client.Street,
                City = client.City,
                State = client.State,
                ZipCode = client.ZipCode,
                OpposingParties = client.OpposingParties,
                Notes = client.Notes,
                CreatedAt = client.CreatedAt,
                UpdatedAt = client.UpdatedAt
            };

            return Ok(clientDto);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteClient(int id)
        {
            var client = await _context.Clients.FindAsync(id);

            if (client == null)
            {
                return NotFound();
            }

            _context.Clients.Remove(client);
            await _context.SaveChangesAsync();

            return NoContent();
        }
    }
}
