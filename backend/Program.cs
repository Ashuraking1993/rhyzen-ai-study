var builder = WebApplication.CreateBuilder(args);

// Add services
builder.Services.AddControllers();


// CORS para makaconnect ang React frontend
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.WithOrigins("http://localhost:5173")
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

// Gemini API Key
builder.Configuration["Gemini:ApiKey"] = "AIzaSyD7UcCYpAItRMFP7Pqq28gQK8P_EbeoMpA";

var app = builder.Build();



app.UseCors("AllowFrontend");
app.UseAuthorization();
app.MapControllers();
app.Run();