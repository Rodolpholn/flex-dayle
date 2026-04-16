using backend.Models.DTOs;
using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;

namespace backend.Services
{
    public interface ISupabaseAuthService
    {
        Task<AuthResponseDto?> RegisterAsync(RegisterDto dto);
        Task<AuthResponseDto?> LoginAsync(LoginDto dto);
        Task<bool> ChangePasswordAsync(string accessToken, string novaSenha);
        Task<bool> SendPasswordResetAsync(string email);
        Task<bool> BlockUserAsync(string userId);
        Task<bool> DeleteUserAsync(string userId);
    }

    public class SupabaseAuthService : ISupabaseAuthService
    {
        private readonly HttpClient _httpClient;
        private readonly IConfiguration _config;
        private readonly string _supabaseUrl;
        private readonly string _anonKey;

        public SupabaseAuthService(HttpClient httpClient, IConfiguration config)
        {
            _httpClient = httpClient;
            _config = config;
            _supabaseUrl = config["Supabase:Url"] ?? "";
            _anonKey = config["Supabase:AnonKey"] ?? "";
        }

        public async Task<AuthResponseDto?> RegisterAsync(RegisterDto dto)
        {
            var url = $"{_supabaseUrl}/auth/v1/signup";
            var payload = new
            {
                email = dto.Email,
                password = dto.Senha,
                data = new
                {
                    nome = dto.Nome,
                    sobrenome = dto.Sobrenome,
                    telefone = dto.Telefone ?? ""
                }
            };

            var request = new HttpRequestMessage(HttpMethod.Post, url);
            request.Headers.Add("apikey", _anonKey);
            request.Content = new StringContent(JsonSerializer.Serialize(payload), Encoding.UTF8, "application/json");

            var response = await _httpClient.SendAsync(request);
            if (!response.IsSuccessStatusCode) return null;

            var content = await response.Content.ReadAsStringAsync();
            var json = JsonDocument.Parse(content).RootElement;

            return new AuthResponseDto
            {
                AccessToken = json.TryGetProperty("access_token", out var at) ? at.GetString() ?? "" : "",
                RefreshToken = json.TryGetProperty("refresh_token", out var rt) ? rt.GetString() ?? "" : ""
            };
        }

        public async Task<AuthResponseDto?> LoginAsync(LoginDto dto)
        {
            var url = $"{_supabaseUrl}/auth/v1/token?grant_type=password";
            var payload = new { email = dto.Email, password = dto.Senha };

            var request = new HttpRequestMessage(HttpMethod.Post, url);
            request.Headers.Add("apikey", _anonKey);
            request.Content = new StringContent(JsonSerializer.Serialize(payload), Encoding.UTF8, "application/json");

            var response = await _httpClient.SendAsync(request);
            if (!response.IsSuccessStatusCode) return null;

            var content = await response.Content.ReadAsStringAsync();
            var json = JsonDocument.Parse(content).RootElement;

            return new AuthResponseDto
            {
                AccessToken = json.TryGetProperty("access_token", out var at) ? at.GetString() ?? "" : "",
                RefreshToken = json.TryGetProperty("refresh_token", out var rt) ? rt.GetString() ?? "" : ""
            };
        }

        public async Task<bool> ChangePasswordAsync(string accessToken, string novaSenha)
        {
            var url = $"{_supabaseUrl}/auth/v1/user";
            var payload = new { password = novaSenha };

            var request = new HttpRequestMessage(HttpMethod.Put, url);
            request.Headers.Add("apikey", _anonKey);
            request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", accessToken);
            request.Content = new StringContent(JsonSerializer.Serialize(payload), Encoding.UTF8, "application/json");

            var response = await _httpClient.SendAsync(request);
            return response.IsSuccessStatusCode;
        }

        public async Task<bool> SendPasswordResetAsync(string email)
        {
            var url = $"{_supabaseUrl}/auth/v1/recover";
            var payload = new { email };

            var request = new HttpRequestMessage(HttpMethod.Post, url);
            request.Headers.Add("apikey", _anonKey);
            request.Content = new StringContent(JsonSerializer.Serialize(payload), Encoding.UTF8, "application/json");

            var response = await _httpClient.SendAsync(request);
            return response.IsSuccessStatusCode;
        }

        public async Task<bool> BlockUserAsync(string userId)
        {
            // Admin action via service_role key
            var serviceKey = _config["Supabase:ServiceRoleKey"] ?? _anonKey;
            var url = $"{_supabaseUrl}/auth/v1/admin/users/{userId}";
            var payload = new { ban_duration = "876600h" }; // ~100 years

            var request = new HttpRequestMessage(HttpMethod.Put, url);
            request.Headers.Add("apikey", serviceKey);
            request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", serviceKey);
            request.Content = new StringContent(JsonSerializer.Serialize(payload), Encoding.UTF8, "application/json");

            var response = await _httpClient.SendAsync(request);
            return response.IsSuccessStatusCode;
        }

        public async Task<bool> DeleteUserAsync(string userId)
        {
            var serviceKey = _config["Supabase:ServiceRoleKey"] ?? _anonKey;
            var url = $"{_supabaseUrl}/auth/v1/admin/users/{userId}";

            var request = new HttpRequestMessage(HttpMethod.Delete, url);
            request.Headers.Add("apikey", serviceKey);
            request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", serviceKey);

            var response = await _httpClient.SendAsync(request);
            return response.IsSuccessStatusCode;
        }
    }
}
