using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;

var builder = WebApplication.CreateBuilder(args);

const string PermissiveDevCors = "PermissiveDevCors";
builder.Services.AddCors(options =>
{
    options.AddPolicy(PermissiveDevCors, policy =>
        policy
            .SetIsOriginAllowed(origin => true)
            .AllowAnyHeader()
            .AllowAnyMethod()
            .AllowCredentials()
    //if use cookies
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

app.UseCors(PermissiveDevCors);

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

        ctx.Response.StatusCode = StatusCodes.Status204NoContent;
        return;
    }
    await next();
});

app.UseCors(PermissiveDevCors);

app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();
app.Run();
