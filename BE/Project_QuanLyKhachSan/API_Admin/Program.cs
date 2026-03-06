using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;

var builder = WebApplication.CreateBuilder(args);

// ============ CORS DEV: ch?p m?i origin (k? c? 'null') ============
const string PermissiveDevCors = "PermissiveDevCors";
builder.Services.AddCors(options =>
{
    options.AddPolicy(PermissiveDevCors, policy =>
        policy
            // CH?P M?I ORIGIN (k? c? 'null' khi m? file://)
            .SetIsOriginAllowed(origin => true)
            .AllowAnyHeader()
            .AllowAnyMethod()
    // N?u b?n dùng cookie/session (withCredentials) thì m? dòng d??i:
    // .AllowCredentials()
    );
});

// ============ Controllers / Swagger ============
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// ============ JWT ============
var jwt = builder.Configuration.GetSection("Jwt");
var key = Encoding.UTF8.GetBytes(jwt["Key"]!);

builder.Services.AddAuthentication(o =>
{
    o.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    o.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(o =>
{
    o.RequireHttpsMetadata = false; // DEV
    o.SaveToken = true;
    o.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateIssuerSigningKey = true,
        ValidIssuer = jwt["Issuer"],
        ValidAudience = jwt["Audience"],
        IssuerSigningKey = new SymmetricSecurityKey(key)
    };
});

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

// ? CORS ph?i ??ng TR??C auth/authorization & MapControllers
app.UseCors(PermissiveDevCors);

// (Tu? ch?n) “B?o hi?m” cho preflight n?u hosting/proxy nào ?ó nu?t m?t CORS.
// Có th? b? n?u b?n ?ã th?y OPTIONS tr? ?úng header CORS.
app.Use(async (ctx, next) =>
{
    if (string.Equals(ctx.Request.Method, "OPTIONS", StringComparison.OrdinalIgnoreCase))
    {
        var origin = ctx.Request.Headers["Origin"].ToString();
        if (!string.IsNullOrEmpty(origin) || origin == "null")
        {
            ctx.Response.Headers["Access-Control-Allow-Origin"] = string.IsNullOrEmpty(origin) ? "null" : origin;
            ctx.Response.Headers["Vary"] = "Origin";
        }
        ctx.Response.Headers["Access-Control-Allow-Methods"] = "GET,POST,PUT,PATCH,DELETE,OPTIONS";
        ctx.Response.Headers["Access-Control-Allow-Headers"] = "Authorization,Content-Type,Accept";
        // N?u dùng cookie:
        // ctx.Response.Headers["Access-Control-Allow-Credentials"] = "true";
        ctx.Response.StatusCode = StatusCodes.Status204NoContent;
        return;
    }
    await next();
});

app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();
app.Run();
