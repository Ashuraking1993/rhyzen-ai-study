using Microsoft.AspNetCore.Mvc;
using System.Text;
using System.Text.Json;
using Npgsql;

namespace backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AiController : ControllerBase
    {
        private readonly IConfiguration _config;
        private readonly HttpClient _http;
        private readonly string _connString;

       public AiController(IConfiguration config)
            {
                _config = config;
                _http = new HttpClient();
                _http.Timeout = TimeSpan.FromSeconds(300); // ← 5 minutes
                _connString = config.GetConnectionString("NeonDb")!;
            }

        [HttpPost("generate")]
        public async Task<IActionResult> Generate([FromBody] GenerateRequest request)
        {
            var apiKey = Environment.GetEnvironmentVariable("GROQ_API_KEY");
            var url = "https://api.groq.com/openai/v1/chat/completions";

            var prompt = request.Type switch
{
    "Flashcards" => $"Generate exactly 5 flashcards from these notes. Return ONLY a valid JSON array, no markdown, no explanation, no extra text. Format:\n[{{\"question\":\"...\",\"answer\":\"...\"}}]\n\nNotes:\n{request.Notes}",

    "Quiz" => $"Generate exactly 5 quiz questions from these notes with MIXED types. Return ONLY a valid JSON array, no markdown, no explanation, no extra text. Format:\n[{{\"type\":\"multiple\",\"question\":\"...\",\"choices\":[\"A\",\"B\",\"C\",\"D\"],\"answer\":\"A\"}},{{\"type\":\"single\",\"question\":\"...\",\"choices\":[\"True\",\"False\"],\"answer\":\"True\"}},{{\"type\":\"identify\",\"question\":\"...\",\"answer\":\"...\"}}]\n\nNotes:\n{request.Notes}",

    "Summary" => $"Summarize these notes in a clear and concise way, use bullet points:\n\n{request.Notes}",

    _ => throw new Exception("Invalid type")
};
           var body = new
                {
                    model = "llama-3.3-70b-versatile",
                    messages = new[]
                    {
                        new { role = "user", content = prompt }
                    },
                    max_tokens = 1024
                };

            var json = JsonSerializer.Serialize(body);
            var content = new StringContent(json, Encoding.UTF8, "application/json");

            _http.DefaultRequestHeaders.Clear();
            _http.DefaultRequestHeaders.Add("Authorization", $"Bearer {apiKey}");

            var response = await _http.PostAsync(url, content);
            var result = await response.Content.ReadAsStringAsync();

            try
            {
                using var doc = JsonDocument.Parse(result);
                var text = doc.RootElement
                    .GetProperty("choices")[0]
                    .GetProperty("message")
                    .GetProperty("content")
                    .GetString();

                // Save session sa DB
                if (request.UserId > 0)
                {
                    await using var conn = new NpgsqlConnection(_connString);
                    await conn.OpenAsync();
                    await using var cmd = new NpgsqlCommand(
                        "INSERT INTO sessions (user_id, title, type) VALUES (@uid, @title, @type)",
                        conn);
                    cmd.Parameters.AddWithValue("uid", request.UserId);
                    cmd.Parameters.AddWithValue("title", request.Notes.Length > 30
                        ? request.Notes[..30] + "..."
                        : request.Notes);
                    cmd.Parameters.AddWithValue("type", request.Type);
                    await cmd.ExecuteNonQueryAsync();
                }

                return Ok(new { result = text, type = request.Type });
            }
            catch
            {
                return Ok(new { result = result, type = request.Type });
            }
        }

        [HttpGet("sessions/{userId}")]
        public async Task<IActionResult> GetSessions(int userId)
        {
            try
            {
                await using var conn = new NpgsqlConnection(_connString);
                await conn.OpenAsync();
                await using var cmd = new NpgsqlCommand(
                    "SELECT id, title, type, created_at FROM sessions WHERE user_id = @uid ORDER BY created_at DESC LIMIT 20",
                    conn);
                cmd.Parameters.AddWithValue("uid", userId);

                var sessions = new List<object>();
                await using var reader = await cmd.ExecuteReaderAsync();
                while (await reader.ReadAsync())
                {
                    sessions.Add(new
                    {
                        id = reader.GetInt32(0),
                        title = reader.GetString(1),
                        type = reader.GetString(2),
                        date = reader.GetDateTime(3).ToString("MMM dd, yyyy")
                    });
                }
                return Ok(sessions);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }
    }

    public class GenerateRequest
    {
        public string Notes { get; set; } = "";
        public string Type { get; set; } = "";
        public int UserId { get; set; } = 0;
    }
}