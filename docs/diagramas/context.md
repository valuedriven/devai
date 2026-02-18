# C4 – Diagrama de Contexto  
```mermaid
C4Context
title Sistema DevAI - Diagrama de Contexto

Person(customer, "Cliente", "Realiza pedidos na vitrine digital")
Rel(customer, DevAI, "Acessa via navegador (HTTPS)")

Person(admin, "Administrador", "Gerencia produtos, pedidos e pagamentos")
Rel(admin, DevAI, "Acessa via navegador (HTTPS)")
System_Boundary(b1, "Central System Block") {
    System(DevAI, "DevAI", "Plataforma web de gestão de pedidos e pagamentos")
}
System_Ext(clerk, "Clerk", "Autenticação OIDC / OAuth2")
Rel(DevAI, clerk, "Autenticação via JWT")
System_Ext(supabase, "Supabase", "PostgreSQL gerenciado")
System_Ext(resend, "Resend", "Serviço de envio de e-mails")
System_Ext(grafana, "Grafana Cloud", "Observabilidade e monitoramento")

Rel(DevAI, supabase, "Armazena dados")
Rel(DevAI, resend, "Envia notificações")
Rel(DevAI, grafana, "Envia logs e métricas")

```
