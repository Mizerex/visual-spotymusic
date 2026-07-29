# Visual SpotyMusic

**Versão online preparada: 2.2.0**

Seu Spotify em uma experiência visual e analógica: um web app em Next.js que transforma biblioteca, busca e reprodução em um toca-discos hi-fi inspirado nos anos 1970.

## Requisitos

- Node.js 20 ou superior;
- uma conta Spotify;
- Spotify Premium para reprodução pelo navegador com o Web Playback SDK;
- um aplicativo criado no Spotify Developer Dashboard.

## Instalação

```bash
npm install
cp .env.example .env.local
npm run dev
```

No Windows PowerShell, copie o ambiente com `Copy-Item .env.example .env.local`. Abra `http://127.0.0.1:3000`.

## Configurar o Spotify

1. Acesse o [Spotify Developer Dashboard](https://developer.spotify.com/dashboard) e crie um aplicativo.
2. Em **APIs used**, selecione **Web API** e **Web Playback SDK**.
3. Abra **Settings** e adicione exatamente esta Redirect URI: `http://127.0.0.1:3000/callback`.
4. Copie o Client ID. Não use nem copie o Client Secret.
5. Preencha `.env.local`:

```env
NEXT_PUBLIC_SPOTIFY_CLIENT_ID=seu_client_id
NEXT_PUBLIC_SPOTIFY_REDIRECT_URI=http://127.0.0.1:3000/callback
```

Na versão publicada, a Redirect URI é detectada automaticamente como `<domínio atual>/callback`. Cadastre esse endereço exato no Spotify Developer Dashboard. Para o slug desejado, use `https://visual-spotymusic.manomizer.chatgpt.site/callback`.

## Executar e gerar produção

```bash
npm run dev
npm run build
npm start
```

O modo demonstração permite validar a interface e as animações sem credenciais; ele não reproduz áudio e não representa dados reais do Spotify.

## Publicação

Publique como projeto Next.js e configure `NEXT_PUBLIC_SPOTIFY_CLIENT_ID`. A Redirect URI pode ser detectada automaticamente pelo domínio atual. A hospedagem deve usar HTTPS. Depois de publicar, cadastre a nova URL de callback no Spotify antes de testar o login.

## Recursos

- login OAuth Authorization Code com PKCE, sem Client Secret;
- renovação automática de token;
- Web Playback SDK para reprodução no navegador;
- playlists, álbuns, artistas seguidos, músicas curtidas e busca por categorias;
- play, pausa, anterior, próxima, progresso, volume, shuffle, repeat e curtir;
- vinil independente com rotação persistente e braço calculado pelo progresso;
- VU meters animados e knobs acessíveis por mouse, toque e teclado;
- layouts específicos para computador, tablet e celular;
- preferência de redução de movimento respeitada.

## Limitações do Spotify

- O Web Playback SDK exige Spotify Premium.
- Alguns navegadores móveis exigem interação antes de liberar áudio.
- O volume do SDK pode não alterar o volume físico em iPhone/iPad.
- O fluxo de áudio do Spotify não pode ser processado livremente pela Web Audio API. Por isso, VU meters e equalização são apresentados explicitamente como visualização, não como medição ou processamento exato.
- Faixas indisponíveis na região ou no plano do usuário não podem ser reproduzidas.

## Segurança dos tokens

O app nunca usa Client Secret. O access token e o refresh token ficam no armazenamento local do navegador e não são impressos no console. Use em dispositivos confiáveis e clique em desconectar ao terminar. Para revogar totalmente o acesso, remova o aplicativo na página de apps da sua conta Spotify.

## Solução de problemas

- **Redirect URI inválida:** confira protocolo, domínio, porta, caminho e barra final; tudo deve coincidir exatamente.
- **Player indisponível:** confirme que a conta é Premium, aguarde alguns segundos e interaja com a página.
- **Dispositivo não encontrado:** mantenha a página aberta até o indicador do toca-discos ficar disponível.
- **Sessão expirada:** desconecte e conecte novamente; o app também tenta renovar o token automaticamente.
- **Biblioteca vazia:** salve músicas, siga artistas ou crie playlists no Spotify e recarregue a categoria.
- **Falha de rede:** verifique bloqueadores, VPN, conexão e permissões do navegador.

## Arquitetura

Componentes de interface ficam em `components`, hooks em `hooks`, integração em `services`, tipos em `types` e o estado compartilhado em `context/SpotifyProvider.tsx`. A rota `/callback` conclui o PKCE e volta à tela principal.


## ChatGPT Sites

Este pacote preserva a configuração `.openai/hosting.json` e está preparado para o slug `visual-spotymusic`. Consulte `PUBLICACAO-CHATGPT-SITES.md` antes de publicar.

A versão 2.2.0 também usa os endpoints genéricos atuais do Spotify para curtir, descurtir e verificar a faixa: `/me/library` e `/me/library/contains`.

## Publicidade na tela de login

A versão 2.3.0 adiciona dois espaços responsivos para anúncios na tela de login. Consulte `ANUNCIOS.md` e configure somente os identificadores públicos do provedor.
