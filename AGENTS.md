# General Guidelines for working with Nx

- For navigating/exploring the workspace, invoke the `nx-workspace` skill first - it has patterns for querying projects, targets, and dependencies
- When running tasks (for example build, lint, test, e2e, etc.), always prefer running the task through `nx` (i.e. `nx run`, `nx run-many`, `nx affected`) instead of using the underlying tooling directly
- Prefix nx commands with the workspace's package manager (e.g., `pnpm nx build`, `npm exec nx test`) - avoids using globally installed CLI
- You have access to the Nx MCP server and its tools, use them to help the user
- For Nx plugin best practices, check `node_modules/@nx/<plugin>/PLUGIN.md`. Not all plugins have this file - proceed without it if unavailable.
- NEVER guess CLI flags - always check nx_docs or `--help` first when unsure

## Scaffolding & Generators

- For scaffolding tasks (creating apps, libs, project structure, setup), ALWAYS invoke the `nx-generate` skill FIRST before exploring or calling MCP tools

## When to use nx_docs

- USE for: advanced config options, unfamiliar flags, migration guides, plugin configuration, edge cases
- DON'T USE for: basic generator syntax (`nx g @nx/react:app`), standard commands, things you already know
- The `nx-generate` skill handles generator discovery internally - don't call nx_docs just to look up generator syntax

## RxJS para Integrações com Backend

- **Toda integração com backend DEVE usar RxJS** (`Observable`, `pipe`, `subscribe`, `tap`, `map`, `switchMap`, `forkJoin`, etc.)
- **NUNCA use `.toPromise()` ou `Promise`** para chamadas HTTP
- Services devem retornar `Observable<T>` — o consumidor (componente/interceptor) faz `.subscribe()`
- Para múltiplas chamadas paralelas, use `forkJoin`; para sequenciais, use `switchMap`
- Para efeitos colaterais (ex: salvar token no localStorage), use `tap()` no pipe

## Signals para State em Componentes

- **Toda variável reativa** no componente (dados, flags de UI, formulários) DEVE usar `signal()` ou `computed()` — nunca propriedades planas
- Para escrita: `signal.set()` ou `signal.update()`; para leitura no template use `signal()` (com `!` se o tipo permitir null e estiver dentro de um `@if` guard)
- Flags booleanas como `saving`, `loading`, `showModal` devem ser `signal<boolean>` (ex: `protected saving = signal(false)`)
- Dados carregados do backend devem ser `WritableSignal<T | null>` com `signal.set()` no `next` do subscribe
- Evite `get` accessors para estado — prefira `computed()` quando precisar de estado derivado

## Styling & UI Guidelines

- **Tailwind CSS Architecture**: Always use Tailwind CSS for styling components, utility classes, and layout configurations as defined in the custom skills. Ensure consistency with the utility-first approach and design tokens present in the workspace configuration.

# Custom Skills Guideline

- **Custom Skills Directory**: ALWAYS query, read, and apply the instructions of the custom skills stored in `.agents\skills` before executing tasks. If a task matches a skill in this folder, use the `view_file` tool to read its `SKILL.md` or instructions and follow them exactly.
- **Tailwind CSS Enforcement**: When styling or creating frontend components, always check and apply the Tailwind CSS rules, configurations, and patterns present in the local skill files.

- **Acesso às Skills**: SEMPRE consulte, leia e utilize as instruções das skills customizadas armazenadas em `.agents\skills` durante a execução das tarefas.
- **Strict Execution Rule**: You MUST analyze, guide yourself by, and adhere to these custom skills in ALL prompts and interactions, regardless of whether the user explicitly requests it or not. This is a foundational behavior that applies to every single task.
- **Uso do Tailwind CSS**: Ao criar ou estilizar componentes, siga rigorosamente as diretrizes, padrões e utilitários do Tailwind CSS descritos na skill específica contida no diretório de skills.

## Enums — proibido strings hardcoded para OperationType / AssetType

- **Nunca use string literal** para `OperationType` ou `AssetType`. Sempre importe e use o enum correspondente.
- **Backend**: `import { OperationType, AssetType } from '../generated/prisma/client'`
- **Frontend**: `import { OperationTypeEnum, AssetTypeEnum } from '@app/models/enums'`
- **Template (HTML)**: exponha o enum como propriedade pública no component e use a sintaxe `tipo === OperationTypeEnum.Compra` no template.
- **Mock data**: valores de tipo em mocks devem usar os mesmos enums para consistência com a API real.
