using Ocelot.DependencyInjection;
using Ocelot.Middleware;

var builder = WebApplication.CreateBuilder(args);

//??c file c?u hình ocelot.json
builder.Configuration.AddJsonFile("ocelot.json", optional: false, reloadOnChange: true);

//Thêm các service c?n thi?t
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

//Thêm c?u hình CORS cho Gateway
builder.Services.AddCors(options =>
{
    // ??i tên Policy cho chu?n ý ngh?a luôn
    options.AddPolicy("AllowReactApp", policy =>
    {
        policy
            .WithOrigins(
                "http://localhost:3000",
                "http://127.0.0.1:5500",
                "http://localhost:5500",
                "https://localhost:5500"
            )
            .AllowAnyHeader()
            .AllowAnyMethod()
            .AllowCredentials();
    });
});

// Thêm Ocelot
builder.Services.AddOcelot(builder.Configuration);

var app = builder.Build();

// C?u hình pipeline
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

// CORS ph?i ??t tr??c Ocelot
app.UseCors("AllowReactApp");

app.UseAuthorization();

//Ocelot Middleware (b?t bu?c ph?i có "await")
await app.UseOcelot();

app.Run();