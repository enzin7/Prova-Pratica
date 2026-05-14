/* ═══════════════════════════════════════════════════════════════
   exemplos_chartjs.js
   Lógica de todos os 7 exemplos do Guia Chart.js
   ─────────────────────────────────────────────────────────────
   Cada seção está comentada linha a linha para fins didáticos.
   Os alunos podem ler o código-fonte direto como material de
   estudo, além de ver os gráficos funcionando no navegador.
   ═══════════════════════════════════════════════════════════════ */


/* ┌─────────────────────────────────────────────────┐
   │  SEÇÃO 0 — DADOS DO CSV E FUNÇÕES UTILITÁRIAS  │
   └─────────────────────────────────────────────────┘ */

// ── 0.1 Dados do CSV (simulados como array de objetos) ──────
// Em um projeto real, esses dados viriam do PapaParse.
// Aqui já estão parseados para simplificar o exemplo.

const DADOS = [
  { id: 1,  tipo_chamado: "Bug",      tempo_gasto: 3.5, data_chamado: "2026-01-15", titulo: "Erro na leitura de CNPJ",       categoria_detalhada: "Leitura CNPJ/CPF" },
  { id: 2,  tipo_chamado: "Melhoria", tempo_gasto: 1.0, data_chamado: "2026-01-20", titulo: "Novo campo de impostos",        categoria_detalhada: "Impostos" },
  { id: 3,  tipo_chamado: "Bug",      tempo_gasto: 5.0, data_chamado: "2026-02-10", titulo: "PDF não processado",            categoria_detalhada: "Erro OCR" },
  { id: 4,  tipo_chamado: "Bug",      tempo_gasto: 2.0, data_chamado: "2026-02-15", titulo: "Valor incorreto na nota",       categoria_detalhada: "Valor monetário" },
  { id: 5,  tipo_chamado: "Melhoria", tempo_gasto: 0.5, data_chamado: "2026-03-01", titulo: "Melhorar template",             categoria_detalhada: "Mapeamento" },
  { id: 6,  tipo_chamado: "Bug",      tempo_gasto: 4.0, data_chamado: "2026-03-10", titulo: "CNPJ fornecedor errado",        categoria_detalhada: "Leitura CNPJ/CPF" },
  { id: 7,  tipo_chamado: "Bug",      tempo_gasto: 1.5, data_chamado: "2026-03-15", titulo: "Alíquota ISS incorreta",        categoria_detalhada: "Impostos" },
  { id: 8,  tipo_chamado: "Melhoria", tempo_gasto: 2.0, data_chamado: "2026-04-01", titulo: "Dashboard de monitoramento",    categoria_detalhada: "Mapeamento" },
  { id: 9,  tipo_chamado: "Bug",      tempo_gasto: 6.0, data_chamado: "2026-04-12", titulo: "Layout novo não mapeado",       categoria_detalhada: "Erro OCR" },
  { id: 10, tipo_chamado: "Bug",      tempo_gasto: 3.0, data_chamado: "2026-04-20", titulo: "Código de barras ilegível",     categoria_detalhada: "Valor monetário" },
];


// ── 0.2 Paleta de cores (mesma do portal) ───────────────────
// Array com 10 cores. Usamos o índice % P.length para ciclar.

const P = [
  "#6366f1",   // indigo
  "#f59e0b",   // âmbar
  "#10b981",   // esmeralda
  "#ef4444",   // vermelho
  "#8b5cf6",   // violeta
  "#06b6d4",   // cyan
  "#f97316",   // laranja
  "#ec4899",   // rosa
  "#14b8a6",   // teal
  "#64748b",   // slate
];


// ── 0.3 Função contar() ─────────────────────────────────────
// Recebe um array de strings e retorna pares [nome, quantidade]
// ordenados do maior para o menor.
//
// Exemplo:
//   contar(["Bug", "Bug", "Melhoria", "Bug"])
//   → [["Bug", 3], ["Melhoria", 1]]

function contar(array) {
  const mapa = {};                         // objeto acumulador
  array.forEach(function(valor) {          // percorre o array
    if (valor) {                           // ignora null/undefined/""
      mapa[valor] = (mapa[valor] || 0) + 1; // incrementa contagem
    }
  });
  return Object.entries(mapa)              // {Bug:3} → [["Bug",3]]
    .sort(function(a, b) {                 // ordena decrescente
      return b[1] - a[1];
    });
}


// ── 0.4 Função mesLabel() ────────────────────────────────────
// Converte "2026-01" em "Jan/26" para os rótulos do eixo X.

function mesLabel(ym) {
  var partes = ym.split("-");              // ["2026", "01"]
  var ano = partes[0];                     // "2026"
  var mes = parseInt(partes[1]);           // 1
  var nomes = [
    "", "Jan", "Fev", "Mar", "Abr", "Mai", "Jun",
    "Jul", "Ago", "Set", "Out", "Nov", "Dez"
  ];
  return nomes[mes] + "/" + ano.slice(2);  // "Jan/26"
}


// ── 0.5 Agrupamentos pré-calculados ─────────────────────────
// Preparamos os dados uma vez, reutilizamos em vários gráficos.

