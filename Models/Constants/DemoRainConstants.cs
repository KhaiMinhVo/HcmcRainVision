namespace HcmcRainVision.Backend.Models.Constants;

public static class DemoRainConstants
{
    public const string CameraId = "CAM_TEST_01";
    public const string CameraName = "Camera Test Mode (Bến Thành)";
    public const string WardId = "W_BENTHANH_C01";
    public const double Latitude = 10.762622;
    public const double Longitude = 106.660172;
    public const float Confidence = 0.99f;

    // Identifier used by the previous standalone demo camera. It is removed
    // during seeding now that the existing test camera owns the demo state.
    public const string LegacyCameraId = "CAM_DEMO_ALWAYS_RAIN";
}
