import com.launchdarkly.sdk.ArrayBuilder
import com.launchdarkly.sdk.ContextKind
import com.launchdarkly.sdk.LDContext
import com.launchdarkly.sdk.LDValue
import com.launchdarkly.sdk.ObjectBuilder


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