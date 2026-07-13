"""Terminal UI helpers."""
import os
import sys


def clear():
    """Clear the terminal screen."""
    os.system("cls" if os.name == "nt" else "clear")


def print_header(title: str):
    """Print a section header."""
    print("=" * 50)
    print(f"  {title}")
    print("=" * 50)
    print()


def print_line(text: str = ""):
    """Print a line, respecting narrow terminals."""
    print(text)


def pause():
    """Wait for user to press Enter."""
    input("\n按 Enter 继续...")


def get_choice(prompt: str = "请选择: ") -> str:
    """Get a single line of input."""
    return input(prompt).strip()


def confirm(prompt: str = "确认吗？") -> bool:
    """Ask yes/no question."""
    answer = input(f"{prompt} (y/n): ").strip().lower()
    return answer in ("y", "yes", "是", "确认", "ok")


def show_menu(title: str, options: list[tuple[str, str]]) -> str:
    """
    Show a numbered menu.

    options: list of (key, label) tuples.
    Returns the selected key, or '' for invalid input.
    """
    print(f"\n【{title}】")
    for idx, (key, label) in enumerate(options, 1):
        print(f"  {idx}. {label}")
    print("  0. 返回")
    choice = get_choice("请输入选项编号: ")
    try:
        index = int(choice)
        if index == 0:
            return ""
        if 1 <= index <= len(options):
            return options[index - 1][0]
    except ValueError:
        pass
    return ""


def boxed_text(lines: list[str]):
    """Print text inside a simple box."""
    width = max(len(line) for line in lines) + 4
    print("+" + "-" * (width - 2) + "+")
    for line in lines:
        print("| " + line.ljust(width - 4) + " |")
    print("+" + "-" * (width - 2) + "+")


def exit_game():
    """Exit cleanly."""
    print("\n江湖路远，后会有期！")
    sys.exit(0)
