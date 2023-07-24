using LaunchDarkly.Sdk.Server;
using LaunchDarkly.Sdk;


class UserContextBuilder {
    public static LDContext CreateContext() {
        return LDContext.Builder("some-key")
            .Kind("user")
            .Anonymous(false)
            .Name("User's Name")
            .Set("roles", LDValue.BuildArray()
              .Add("writer")
              .Add("reader")
              .Build())
            .Private("email")
            .Build();
    }
}


class OrganizationContextBuilder {
    public static LDContext CreateContext() {
        return LDContext.Builder("org-id")
            .Kind("organization")
            .Anonymous(false)
            .Name("Acme Inc")
            .Set("domain", "acme.my.example.com")
            .Set("optIns", LDValue.BuildArray()
              .Add("feature-1")
              .Add("feature-2")
              .Build())
            .Build();
    }
}


class DeviceContextBuilder {
    public static LDContext CreateContext() {
        return LDContext.Builder("device-id-here")
            .Kind("device")
            .Anonymous(false)
            .Set("manufacturer", "Samsung")
            .Set("model", "Galaxy S10")
            .Set("formFactor", "phone")
            .Set("os", LDValue.BuildObject()
                .Add("android", LDValue.BuildObject()
                          .Add("version", "10.0.0")
                        .Build())
              .Build())
            .Set("storageCapMB", 10D)
            .Set("memoryCapMB", 512D)
            .Build();
    }
}


class ApplicationContextBuilder {
    public static LDContext CreateContext() {
        return LDContext.Builder("my-app-1.0.0")
            .Kind("application")
            .Anonymous(false)
            .Name("My Mobile App")
            .Set("id", "com.example.app")
            .Set("version", "1.0.0")
            .Set("buildDate", 1689952732283D)
            .Build();
    }
}