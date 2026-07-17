from groq import Groq
from app.core.config import settings


# Initialize Groq client
client = Groq(api_key=settings.GROQ_API_KEY)


def call_llm(prompt: str, system: str = "You are a helpful assistant.") -> str:
    """
    Call Groq LLM with a prompt and system message.
    
    Args:
        prompt: The user prompt/message
        system: The system message (default: "You are a helpful assistant.")
    
    Returns:
        The LLM response as a string
    """
    response = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[
            {"role": "system", "content": system},
            {"role": "user", "content": prompt}
        ],
        temperature=0.7,
        max_tokens=4096,
    )
    
    return response.choices[0].message.content
