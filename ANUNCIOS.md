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

Sem esses identificadores, a interface mostra apenas áreas de demonstração com a mensagem “Espaço reservado”. Nenhuma chave secreta deve ser adicionada ao projeto.

Antes de ativar anúncios reais, confirme a aprovação do domínio no provedor e revise as regras de consentimento, privacidade e anúncios aplicáveis ao público do site.
