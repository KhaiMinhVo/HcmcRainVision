namespace HcmcRainVision.Backend.Services.Chatbot
{
    public static class VietnameseTextNormalizer
    {
        public static string NormalizeForIntent(string input) => input?.Trim().ToLowerInvariant() ?? string.Empty;
        public static string? CanonicalizeDistrict(string input) => input;
        public static string? CanonicalizeLocation(string input) => input;
    }
}
