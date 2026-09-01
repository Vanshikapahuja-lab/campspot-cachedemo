# The Complete Docker Caching + Parallel Build Demo

This kit demonstrates all three things Campspot asked about, in one live
comparison:

1. Docker build caching (only 3 of 12 layers restoring today)
2. Host-level Node package persistence via cache mounts (Mitch's ask)
3. Parallel builds instead of one agent handling everything (Ben's ask)

## What's inside

```
app-a/  app-b/  app-c/     - three small Node apps, each with its own
                              Dockerfile and Dockerfile.cachemount
harness/
  pipeline-1-baseline.yaml       - one agent, sequential, no caching (today)
  pipeline-2-caching-only.yaml   - one agent, sequential, caching ON
                                    (isolates what caching alone contributes)
  pipeline-3-full-solution.yaml  - three parallel agents, caching ON,
                                    cache mounts ON (the full fix)
```

Three apps instead of one so parallel execution is actually visible - one
app can't demonstrate a bottleneck across multiple agents.

## Registry: GitHub Container Registry, not Docker Hub

This kit pushes images to **ghcr.io** (GitHub Container Registry) instead
of Docker Hub, since you're using Rancher Desktop and don't need a
separate Docker Hub account at all — the same GitHub credentials cover
everything.

## One-time setup

1. Push this whole folder to a new GitHub repo (e.g. `dlc-full-demo`) -
   same process as before: `git init`, `git add .`, `git commit`,
   `git push`.
2. Generate a GitHub PAT with these scopes: `repo`, `write:packages`,
   `read:packages`. (If you already made a `github_pat` for the code
   connector, either regenerate it with these added scopes, or make a
   second token — either works.)
3. In Harness: Project Settings → Secrets → store that token as
   `ghcr_pat`.
4. Create a Docker Registry connector for GHCR:
   - Docker Registry URL: `https://ghcr.io`
   - Username: your GitHub username
   - Password: the `ghcr_pat` secret
   - Connectivity: Connect through Harness Platform
   - Save and confirm the green checkmark.
5. In Harness (harness-tpm account, interns-sandbox org), reuse or create
   your sandbox project and the GitHub connector exactly as in the
   beginner guide.
6. Import all three pipeline YAML files from `harness/`, replacing every
   `YOUR_...` placeholder — note `YOUR_GHCR_CONNECTOR_ID` and
   `YOUR_GITHUB_USERNAME` are new placeholder names in this version.
7. Confirm Docker Layer Caching is active on the account (check the Build
   and Push log for BuildKit/Buildx output) before relying on this live.

### Local testing with Rancher Desktop needs none of this

Part 2 of the Complete Guide (building locally to prove caching works)
never pushes anywhere — it only uses Rancher Desktop's local `docker` (or
`nerdctl`) engine. GHCR only comes into play once you're running the
pipelines inside Harness.

## The live demo script

**Step 1 — Run `dlc-demo-1-baseline`.**
Three builds, one after another, no caching. Note the total pipeline
duration. Say: "this mirrors what you're seeing today - one agent, every
build waiting its turn, nothing cached."

**Step 2 — Run `dlc-demo-2-caching-only` twice.**
First run is cold (slow, as expected - say so up front). Second run should
be noticeably faster than the baseline, with `CACHED` lines in each Build
and Push log. Say: "same one-agent layout as before - this improvement is
caching alone, nothing else changed yet."

**Step 3 — Run `dlc-demo-3-full-solution` twice.**
First run cold again. Second run: point at the three stages starting and
finishing at roughly the same time in the execution view, instead of one
after another. Compare the total pipeline duration against Step 2's
second run - the remaining gap is what parallelism adds on top of caching.

**Step 4 (optional) — Cache mount survives a dependency change.**
Edit `app-a/package.json`, bump the `express` version, commit and push.
Re-run `dlc-demo-3-full-solution`. In app-a's build log, `npm install`
reruns (expected - the layer above the cache mount changed) but doesn't
re-download every package - only what's different. This is the direct
answer to Mitch's host-level persistence question.

## What to say about each number

- Baseline vs. caching-only isolates **caching's** contribution.
- Caching-only vs. full-solution isolates **parallelism's** contribution.
- Step 4 isolates the **cache mount's** contribution specifically.

Keeping these separate is deliberate - it lets you answer "which part
actually helped?" with a real number instead of one combined claim.
