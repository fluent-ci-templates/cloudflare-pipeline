use extism_pdk::*;
use fluentci_pdk::dag;

#[plugin_fn]
pub fn deploy(args: String) -> FnResult<String> {
    let stdout = dag()
        .pipeline("deploy")?
        .pkgx()?
        .with_exec(vec!["pkgx", "+classic.yarnpkg.com", "yarn", "install"])?
        .with_exec(vec![
            "pkgx", "+bun", "+node", "bunx", "wrangler", "deploy", &args,
        ])?
        .stdout()?;
    Ok(stdout)
}

#[plugin_fn]
pub fn pages_deploy(args: String) -> FnResult<String> {
    let stdout = dag()
        .pipeline("pages_deploy")?
        .pkgx()?
        .with_exec(vec![
            "pkgx", "+node", "+bun", "bunx", "wrangler", "pages", "deploy", &args,
        ])?
        .stdout()?;
    Ok(stdout)
}
