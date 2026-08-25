# Publicação do Visual SpotyMusic no ChatGPT Sites

## Nome e endereço desejados

- Nome: `visual-spotymusic`
- URL desejada: `https://visual-spotymusic.manomizer.chatgpt.site/`
- Callback Spotify: `https://visual-spotymusic.manomizer.chatgpt.site/callback`
- Painel administrativo: `https://visual-spotymusic.manomizer.chatgpt.site/admin`
- Teste Jamendo: `https://visual-spotymusic.manomizer.chatgpt.site/jamendo-test`

O endereço final é confirmado pela tela de publicação do ChatGPT Sites. Se o slug estiver indisponível, não altere o código antes de escolher e confirmar o novo endereço.

## Variáveis necessárias

Configure no Site:

```text
NEXT_PUBLIC_SPOTIFY_CLIENT_ID=<Client ID do seu aplicativo Spotify>
NEXT_PUBLIC_JAMENDO_CLIENT_ID=<Client ID do aplicativo Visual SpotyMusic no Jamendo>
NEXT_PUBLIC_ADMIN_PASSWORD_SHA256=<hash SHA-256 da senha administrativa>
```

Os Client IDs são públicos. Não adicione Client Secret.

A senha administrativa não deve ser salva em texto puro no Git. O site recebe apenas o hash SHA-256 e compara localmente com a senha digitada. Como o projeto usa exportação estática, esse gate serve como bloqueio administrativo pessoal, mas não substitui autenticação de servidor para conteúdo realmente sensível.

## Spotify Developer Dashboard

Depois que a URL do Site estiver confirmada, adicione exatamente:

```text
https://visual-spotymusic.manomizer.chatgpt.site/callback
```

O protocolo, domínio e caminho precisam coincidir.

## Validação Jamendo

Antes de expor qualquer integração no player principal:

1. Entre em `/admin` com a senha administrativa.
2. Abra `Testar Jamendo`.
3. Confirme que o catálogo carrega músicas reais.
4. Teste capa, título, artista e álbum.
5. Teste Play, Pause, Stop, Anterior, Próxima e Volume.
6. Confirme que o áudio é servido corretamente pelo Jamendo.
7. Só depois conecte a fonte Jamendo à experiência principal.

## Publicação

1. Abra este projeto em Trabalho/Codex no aplicativo do ChatGPT.
2. Abra a prévia privada.
3. Configure as três variáveis acima.
4. Teste `/admin` e `/jamendo-test`.
5. Teste o modo demonstração.
6. Cadastre a Redirect URI no Spotify.
7. Teste o login e a reprodução com conta Premium.
8. Confirme PC e mobile.
9. Em Compartilhar, selecione `Qualquer pessoa na internet`.
10. Publique somente após a revisão.

## Observação técnica

O projeto usa Next.js com `output: "export"`. Por isso, não depende de middleware/server auth no ChatGPT Sites. O bloqueio administrativo é feito no cliente por `AdminGate`, com o hash configurado no ambiente do Site. O arquivo `.openai/hosting.json` foi preservado para manter a associação existente com o projeto do ChatGPT Sites.
