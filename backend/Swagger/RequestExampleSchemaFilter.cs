using HcmcRainVision.Backend.Models.DTOs;
using Microsoft.OpenApi.Any;
using Microsoft.OpenApi.Models;
using Swashbuckle.AspNetCore.SwaggerGen;

namespace HcmcRainVision.Backend.Swagger
{
    public class RequestExampleSchemaFilter : ISchemaFilter
    {
        public void Apply(OpenApiSchema schema, SchemaFilterContext context)
        {
            if (context.Type == typeof(CheckRouteRequest))
            {
                schema.Example = new OpenApiObject
                {
                    ["currentLatitude"] = new OpenApiDouble(10.7769),
                    ["currentLongitude"] = new OpenApiDouble(106.7009),
                    ["originLatitude"] = new OpenApiNull(),
                    ["originLongitude"] = new OpenApiNull(),
                    ["destinationLatitude"] = new OpenApiDouble(10.8727102),
                    ["destinationLongitude"] = new OpenApiDouble(106.7649932),
                    ["routePoints"] = new OpenApiArray()
                };
            }
        }
    }
}
