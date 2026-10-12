"""One function, ask_ai(), for every model. Switch model by changing .env only.

LLM_PROVIDER = groq | openai | ollama | anthropic

  groq      -> GROQ_API_KEY, GROQ_MODEL            (fast, free tier)
  openai    -> OPENAI_BASE_URL, OPENAI_API_KEY, OPENAI_MODEL
               (any OpenAI-compatible API: OpenRouter, Gemini, OpenAI, or Groq again)
  ollama    -> OLLAMA_URL, OLLAMA_MODEL             (local)
  anthropic -> ANTHROPIC_API_KEY, ANTHROPIC_MODEL

Optional: LLM_TIMEOUT (seconds, default 120), LLM_MAX_TOKENS (default 2048)
"""
import os
import re
import ast
import json
import requests

LANG_NAMES = {
    "en": "English", "ta": "Tamil", "hi": "Hindi", "ml": "Malayalam",
    "te": "Telugu", "kn": "Kannada", "bn": "Bengali", "mr": "Marathi",
    "gu": "Gujarati", "pa": "Punjabi", "ur": "Urdu",
    "es": "Spanish", "fr": "French", "de": "German", "ar": "Arabic",
}

SYSTEM = ("You are Learnexa, a friendly AI tutor. Explain clearly and simply, use short "
          "paragraphs, bullet points and small examples. Reply in {lang}.")

JSON_SYSTEM = ("You are a data generator for a learning app. Reply with ONLY valid JSON. "
               "Use double quotes for every key and string. No markdown, no code fences, "
               "no commentary before or after the JSON.")


class LLMError(Exception):
    pass


def _timeout():
    try:
        return int(os.getenv("LLM_TIMEOUT", "120"))
    except ValueError:
        return 120


def _max_tokens():
    try:
        return int(os.getenv("LLM_MAX_TOKENS", "2048"))
    except ValueError:
        return 2048


def _need(name):
    val = (os.getenv(name) or "").strip()
    if not val:
        raise LLMError(f"Missing setting in .env: {name}")
    return val


def _post(provider, url, headers, body):
    """POST and turn every failure into a readable LLMError."""
    try:
        r = requests.post(url, headers=headers, json=body, timeout=_timeout())
    except requests.exceptions.ConnectionError:
        raise LLMError(f"Cannot reach the '{provider}' model. Is it running / is the URL correct?")
    except requests.exceptions.Timeout:
        raise LLMError(f"The '{provider}' model took too long to answer. Please try again.")
    except requests.RequestException as e:
        raise LLMError(f"Model request failed: {e}")
    if r.status_code != 200:
        try:
            err = r.json()
            msg = err.get("error", err)
            msg = msg.get("message", msg) if isinstance(msg, dict) else msg
        except Exception:
            msg = r.text[:200]
        if r.status_code in (401, 403):
            msg = f"API key rejected. Check your key in .env. ({msg})"
        elif r.status_code == 429:
            msg = f"Rate limit reached. Wait a few seconds and try again. ({msg})"
        raise LLMError(f"{provider} error {r.status_code}: {msg}")
    try:
        return r.json()
    except ValueError:
        raise LLMError(f"The '{provider}' model sent an unreadable response.")


