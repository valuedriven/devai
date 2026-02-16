# C4 – Diagrama de Deployment  
```mermaid
C4Deployment
title Sistema SeWAI - Deployment Atual

Deployment_Node(user_device, "Dispositivo do Usuário", "Browser") {
    Container(user_browser, "Browser", "")
}

Deployment_Node(vercel, "Vercel", "Cloud Platform") {
    Container(frontend_instance, "Frontend Next.js", "Node.js Runtime")
    Container(backend_instance, "Backend NestJS", "Node.js Runtime")
}

Deployment_Node(supabase, "Supabase", "PostgreSQL Managed") {
    ContainerDb(database_instance, "PostgreSQL", "Banco de Dados")
}

Deployment_Node(clerk_node, "Clerk Cloud", "Identity Provider") {
    Container(clerk_service, "Auth Service", "OIDC/OAuth2")
}

Deployment_Node(resend_node, "Resend Cloud", "Email Service") {
    Container(resend_service, "Email Service", "SMTP/API")
}

Deployment_Node(grafana_node, "Grafana Cloud", "Observability") {
    Container(grafana_service, "Monitoring", "Logs & Metrics")
}

Rel(user_browser, frontend_instance, "HTTPS")
Rel(frontend_instance, backend_instance, "API REST (HTTPS)")
Rel(backend_instance, database_instance, "Prisma / TCP")
Rel(backend_instance, clerk_service, "JWT Validation")
Rel(backend_instance, resend_service, "Email API")
Rel(backend_instance, grafana_service, "OpenTelemetry")

```