// Contagem por tipo
var contagemTipo = contar(DADOS.map(function(r) { return r.tipo_chamado; }));
// → [["Bug", 7], ["Melhoria", 3]]

// Contagem por categoria
var contagemCat = contar(DADOS.map(function(r) { return r.categoria_detalhada; }));
// → [["Leitura CNPJ/CPF",2], ["Impostos",2], ["Erro OCR",2], ...]

var horasGastas = contar(DADOS.map(function(r) { return r.tempo_gasto; }));

// Meses únicos ordenados
var mesesUnicos = [];
var mesesSet = {};
DADOS.forEach(function(r) {
  var m = r.data_chamado.slice(0, 7);      // "2026-01"
  if (!mesesSet[m]) {
    mesesSet[m] = true;
    mesesUnicos.push(m);
  }
});
mesesUnicos.sort();
// → ["2026-01", "2026-02", "2026-03", "2026-04"]

// Por mês e tipo (para barras empilhadas)
var porMesTipo = {};
mesesUnicos.forEach(function(m) { porMesTipo[m] = {}; });
DADOS.forEach(function(r) {
  var m = r.data_chamado.slice(0, 7);
  var t = r.tipo_chamado;
  porMesTipo[m][t] = (porMesTipo[m][t] || 0) + 1;
});

// Horas por mês (para gráfico de linha)
var horasPorMes = {};
DADOS.forEach(function(r) {
  var m = r.data_chamado.slice(0, 7);
  horasPorMes[m] = (horasPorMes[m] || 0) + r.tempo_gasto;
});

// Tempo médio por categoria (para barras horizontais)
var tempoPorCat = {};
DADOS.forEach(function(r) {
  var c = r.categoria_detalhada;
  if (!tempoPorCat[c]) tempoPorCat[c] = { soma: 0, qtd: 0 };
  tempoPorCat[c].soma += r.tempo_gasto;
  tempoPorCat[c].qtd++;
});
var mediaPorCat = Object.entries(tempoPorCat)
  .map(function(e) {
    return { nome: e[0], media: +(e[1].soma / e[1].qtd).toFixed(2) };
  })
  .sort(function(a, b) { return b.media - a.media; });


// ── 0.6 Registro do plugin DataLabels ────────────────────────
// Registra o plugin GLOBALMENTE. Depois desativa por padrão.
// Cada gráfico que quiser rótulos precisa ativar explicitamente.

Chart.register(ChartDataLabels);
Chart.defaults.set("plugins.datalabels", { display: false });


// ── 0.7 Sistema de toggle de código ──────────────────────────
// Cada botão "Ver código" mostra/oculta o bloco correspondente.

function toggleCode(id) {
  var wrapper = document.getElementById("code-" + id);
  var btn = document.getElementById("btn-" + id);
  if (wrapper.classList.contains("visible")) {
    wrapper.classList.remove("visible");
    btn.classList.remove("open");
    btn.innerHTML = '<span class="arrow">▶</span> Ver código';
  } else {
    wrapper.classList.add("visible");
    btn.classList.add("open");
    btn.innerHTML = '<span class="arrow">▶</span> Ocultar código';
  }
}


/* ┌─────────────────────────────────────────────────────────┐
   │  SEÇÃO 1 — EXEMPLO 1: BARRAS VERTICAIS SIMPLES         │
   │  Conceito: type "bar", labels, datasets, backgroundColor│
   └─────────────────────────────────────────────────────────┘ */

(function exemplo1() {

  // 1. Pega o elemento <canvas> pelo id
  var ctx = document.getElementById("chart1");

  // 2. Cria o gráfico
  new Chart(ctx, {

    // ── type: define o tipo do gráfico ──
    // "bar" = barras verticais
    type: "bar",

    // ── data: contém labels + datasets ──
    data: {

      // labels: array de strings que aparece no eixo X
      // Cada posição corresponde a uma barra
      labels: contagemTipo.map(function(c) { return c[0]; }),
      // → ["Bug", "Melhoria"]

      // datasets: array de objetos. Cada objeto = 1 conjunto de barras.
      // Com 1 dataset, temos 1 barra por label.
      datasets: [{

        // label: nome do dataset (aparece no tooltip e na legenda)
        label: "Quantidade de chamados",

        // data: valores numéricos. Posição 0 → primeiro label, etc.
        data: contagemTipo.map(function(c) { return c[1]; }),
        // → [7, 3]

        // backgroundColor: cor de preenchimento das barras
        // String = mesma cor para todas. Array = uma cor por barra.
        backgroundColor: ["#ef4444", "#6366f1"],

        // borderRadius: arredondamento dos cantos (px)
        borderRadius: 8,

        // borderSkipped: false = arredonda TODOS os cantos
        // "bottom" = arredonda só o topo da barra
        borderSkipped: false,

        // barThickness: largura fixa das barras (px). Sem isso,
        // o Chart.js calcula automaticamente.
        barThickness: 80,
      }]
    },

    // ── options: controla aparência do gráfico ──
    options: {

      // responsive: true = redimensiona com a janela
      responsive: true,

      // maintainAspectRatio: false = altura controlada pelo container CSS
      // Se true, o Chart.js ignora a altura da div pai
      maintainAspectRatio: false,

      // plugins: configurações de funcionalidades extras
      plugins: {

        // legend: controla a legenda (caixinha de cores)
        legend: {
          display: false   // false = oculta a legenda
          // Com 1 dataset, a legenda é redundante
        }
      },

      // scales: configura os eixos X e Y
      scales: {

        // Eixo X (categorias)
        x: {
          grid: {
            display: false   // oculta linhas de grade verticais
          }
        },

        // Eixo Y (valores)
        y: {
          beginAtZero: true,  // força o eixo a começar em 0
          grid: {
            color: "#f0f0f0"  // cor das linhas de grade (cinza claro)
          }
        }
      }
    }
  });

})();


