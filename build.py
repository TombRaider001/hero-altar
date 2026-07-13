"""Simple bundler: concatenate ES modules into a single non-module script."""
import re

FILES = [
    'src/utils.js',
    'src/storage.js',
    'src/input.js',
    'src/player.js',
    'src/data_embedded.js',
    'src/world.js',
    'src/combat.js',
    'src/ui.js',
    'src/assets.js',
    'src/renderer.js',
    'src/game.js',
    'src/main.js',
]


def strip_module_syntax(text):
    # Remove import statements
    text = re.sub(r"^import\s+.*?from\s+['\"].*?['\"];?\s*$", '', text, flags=re.MULTILINE)
    text = re.sub(r"^import\s+['\"].*?['\"];?\s*$", '', text, flags=re.MULTILINE)

    # Remove export { ... } statements
    text = re.sub(r"^export\s+\{[^}]*\};?\s*$", '', text, flags=re.MULTILINE)

    # Convert 'export class Foo' -> 'class Foo', 'export function foo' -> 'function foo'
    text = re.sub(r"\bexport\s+(class|function)\s+", r"\1 ", text)

    # Convert 'export const foo' -> 'const foo', 'export let foo' -> 'let foo'
    text = re.sub(r"\bexport\s+(const|let|var)\s+", r"\1 ", text)

    # Remove leftover 'export' keyword before default/declarations
    text = re.sub(r"\bexport\s+\b", '', text)

    return text


def main():
    parts = []
    parts.append('// Auto-generated bundle. Do not edit directly.\n')
    parts.append('"use strict";\n')
    parts.append('(function() {\n')

    for path in FILES:
        with open(path, 'r', encoding='utf-8') as f:
            content = f.read()
        content = strip_module_syntax(content)
        parts.append(f'\n// ===== {path} =====\n')
        parts.append(content)
        parts.append('\n')

    parts.append('})();\n')

    with open('dist/game.js', 'w', encoding='utf-8') as f:
        f.write(''.join(parts))

    print('Bundled to dist/game.js')


if __name__ == '__main__':
    main()
