# Resultados — Apoio Vivo

Mapeamento dos requisitos especificados no **Projeto Interdisciplinar I** para o que foi
**implementado** no Projeto Interdisciplinar II (webapp PWA).

## Requisitos Funcionais

| ID | Requisito | Status | Onde / como |
|---|---|---|---|
| RF01 | Detectar quedas em tempo real | ✅ | Monitoramento — análise de pose (MoveNet) + botão "simular queda"; gera alerta ao cuidador |
| RF02 | Reconhecer objetos/ambientes | ✅ | Monitoramento — COCO-SSD (TensorFlow.js), nomes em PT-BR com voz |
| RF03 | Enviar lembretes programados | ✅ | Tela Lembretes + avisos contextuais por voz no horário |
| RF04 | Notificar cuidadores em emergência | ✅ | Botão LIGAR / queda → alerta no Painel + **notificação no navegador** + **e-mail automático** (Resend) aos cuidadores cadastrados |
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
- **Monitoramento** (nova) — câmera com objetos + queda + reconhecimento facial + ambiente.
- **Cadastrar Rostos** (nova) — captura facial do idoso e cuidadores.
- **Conta / Cuidadores** (novas) — login e cadastro de quem recebe os alertas.

## Desafios técnicos do SP3 (todos atendidos)

1. **Interface simplificada e acessível** — ícones grandes, alto contraste, voz de
   entrada (comando) e de saída, pouco texto.
2. **Reconhecimento facial para personalização** — identifica **quem** está na câmera
   (idoso × cuidador) com face-api.js e saúda pelo nome.
3. **Identificação de objetos essenciais** — COCO-SSD nomeia objetos e dá informação
   personalizada (garrafa → "remédio das 8h"; celular → "ligar para a família").
4. **Lembretes contextuais inteligentes** — por horário e por **ambiente detectado**
   (cozinha no almoço → "hora de almoçar, beba água").
5. **Detecção de rotina e anomalias** — **aprende** os horários ativos do idoso e
   sinaliza inatividade fora do padrão; notifica o cuidador.

## Backend de comunicação com familiares

- **Autenticação** do cuidador (Supabase Auth) — login e cadastro de conta.
- **Cadastro de cuidadores/familiares** que recebem os alertas (Supabase + RLS).
- **Envio automático de e-mail** (Resend) em quedas e emergências, além da notificação
  no navegador (Web Notifications API).
- Funciona em **modo local** sem backend (degrada com segurança); o envio real ativa ao
  preencher o `.env.local` (veja `.env.example` e `src/lib/supabase/schema.sql`).

## Decisão de plataforma

O PI-I propôs Flutter + FastAPI + ESP32-CAM. Para a entrega da disciplina, implementamos um
**protótipo web (PWA)** com a visão computacional rodando no navegador — de baixo custo,
instalável e demonstrável ao vivo, cobrindo os mesmos requisitos funcionais.

## Qualidade

- 34 testes de lógica (Vitest) passando.
- `tsc --noEmit` sem erros · build de produção sem erros.