/* ┌─────────────────────────────────────────────────────────┐
   │  SEÇÃO 2 — EXEMPLO 2: BARRAS EMPILHADAS (STACKED)      │
   │  Conceito: múltiplos datasets, stacked: true            │
   └─────────────────────────────────────────────────────────┘ */

(function exemplo2() {

  var ctx = document.getElementById("chart2");

  new Chart(ctx, {
    type: "bar",

    data: {
      // Labels = meses formatados
      labels: mesesUnicos.map(mesLabel),
      // → ["Jan/26", "Fev/26", "Mar/26", "Abr/26"]

      // 2 datasets = 2 camadas de barras empilhadas
      datasets: [
        {
          label: "Bug",

          // Para cada mês, pega a contagem de bugs (ou 0)
          data: mesesUnicos.map(function(m) {
            return porMesTipo[m]["Bug"] || 0;
          }),
          // → [1, 2, 2, 2]

          backgroundColor: "#ef4444",
          borderRadius: 6,
          borderSkipped: false,
        },
        {
          label: "Melhoria",

          data: mesesUnicos.map(function(m) {
            return porMesTipo[m]["Melhoria"] || 0;
          }),
          // → [1, 0, 1, 1]

          backgroundColor: "#6366f1",
          borderRadius: 6,
          borderSkipped: false,
        }
      ]
    },

    options: {
      responsive: true,
      maintainAspectRatio: false,

      plugins: {
        legend: {
          display: false   // usamos legenda HTML customizada
        },

        // ── datalabels: ativado neste gráfico ──
        datalabels: {

          // display: função que decide se mostra o rótulo
          // ctx.dataset.data[ctx.dataIndex] = valor do ponto atual
          // Só mostra se > 0 (não mostra "0" em barras vazias)
          display: function(ctx) {
            return ctx.dataset.data[ctx.dataIndex] > 0;
          },

          // color: cor do texto do rótulo
          color: "#fff",

          // anchor: ponto de referência na barra
          // "center" = meio da barra
          anchor: "center",

          // align: posição do texto relativa ao anchor
          // "center" = centralizado no anchor
          align: "center",

          // font: configuração da fonte do rótulo
          font: {
            family: "'JetBrains Mono'",
            size: 11,
            weight: 700         // 700 = bold
          }
        }
      },

      // ── stacked: a chave do gráfico empilhado ──
      scales: {
        x: {
          stacked: true,       // empilha no eixo X
          grid: { display: false }
        },
        y: {
          stacked: true,       // empilha no eixo Y
          beginAtZero: true,
          grid: { color: "#f0f0f0" }
        }
      }
    }
  });

})();


/* ┌─────────────────────────────────────────────────────────┐
   │  SEÇÃO 3 — EXEMPLO 3: GRÁFICO DOUGHNUT (ROSCA)         │
   │  Conceito: type "doughnut", cutout, legenda à direita   │
   └─────────────────────────────────────────────────────────┘ */

