# Resultados — Apoio Vivo

Mapeamento dos requisitos especificados no **Projeto Interdisciplinar I** para o que foi
**implementado** no Projeto Interdisciplinar II (webapp PWA).

## Requisitos Funcionais

| ID | Requisito | Status | Onde / como |
|---|---|---|---|
| RF01 | Detectar quedas em tempo real | ✅ | Monitoramento — análise de pose (MoveNet) + botão "simular queda"; gera alerta ao cuidador |
| RF02 | Reconhecer objetos/ambientes | ✅ | Monitoramento — COCO-SSD (TensorFlow.js), nomes em PT-BR com voz |
| RF03 | Enviar lembretes programados | ✅ | Tela Lembretes + avisos contextuais por voz no horário |
| RF04 | Notificar cuidadores em emergência | ✅ | Tela Emergência (botão LIGAR) → alerta no Painel do Cuidador |
| RF05 | Mensagens em áudio e texto | ✅ | Web Speech API (voz) + textos grandes em todas as telas |
| RF06 | Registrar atividades e eventos | ✅ | Histórico + log de eventos consumido pelo Painel do Cuidador |
| RF07 | Personalizar lembretes (texto, hora, recorrência) | ✅ | CRUD completo de lembretes |

## Requisitos Não Funcionais

| ID | Requisito | Status | Como |
|---|---|---|---|
| RNF01 | Acessibilidade WCAG 2.1 | ✅ | Alto contraste, foco visível, ARIA, navegação por teclado, áudio |
| RNF02 | Baixa latência nos alertas | ✅ | Processamento local no navegador, sem ida ao servidor |
| RNF03 | Proteção de dados / LGPD | ✅ | Visão computacional roda no cliente; vídeo não é enviado a servidores |
| RNF05 | Compatível com Android/iOS | ✅ | Web responsivo + PWA instalável (mobile, tablet, desktop) |

## Telas implementadas (wireframes do PI-I)

- **Início** — saudação personalizada, botões grandes, próximo lembrete.
- **Lembretes** — lista com áudio e CRUD.
- **Emergência** — botão LIGAR.
- **Painel do Cuidador** — atividade semanal e alertas recentes.
- **Monitoramento** (nova) — câmera com objetos + queda + saudação facial.

## Pontos do PI-II (SP3) atendidos

- Interface simplificada e acessível ✅
- Reconhecimento/saudação ao ver a pessoa ✅
- Identificação de objetos essenciais ✅
- Lembretes contextuais ✅
- Detecção de rotina e anomalias (Painel do Cuidador) ✅

## Decisão de plataforma

O PI-I propôs Flutter + FastAPI + ESP32-CAM. Para a entrega da disciplina, implementamos um
**protótipo web (PWA)** com a visão computacional rodando no navegador — de baixo custo,
instalável e demonstrável ao vivo, cobrindo os mesmos requisitos funcionais.

## Qualidade

- 19 testes de lógica (Vitest) passando.
- `tsc --noEmit` sem erros · build de produção sem erros.