def _chat(system, msgs, temperature=0.6):
    """Send one chat request to the configured provider and return the reply text."""
    provider = os.getenv("LLM_PROVIDER", "ollama").strip().lower()
    max_tokens = _max_tokens()

    if provider == "ollama":
        base = os.getenv("OLLAMA_URL", "http://localhost:11434").rstrip("/")
        data = _post(provider, base + "/api/chat", {}, {
            "model": os.getenv("OLLAMA_MODEL", "llama3.2:latest"),
            "stream": False,
            "keep_alive": "30m",
            "messages": [{"role": "system", "content": system}] + msgs,
            "options": {"temperature": temperature, "num_ctx": 4096},
        })
        return (data.get("message", {}).get("content") or "").strip()

    if provider == "anthropic":
        data = _post(provider, "https://api.anthropic.com/v1/messages",
                     {"x-api-key": _need("ANTHROPIC_API_KEY"), "anthropic-version": "2023-06-01"},
                     {"model": os.getenv("ANTHROPIC_MODEL", "claude-sonnet-4-6"),
                      "max_tokens": max_tokens, "temperature": temperature,
                      "system": system, "messages": msgs})
        return "".join(b.get("text", "") for b in data.get("content", [])).strip()

    if provider in ("groq", "openai"):
        if provider == "groq":
            base = "https://api.groq.com/openai/v1"
            key = _need("GROQ_API_KEY")
            model = os.getenv("GROQ_MODEL", "llama-3.3-70b-versatile")
        else:
            base = _need("OPENAI_BASE_URL").rstrip("/")
            key = _need("OPENAI_API_KEY")
            model = _need("OPENAI_MODEL")
        data = _post(provider, base + "/chat/completions",
                     {"Authorization": "Bearer " + key},
                     {"model": model, "temperature": temperature, "max_tokens": max_tokens,
                      "messages": [{"role": "system", "content": system}] + msgs})
        try:
            return (data["choices"][0]["message"]["content"] or "").strip()
        except (KeyError, IndexError, TypeError):
            raise LLMError("The AI model sent an unexpected response.")

    raise LLMError(f"Unknown LLM_PROVIDER '{provider}'. Use groq, openai, ollama or anthropic.")


# ------------------------------------------------------------ public API ---

def ask_ai(message, history=None, language="en"):
    """history = [{'role': 'user'|'assistant', 'content': str}, ...] (oldest first)."""
    system = SYSTEM.format(lang=LANG_NAMES.get(language, "English"))
    msgs = []
    for m in (history or []):
        content = str(m.get("content", "")).strip()
        if content:
            msgs.append({"role": "assistant" if m.get("role") == "assistant" else "user",
                         "content": content})
    msgs.append({"role": "user", "content": message})
    text = _chat(system, msgs)
    if not text:
        raise LLMError("The AI model returned an empty reply. Please try again.")
    return text


def _extract_json(text):
    """Find the first JSON array/object in a model reply and parse it, tolerating common mistakes."""
    text = (text or "").strip()
    text = re.sub(r"^```[a-zA-Z]*\s*|\s*```$", "", text).strip()
    start = next((i for i, ch in enumerate(text) if ch in "[{"), None)
    if start is None:
        raise ValueError("no JSON found")
    open_ch = text[start]
    close_ch = "]" if open_ch == "[" else "}"
    depth, in_str, esc, end = 0, False, False, None
    for i in range(start, len(text)):
        ch = text[i]
        if in_str:
            if esc:
                esc = False
            elif ch == "\\":
                esc = True
            elif ch == '"':
                in_str = False
            continue
        if ch == '"':
            in_str = True
        elif ch == open_ch:
            depth += 1
        elif ch == close_ch:
            depth -= 1
            if depth == 0:
                end = i
                break
    chunk = text[start:end + 1] if end is not None else text[start:]
    candidates = [chunk, re.sub(r",\s*([\]}])", r"\1", chunk)]
    for c in candidates:
        try:
            return json.loads(c)
        except Exception:
            pass
    for c in candidates:  # python-style dicts with single quotes
        try:
            return ast.literal_eval(c)
        except Exception:
            pass
    raise ValueError("could not parse JSON")


def ask_ai_json(prompt, language="en"):
    """Ask the model for JSON only and return it parsed. Retries once on bad JSON,
    then raises LLMError."""
    for attempt in range(2):
        p = prompt if attempt == 0 else (
            prompt + "\n\nYour previous reply was not valid JSON. Reply with ONLY valid JSON.")
        raw = _chat(JSON_SYSTEM, [{"role": "user", "content": p}], temperature=0.3)
        try:
            return _extract_json(raw)
        except Exception:
            continue
    raise LLMError("The AI model returned an unexpected format. Please try again.")