"""
RevOps job-hunting agent — run daily to surface 2 opportunities to apply to.

Usage:
    python setup.py          # first time only
    export AGENT_ID=agent_...
    export ENV_ID=env_...
    export SMTP_USER=you@gmail.com
    export SMTP_PASSWORD=your-gmail-app-password  # see README for setup
    python agent.py
"""

import os
import smtplib
import datetime
from email.message import EmailMessage
import anthropic

AGENT_ID = os.environ["AGENT_ID"]
ENV_ID = os.environ["ENV_ID"]

TO_EMAIL = "heather@robinettemarketing.com"
SMTP_USER = os.environ["SMTP_USER"]          # Gmail address you send FROM
SMTP_PASSWORD = os.environ["SMTP_PASSWORD"]  # Gmail App Password

KICKOFF = "Find me 2 RevOps opportunities for today."


def send_email(body: str) -> None:
    today = datetime.date.today().strftime("%B %d, %Y")
    msg = EmailMessage()
    msg["Subject"] = f"RevOps opportunities — {today}"
    msg["From"] = SMTP_USER
    msg["To"] = TO_EMAIL
    msg.set_content(body)

    with smtplib.SMTP_SSL("smtp.gmail.com", 465) as smtp:
        smtp.login(SMTP_USER, SMTP_PASSWORD)
        smtp.send_message(msg)


def run() -> None:
    client = anthropic.Anthropic()

    # Each run gets a fresh session (isolated container, clean state).
    session = client.beta.sessions.create(
        agent=AGENT_ID,
        environment_id=ENV_ID,
        title="Daily RevOps hunt",
    )
    print(f"Session: {session.id}\n")

    output_parts: list[str] = []

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
                        output_parts.append(block.text)
            elif event.type == "agent.thinking":
                pass  # extended thinking runs silently
            elif event.type in ("session.status_idle", "session.status_terminated"):
                break  # agent finished; no custom tools so requires_action won't fire

    print("\n")

    full_output = "".join(output_parts)
    if full_output.strip():
        print(f"Sending results to {TO_EMAIL}...")
        send_email(full_output)
        print("Sent.")


if __name__ == "__main__":
    run()
