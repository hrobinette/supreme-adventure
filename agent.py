"""
RevOps job-hunting agent — run daily to surface 2 opportunities to apply to.

Usage:
    python setup.py          # first time only
    export AGENT_ID=agent_...
    export ENV_ID=env_...
    python agent.py
"""

import os
import anthropic

AGENT_ID = os.environ["AGENT_ID"]
ENV_ID = os.environ["ENV_ID"]

KICKOFF = "Find me 2 RevOps opportunities for today."


def run() -> None:
    client = anthropic.Anthropic()

    # Each run gets a fresh session (isolated container, clean state).
    session = client.beta.sessions.create(
        agent=AGENT_ID,
        environment_id=ENV_ID,
        title="Daily RevOps hunt",
    )
    print(f"Session: {session.id}\n")

    # Open the stream before sending — so we don't miss early events.
    with client.beta.sessions.stream(session_id=session.id) as stream:
        client.beta.sessions.events.send(
            session_id=session.id,
            events=[
                {
                    "type": "user.message",
                    "content": [{"type": "text", "text": KICKOFF}],
                }
            ],
        )

        for event in stream:
            if event.type == "agent.message":
                for block in event.content:
                    if block.type == "text":
                        print(block.text, end="", flush=True)
            elif event.type == "agent.thinking":
                pass  # extended thinking runs silently
            elif event.type in ("session.status_idle", "session.status_terminated"):
                break  # agent finished; no custom tools so requires_action won't fire

    print("\n")


if __name__ == "__main__":
    run()
