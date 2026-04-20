# Apoio Vivo

Aplicação assistiva baseada em **visão computacional** para apoio a **idosos com
comprometimento cognitivo leve** — webapp (PWA) de baixo custo, acessível e instalável.

> **Projeto Interdisciplinar II** — Situação-Problema 3.
> Implementação (continuação) do **Projeto Interdisciplinar I** (Pablo Marques e Matheus Ferreira),
> que especificou os requisitos, a modelagem (UML/DER) e os wireframes.

## O que faz

- **Lembretes** com áudio (voz) e personalização — horário e recorrência.
- **Emergência** — botão grande que aciona o cuidador.
- **Monitoramento por câmera** (visão computacional no navegador):
  - **Reconhecimento de objetos** (COCO-SSD) — aponte a câmera e o app nomeia o objeto.
  - **Detecção de queda** por análise de pose (MoveNet) — com botão "simular queda" para demonstração.
  - **Saudação personalizada** ao detectar a pessoa.
- **Painel do Cuidador** — atividade semanal e alertas (queda, lembrete ignorado, emergência).
- **Acessibilidade (WCAG)** — alto contraste, foco visível, navegação por teclado, áudio + texto.

## Tecnologias

| Camada | Tecnologia |
|---|---|
| Framework | Next.js 16 (App Router) + React 19 |
| Linguagem | TypeScript |
| Estilo | Tailwind CSS v4 |
| Visão computacional | TensorFlow.js · COCO-SSD · pose-detection (MoveNet) |
| Voz | Web Speech API |
| Dados | localStorage (camada de dados isolada, seed de demonstração) |
| Testes | Vitest |
| Hospedagem | Vercel (PWA instalável) |

## Como rodar

```bash
npm install
npm run dev
```

Abra **http://localhost:3000** (use Chrome/Edge e permita o acesso à câmera no Monitoramento).

Outros comandos:

```bash
npm test        # testes de lógica (Vitest)
npm run build   # build de produção
npm run lint    # análise estática
```

## Privacidade (LGPD)

Toda a visão computacional roda **no próprio navegador** — as imagens da câmera **não são enviadas**
para nenhum servidor, atendendo às diretrizes de privacidade do projeto.

## Documentação

- Requisitos atendidos: [`docs/RESULTADOS.md`](docs/RESULTADOS.md)
- Apresentação (Marp): [`docs/slides.md`](docs/slides.md)
