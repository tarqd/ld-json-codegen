import com.launchdarkly.sdk.ArrayBuilder
import com.launchdarkly.sdk.ContextKind
import com.launchdarkly.sdk.LDContext
import com.launchdarkly.sdk.LDValue
import com.launchdarkly.sdk.ObjectBuilder


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