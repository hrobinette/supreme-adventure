"""
Simple multi-turn chatbot agent using the Anthropic Messages API.

Usage:
    pip install -r requirements.txt
    export ANTHROPIC_API_KEY="your-api-key"
    python agent.py
"""

import anthropic

SYSTEM_PROMPT = "You are a helpful assistant."
MODEL = "claude-opus-4-6"


def run_agent() -> None:
    client = anthropic.Anthropic()
    messages: list[anthropic.MessageParam] = []

    print("Agent ready. Type 'quit' or 'exit' to stop.\n")

    while True:
        user_input = input("You: ").strip()
        if not user_input:
            continue
        if user_input.lower() in ("quit", "exit"):
            print("Goodbye!")
            break

        messages.append({"role": "user", "content": user_input})

        with client.messages.stream(
            model=MODEL,
            max_tokens=16000,
            system=SYSTEM_PROMPT,
            messages=messages,
        ) as stream:
            print("Agent: ", end="", flush=True)
            for text in stream.text_stream:
                print(text, end="", flush=True)
            print()  # newline after response

            final = stream.get_final_message()

        # Append the assistant's full response to history
        assistant_text = next(
            (b.text for b in final.content if b.type == "text"), ""
        )
        messages.append({"role": "assistant", "content": assistant_text})


if __name__ == "__main__":
    run_agent()
