"""
Multi-turn chatbot agent with web search using the Anthropic Messages API.

Usage:
    pip install -r requirements.txt
    export ANTHROPIC_API_KEY="your-api-key"
    python agent.py
"""

import anthropic

SYSTEM_PROMPT = "You are a helpful assistant with access to web search."
MODEL = "claude-opus-4-6"
TOOLS = [{"type": "web_search_20260209", "name": "web_search"}]
MAX_CONTINUATIONS = 5  # safety limit for pause_turn loops


def run_agent() -> None:
    client = anthropic.Anthropic()
    messages: list[anthropic.MessageParam] = []

    print("Agent ready (web search enabled). Type 'quit' or 'exit' to stop.\n")

    while True:
        user_input = input("You: ").strip()
        if not user_input:
            continue
        if user_input.lower() in ("quit", "exit"):
            print("Goodbye!")
            break

        messages.append({"role": "user", "content": user_input})
        print("Agent: ", end="", flush=True)

        # Inner loop handles pause_turn: fired when the server-side search loop
        # hits its iteration limit and needs us to re-send to continue.
        for _ in range(MAX_CONTINUATIONS + 1):
            with client.messages.stream(
                model=MODEL,
                max_tokens=16000,
                system=SYSTEM_PROMPT,
                tools=TOOLS,
                messages=messages,
            ) as stream:
                for text in stream.text_stream:
                    print(text, end="", flush=True)
                final = stream.get_final_message()

            # Store the full content list (includes server_tool_use blocks)
            # so the model has context about what searches were run.
            messages.append({"role": "assistant", "content": final.content})

            if final.stop_reason != "pause_turn":
                break

        print()  # newline after response


if __name__ == "__main__":
    run_agent()
