use extism_pdk::*;
use fluentci_pdk::dag;

#[plugin_fn]
pub fn deploy(args: String) -> FnResult<String> {
    let version = dag().get_env("WRANGLER_VERSION")?;
    if version.is_empty() {
        dag().set_envs(vec![("WRANGLER_VERSION".into(), "latest".into())])?;
    }
    let package_manager = dag().get_env("PACKAGE_MANAGER")?;
    if package_manager.is_empty() {
        dag().set_envs(vec![("PACKAGE_MANAGER".into(), "yarn".into())])?;
    }
    let bun_version = dag().get_env("BUN_VERSION")?;
    if bun_version.is_empty() {
        dag().set_envs(vec![("BUN_VERSION".into(), "latest".into())])?;
    }
    let stdout = dag()
        .pipeline("deploy")?
        .pkgx()?
        .with_exec(vec![
            "pkgx",
            "+classic.yarnpkg.com",
            "$PACKAGE_MANAGER",
            "install",
        ])?
        .with_exec(vec![
            "pkgx",
            "+bun@$BUN_VERSION",
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
    let bun_version = dag().get_env("BUN_VERSION")?;
    if bun_version.is_empty() {
        dag().set_envs(vec![("BUN_VERSION".into(), "latest".into())])?;
    }
    let stdout = dag()
        .pipeline("pages_deploy")?
        .pkgx()?
        .with_exec(vec![
            "pkgx",
            "+node",
            "+bun@$BUN_VERSION",
            "bunx",
            "wrangler@$WRANGLER_VERSION",
            "pages",
            "deploy",
            &args,
        ])?
        .stdout()?;
    Ok(stdout)
}
