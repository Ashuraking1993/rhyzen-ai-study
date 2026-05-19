using Microsoft.AspNetCore.Mvc;
using Npgsql;
using BCrypt.Net;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly IConfiguration _config;
        private readonly string _connString;
        private readonly string _jwtSecret = "RhyzenAISecretKey2026SuperSecret!";

        public AuthController(IConfiguration config)
        {
            _config = config;
            _connString = config.GetConnectionString("NeonDb")!;
        }

      [HttpPost("register")]
public async Task<IActionResult> Register([FromBody] AuthRequest req)
{
    try
    {
        var hash = BCrypt.Net.BCrypt.HashPassword(req.Password);
        await using var conn = new NpgsqlConnection(_connString);
        await conn.OpenAsync();

        await using var cmd = new NpgsqlCommand(
            "INSERT INTO users (email, password_hash, name) VALUES (@email, @hash, @name)",
            conn);
        cmd.Parameters.AddWithValue("email", req.Email);
        cmd.Parameters.AddWithValue("hash", hash);
        cmd.Parameters.AddWithValue("name", req.Name ?? "Operator");
        await cmd.ExecuteNonQueryAsync();

        return Ok(new { message = "Registration successful!" }); // ← ito lang
    }
    catch (Exception ex)
    {
        if (ex.Message.Contains("duplicate"))
            return BadRequest(new { message = "Email already exists!" });
        return BadRequest(new { message = ex.Message });
    }
}

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] AuthRequest req)
        {
            try
            {
                await using var conn = new NpgsqlConnection(_connString);
                await conn.OpenAsync();

                await using var cmd = new NpgsqlCommand(
                    "SELECT id, email, password_hash, name FROM users WHERE email = @email",
                    conn);
                cmd.Parameters.AddWithValue("email", req.Email);

                await using var reader = await cmd.ExecuteReaderAsync();
                if (!await reader.ReadAsync())
                    return Unauthorized(new { message = "Invalid email or password!" });

                var id = reader.GetInt32(0);
                var email = reader.GetString(1);
                var hash = reader.GetString(2);
                var name = reader.GetString(3);

                if (!BCrypt.Net.BCrypt.Verify(req.Password, hash))
                    return Unauthorized(new { message = "Invalid email or password!" });

                var token = GenerateJWT(id, email, name);
                return Ok(new { token, name, email, userId = id });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        private string GenerateJWT(int id, string email, string name)
        {
            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_jwtSecret));
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);
            var claims = new[]
            {
                new Claim("id", id.ToString()),
                new Claim("email", email),
                new Claim("name", name),
            };
            var token = new JwtSecurityToken(
                claims: claims,
                expires: DateTime.UtcNow.AddDays(7),
                signingCredentials: creds
            );
            return new JwtSecurityTokenHandler().WriteToken(token);
        }
    }

    public class AuthRequest
    {
        public string Email { get; set; } = "";
        public string Password { get; set; } = "";
        public string? Name { get; set; }
    }
}