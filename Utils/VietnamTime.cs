namespace HcmcRainVision.Backend.Utils
{
    public static class VietnamTime
    {
        private static readonly Lazy<TimeZoneInfo> _tz = new(() =>
        {
            var zoneIds = new[]
            {
                "SE Asia Standard Time", // Windows
                "Asia/Ho_Chi_Minh"       // Linux/macOS (IANA)
            };

            foreach (var id in zoneIds)
            {
                try
                {
                    return TimeZoneInfo.FindSystemTimeZoneById(id);
                }
                catch (TimeZoneNotFoundException)
                {
                    // Try the next known identifier.
                }
                catch (InvalidTimeZoneException)
                {
                    // Try the next known identifier.
                }
            }

            throw new InvalidOperationException("Cannot resolve Vietnam time zone on this environment.");
        });

        public static TimeZoneInfo TimeZone => _tz.Value;

        public static DateTime Now => TimeZoneInfo.ConvertTimeFromUtc(DateTime.UtcNow, TimeZone);

        public static DateTime ToVietnamTime(DateTime utcOrLocal)
        {
            var utc = utcOrLocal.Kind switch
            {
                DateTimeKind.Utc => utcOrLocal,
                DateTimeKind.Local => utcOrLocal.ToUniversalTime(),
                _ => DateTime.SpecifyKind(utcOrLocal, DateTimeKind.Utc)
            };

            return TimeZoneInfo.ConvertTimeFromUtc(utc, TimeZone);
        }
    }
}
