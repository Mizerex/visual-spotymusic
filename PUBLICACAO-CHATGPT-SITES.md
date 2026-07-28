# Publicação do Visual SpotyMusic no ChatGPT Sites

## Nome e endereço desejados

- Nome: `visual-spotymusic`
- URL desejada: `https://visual-spotymusic.manomizer.chatgpt.site/`
- Callback Spotify: `https://visual-spotymusic.manomizer.chatgpt.site/callback`

O endereço final é confirmado pela tela de publicação do ChatGPT Sites. Se o slug estiver indisponível, não altere o código antes de escolher e confirmar o novo endereço.

## Variável necessária

Configure no Site:

```text
NEXT_PUBLIC_SPOTIFY_CLIENT_ID=<Client ID do seu aplicativo Spotify>
```

O Client ID é público. Não adicione Client Secret. A Redirect URI é detectada automaticamente pelo domínio atual.

## Spotify Developer Dashboard

Depois que a URL do Site estiver confirmada, adicione exatamente:

```text
https://visual-spotymusic.manomizer.chatgpt.site/callback
```

O protocolo, domínio e caminho precisam coincidir.

## Publicação

1. Abra este projeto em Trabalho/Codex no aplicativo do ChatGPT.
2. Abra a prévia privada.
3. Teste primeiro o modo demonstração.
4. Configure o Client ID.
5. Cadastre a Redirect URI no Spotify.
6. Teste o login e a reprodução com conta Premium.
7. Em Compartilhar, selecione `Qualquer pessoa na internet`.
8. Publique somente após a revisão.

## Observação técnica

O projeto usa Next.js com exportação estática e um worker para disponibilizar `/spotify-config.json`. O arquivo `.openai/hosting.json` foi preservado para manter a associação existente com o projeto do ChatGPT Sites.
