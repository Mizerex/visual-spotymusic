# Anúncios na tela de login

A versão 2.3.0 inclui dois espaços publicitários claramente separados dos botões de acesso:

- retângulo lateral para telas grandes;
- banner inferior, mantido também em tablet e celular.

## Ativar Google AdSense

Preencha as variáveis públicas da hospedagem:

```env
NEXT_PUBLIC_ADSENSE_CLIENT_ID=ca-pub-0000000000000000
NEXT_PUBLIC_ADSENSE_LOGIN_RECTANGLE_SLOT=0000000000
NEXT_PUBLIC_ADSENSE_LOGIN_BANNER_SLOT=0000000000
```

Sem um Publisher ID válido e pelo menos um slot válido, o script do AdSense não é carregado. Slots não configurados ou não preenchidos não exibem rótulos, placeholders ou blocos vazios. Nenhuma chave secreta deve ser adicionada ao projeto.

O Publisher ID precisa usar o formato `ca-pub-` seguido de 16 dígitos. IDs de slot aceitam somente dígitos. Mantenha os valores de produção nas variáveis da hospedagem, não no código-fonte.

O arquivo `public/ads.txt` deve ser criado somente com a linha apresentada pelo próprio AdSense. Não use os números fictícios deste guia.

Antes de ativar anúncios reais, confirme a aprovação do domínio no provedor e revise as regras de consentimento, privacidade e anúncios aplicáveis ao público do site.
