use extism_pdk::*;
use fluentci_pdk::dag;

#[plugin_fn]
pub fn deploy(args: String) -> FnResult<String> {
    let version = dag().get_env("WRANGLER_VERSION")?;
    if version.is_empty() {
        dag().set_envs(vec![("WRANGLER_VERSION".into(), "latest".into())])?;
    }
    let stdout = dag()
        .pipeline("deploy")?
        .pkgx()?
        .with_exec(vec!["pkgx", "+classic.yarnpkg.com", "yarn", "install"])?
        .with_exec(vec![
            "pkgx",
            "+bun",
            "+node",
            "bunx",
            "wrangler@$WRANGLER_VERSION",
            "deploy",
            &args,
        ])?
        .stdout()?;
    Ok(stdout)
}

#[plugin_fn]
pub fn pages_deploy(args: String) -> FnResult<String> {
    let version = dag().get_env("WRANGLER_VERSION")?;
    if version.is_empty() {
        dag().set_envs(vec![("WRANGLER_VERSION".into(), "latest".into())])?;
    }
    let stdout = dag()
        .pipeline("pages_deploy")?
        .pkgx()?
        .with_exec(vec![
            "pkgx",
            "+node",
            "+bun",
            "bunx",
            "wrangler@$WRANGLER_VERSION",
            "pages",
            "deploy",
            &args,
        ])?
        .stdout()?;
    Ok(stdout)
}
