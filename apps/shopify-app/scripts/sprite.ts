import fg from "fast-glob";
import { readFile, writeFile } from "fs/promises";
import type { Element as IElement } from "happy-dom";
import { Window } from "happy-dom";
import { join, sep } from "path";
import ts, { factory } from "typescript";

type Config = {
  spritesPath: string;
  spriteTypesOutputPath: string;
  spriteOutputPath: string;
};

type Sprite = {
  id: string;
  relativePath: string;
  path: string;
  contents: string;
};

const config: Config = {
  spritesPath: "./app/assets/icons",
  spriteTypesOutputPath: "./app/components/SpriteIcon/types.d.ts",
  spriteOutputPath: "./app/components/SpriteIcon/Sprite.tsx",
};

async function main() {
  await updateSprites();
}

async function updateSprites() {
  const entries = await fg(["**/*.svg"], { cwd: config.spritesPath });

  const sprites: Sprite[] = await Promise.all(
    entries.map(async (e) => {
      const path = join(config.spritesPath, e);
      const contents = await readFile(path, { encoding: "utf-8" });

      const id = e.replace(sep, ":").replace(".svg", "").trim();

      return {
        id,
        relativePath: e,
        path,
        contents,
      };
    }),
  );

  const spriteContents = generateSprite(sprites);
  const spritePropsContents = generateSpriteTypes(sprites);
  await Promise.all([
    writeFile(config.spriteOutputPath, spriteContents),
    writeFile(config.spriteTypesOutputPath, spritePropsContents),
  ]);

  console.log(`✅ Successfully generated sprite for ${sprites.length} SVGs.`);
}

const kebabToCamel = (s: string) => s.replace(/-./g, (x) => x[1].toUpperCase());

function generateSprite(sprites: Pick<Sprite, "contents" | "id">[]): string {
  const window = new Window();
  const document = window.document;
  const body = document.body;
  const svg = document.createElement("svg");
  body.appendChild(svg);

  sprites.forEach((e) => {
    const fragment = document.createDocumentFragment();
    document.body.innerHTML = e.contents;

    const svgElement = document.querySelector("svg"); // Ищем <svg>

    if (svgElement) {
      fragment.appendChild(svgElement);
    } else {
      console.error("SVG not found in contents");
    }

    const symbol = replaceElement(
      document.createElementNS("http://www.w3.org/2000/svg", "symbol"),
      fragment?.querySelector("svg"),
    );

    symbol.setAttribute("id", e.id);

    const renameAttributes = (element: IElement) => {
      element.getAttributeNames().forEach((htmlName) => {
        const reactName = kebabToCamel(htmlName);
        if (htmlName !== reactName) {
          const value = element.getAttribute(htmlName);
          element.setAttribute(reactName, value || "");
          element.removeAttribute(htmlName);
        }
      });
      [...element?.children].flat()?.forEach(renameAttributes);
    };
    renameAttributes(symbol);

    svg.appendChild(symbol);
  });

  const svgOuterHtml = document?.body?.querySelector("svg")?.outerHTML;
  return `export default () => ${svgOuterHtml};`;
}

function generateSpriteTypes(sprites: Pick<Sprite, "id">[]): string {
  const nodes = factory.createNodeArray([
    factory.createVariableStatement(
      [factory.createModifier(ts.SyntaxKind.ExportKeyword)],
      factory.createVariableDeclarationList(
        [
          factory.createVariableDeclaration(
            factory.createIdentifier("spriteIconNames"),
            undefined,
            undefined,
            factory.createAsExpression(
              factory.createArrayLiteralExpression(
                sprites.map((s) => factory.createStringLiteral(s.id)),
                false,
              ),
              factory.createTypeReferenceNode(
                factory.createIdentifier("const"),
                undefined,
              ),
            ),
          ),
        ],
        ts.NodeFlags.Const,
      ),
    ),
    factory.createTypeAliasDeclaration(
      [factory.createModifier(ts.SyntaxKind.ExportKeyword)],
      factory.createIdentifier("SpriteIconName"),
      undefined,
      factory.createIndexedAccessTypeNode(
        factory.createTypeQueryNode(
          factory.createIdentifier("spriteIconNames"),
          undefined,
        ),
        factory.createKeywordTypeNode(ts.SyntaxKind.NumberKeyword),
      ),
    ),
  ]);

  const file = ts.createSourceFile(
    "source.ts",
    "",
    ts.ScriptTarget.ESNext,
    false,
    ts.ScriptKind.TS,
  );
  const printer = ts.createPrinter({ newLine: ts.NewLineKind.LineFeed });
  return printer.printList(ts.ListFormat.MultiLine, nodes, file);
}

function replaceElement(replacement: IElement, existing: SVGSVGElement | null) {
  console.log(existing);
  if (!existing) return;
  console;
  replacement.append(
    ...Array.from(existing.children).map((c) => c.cloneNode(true)),
  );

  existing
    ?.getAttributeNames()
    .map((n) => {
      return existing.getAttributeNode(n);
    })
    .forEach((a) => {
      replacement.setAttributeNode(a);
    });

  existing?.replaceWith(replacement);

  return replacement;
}

main().catch((e) => {
  console.error(e);
  console.log("❌ Sprite compilation failed");
});