(function exemplo3() {

  var ctx = document.getElementById("chart3");
  var total = DADOS.length;     // 10 chamados

  new Chart(ctx, {
    type: "doughnut",

    data: {
      // labels: nomes das fatias (aparecem no tooltip e na legenda)
      labels: contagemCat.map(function(c) { return c[0]; }),

      datasets: [{
        // data: tamanho de cada fatia
        data: contagemCat.map(function(c) { return c[1]; }),

        // backgroundColor: cor de cada fatia (na mesma ordem dos labels)
        backgroundColor: contagemCat.map(function(_, i) {
          return P[i % P.length];
        }),

        // borderWidth: espessura da borda entre fatias (px)
        // Cria separação visual entre as fatias
        borderWidth: 2,

        // borderColor: cor da borda entre fatias
        // Branco cria efeito limpo
        borderColor: "#fff",

        // hoverOffset: quanto a fatia "salta" ao hover (px)
        hoverOffset: 8,
      }]
    },

    options: {
      responsive: true,
      maintainAspectRatio: false,

      // ── cutout: tamanho do buraco central ──
      // "52%" = buraco com 52% do raio
      // "0%" = pizza sólida (igual a type: "pie")
      // "80%" = anel bem fino
      cutout: "52%",

      plugins: {
        // ── legend: configuração da legenda nativa ──
        legend: {
          position: "right",    // legenda à direita do gráfico

          labels: {
            boxWidth: 10,       // largura do quadradinho de cor
            padding: 8,         // espaço entre itens da legenda
            font: { size: 11 },

            // generateLabels: função que CUSTOMIZA os textos da legenda
            // Aqui adicionamos a porcentagem ao lado do nome
            generateLabels: function(chart) {
              var ds = chart.data.datasets[0];
              return chart.data.labels.map(function(label, i) {
                var pct = ((ds.data[i] / total) * 100).toFixed(1);
                return {
                  text: label + " (" + pct + "%)",
                  fillStyle: ds.backgroundColor[i],
                  hidden: false,
                  index: i
                };
              });
            }
          }
        },

        // ── datalabels no doughnut ──
        datalabels: {
          // Só mostra rótulo se a fatia for > 8% do total
          display: function(ctx) {
            var val = ctx.dataset.data[ctx.dataIndex];
            return (val / total * 100) > 8;
          },

          color: "#fff",

          font: {
            family: "'JetBrains Mono'",
            size: 11,
            weight: 700
          },

          // formatter: transforma o valor antes de exibir
          // Mostra "2 (20.0%)"
          formatter: function(value) {
            var pct = ((value / total) * 100).toFixed(1);
            return value + "\n" + pct + "%";
          }
        }
      }
    }
  });

})();


/* ┌─────────────────────────────────────────────────────────┐
   │  SEÇÃO 4 — EXEMPLO 4: GRÁFICO DE LINHA                 │
   │  Conceito: type "line", fill, tension, pointRadius      │
   └─────────────────────────────────────────────────────────┘ */

(function exemplo4() {

  var ctx = document.getElementById("chart4");

  new Chart(ctx, {
    type: "line",

    data: {
      labels: mesesUnicos.map(mesLabel),

      datasets: [{
        label: "Horas gastas",

        // data: valores numéricos por mês
        data: mesesUnicos.map(function(m) { return horasPorMes[m]; }),
        // → [4.5, 7.0, 5.5, 11.0]

        // ── borderColor: cor da LINHA ──
        borderColor: "#6366f1",

        // ── backgroundColor: cor do PREENCHIMENTO abaixo da linha ──
        // O "18" no final é opacidade HEX (~9%)
        // Sem isso, o preenchimento fica opaco demais
        backgroundColor: "#6366f118",

        // fill: true = preenche a área abaixo da linha
        // false = só a linha sem preenchimento
        fill: true,

        // ── tension: curvatura da linha ──
        // 0   = retas (linhas angulares)
        // 0.3 = curva suave (usado aqui)
        // 1   = muito curvo (exagerado)
        tension: 0.35,

        // ── pointRadius: tamanho das bolinhas nos pontos ──
        pointRadius: 6,

        // pointBackgroundColor: cor interna do ponto
        // Branco cria efeito de "bolinha vazada"
        pointBackgroundColor: "#fff",

        // pointBorderWidth: espessura da borda do ponto
        pointBorderWidth: 2.5,

        // pointBorderColor: cor da borda do ponto
        // Geralmente igual à borderColor da linha
        pointBorderColor: "#6366f1",

        // pointHoverRadius: tamanho do ponto ao passar o mouse
        pointHoverRadius: 8,
      }]
    },

    options: {
      responsive: true,
      maintainAspectRatio: false,

      plugins: {
        legend: { display: false },

        datalabels: {
          display: true,
          color: "#6366f1",
          anchor: "end",          // ancora no topo do ponto
          align: "top",           // texto acima do anchor
          offset: 4,              // 4px de distância
          font: {
            family: "'JetBrains Mono'",
            size: 11,
            weight: 600
          },
          // Mostra o valor seguido de "h"
          formatter: function(value) {
            return value + "h";
          }
        }
      },

      scales: {
        x: { grid: { display: false } },
        y: {
          beginAtZero: true,
          grid: { color: "#f0f0f0" },
          ticks: {
            // callback: formata os números do eixo Y
            // Adiciona "h" após cada valor
            callback: function(value) {
              return value + "h";
            }
          }
        }
      }
    }
  });

})();


/* ┌─────────────────────────────────────────────────────────┐
   │  SEÇÃO 5 — EXEMPLO 5: BARRAS HORIZONTAIS                │
   │  Conceito: indexAxis "y", tempo médio por categoria     │
   └─────────────────────────────────────────────────────────┘ */

