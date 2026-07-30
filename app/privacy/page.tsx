import Link from "next/link";

export default function PrivacyPage() {
  return <main className="legal-page">
    <article>
      <p className="eyebrow">VISUAL SPOTYMUSIC</p>
      <h1>Privacidade</h1>
      <p>O Visual SpotyMusic é um projeto pessoal e não oficial conectado ao Spotify. A autenticação usa Authorization Code com PKCE e não utiliza Client Secret no navegador.</p>
      <h2>Dados utilizados</h2>
      <p>Após sua autorização, o aplicativo acessa somente os dados e controles permitidos pelos escopos exibidos na tela do Spotify, como perfil, biblioteca e estado de reprodução.</p>
      <h2>Armazenamento</h2>
      <p>Os tokens de acesso são mantidos no armazenamento local do navegador para conservar a sessão. Eles não são enviados para um servidor próprio do Visual SpotyMusic.</p>
      <h2>Como remover o acesso</h2>
      <p>Use o botão de desconectar no aplicativo e, para revogar completamente a autorização, remova o Visual SpotyMusic na página de aplicativos conectados da sua conta Spotify.</p>
      <h2>Spotify</h2>
      <p>Conteúdo, capas, metadados e reprodução são fornecidos pelo Spotify. Este projeto não é afiliado nem endossado pelo Spotify.</p>
      <h2>Publicidade e cookies</h2>
      <p>O site pode exibir anúncios fornecidos pelo Google AdSense. O Google e outros fornecedores terceiros podem usar cookies ou tecnologias semelhantes para exibir, limitar e medir anúncios, inclusive com base em visitas anteriores a este e a outros sites.</p>
      <p>Quando exigido, o site solicitará consentimento antes da personalização de anúncios. Usuários podem gerenciar anúncios personalizados nas <a href="https://adssettings.google.com/" target="_blank" rel="noreferrer">Configurações de anúncios do Google</a> e consultar a <a href="https://policies.google.com/technologies/ads" target="_blank" rel="noreferrer">política de publicidade do Google</a>.</p>
      <p>Para visitantes do Espaço Econômico Europeu, Reino Unido e Suíça, a mensagem de consentimento certificada configurada no AdSense será usada para registrar e permitir a revisão das preferências aplicáveis.</p>
      <Link href="/">Voltar ao Visual SpotyMusic</Link>
    </article>
  </main>;
}
