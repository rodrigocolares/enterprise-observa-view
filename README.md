# DC Mission Control – Datadog Observability Platform

## Overview

DC Mission Control é uma plataforma de observabilidade enterprise desenvolvida para simular operações de missão crítica em ambientes corporativos de Data Center.

Inspirada em soluções como Datadog, Grafana, Dynatrace, Azure Monitor e ServiceNow, a aplicação fornece uma visão operacional completa de uma infraestrutura composta por aproximadamente 1.100 servidores monitorados em tempo real.

O objetivo é permitir demonstrações executivas, treinamentos de observabilidade, laboratórios de NOC/SRE, provas de conceito e apresentações corporativas sem a necessidade de integração com ambientes reais.

---

## Key Features

### Executive Dashboard

* KPIs operacionais em tempo real
* Health Score Global
* SLA e Availability
* Incident Overview
* Environment Health

### Server Inventory

* Inventário completo de hosts
* Pesquisa global
* Filtros avançados
* Exportação CSV
* Paginação enterprise

### Datadog Observability

* Top CPU Consumers
* Top Memory Consumers
* Top Disk Consumers
* Infrastructure Overview
* Hosts Overview
* Heatmaps
* Time Series
* Service Performance

### Alert Center

Motor de monitoramento pré-configurado com:

* CPU Monitoring
* Memory Monitoring
* Disk Monitoring
* Latency Monitoring
* Service Monitoring
* Backup Monitoring
* Certificate Monitoring

Inclui:

* Warning
* Critical
* Emergency

Cada alerta possui:

* Root Cause
* Business Impact
* Validation Steps
* Resolution Steps
* Estimated Resolution Time

### Incident Management

Inspirado em ServiceNow.

Gerenciamento de:

* Incidentes
* Impactos
* Severidade
* Responsáveis
* Plano de Resolução

### Lifecycle Management

Gestão de obsolescência tecnológica:

#### Windows

* Windows Server 2003
* Windows Server 2016
* Windows Server 2022
* Windows Server 2025

#### Linux

* CentOS 7
* CentOS 8
* CentOS Stream

Classificações:

* Supported
* Extended Support
* End Of Life (EOL)

### Compliance Center

Avaliação contínua baseada em:

* EOL Servers
* Missing Patches
* Missing Antivirus
* Missing Monitoring
* Missing Backup

Compliance Score:

* Green
* Yellow
* Red

### Operational Map

Visão estilo NOC para:

* SP01
* SP02
* DR01

Status:

* Online
* Warning
* Critical
* Offline

### Capacity Planning

Projeções para:

* 30 dias
* 60 dias
* 90 dias

Análises:

* CPU Growth
* Memory Growth
* Storage Growth

### Operational Insights

Indicadores estratégicos:

* Top Problematic Servers
* Top Incident Applications
* Recurring Alerts
* Failure Trends
* Availability Trends
* Operational Score

### Datadog Configuration

Simulação de integração Datadog:

* API Key
* Application Key
* Region
* Environment

Sem conexão real com APIs externas.

---

## Infrastructure Simulation

### Total Hosts

1.100 Servidores

### Windows Servers

550 Hosts

| Version             | Distribution |
| ------------------- | ------------ |
| Windows Server 2003 | 10%          |
| Windows Server 2016 | 20%          |
| Windows Server 2022 | 40%          |
| Windows Server 2025 | 30%          |

### Linux Servers

550 Hosts

| Version       | Distribution |
| ------------- | ------------ |
| CentOS 7      | 30%          |
| CentOS 8      | 40%          |
| CentOS Stream | 30%          |

### Environments

| Environment  | Distribution |
| ------------ | ------------ |
| Production   | 70%          |
| Homologation | 20%          |
| Development  | 10%          |

### Criticality

| Level  | Distribution |
| ------ | ------------ |
| High   | 20%          |
| Medium | 50%          |
| Low    | 30%          |

### Datacenters

* SP01
* SP02
* DR01

---

## Monitored Metrics

Cada host possui:

* CPU Usage
* Memory Usage
* Disk Usage
* Network Traffic
* Latency
* Availability
* Uptime
* Incident Count
* Alert Count
* Last Check-In

Atualização automática:

**15 segundos**

---

## Technology Stack

### Frontend

* React
* TypeScript
* Tailwind CSS
* ShadCN UI
* Recharts
* Lucide Icons

### Design

* Dark Mode
* Enterprise UI
* Datadog Inspired
* Grafana Inspired
* Dynatrace Inspired
* Azure Monitor Inspired
* ServiceNow Inspired

---

## Responsive Design

### Desktop

* Expanded Sidebar
* Full Dashboards
* UltraWide Support
* 4K Ready

### Tablet

* Collapsible Sidebar
* Two Column Layout

### Mobile

* Hamburger Menu
* Responsive Cards
* Adaptive Charts
* Mobile Optimized Navigation

---

## Alert Engine

### CPU

| Severity  | Threshold |
| --------- | --------- |
| Warning   | >75%      |
| Critical  | >90%      |
| Emergency | >95%      |

### Memory

| Severity  | Threshold |
| --------- | --------- |
| Warning   | >80%      |
| Critical  | >90%      |
| Emergency | >95%      |

### Disk

| Severity  | Threshold |
| --------- | --------- |
| Warning   | >80%      |
| Critical  | >90%      |
| Emergency | >95%      |

### Latency

| Severity  | Threshold |
| --------- | --------- |
| Warning   | >100ms    |
| Critical  | >200ms    |
| Emergency | >500ms    |

---

## Health Score

### Data Center Health Score

| Score    | Status    |
| -------- | --------- |
| 90 - 100 | Healthy   |
| 70 - 89  | Attention |
| 50 - 69  | Risk      |
| 0 - 49   | Critical  |

---

## Disclaimer

Este projeto é uma simulação de observabilidade enterprise.

Nenhuma integração real é realizada com:

* Datadog
* Grafana
* Dynatrace
* Azure Monitor
* ServiceNow

Todos os dados são gerados localmente através de mecanismos de simulação e atualização dinâmica.

---

## Target Audience

* NOC Teams
* SRE Teams
* Infrastructure Teams
* Cloud Operations
* Datacenter Operations
* Service Management
* Architecture Demonstrations
* Training Environments
* Executive Presentations

---

## Author

**Rodrigo Colares**

Enterprise Infrastructure | Cloud Operations | Observability | SRE | AI for Operations

---

## License

MIT License