(function exemplo5() {

  var ctx = document.getElementById("chart5");

  new Chart(ctx, {
    type: "bar",

    data: {
      // Labels = nomes das categorias (aparecerão no eixo Y)
      labels: mediaPorCat.map(function(c) { return c.nome; }),

      datasets: [{
        label: "Tempo médio (h)",

        data: mediaPorCat.map(function(c) { return c.media; }),
        // → [3.5, 2.5, 2.5, 1.5, 1.25]

        // Cores: uma por barra, ciclando pela paleta
        backgroundColor: mediaPorCat.map(function(_, i) {
          return P[i % P.length];
        }),

        borderRadius: 6,
        borderSkipped: false,
      }]
    },

    options: {
      responsive: true,
      maintainAspectRatio: false,

      // ═══ indexAxis: "y" ═══
      // ESTE É O SEGREDO para barras horizontais.
      // "x" (padrão) = barras verticais
      // "y" = barras horizontais (categorias no eixo Y)
      indexAxis: "y",

      plugins: {
        legend: { display: false },

        datalabels: {
          display: true,
          color: "#fff",
          anchor: "center",
          align: "center",
          font: {
            family: "'JetBrains Mono'",
            size: 11,
            weight: 700
          },
          formatter: function(value) {
            return value + "h";
          }
        }
      },

      // Quando indexAxis: "y", os eixos se invertem logicamente!
      // scales.x agora é o eixo dos VALORES (horizontal)
      // scales.y agora é o eixo das CATEGORIAS (vertical)
      scales: {
        x: {
          grid: { color: "#f0f0f0" },
          ticks: {
            callback: function(v) { return v + "h"; }
          }
        },
        y: {
          grid: { display: false }
        }
      }
    }
  });

})();


/* ┌─────────────────────────────────────────────────────────┐
   │  SEÇÃO 6 — EXEMPLO 6: MÚLTIPLAS LINHAS                  │
   │  Conceito: 2 datasets tipo line, uma linha por tipo     │
   └─────────────────────────────────────────────────────────┘ */

(function exemplo6() {

  var ctx = document.getElementById("chart6");

  new Chart(ctx, {
    type: "line",

    data: {
      labels: mesesUnicos.map(mesLabel),

      datasets: [
        // ── Dataset 1: Bugs por mês ──
        {
          label: "Bug",
          data: mesesUnicos.map(function(m) {
            return porMesTipo[m]["Bug"] || 0;
          }),
          borderColor: "#ef4444",
          backgroundColor: "#ef444418",
          fill: true,
          tension: 0.35,
          pointRadius: 5,
          pointBackgroundColor: "#fff",
          pointBorderWidth: 2,
          pointBorderColor: "#ef4444",
        },
        // ── Dataset 2: Melhorias por mês ──
        {
          label: "Melhoria",
          data: mesesUnicos.map(function(m) {
            return porMesTipo[m]["Melhoria"] || 0;
          }),
          borderColor: "#6366f1",
          backgroundColor: "#6366f118",
          fill: true,
          tension: 0.35,
          pointRadius: 5,
          pointBackgroundColor: "#fff",
          pointBorderWidth: 2,
          pointBorderColor: "#6366f1",
        }
      ]
    },

    options: {
      responsive: true,
      maintainAspectRatio: false,

      plugins: {
        // Legenda nativa ativada (para mostrar 2 datasets)
        legend: {
          display: false    // usamos legenda HTML
        },

        datalabels: {
          display: true,
          anchor: "end",
          align: "top",
          offset: 2,
          font: {
            family: "'JetBrains Mono'",
            size: 10,
            weight: 600
          },
          // A cor do rótulo muda com base no dataset
          color: function(ctx) {
            return ctx.dataset.borderColor;
          }
        }
      },

      scales: {
        x: { grid: { display: false } },
        y: {
          beginAtZero: true,
          grid: { color: "#f0f0f0" },
          ticks: { stepSize: 1 }
        }
      }
    }
  });

})();


/* ┌─────────────────────────────────────────────────────────┐
   │  SEÇÃO 7 — EXEMPLO 7: DESTRUIR E RECRIAR                │
   │  Conceito: chart.destroy(), referências, troca dinâmica │
   └─────────────────────────────────────────────────────────┘ */

// Variável que guarda a referência ao gráfico atual
// Precisa ser global porque os botões acessam de fora
var chartEx7 = null;

