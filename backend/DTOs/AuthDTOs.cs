namespace backend_dotnet.DTOs
{
    public class LoginRequest
    {
        public string Username { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
    }

    public class LoginResponse
    {
        public string Access { get; set; } = string.Empty;
        public string Refresh { get; set; } = string.Empty;
    }

    public class RefreshRequest
    {
        public string Refresh { get; set; } = string.Empty;
    }

    public class RefreshResponse
    {
        public string Access { get; set; } = string.Empty;
    }
}
