"""Entry point for Hero Altar."""
import io
import os
import sys

from src.game import Game


def _setup_encoding():
    """Ensure UTF-8 output for CJK characters."""
    # If PYTHONIOENCODING is set, Python already uses it.
    if os.environ.get("PYTHONIOENCODING"):
        return

    if sys.platform == "win32":
        try:
            if sys.stdout.encoding != "utf-8":
                sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8")
            if sys.stderr.encoding != "utf-8":
                sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding="utf-8")
        except Exception:
            pass


def main():
    _setup_encoding()
    game = Game()
    game.run()


if __name__ == "__main__":
    main()
