using backend_dotnet.Data;
using backend_dotnet.Models;
using System.Security.Cryptography;
using System.Text;

namespace backend_dotnet
{
    public static class SeedData
    {
        public static void Initialize(CaseVaultContext context)
        {
            if (context.Users.Any())
            {
                return; // DB has been seeded
            }

            // Create admin user
            var adminUser = new User
            {
                Email = "admin@nmmlaw.com",
                PasswordHash = HashPassword("admin123"),
                FirstName = "Admin",
                LastName = "User",
                Role = "admin",
                IsActive = true
            };

            // Create test user
            var testUser = new User
            {
                Email = "test@example.com",
                PasswordHash = HashPassword("testpass123"),
                FirstName = "Test",
                LastName = "User",
                Role = "lawyer",
                IsActive = true
            };

            context.Users.AddRange(adminUser, testUser);
            context.SaveChanges();
        }

        private static string HashPassword(string password)
        {
            using var sha256 = SHA256.Create();
            var hashedBytes = sha256.ComputeHash(Encoding.UTF8.GetBytes(password));
            return Convert.ToBase64String(hashedBytes);
        }
    }
}
