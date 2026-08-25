# GitHub First Deployment Workflow Rule

- All feature updates, bug fixes, and configuration changes MUST first be committed and pushed to the GitHub repository (`https://github.com/evrek4/kuart`).
- Only AFTER the changes are safely pushed to GitHub (`git push`), trigger the Hostinger deployment / build process (`hosting_deployJsApplication` or `hosting_startNode_jsBuildV1`).
- Never perform a direct-only server mutation without committing and pushing to GitHub first.
