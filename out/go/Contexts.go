import(
"github.com/launchdarkly/go-sdk-common/v3/ldcontext"
)


func CreateUserContext() {
    return ldcontext.NewBuilder("some-key").
        Kind("user").
        Anonymous(false).
      Name("User's Name").
      Set("roles", ldvalue.CopyArbitraryValueArray([]interface{}{"writer", "reader"})).
      Private("email").
      Build();
}


func CreateOrganizationContext() {
    return ldcontext.NewBuilder("org-id").
        Kind("organization").
        Anonymous(false).
      Name("Acme Inc").
      SetString("domain", "acme.my.example.com").
      Set("optIns", ldvalue.CopyArbitraryValueArray([]interface{}{"feature-1", "feature-2"})).
      Build();
}


func CreateDeviceContext() {
    return ldcontext.NewBuilder("device-id-here").
        Kind("device").
        Anonymous(false).
      SetString("manufacturer", "Samsung").
      SetString("model", "Galaxy S10").
      SetString("formFactor", "phone").
      Set("os", ldvalue.ObjectBuild().
            Set("android", ldvalue.ObjectBuild().
                          SetString("version", "10.0.0")
                      Build())
        Build()).
      SetFloat64("storageCapMB", 10).
      SetFloat64("memoryCapMB", 512).
      Build();
}


func CreateApplicationContext() {
    return ldcontext.NewBuilder("my-app-1.0.0").
        Kind("application").
        Anonymous(false).
      Name("My Mobile App").
      SetString("id", "com.example.app").
      SetString("version", "1.0.0").
      SetFloat64("buildDate", 1689952732283).
      Build();
}