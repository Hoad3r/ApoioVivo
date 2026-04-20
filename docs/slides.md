---
marp: true
theme: default
paginate: true
title: Apoio Vivo
---

<!-- _class: lead -->

# Apoio Vivo

### Aplicação Assistiva com Visão Computacional para Idosos com Comprometimento Cognitivo Leve

Projeto Interdisciplinar II — Situação-Problema 3
Pablo Marques · Matheus Ferreira

---

## O problema

- População idosa crescente; muitos vivem sozinhos.
- Comprometimento cognitivo leve → esquecimentos, insegurança.
- Famílias preocupadas; necessidade de **suporte não invasivo**.

**Como** apoiar tarefas diárias com lembretes, identificação de objetos e um canal
simples com a família, em um dispositivo de baixo custo?

---

## Continuidade do Projeto Interdisciplinar I

- O **PI-I** especificou o sistema: requisitos (RF/RNF), UML, DER e wireframes.
- O **PI-II** **implementa** essa especificação.
- Decisão: **webapp PWA** (em vez de Flutter + FastAPI + ESP32) — baixo custo,
  instalável e demonstrável ao vivo, cobrindo os mesmos requisitos.

---

## Solução — telas

- **Início**: saudação personalizada + botões grandes + próximo lembrete.
- **Lembretes**: CRUD com **voz**.
- **Emergência**: botão grande que aciona o cuidador.
- **Monitoramento**: câmera com IA.
- **Painel do Cuidador**: atividade semanal + alertas.

---

## Visão computacional (no navegador)

- **Objetos** — COCO-SSD (TensorFlow.js): aponte e o app nomeia.
- **Queda** — análise de pose (MoveNet): detecção real + botão "simular queda".
- **Saudação** — ao detectar a pessoa, cumprimenta pelo nome.

> Tudo roda **no dispositivo** → privacidade (LGPD): o vídeo não sai do navegador.

---

## Arquitetura

```
Next.js (App Router) — PWA
├── (idoso)     Início · Lembretes · Emergência · Monitoramento · Histórico
├── (cuidador)  Painel do Cuidador
└── lib/        dados (localStorage) · visão (TF.js) · voz · rotina
```

Tecnologias: Next.js 16, React 19, TypeScript, Tailwind, TensorFlow.js, Web Speech API.

---

## Acessibilidade (WCAG)

- Alto contraste (toggle persistente).
- Textos grandes, botões amplos, foco visível.
- Navegação por teclado e leitores de tela (ARIA).
- Mensagens em **áudio + texto**.

---

## Resultados

- **RF01–RF07** e **RNF (WCAG, LGPD, multiplataforma)** atendidos.
- 19 testes de lógica passando · build de produção sem erros.
- PWA instalável em celular, tablet e desktop.

---

<!-- _class: lead -->

# Obrigado!

Demonstração ao vivo 🎥
