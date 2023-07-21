import com.launchdarkly.sdk.ArrayBuilder
import com.launchdarkly.sdk.ContextKind
import com.launchdarkly.sdk.LDContext
import com.launchdarkly.sdk.LDValue
import com.launchdarkly.sdk.ObjectBuilder


fun createUserContext(): LDContext {
    val builder = LDContext.builder(ContextKind.of("user"), "some-key")
        .anonymous(false)
        .name("User's Name")
        .set("roles", LDValue.buildArray()
          .add("writer")
          .add("reader")
          .build())
    .privateAttributes("email")
    return builder.build()
}


fun createOrganizationContext(): LDContext {
    val builder = LDContext.builder(ContextKind.of("organization"), "org-id")
        .anonymous(false)
        .name("Acme Inc")
        .set("domain", "acme.my.example.com")
        .set("optIns", LDValue.buildArray()
          .add("feature-1")
          .add("feature-2")
          .build())
    return builder.build()
}


fun createDeviceContext(): LDContext {
    val builder = LDContext.builder(ContextKind.of("device"), "device-id-here")
        .anonymous(false)
        .set("manufacturer", "Samsung")
        .set("model", "Galaxy S10")
        .set("formFactor", "phone")
        .set("os", LDValue.buildObject()
            .put("android", LDValue.buildObject()
                      .put("version", "10.0.0")
                    .build())
          .build())
        .set("storageCapMB", 10)
        .set("memoryCapMB", 512)
    return builder.build()
}


fun createApplicationContext(): LDContext {
    val builder = LDContext.builder(ContextKind.of("application"), "my-app-1.0.0")
        .anonymous(false)
        .name("My Mobile App")
        .set("id", "com.example.app")
        .set("version", "1.0.0")
        .set("buildDate", 1689952732283)
    return builder.build()
}