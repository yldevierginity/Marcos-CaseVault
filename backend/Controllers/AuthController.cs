using Microsoft.AspNetCore.Mvc;
using backend_dotnet.DTOs;
using backend_dotnet.Services;

namespace backend_dotnet.Controllers
{
    [ApiController]
    [Route("api/token")]
    public class AuthController : ControllerBase
    {
        private readonly JwtService _jwtService;

        public AuthController(JwtService jwtService)
        {
            _jwtService = jwtService;
        }

        [HttpPost]
        public ActionResult<LoginResponse> Login([FromBody] LoginRequest request)
        {
            // Simple hardcoded authentication for demo
            // In production, validate against Django users table
            if (request.Username == "admin@nmmlaw.com" && request.Password == "admin123")
            {
                var accessToken = _jwtService.GenerateAccessToken(request.Username, "admin");
                var refreshToken = _jwtService.GenerateRefreshToken();

                return Ok(new LoginResponse
                {
                    Access = accessToken,
                    Refresh = refreshToken
                });
            }

            if (request.Username == "test@example.com" && request.Password == "testpass123")
            {
                var accessToken = _jwtService.GenerateAccessToken(request.Username, "lawyer");
                var refreshToken = _jwtService.GenerateRefreshToken();

                return Ok(new LoginResponse
                {
                    Access = accessToken,
                    Refresh = refreshToken
                });
            }

            return Unauthorized();
        }

        [HttpPost("refresh")]
        public ActionResult<RefreshResponse> Refresh([FromBody] RefreshRequest request)
        {
            // For simplicity, generate new access token
            // In production, validate refresh token properly
            var accessToken = _jwtService.GenerateAccessToken("admin@nmmlaw.com", "admin");

            return Ok(new RefreshResponse
            {
                Access = accessToken
            });
        }
    }
}
