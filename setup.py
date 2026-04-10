"""
ONE-TIME SETUP — creates the environment and agent, then prints the IDs to export.

Usage:
    pip install -r requirements.txt
    export ANTHROPIC_API_KEY="your-api-key"
    python setup.py

Then follow the printed instructions to export AGENT_ID and ENV_ID.
"""

import anthropic

client = anthropic.Anthropic()

# ── Environment ──────────────────────────────────────────────────────────────
# A reusable sandbox config. Sessions created from this environment get
# a fresh container with unrestricted internet access.
environment = client.beta.environments.create(
    name="revops-job-hunter-env",
    config={
        "type": "cloud",
        "networking": {"type": "unrestricted"},
    },
)
print(f"Created environment: {environment.id}")

# ── Agent ─────────────────────────────────────────────────────────────────────
# A persisted, versioned config. Store the ID — don't re-create on every run.
agent = client.beta.agents.create(
    name="RevOps Job Hunter",
    model="claude-opus-4-6",
    system="""\
You are a RevOps job-hunting assistant. Each session your job is to:

1. Search for open roles — Senior RevOps Manager, Director of RevOps, Head of RevOps —
   at Series A, B, or C companies in cybersecurity or adjacent industries
   (cloud security, identity, SaaS, data security, fintech, etc.).

2. Also identify companies in these industries that don't yet have a dedicated RevOps
   leader but likely need one. These are cold outreach targets.

3. Surface exactly 2 strong opportunities per session (job openings OR outreach targets).

For each opportunity provide:
  • Company name, funding stage, and industry
  • Role title and job link (if an open role)
  • Why it's a good fit
  • A suggested outreach angle or application note

Be concise and actionable. Prioritize quality over quantity.\
""",
    tools=[
        {
            "type": "agent_toolset_20260401",
            "default_config": {"enabled": True},
            "configs": [
                {"name": "bash", "enabled": False},  # no shell execution
            ],
        }
    ],
)
print(f"Created agent:       {agent.id}  (version: {agent.version})")

print("\n── Add these to your shell profile or .env ──────────────────────────────")
print(f"export AGENT_ID={agent.id}")
print(f"export ENV_ID={environment.id}")
