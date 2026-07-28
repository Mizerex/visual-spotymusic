import Link from "next/link";

export default function PrivacyPage() {
  return <main className="legal-page">
    <article>
      <p className="eyebrow">VISUAL SPOTYMUSIC</p>
      <h1>Privacidade</h1>
      <p>O Visual SpotyMusic é um projeto pessoal e não oficial conectado ao Spotify. A autenticação usa Authorization Code com PKCE e não utiliza Client Secret no navegador.</p>
      <h2>Dados utilizados</h2>
      <p>Cada visitante entra com a própria conta. Após sua autorização, o aplicativo acessa somente os dados e controles permitidos pelos escopos exibidos na tela do Spotify, como perfil, biblioteca e estado de reprodução.</p>
      <h2>Armazenamento</h2>
      <p>Os tokens de acesso de cada pessoa são mantidos somente no armazenamento local do navegador usado por ela para conservar a sessão. Eles não são compartilhados com outros visitantes nem enviados para um servidor próprio do Visual SpotyMusic.</p>
      <h2>Como remover o acesso</h2>
      <p>Use o botão de desconectar no aplicativo e, para revogar completamente a autorização, remova o Visual SpotyMusic na página de aplicativos conectados da sua conta Spotify.</p>
      <h2>Spotify</h2>
      <p>Conteúdo, capas, metadados e reprodução são fornecidos pelo Spotify. Este projeto não é afiliado nem endossado pelo Spotify.</p>
      <Link href="/">Voltar ao Visual SpotyMusic</Link>
    </article>
  </main>;
}