// ── Função que cria um gráfico de BARRAS ──
function criarBarras7() {
  var ctx = document.getElementById("chart7");

  // 1. Se existe um gráfico anterior, DESTROI
  //    Sem isso, o Chart.js sobrepõe gráficos e causa cintilação
  if (chartEx7) {
    chartEx7.destroy();
    chartEx7 = null;
  }

  // 2. Cria o novo gráfico e GUARDA a referência
  chartEx7 = new Chart(ctx, {
    type: "bar",
    data: {
      labels: contagemTipo.map(function(c) { return c[0]; }),
      datasets: [{
        label: "Chamados",
        data: contagemTipo.map(function(c) { return c[1]; }),
        backgroundColor: ["#ef4444", "#6366f1"],
        borderRadius: 8,
        borderSkipped: false,
        barThickness: 80,
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        x: { grid: { display: false } },
        y: { beginAtZero: true, grid: { color: "#f0f0f0" } }
      }
    }
  });

  // Atualiza visual dos botões
  atualizarBotoes7("barras");
}

// ── Função que cria um gráfico de ROSCA ──
function criarRosca7() {
  var ctx = document.getElementById("chart7");

  if (chartEx7) {
    chartEx7.destroy();
    chartEx7 = null;
  }

  chartEx7 = new Chart(ctx, {
    type: "doughnut",
    data: {
      labels: contagemCat.map(function(c) { return c[0]; }),
      datasets: [{
        data: contagemCat.map(function(c) { return c[1]; }),
        backgroundColor: contagemCat.map(function(_, i) { return P[i]; }),
        borderWidth: 2,
        borderColor: "#fff",
        hoverOffset: 6,
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      cutout: "52%",
      plugins: {
        legend: { position: "right", labels: { boxWidth: 10, font: { size: 11 } } }
      }
    }
  });

  atualizarBotoes7("rosca");
}

// ── Função que cria um gráfico de LINHA ──
function criarLinha7() {
  var ctx = document.getElementById("chart7");

  if (chartEx7) {
    chartEx7.destroy();
    chartEx7 = null;
  }

  chartEx7 = new Chart(ctx, {
    type: "line",
    data: {
      labels: mesesUnicos.map(mesLabel),
      datasets: [{
        label: "Horas",
        data: mesesUnicos.map(function(m) { return horasPorMes[m]; }),
        borderColor: "#10b981",
        backgroundColor: "#10b98118",
        fill: true,
        tension: 0.35,
        pointRadius: 5,
        pointBackgroundColor: "#fff",
        pointBorderWidth: 2,
        pointBorderColor: "#10b981",
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        x: { grid: { display: false } },
        y: { beginAtZero: true, grid: { color: "#f0f0f0" } }
      }
    }
  });

  atualizarBotoes7("linha");
}

// ── Helper: destaca o botão ativo ──
function atualizarBotoes7(tipo) {
  var botoes = document.querySelectorAll("#ex7-btns .btn");
  botoes.forEach(function(b) { b.classList.remove("active"); });
  var mapa = { "barras": 0, "rosca": 1, "linha": 2 };
  if (mapa[tipo] !== undefined) {
    botoes[mapa[tipo]].classList.add("active");
  }
}

// Inicializa o exemplo 7 com o gráfico de barras
criarBarras7();

/* ┌─────────────────────────────────────────────────────────┐
   │  EXERCÍCIOS — gráficos propostos no Guia Chart.js       │
   └─────────────────────────────────────────────────────────┘ */

(function exercicio1() {
  var ctx = document.getElementById("chartex1");
  if (!ctx) return;

  new Chart(ctx, {
    type: "bar",
    data: {
      labels: contagemCat.map(function(c) { return c[0]; }),
      datasets: [{
        label: "Quantidade por categoria detalhada",
        data: contagemCat.map(function(c) { return c[1]; }),
        backgroundColor: contagemCat.map(function(_, i) { return P[i % P.length]; }),
        borderRadius: 8,
        borderSkipped: false,
        barThickness: 52,
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        datalabels: {
          display: true,
          anchor: "end",
          align: "top",
          color: "#111827",
          font: {
            family: "'JetBrains Mono'",
            size: 11,
            weight: 700
          }
        }
      },
      scales: {
        x: { grid: { display: false } },
        y: {
          beginAtZero: true,
          ticks: { stepSize: 1 },
          grid: { color: "#f0f0f0" }
        }
      }
    }
  });
})();

(function exercicio2() {
  var ctx = document.getElementById("chartex2");
  if (!ctx) return;
  var total = DADOS.length;

  new Chart(ctx, {
    type: "doughnut",
    data: {
      labels: contagemTipo.map(function(c) { return c[0]; }),
      datasets: [{
        data: contagemTipo.map(function(c) { return c[1]; }),
        backgroundColor: ["#ef4444", "#6366f1"],
        borderWidth: 2,
        borderColor: "#fff",
        hoverOffset: 8,
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      cutout: "52%",
      plugins: {
        legend: {
          position: "right",
          labels: {
            boxWidth: 10,
            padding: 8,
            font: { size: 11 },
            generateLabels: function(chart) {
              var ds = chart.data.datasets[0];
              return chart.data.labels.map(function(label, i) {
                var pct = ((ds.data[i] / total) * 100).toFixed(1);
                return {
                  text: label + " (" + pct + "%)",
                  fillStyle: ds.backgroundColor[i],
                  strokeStyle: ds.backgroundColor[i],
                  hidden: false,
                  index: i
                };
              });
            }
          }
        },
        datalabels: {
          display: true,
          color: "#fff",
          font: {
            family: "'JetBrains Mono'",
            size: 11,
            weight: 700
          },
          formatter: function(value) {
            var pct = ((value / total) * 100).toFixed(1);
            return value + "\n" + pct + "%";
          }
        }
      }
    }
  });
})();

(function exercicio3() {
  var ctx = document.getElementById("chartex3");
  if (!ctx) return;

  new Chart(ctx, {
    type: "line",
    data: {
      labels: mesesUnicos.map(mesLabel),
      datasets: [{
        label: "Horas gastas",
        data: mesesUnicos.map(function(m) { return horasPorMes[m] || 0; }),
        borderColor: "#6366f1",
        backgroundColor: "rgba(99, 102, 241, 0.15)",
        fill: true,
        tension: 0.4,
        pointRadius: 6,
        pointBackgroundColor: "#fff",
        pointBorderWidth: 2.5,
        pointBorderColor: "#6366f1",
        pointHoverRadius: 8,
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        datalabels: {
          display: true,
          color: "#6366f1",
          anchor: "end",
          align: "top",
          offset: 4,
          font: {
            family: "'JetBrains Mono'",
            size: 11,
            weight: 600
          },
          formatter: function(value) { return value + "h"; }
        }
      },
      scales: {
        x: { grid: { display: false } },
        y: {
          beginAtZero: true,
          grid: { color: "#f0f0f0" },
          ticks: { callback: function(value) { return value + "h"; } }
        }
      }
    }
  });
})();

(function exercicio4() {
  var ctx = document.getElementById("chartex4");
  if (!ctx) return;

  new Chart(ctx, {
    type: "bar",
    data: {
      labels: mediaPorCat.map(function(c) { return c.nome; }),
      datasets: [{
        label: "Tempo médio (h)",
        data: mediaPorCat.map(function(c) { return c.media; }),
        backgroundColor: mediaPorCat.map(function(_, i) { return P[i % P.length]; }),
        borderRadius: 6,
        borderSkipped: false,
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      indexAxis: "y",
      plugins: {
        legend: { display: false },
        datalabels: {
          display: true,
          color: "#fff",
          anchor: "center",
          align: "center",
          font: {
            family: "'JetBrains Mono'",
            size: 11,
            weight: 700
          },
          formatter: function(value) { return value + "h"; }
        }
      },
      scales: {
        x: {
          beginAtZero: true,
          grid: { color: "#f0f0f0" },
          ticks: { callback: function(v) { return v + "h"; } }
        },
        y: { grid: { display: false } }
      }
    }
  });
})();



(function exercicio5() {
  var ctx = document.getElementById("chartex5");
  if (!ctx) return;

  new Chart(ctx, {
    type: "bar",
    data: {
      labels: mesesUnicos.map(mesLabel),
      datasets: [
        {
          label: "Bug",
          data: mesesUnicos.map(function(m) { return porMesTipo[m]["Bug"] || 0; }),
          backgroundColor: "#ef4444",
          borderRadius: 6,
          borderSkipped: false,
        },
        {
          label: "Melhoria",
          data: mesesUnicos.map(function(m) { return porMesTipo[m]["Melhoria"] || 0; }),
          backgroundColor: "#6366f1",
          borderRadius: 6,
          borderSkipped: false,
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        datalabels: {
          display: function(ctx) {
            return ctx.dataset.data[ctx.dataIndex] > 0;
          },
          color: "#fff",
          anchor: "center",
          align: "center",
          font: {
            family: "'JetBrains Mono'",
            size: 11,
            weight: 700
          },
          formatter: function(value) { return value; }
        }
      },
      scales: {
        x: {
          stacked: true,
          grid: { display: false }
        },
        y: {
          stacked: true,
          beginAtZero: true,
          ticks: { stepSize: 1 },
          grid: { color: "#f0f0f0" }
        }
      }
    }
  });
})();

(function exercicio6() {
  var ctx = document.getElementById("chartex6");
  if (!ctx) return;

  new Chart(ctx, {
    type: "line",
    data: {
      labels: mesesUnicos.map(mesLabel),
      datasets: [
        {
          label: "Bug",
          data: mesesUnicos.map(function(m) { return porMesTipo[m]["Bug"] || 0; }),
          borderColor: "#ef4444",
          backgroundColor: "#ef444418",
          fill: true,
          tension: 0.35,
          pointRadius: 5,
          pointBackgroundColor: "#fff",
          pointBorderWidth: 2,
          pointBorderColor: "#ef4444",
        },
        {
          label: "Melhoria",
          data: mesesUnicos.map(function(m) { return porMesTipo[m]["Melhoria"] || 0; }),
          borderColor: "#6366f1",
          backgroundColor: "#6366f118",
          fill: true,
          tension: 0.35,
          pointRadius: 5,
          pointBackgroundColor: "#fff",
          pointBorderWidth: 2,
          pointBorderColor: "#6366f1",
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        datalabels: {
          display: true,
          anchor: "end",
          align: "top",
          offset: 2,
          font: {
            family: "'JetBrains Mono'",
            size: 10,
            weight: 600
          },
          color: function(ctx) { return ctx.dataset.borderColor; }
        }
      },
      scales: {
        x: { grid: { display: false } },
        y: {
          beginAtZero: true,
          ticks: { stepSize: 1 },
          grid: { color: "#f0f0f0" }
        }
      }
    }
  });
})();

var chartAtualExercicio7 = null;

function destruirGraficoExercicio7() {
  if (chartAtualExercicio7) {
    chartAtualExercicio7.destroy();
    chartAtualExercicio7 = null;
  }
}

function atualizarBotoesExercicio7(tipo) {
  var botoes = document.querySelectorAll("#exercicio7-btns .btn");
  botoes.forEach(function(botao) { botao.classList.remove("active"); });

  if (tipo === "barras" && botoes[0]) botoes[0].classList.add("active");
  if (tipo === "rosca" && botoes[1]) botoes[1].classList.add("active");
}

function criarBarrasExercicio7() {
  var ctx = document.getElementById("chartex7");
  if (!ctx) return;

  destruirGraficoExercicio7();

  chartAtualExercicio7 = new Chart(ctx, {
    type: "bar",
    data: {
      labels: contagemCat.map(function(c) { return c[0]; }),
      datasets: [{
        label: "Chamados por categoria",
        data: contagemCat.map(function(c) { return c[1]; }),
        backgroundColor: contagemCat.map(function(_, i) { return P[i % P.length]; }),
        borderRadius: 8,
        borderSkipped: false,
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        datalabels: {
          display: true,
          anchor: "end",
          align: "top",
          color: "#444",
          font: {
            family: "'JetBrains Mono'",
            size: 11,
            weight: 700
          }
        }
      },
      scales: {
        x: { grid: { display: false } },
        y: {
          beginAtZero: true,
          ticks: { stepSize: 1 },
          grid: { color: "#f0f0f0" }
        }
      }
    }
  });

  atualizarBotoesExercicio7("barras");
}

function criarRoscaExercicio7() {
  var ctx = document.getElementById("chartex7");
  if (!ctx) return;

  destruirGraficoExercicio7();

  var total = DADOS.length;

  chartAtualExercicio7 = new Chart(ctx, {
    type: "doughnut",
    data: {
      labels: contagemTipo.map(function(c) { return c[0]; }),
      datasets: [{
        data: contagemTipo.map(function(c) { return c[1]; }),
        backgroundColor: ["#ef4444", "#6366f1"],
        borderWidth: 2,
        borderColor: "#fff",
        hoverOffset: 8,
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      cutout: "52%",
      plugins: {
        legend: {
          position: "right",
          labels: {
            boxWidth: 10,
            padding: 8,
            font: { size: 11 },
            generateLabels: function(chart) {
              var ds = chart.data.datasets[0];
              return chart.data.labels.map(function(label, i) {
                var pct = ((ds.data[i] / total) * 100).toFixed(1);
                return {
                  text: label + " (" + pct + "%)",
                  fillStyle: ds.backgroundColor[i],
                  strokeStyle: ds.backgroundColor[i],
                  hidden: false,
                  index: i
                };
              });
            }
          }
        },
        datalabels: {
          display: true,
          color: "#fff",
          font: {
            family: "'JetBrains Mono'",
            size: 11,
            weight: 700
          },
          formatter: function(value) {
            var pct = ((value / total) * 100).toFixed(1);
            return value + "\n" + pct + "%";
          }
        }
      }
    }
  });

  atualizarBotoesExercicio7("rosca");
}

criarBarrasExercicio7();

/* ┌─────────────────────────────────────────────────────────┐
   │  SEÇÃO 8 — EXPORTAR JSON                                │
   │  Conceito: Blob, createObjectURL, download sem servidor │
   └─────────────────────────────────────────────────────────┘ */

function exportarJSON() {

  // 1. Monta o objeto com todos os resultados
  var resultado = {

    meta: {
      exportadoEm: new Date().toISOString(),
      totalRegistros: DADOS.length,
    },

    distribuicao: {
      porTipo: contagemTipo.map(function(c) {
        return {
          nome: c[0],
          quantidade: c[1],
          percentual: +((c[1] / DADOS.length) * 100).toFixed(2)
        };
      }),
      porCategoria: contagemCat.map(function(c) {
        return {
          nome: c[0],
          quantidade: c[1],
          percentual: +((c[1] / DADOS.length) * 100).toFixed(2)
        };
      }),
      porMes: mesesUnicos.map(function(m) {
        var total = 0;
        Object.values(porMesTipo[m]).forEach(function(v) { total += v; });
        return { mes: m, mesFormatado: mesLabel(m), quantidade: total };
      }),
    },

    horasPorMes: mesesUnicos.map(function(m) {
      return { mes: mesLabel(m), horas: horasPorMes[m] };
    }),

    tempoMedioPorCategoria: mediaPorCat,

    dados: DADOS,
  };

  // 2. Converte para string JSON com indentação de 2 espaços
  var jsonString = JSON.stringify(resultado, null, 2);

  // 3. Cria um Blob (objeto binário na memória)
  //    type: "application/json" diz ao navegador que é JSON
  var blob = new Blob([jsonString], { type: "application/json" });

  // 4. Cria uma URL temporária apontando para o Blob
  var url = URL.createObjectURL(blob);

  // 5. Cria um <a> invisível e simula um clique para baixar
  var link = document.createElement("a");
  link.href = url;
  link.download = "analise_chamados_" + new Date().toISOString().slice(0, 10) + ".json";
  link.click();

  // 6. Libera a memória da URL temporária
  URL.revokeObjectURL(url);

  // 7. Feedback visual
  var btn = document.getElementById("btnExport");
  var textoOriginal = btn.textContent;
  btn.textContent = "✓ JSON baixado!";
  btn.disabled = true;
  setTimeout(function() {
    btn.textContent = textoOriginal;
    btn.disabled = false;
  }, 2000);
}