use extism_pdk::*;
use fluentci_pdk::dag;

#[plugin_fn]
pub fn deploy(args: String) -> FnResult<String> {
    let stdout = dag()
        .pipeline("deploy")?
        .pkgx()?
        .with_packages(vec!["node", "bun", "classic.yarnpkg.com"])?
        .with_exec(vec!["yarn", "install"])?
        .with_exec(vec!["bunx", "wrangler", "deploy", &args])?
        .stdout()?;
    Ok(stdout)
}

#[plugin_fn]
pub fn pages_deploy(args: String) -> FnResult<String> {
    let stdout = dag()
        .pipeline("pages_deploy")?
        .pkgx()?
        .with_packages(vec!["node", "bun", "classic.yarnpkg.com"])?
        .with_exec(vec!["bunx", "wrangler", "pages", "deploy", &args])?
        .stdout()?;
    Ok(stdout)
}
