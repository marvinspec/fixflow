/* ==========================================================================
   FIXFLOW - APPLICATION ENGINE (JS)
   Empresa: Edifica Soluções & Filiais
   ========================================================================== */

(function () {
  'use strict';

  const STORAGE_KEY = 'fixflow_app_data_v2';
  const SESSION_USER_KEY = 'fixflow_logged_user_v2';

  // Native User Credentials Database
  const NATIVE_USERS = [
    {
      username: 'marvin',
      password: 'Edifica0804@',
      name: 'Marvin',
      role: 'Gestão',
      empresa: 'Edifica Soluções',
      filiais: ['Edifica Soluções', 'Soler Serv']
    },
    {
      username: 'Jacklima',
      password: 'Edifica0804',
      name: 'Jack Lima',
      role: 'Gestão',
      empresa: 'Edifica Soluções',
      filiais: ['Edifica Soluções', 'Soler Serv']
    },
    {
      username: 'Luiz_Franco',
      password: 'AdmEdifica1008',
      name: 'Luiz Franco',
      role: 'Administrativo',
      empresa: 'Edifica Soluções',
      filiais: ['Edifica Soluções']
    }
  ];

  // Application State
  let appState = {
    loggedUser: null,
    currentFilial: 'Edifica Soluções',
    currentViewMode: 'kanban', // 'kanban', 'table'
    activeTab: 'dashboardTab',
    searchQuery: '',
    
    // Core Collections
    services: [],
    financialEntries: [],
    comments: {}, // Map by SS ID: [{ author, date, text }]
    attachments: {} // Map by SS ID: [{ name, type, date, dataUrl }]
  };

  // Seed Data for Initial Launch
  const initialSeedData = {
    services: [
      {
        id: 'SS-1001',
        clienteFinal: 'Hospital Santa Clara',
        clienteFaturamento: 'Grupo Santa Clara Saúde S.A.',
        cidadeEstado: 'São Paulo / SP',
        filial: 'Edifica Soluções',
        descricao: 'Manutenção Preventiva e Limpeza de Dutos no Chiller Trane 50TR.',
        tipo: 'Preventiva',
        tecnico: 'Carlos Andrade',
        valorCobrado: 12000.00,
        prevMaoObra: 2000.00,
        prevMaterial: 3000.00,
        status: 'Em Andamento',
        dataCriacao: '2026-08-01',
        createdBy: 'marvin',

        // Faturamento / NF fields
        cnpjFat: '12.345.678/0001-90',
        numeroOC: 'OC-9842',
        numeroNF: 'NF-4052',
        dataFat: '2026-08-05',
        dataRecPrev: '2026-09-05',
        dataRecReal: '',
        possuiDesconto: true,
        descDesconto: 'Desconto de pontualidade negociado',
        valorDesconto: 500.00
      },
      {
        id: 'SS-1002',
        clienteFinal: 'Shopping Plaza Central',
        clienteFaturamento: 'Plaza Shopping Empreendimentos',
        cidadeEstado: 'Campinas / SP',
        filial: 'Soler Serv',
        descricao: 'Troca de Disjuntores Média Tensão na Cabine Primária.',
        tipo: 'Corretiva',
        tecnico: 'Roberto Silva',
        valorCobrado: 18500.00,
        prevMaoObra: 3500.00,
        prevMaterial: 5000.00,
        status: 'Aguardando OC',
        dataCriacao: '2026-08-03',
        createdBy: 'Luiz_Franco',

        cnpjFat: '98.765.432/0001-10',
        numeroOC: '',
        numeroNF: '',
        dataFat: '',
        dataRecPrev: '2026-09-15',
        dataRecReal: '',
        possuiDesconto: false,
        descDesconto: '',
        valorDesconto: 0.00
      },
      {
        id: 'SS-1003',
        clienteFinal: 'Condomínio Horizon',
        clienteFaturamento: 'Condomínio Edifício Horizon',
        cidadeEstado: 'Santo André / SP',
        filial: 'Edifica Soluções',
        descricao: 'Substituição de Motobomba de Recalque e Tubulação Galvanizada.',
        tipo: 'Corretiva',
        tecnico: 'Carlos Andrade',
        valorCobrado: 7200.00,
        prevMaoObra: 1500.00,
        prevMaterial: 2000.00,
        status: 'Recebido',
        dataCriacao: '2026-07-28',
        createdBy: 'Jacklima',

        cnpjFat: '45.123.789/0001-33',
        numeroOC: 'OC-7710',
        numeroNF: 'NF-4048',
        dataFat: '2026-07-30',
        dataRecPrev: '2026-08-10',
        dataRecReal: '2026-08-09',
        possuiDesconto: false,
        descDesconto: '',
        valorDesconto: 0.00
      }
    ],

    financialEntries: [
      // FIN Custos de OS
      {
        id: 'FIN-5001',
        tipoDestino: 'SS',
        vinculoSS: 'SS-1001',
        filial: 'Edifica Soluções',
        centroCusto: 'Peças / Insumos OS',
        descricao: 'Compressor Trane Scroll 3D Danfoss',
        tipoCompra: 'Peças de Refrigeração',
        parcelas: 1,
        valor: 3800.00,
        chavePix: '12345678000190',
        dataPrevisao: '2026-08-10',
        dataPagamentoReal: '2026-08-04',
        statusPagamento: 'Pago',
        createdBy: 'marvin'
      },
      {
        id: 'FIN-5002',
        tipoDestino: 'SS',
        vinculoSS: 'SS-1001',
        filial: 'Edifica Soluções',
        centroCusto: 'Mão de Obra Terceirizada',
        descricao: 'Diárias de Soldador Especialista Cobre',
        tipoCompra: 'Serviços Terceirizados',
        parcelas: 1,
        valor: 1200.00,
        chavePix: 'soldador@pix.com',
        dataPrevisao: '2026-08-06',
        dataPagamentoReal: '2026-08-06',
        statusPagamento: 'Pago',
        createdBy: 'marvin'
      },
      {
        id: 'FIN-5003',
        tipoDestino: 'SS',
        vinculoSS: 'SS-1002',
        filial: 'Soler Serv',
        centroCusto: 'Peças / Insumos OS',
        descricao: 'Disjuntores Caixa Moldada Siemens 400A',
        tipoCompra: 'Componentes Elétricos',
        parcelas: 2,
        valor: 5400.00,
        chavePix: 'financeiro@siemens.com',
        dataPrevisao: '2026-08-20',
        dataPagamentoReal: '',
        statusPagamento: 'Pendente',
        createdBy: 'Luiz_Franco'
      },

      // DP Despesas da Empresa
      {
        id: 'DP-9001',
        tipoDestino: 'DP',
        vinculoSS: '',
        filial: 'Edifica Soluções',
        centroCusto: 'Administrativo / Aluguel',
        descricao: 'Aluguel Galpão Matriz & Base Operacional',
        tipoCompra: 'Aluguel Predial',
        parcelas: 1,
        valor: 4200.00,
        chavePix: 'imobiliaria@pix.com',
        dataPrevisao: '2026-08-05',
        dataPagamentoReal: '2026-08-05',
        statusPagamento: 'Pago',
        createdBy: 'Jacklima'
      },
      {
        id: 'DP-9002',
        tipoDestino: 'DP',
        vinculoSS: '',
        filial: 'Edifica Soluções',
        centroCusto: 'Imposto',
        descricao: 'Imposto DAS Simples Nacional',
        tipoCompra: 'Tributos',
        parcelas: 1,
        valor: 2350.00,
        chavePix: '',
        dataPrevisao: '2026-08-20',
        dataPagamentoReal: '',
        statusPagamento: 'Pendente',
        createdBy: 'marvin'
      },
      {
        id: 'DP-9003',
        tipoDestino: 'DP',
        vinculoSS: '',
        filial: 'Soler Serv',
        centroCusto: 'Retirada de Lucro',
        descricao: 'Distribuição Parcial de Lucro aos Sócios',
        tipoCompra: 'Pró-labore / Lucros',
        parcelas: 1,
        valor: 5000.00,
        chavePix: 'socio@pix.com',
        dataPrevisao: '2026-08-15',
        dataPagamentoReal: '2026-08-10',
        statusPagamento: 'Pago',
        createdBy: 'marvin'
      }
    ],

    comments: {
      'SS-1001': [
        { author: 'marvin', date: '04/08/2026 14:20', text: 'Compressor comprado e faturado via FIN-5001. Acompanhar instalação.' },
        { author: 'Carlos Andrade', date: '06/08/2026 09:15', text: 'Soldador executou as bolsas de cobre. Custo de mão de obra em FIN-5002.' }
      ]
    },

    attachments: {
      'SS-1001': [
        { name: 'Nota_Fiscal_Compressor.pdf', type: 'application/pdf', date: '04/08/2026', dataUrl: '' }
      ]
    }
  };

  let chartCashFlowInstance = null;
  let chartCostDistributionInstance = null;

  // --- INITIALIZATION ---
  document.addEventListener('DOMContentLoaded', () => {
    loadDataFromStorage();
    checkSessionUser();
    setupEventListeners();
  });

  // --- STORAGE & SESSION ---
  function loadDataFromStorage() {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        appState.services = parsed.services || [];
        appState.financialEntries = parsed.financialEntries || [];
        appState.comments = parsed.comments || {};
        appState.attachments = parsed.attachments || {};
      } catch (e) {
        loadSeedData();
      }
    } else {
      loadSeedData();
    }
  }

  function loadSeedData() {
    appState.services = JSON.parse(JSON.stringify(initialSeedData.services));
    appState.financialEntries = JSON.parse(JSON.stringify(initialSeedData.financialEntries));
    appState.comments = JSON.parse(JSON.stringify(initialSeedData.comments));
    appState.attachments = JSON.parse(JSON.stringify(initialSeedData.attachments));
    saveDataToStorage();
  }

  function saveDataToStorage() {
    const dataToSave = {
      services: appState.services,
      financialEntries: appState.financialEntries,
      comments: appState.comments,
      attachments: appState.attachments
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(dataToSave));
  }

  function checkSessionUser() {
    const savedUser = sessionStorage.getItem(SESSION_USER_KEY);
    if (savedUser) {
      try {
        appState.loggedUser = JSON.parse(savedUser);
        showAppLayout();
        return;
      } catch (e) {}
    }
    showLoginView();
  }

  function showLoginView() {
    document.getElementById('loginView').classList.remove('hidden');
    document.getElementById('appLayout').classList.add('hidden');
  }

  function showAppLayout() {
    document.getElementById('loginView').classList.add('hidden');
    document.getElementById('appLayout').classList.remove('hidden');

    const user = appState.loggedUser;
    document.getElementById('loggedUserName').textContent = user.name;
    document.getElementById('loggedUserRole').textContent = user.role;

    // Populate Filial Selector
    const filialSelect = document.getElementById('filialSelect');
    let options = '';
    user.filiais.forEach(f => {
      options += `<option value="${f}">${f}</option>`;
    });
    filialSelect.innerHTML = options;
    appState.currentFilial = user.filiais[0] || 'Edifica Soluções';
    filialSelect.value = appState.currentFilial;

    // Apply Permissions (Administrativo vs Gestão)
    applyUserPermissions();
    renderAllViews();
  }

  // --- AUTHENTICATION EVENTS ---
  function handleLogin(e) {
    e.preventDefault();
    const userVal = document.getElementById('loginUsername').value.trim();
    const passVal = document.getElementById('loginPassword').value.trim();
    const errorMsg = document.getElementById('loginErrorMsg');

    const found = NATIVE_USERS.find(u => u.username.toLowerCase() === userVal.toLowerCase() && u.password === passVal);
    if (found) {
      errorMsg.classList.add('hidden');
      appState.loggedUser = found;
      sessionStorage.setItem(SESSION_USER_KEY, JSON.stringify(found));
      showAppLayout();
      showToast(`Bem-vindo, ${found.name}! Conectado como ${found.role}.`);
    } else {
      errorMsg.classList.remove('hidden');
    }
  }

  function handleLogout() {
    sessionStorage.removeItem(SESSION_USER_KEY);
    appState.loggedUser = null;
    showLoginView();
    showToast('Sessão encerrada com sucesso.');
  }

  // --- PERMISSIONS LOGIC ---
  function applyUserPermissions() {
    const user = appState.loggedUser;
    const isAdm = user && user.role === 'Administrativo';
    const adminElements = document.querySelectorAll('.admin-only');

    if (isAdm) {
      adminElements.forEach(el => el.classList.add('hidden'));
      if (appState.activeTab === 'dashboardTab' || appState.activeTab === 'dpTab' || appState.activeTab === 'invoicesTab') {
        switchTab('servicesTab');
      }
    } else {
      adminElements.forEach(el => el.classList.remove('hidden'));
    }
  }

  // --- EVENT LISTENERS ---
  function setupEventListeners() {
    document.getElementById('formLogin').addEventListener('submit', handleLogin);
    document.getElementById('btnLogout').addEventListener('click', handleLogout);

    // Sidebar Toggle (Recolher / Expandir Menu)
    document.getElementById('btnToggleSidebar').addEventListener('click', () => {
      document.getElementById('mainSidebar').classList.toggle('collapsed');
    });

    // Filial Switcher
    document.getElementById('filialSelect').addEventListener('change', (e) => {
      appState.currentFilial = e.target.value;
      renderAllViews();
      showToast(`Filial ativa alterada para: ${appState.currentFilial}`);
    });

    // Navigation Items
    document.querySelectorAll('.menu-item[data-tab]').forEach(item => {
      item.addEventListener('click', (e) => {
        e.preventDefault();
        switchTab(item.getAttribute('data-tab'));
      });
    });

    // View Switcher (Kanban vs Table)
    document.getElementById('btnViewKanban').addEventListener('click', () => setSSViewMode('kanban'));
    document.getElementById('btnViewTable').addEventListener('click', () => setSSViewMode('table'));

    // Global Search & Filters
    document.getElementById('globalSearchInput').addEventListener('input', (e) => {
      appState.searchQuery = e.target.value.toLowerCase();
      renderSSViews();
      renderFINTable();
      renderDPTable();
    });

    document.getElementById('filterSSFilial').addEventListener('change', renderSSViews);
    document.getElementById('filterSSStatus').addEventListener('change', renderSSViews);
    document.getElementById('filterSSTipo').addEventListener('change', renderSSViews);
    document.getElementById('filterSSResponsavel').addEventListener('change', renderSSViews);

    document.getElementById('btnResetSSFilters').addEventListener('click', () => {
      document.getElementById('filterSSFilial').value = 'all';
      document.getElementById('filterSSStatus').value = 'all';
      document.getElementById('filterSSTipo').value = 'all';
      document.getElementById('filterSSResponsavel').value = 'all';
      document.getElementById('globalSearchInput').value = '';
      appState.searchQuery = '';
      renderSSViews();
    });

    document.getElementById('filterFINFilial').addEventListener('change', renderFINTable);
    document.getElementById('filterFINCentroCusto').addEventListener('change', renderFINTable);
    document.getElementById('filterFINStatus').addEventListener('change', renderFINTable);

    document.getElementById('filterDPFilial').addEventListener('change', renderDPTable);
    document.getElementById('filterDPCentroCusto').addEventListener('change', renderDPTable);

    // Modal Open Buttons
    document.getElementById('btnOpenNewSSModal').addEventListener('click', () => openSSFormModal());
    document.getElementById('btnNewSSFromTab').addEventListener('click', () => openSSFormModal());

    document.getElementById('btnOpenNewFINModal').addEventListener('click', () => openFINFormModal('SS'));
    document.getElementById('btnNewFINFromTab').addEventListener('click', () => openFINFormModal('SS'));
    document.getElementById('btnNewDPFromTab').addEventListener('click', () => openFINFormModal('DP'));

    // Modal Close Buttons
    document.querySelectorAll('.closeSSFormModal').forEach(b => b.addEventListener('click', () => closeModal(document.getElementById('modalSSForm'))));
    document.querySelectorAll('.closeFINFormModal').forEach(b => b.addEventListener('click', () => closeModal(document.getElementById('modalFINForm'))));
    document.getElementById('closeSSDetailsModal').addEventListener('click', () => closeModal(document.getElementById('modalSSDetails')));
    document.getElementById('btnCloseSSDetailsBottom').addEventListener('click', () => closeModal(document.getElementById('modalSSDetails')));

    // Form Submissions
    document.getElementById('formSS').addEventListener('submit', handleSSFormSubmit);
    document.getElementById('formFIN').addEventListener('submit', handleFINFormSubmit);

    // Same client checkbox in SS Form
    document.getElementById('chkSameClient').addEventListener('change', (e) => {
      if (e.target.checked) {
        document.getElementById('ssClienteFaturamento').value = document.getElementById('ssClienteFinal').value;
      }
    });
    document.getElementById('ssClienteFinal').addEventListener('input', (e) => {
      if (document.getElementById('chkSameClient').checked) {
        document.getElementById('ssClienteFaturamento').value = e.target.value;
      }
    });

    // Destination Toggle in FIN Form
    document.querySelectorAll('input[name="finTipoDestino"]').forEach(radio => {
      radio.addEventListener('change', (e) => {
        if (e.target.value === 'SS') {
          document.getElementById('groupSelectSS').classList.remove('hidden');
        } else {
          document.getElementById('groupSelectSS').classList.add('hidden');
        }
      });
    });

    // Import / Export Modals
    document.getElementById('btnOpenImportModalTop').addEventListener('click', openImportModal);
    document.getElementById('btnOpenImportModalNav').addEventListener('click', openImportModal);
    document.querySelectorAll('.closeImportModal').forEach(b => b.addEventListener('click', () => closeModal(document.getElementById('modalImportFlex'))));

    document.getElementById('btnOpenExportModalTop').addEventListener('click', openExportModal);
    document.getElementById('btnOpenExportModalNav').addEventListener('click', openExportModal);
    document.querySelectorAll('.closeExportModal').forEach(b => b.addEventListener('click', () => closeModal(document.getElementById('modalExportFlex'))));

    document.getElementById('btnExecuteExport').addEventListener('click', handleExecuteExport);

    // CSV File Upload & Parsing
    document.getElementById('csvFileInput').addEventListener('change', handleCSVFileSelect);
    document.getElementById('btnConfirmImport').addEventListener('click', processImportedRecords);
    document.getElementById('btnDownloadTemplate').addEventListener('click', downloadCSVTemplate);

    // Comments & Mentions in SS Details Modal
    document.getElementById('btnPostSSComment').addEventListener('click', handleAddComment);

    // Card Header Edits Save
    document.getElementById('btnSaveCardHeaderEdits').addEventListener('click', handleSaveCardHeaderEdits);
    document.getElementById('btnSaveCardFatEdits').addEventListener('click', handleSaveCardFatEdits);

    // Discount Flag Toggle in SS Details Modal
    document.getElementById('chkPossuiDesconto').addEventListener('change', (e) => {
      const group = document.getElementById('discountFieldsGroup');
      if (e.target.checked) {
        group.classList.remove('hidden');
      } else {
        group.classList.add('hidden');
      }
      recalculateSSDetailsValues();
    });

    document.getElementById('detailSSValorDesconto').addEventListener('input', recalculateSSDetailsValues);

    // File Attachment Input
    document.getElementById('inputAddAttachmentToSS').addEventListener('change', handleSSAttachmentUpload);

    // Close File Viewer Modal
    document.getElementById('closeFileViewerModal').addEventListener('click', () => closeModal(document.getElementById('modalFileViewer')));
    document.getElementById('btnCloseFileViewerBottom').addEventListener('click', () => closeModal(document.getElementById('modalFileViewer')));
  }

  // --- NAVIGATION & TABS ---
  function switchTab(tabId) {
    appState.activeTab = tabId;

    document.querySelectorAll('.menu-item[data-tab]').forEach(item => {
      if (item.getAttribute('data-tab') === tabId) item.classList.add('active');
      else item.classList.remove('active');
    });

    document.querySelectorAll('.tab-pane').forEach(pane => {
      if (pane.id === tabId) pane.classList.add('active');
      else pane.classList.remove('active');
    });

    renderAllViews();
  }

  // --- RENDER ALL VIEWS ---
  function renderAllViews() {
    populateSSDropdowns();
    renderDashboardKPIs();
    renderSSViews();
    renderFINTable();
    renderDPTable();
    renderInvoicesTable();
    if (appState.loggedUser && appState.loggedUser.role === 'Gestão') {
      renderCharts();
    }
  }

  // --- DASHBOARD KPIS & CALCULATIONS ---
  function renderDashboardKPIs() {
    let services = getFilteredServicesList();
    let finEntries = appState.financialEntries.filter(f => f.filial === appState.currentFilial);

    const totalRevenue = services.reduce((acc, s) => acc + (parseFloat(s.valorCobrado) || 0), 0);
    
    const directCosts = finEntries
      .filter(f => f.tipoDestino === 'SS')
      .reduce((acc, f) => acc + (parseFloat(f.valor) || 0), 0);

    const dpExpenses = finEntries
      .filter(f => f.tipoDestino === 'DP')
      .reduce((acc, f) => acc + (parseFloat(f.valor) || 0), 0);

    const netProfit = totalRevenue - directCosts - dpExpenses;
    const margin = totalRevenue > 0 ? ((netProfit / totalRevenue) * 100).toFixed(1) : '0';

    const concludedCount = services.filter(s => s.status === 'Recebido').length;

    document.getElementById('kpiTotalRevenue').textContent = formatCurrency(totalRevenue);
    document.getElementById('kpiDirectCosts').textContent = formatCurrency(directCosts);
    document.getElementById('kpiDPExpenses').textContent = formatCurrency(dpExpenses);
    document.getElementById('kpiNetProfit').textContent = formatCurrency(netProfit);
    document.getElementById('kpiProfitMargin').textContent = `Margem Real: ${margin}%`;
    document.getElementById('kpiCountSSConcluidas').textContent = `${concludedCount} OSs Recebidas`;
    document.getElementById('badgeSSCount').textContent = services.length;

    renderStatusBars(services);
    renderDashboardAlerts(services, finEntries);
  }

  function renderStatusBars(services) {
    const list = document.getElementById('statusOverviewList');
    if (!list) return;

    const statuses = ['Aguardando Início', 'Em Andamento', 'Aguardando OC', 'Aguardando Faturamento', 'Aguardando Pagamento', 'Recebido'];
    const total = services.length || 1;

    let html = '';
    statuses.forEach(st => {
      const count = services.filter(s => s.status === st).length;
      const pct = Math.round((count / total) * 100);
      let colorClass = 'var(--primary)';
      if (st === 'Aguardando Início') colorClass = 'var(--amber)';
      if (st === 'Em Andamento') colorClass = 'var(--blue)';
      if (st === 'Aguardando OC') colorClass = 'var(--purple)';
      if (st === 'Aguardando Faturamento') colorClass = 'var(--primary)';
      if (st === 'Aguardando Pagamento') colorClass = 'var(--orange)';
      if (st === 'Recebido') colorClass = 'var(--emerald)';

      html += `
        <div class="status-bar-item">
          <div class="status-bar-info">
            <span>${st}</span>
            <span>${count} chamados (${pct}%)</span>
          </div>
          <div class="progress-track">
            <div class="progress-fill" style="width: ${pct}%; background-color: ${colorClass}"></div>
          </div>
        </div>
      `;
    });

    list.innerHTML = html;
  }

  function renderDashboardAlerts(services, finEntries) {
    const alertsList = document.getElementById('dashboardAlertsList');
    if (!alertsList) return;

    const pendingPag = services.filter(s => s.status === 'Aguardando Pagamento' || s.status === 'Pagamento Atrasado');
    const pendingFIN = finEntries.filter(f => f.statusPagamento === 'Pendente');

    let html = '';

    if (pendingPag.length > 0) {
      html += `
        <div class="alert-item urgent">
          <i class="fa-solid fa-triangle-exclamation text-crimson"></i>
          <div>
            <strong>${pendingPag.length} Ordens de Serviço aguardando ou com pagamento atrasado</strong>
            <p style="font-size: 0.72rem; color: var(--text-muted)">Verificar cobranças com o setor financeiro.</p>
          </div>
        </div>
      `;
    }

    if (pendingFIN.length > 0) {
      const sumPending = pendingFIN.reduce((a, f) => a + parseFloat(f.valor), 0);
      html += `
        <div class="alert-item">
          <i class="fa-solid fa-clock text-amber"></i>
          <div>
            <strong>${pendingFIN.length} Lançamentos Pendentes (${formatCurrency(sumPending)})</strong>
            <p style="font-size: 0.72rem; color: var(--text-muted)">Previsões de saída agendadas.</p>
          </div>
        </div>
      `;
    }

    if (!html) {
      html = '<p style="font-size: 0.8rem; color: var(--text-muted)">Nenhum alerta crítico no momento.</p>';
    }

    alertsList.innerHTML = html;
  }

  // --- CHARTS (CHART.JS) ---
  function renderCharts() {
    const ctxFlow = document.getElementById('chartCashFlow');
    if (ctxFlow) {
      if (chartCashFlowInstance) chartCashFlowInstance.destroy();
      chartCashFlowInstance = new Chart(ctxFlow, {
        type: 'line',
        data: {
          labels: ['Julho', 'Agosto (Atual)', 'Setembro (Prev.)', 'Outubro (Prev.)'],
          datasets: [
            { label: 'Entradas Previstas (R$)', data: [14200, 25700, 31000, 42500], borderColor: '#10b981', backgroundColor: 'rgba(16, 185, 129, 0.1)', fill: true, tension: 0.3, borderWidth: 3 },
            { label: 'Saídas Operacionais (R$)', data: [8100, 16800, 14200, 15000], borderColor: '#ef4444', backgroundColor: 'rgba(239, 68, 68, 0.05)', fill: true, tension: 0.3, borderWidth: 2, borderDash: [5, 5] }
          ]
        },
        options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { x: { grid: { color: '#374151' }, ticks: { color: '#9ca3af' } }, y: { grid: { color: '#374151' }, ticks: { color: '#9ca3af' } } } }
      });
    }

    const ctxCost = document.getElementById('chartCostDistribution');
    if (ctxCost) {
      if (chartCostDistributionInstance) chartCostDistributionInstance.destroy();
      const finEntries = appState.financialEntries.filter(f => f.filial === appState.currentFilial);
      const directCosts = finEntries.filter(f => f.tipoDestino === 'SS').reduce((a, f) => a + parseFloat(f.valor), 0);
      const dpCosts = finEntries.filter(f => f.tipoDestino === 'DP').reduce((a, f) => a + parseFloat(f.valor), 0);

      chartCostDistributionInstance = new Chart(ctxCost, {
        type: 'doughnut',
        data: {
          labels: ['Custos OS (Peças/Terceiros)', 'Despesas DP (Empresa)'],
          datasets: [{ data: [directCosts || 1, dpCosts || 1], backgroundColor: ['#06b6d4', '#f59e0b'], borderWidth: 0 }]
        },
        options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom', labels: { color: '#9ca3af', font: { size: 11 } } } } }
      });
    }
  }

  // --- ORDENS DE SERVIÇO (SS) RENDERING & FILTERS ---
  function getFilteredServicesList() {
    let list = [...appState.services];

    // Filter by Filial
    const filialFilter = document.getElementById('filterSSFilial').value;
    if (filialFilter !== 'all') {
      list = list.filter(s => s.filial === filialFilter);
    } else {
      list = list.filter(s => s.filial === appState.currentFilial);
    }

    // Role Restriction: Adm (Luiz_Franco) only sees his own SS entries
    if (appState.loggedUser && appState.loggedUser.role === 'Administrativo') {
      list = list.filter(s => s.createdBy === appState.loggedUser.username);
    }

    // Status Filter
    const statusFilter = document.getElementById('filterSSStatus').value;
    if (statusFilter !== 'all') {
      list = list.filter(s => s.status === statusFilter);
    }

    // Tipo Filter
    const tipoFilter = document.getElementById('filterSSTipo').value;
    if (tipoFilter !== 'all') {
      list = list.filter(s => s.tipo === tipoFilter);
    }

    // Tech Filter
    const techFilter = document.getElementById('filterSSResponsavel').value;
    if (techFilter !== 'all') {
      list = list.filter(s => s.tecnico === techFilter);
    }

    // Global Search Query
    if (appState.searchQuery) {
      list = list.filter(s =>
        s.id.toLowerCase().includes(appState.searchQuery) ||
        (s.clienteFinal && s.clienteFinal.toLowerCase().includes(appState.searchQuery)) ||
        (s.clienteFaturamento && s.clienteFaturamento.toLowerCase().includes(appState.searchQuery)) ||
        (s.cidadeEstado && s.cidadeEstado.toLowerCase().includes(appState.searchQuery)) ||
        s.descricao.toLowerCase().includes(appState.searchQuery) ||
        (s.numeroNF && s.numeroNF.toLowerCase().includes(appState.searchQuery))
      );
    }

    return list;
  }

  function setSSViewMode(mode) {
    appState.currentViewMode = mode;
    if (mode === 'kanban') {
      document.getElementById('btnViewKanban').classList.add('active');
      document.getElementById('btnViewTable').classList.remove('active');
      document.getElementById('kanbanViewContainer').classList.remove('hidden');
      document.getElementById('tableViewContainer').classList.add('hidden');
    } else {
      document.getElementById('btnViewTable').classList.add('active');
      document.getElementById('btnViewKanban').classList.remove('active');
      document.getElementById('tableViewContainer').classList.remove('hidden');
      document.getElementById('kanbanViewContainer').classList.add('hidden');
    }
    renderSSViews();
  }

  function populateSSDropdowns() {
    const techs = [...new Set(appState.services.map(s => s.tecnico).filter(Boolean))];
    let techOptions = '<option value="all">Todos os Técnicos</option>';
    techs.forEach(t => techOptions += `<option value="${t}">${t}</option>`);
    document.getElementById('filterSSResponsavel').innerHTML = techOptions;

    let ssOptions = '<option value="">-- Selecione uma OS --</option>';
    appState.services.forEach(s => {
      ssOptions += `<option value="${s.id}">${s.id} - ${s.clienteFinal} (${formatCurrency(s.valorCobrado)})</option>`;
    });
    document.getElementById('finVinculoSS').innerHTML = ssOptions;
  }

  function renderSSViews() {
    const list = getFilteredServicesList();
    if (appState.currentViewMode === 'kanban') {
      renderKanbanBoard(list);
    } else {
      renderSSTable(list);
    }
  }

  function renderKanbanBoard(services) {
    const cols = {
      'Aguardando Início': document.getElementById('cardsColInicio'),
      'Em Andamento': document.getElementById('cardsColAndamento'),
      'Aguardando OC': document.getElementById('cardsColOC'),
      'Aguardando Faturamento': document.getElementById('cardsColFat'),
      'Aguardando Pagamento': document.getElementById('cardsColPag'),
      'Recebido': document.getElementById('cardsColRecebido')
    };

    const counts = {
      'Aguardando Início': document.getElementById('countColInicio'),
      'Em Andamento': document.getElementById('countColAndamento'),
      'Aguardando OC': document.getElementById('countColOC'),
      'Aguardando Faturamento': document.getElementById('countColFat'),
      'Aguardando Pagamento': document.getElementById('countColPag'),
      'Recebido': document.getElementById('countColRecebido')
    };

    Object.keys(cols).forEach(k => {
      if (cols[k]) cols[k].innerHTML = '';
      if (counts[k]) counts[k].textContent = '0';
    });

    services.forEach(s => {
      let colKey = s.status;
      if (s.status === 'Pagamento Atrasado') colKey = 'Aguardando Pagamento';
      if (s.status === 'Cancelado') colKey = 'Aguardando Início';

      const targetCol = cols[colKey];
      if (targetCol) {
        const cardElem = createKanbanCardElement(s);
        targetCol.appendChild(cardElem);

        const currentCount = parseInt(counts[colKey].textContent) || 0;
        counts[colKey].textContent = currentCount + 1;
      }
    });
  }

  function createKanbanCardElement(s) {
    const card = document.createElement('div');
    card.className = 'kanban-card';
    card.addEventListener('click', () => openSSDetailsModal(s.id));

    const costs = appState.financialEntries
      .filter(f => f.vinculoSS === s.id)
      .reduce((a, f) => a + parseFloat(f.valor), 0);

    const bdi = costs > 0 ? (((s.valorCobrado - costs) / costs) * 100).toFixed(0) : '0';
    const attachmentsCount = appState.attachments[s.id] ? appState.attachments[s.id].length : 0;

    card.innerHTML = `
      <div class="card-top">
        <span class="card-code">${s.id}</span>
        <span class="badge ${getStatusBadgeClass(s.status)}">${s.status}</span>
      </div>
      <div class="card-client">${escapeHtml(s.clienteFinal || s.cliente)}</div>
      <div class="card-desc">${escapeHtml(s.cidadeEstado ? `[${s.cidadeEstado}] ` : '')}${escapeHtml(s.descricao)}</div>
      <div class="card-footer-info">
        <span class="card-value">${formatCurrency(s.valorCobrado)}</span>
        <span class="tag tag-emerald font-bold" title="BDI">BDI: ${bdi}%</span>
        ${attachmentsCount > 0 ? `<span title="${attachmentsCount} Anexos"><i class="fa-solid fa-paperclip"></i> ${attachmentsCount}</span>` : ''}
      </div>
    `;
    return card;
  }

  function renderSSTable(services) {
    const tbody = document.getElementById('tableServicesBody');
    tbody.innerHTML = '';

    if (services.length === 0) {
      tbody.innerHTML = '<tr><td colspan="14" style="text-align: center; color: var(--text-muted)">Nenhuma Ordem de Serviço encontrada.</td></tr>';
      return;
    }

    services.forEach(s => {
      const costs = appState.financialEntries
        .filter(f => f.vinculoSS === s.id)
        .reduce((a, f) => a + parseFloat(f.valor), 0);

      const prevTotal = (parseFloat(s.prevMaoObra) || 0) + (parseFloat(s.prevMaterial) || 0);
      const bdi = costs > 0 ? (((s.valorCobrado - costs) / costs) * 100).toFixed(0) : '0';
      const profit = s.valorCobrado - costs;
      const profitPct = s.valorCobrado > 0 ? ((profit / s.valorCobrado) * 100).toFixed(1) : '0';

      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td><strong class="text-emerald">${s.id}</strong></td>
        <td><span class="tag tag-emerald">${s.filial || 'Matriz'}</span></td>
        <td><strong>${escapeHtml(s.clienteFinal || s.cliente)}</strong></td>
        <td>${escapeHtml(s.clienteFaturamento || '-')}</td>
        <td>${escapeHtml(s.cidadeEstado || '-')}</td>
        <td><span class="badge ${s.tipo === 'Preventiva' ? 'badge-blue' : 'badge-amber'}">${s.tipo}</span></td>
        <td><span class="badge ${getStatusBadgeClass(s.status)}">${s.status}</span></td>
        <td>${escapeHtml(s.tecnico || '-')}</td>
        <td><strong>${formatCurrency(s.valorCobrado)}</strong></td>
        <td class="admin-only">${formatCurrency(prevTotal)}</td>
        <td class="admin-only text-crimson">${formatCurrency(costs)}</td>
        <td class="admin-only font-bold text-emerald">${bdi}%</td>
        <td class="admin-only"><strong class="${profit >= 0 ? 'text-emerald' : 'text-crimson'}">${formatCurrency(profit)} (${profitPct}%)</strong></td>
        <td>
          <button class="btn btn-secondary btn-xs" onclick="window.openSSDetailsModalExternal('${s.id}')">
            <i class="fa-solid fa-eye"></i> Card
          </button>
        </td>
      `;
      tbody.appendChild(tr);
    });
  }

  window.openSSDetailsModalExternal = function (ssId) { openSSDetailsModal(ssId); };

  // --- FIN TABLE & CLICKABLE CARDS ---
  function renderFINTable() {
    const tbody = document.getElementById('tableFinancesBody');
    if (!tbody) return;

    let entries = appState.financialEntries.filter(f => f.tipoDestino === 'SS');

    // Filial Filter
    const filialFilter = document.getElementById('filterFINFilial').value;
    if (filialFilter !== 'all') {
      entries = entries.filter(f => f.filial === filialFilter);
    } else {
      entries = entries.filter(f => f.filial === appState.currentFilial);
    }

    // Role Restriction: Adm only sees FINs linked to their own SSs
    if (appState.loggedUser && appState.loggedUser.role === 'Administrativo') {
      const mySSIds = appState.services.filter(s => s.createdBy === appState.loggedUser.username).map(s => s.id);
      entries = entries.filter(f => mySSIds.includes(f.vinculoSS));
    }

    // Centro Custo Filter
    const ccFilter = document.getElementById('filterFINCentroCusto').value;
    if (ccFilter !== 'all') {
      entries = entries.filter(f => f.centroCusto === ccFilter);
    }

    // Status Filter
    const statusFilter = document.getElementById('filterFINStatus').value;
    if (statusFilter !== 'all') {
      entries = entries.filter(f => f.statusPagamento === statusFilter);
    }

    // Search Query
    if (appState.searchQuery) {
      entries = entries.filter(f =>
        f.id.toLowerCase().includes(appState.searchQuery) ||
        f.descricao.toLowerCase().includes(appState.searchQuery) ||
        (f.vinculoSS && f.vinculoSS.toLowerCase().includes(appState.searchQuery))
      );
    }

    // Sort: Most recent first
    entries.sort((a, b) => new Date(b.dataPagamentoReal || b.dataPrevisao || '2026-01-01') - new Date(a.dataPagamentoReal || a.dataPrevisao || '2026-01-01'));

    tbody.innerHTML = '';

    if (entries.length === 0) {
      tbody.innerHTML = '<tr><td colspan="11" style="text-align: center; color: var(--text-muted)">Nenhum lançamento financeiro de OS registrado.</td></tr>';
      return;
    }

    entries.forEach(f => {
      const tr = document.createElement('tr');
      tr.title = 'Clique para editar este lançamento FIN';
      tr.addEventListener('click', () => openFINFormModal('SS', null, f.id));

      tr.innerHTML = `
        <td><strong class="text-primary">${f.id}</strong></td>
        <td>${formatDate(f.dataPagamentoReal || f.dataPrevisao)}</td>
        <td><span class="tag tag-emerald">${f.filial || 'Matriz'}</span></td>
        <td><strong>${escapeHtml(f.descricao)}</strong></td>
        <td><span class="badge badge-primary"><i class="fa-solid fa-link"></i> ${f.vinculoSS || 'N/A'}</span></td>
        <td><span class="tag tag-crimson">${escapeHtml(f.centroCusto || 'Peças')}</span></td>
        <td>${f.parcelas || 1}x</td>
        <td><strong class="text-crimson">${formatCurrency(f.valor)}</strong></td>
        <td><span class="badge ${f.statusPagamento === 'Pago' ? 'badge-emerald' : 'badge-amber'}">${f.statusPagamento}</span></td>
        <td>${escapeHtml(f.createdBy || 'Sistema')}</td>
        <td>
          <button class="btn btn-outline-secondary btn-xs" onclick="event.stopPropagation(); window.deleteFINDirect('${f.id}')">
            <i class="fa-solid fa-trash"></i>
          </button>
        </td>
      `;
      tbody.appendChild(tr);
    });
  }

  // --- DP TABLE & CLICKABLE CARDS ---
  function renderDPTable() {
    const tbody = document.getElementById('tableDPBody');
    if (!tbody) return;

    let entries = appState.financialEntries.filter(f => f.tipoDestino === 'DP');

    // Filial Filter
    const filialFilter = document.getElementById('filterDPFilial').value;
    if (filialFilter !== 'all') {
      entries = entries.filter(f => f.filial === filialFilter);
    } else {
      entries = entries.filter(f => f.filial === appState.currentFilial);
    }

    // Centro Custo Filter
    const ccFilter = document.getElementById('filterDPCentroCusto').value;
    if (ccFilter !== 'all') {
      entries = entries.filter(f => f.centroCusto === ccFilter);
    }

    // Sort: Most recent first
    entries.sort((a, b) => new Date(b.dataPagamentoReal || b.dataPrevisao || '2026-01-01') - new Date(a.dataPagamentoReal || a.dataPrevisao || '2026-01-01'));

    tbody.innerHTML = '';

    if (entries.length === 0) {
      tbody.innerHTML = '<tr><td colspan="10" style="text-align: center; color: var(--text-muted)">Nenhuma despesa DP da empresa registrada.</td></tr>';
      return;
    }

    entries.forEach(f => {
      const tr = document.createElement('tr');
      tr.title = 'Clique para editar esta despesa DP da empresa';
      tr.addEventListener('click', () => openFINFormModal('DP', null, f.id));

      tr.innerHTML = `
        <td><strong class="text-purple">${f.id}</strong></td>
        <td>${formatDate(f.dataPagamentoReal || f.dataPrevisao)}</td>
        <td><span class="tag tag-emerald">${f.filial || 'Matriz'}</span></td>
        <td><strong>${escapeHtml(f.descricao)}</strong></td>
        <td><span class="tag tag-crimson">${escapeHtml(f.centroCusto || 'DP Geral')}</span></td>
        <td>${f.parcelas || 1}x</td>
        <td><strong class="text-crimson">${formatCurrency(f.valor)}</strong></td>
        <td><span class="badge ${f.statusPagamento === 'Pago' ? 'badge-emerald' : 'badge-amber'}">${f.statusPagamento}</span></td>
        <td>${escapeHtml(f.createdBy || 'Sistema')}</td>
        <td>
          <button class="btn btn-outline-secondary btn-xs" onclick="event.stopPropagation(); window.deleteFINDirect('${f.id}')">
            <i class="fa-solid fa-trash"></i>
          </button>
        </td>
      `;
      tbody.appendChild(tr);
    });
  }

  window.deleteFINDirect = function(finId) {
    if (confirm('Deseja realmente excluir este lançamento financeiro?')) {
      appState.financialEntries = appState.financialEntries.filter(f => f.id !== finId);
      saveDataToStorage();
      renderAllViews();
      showToast('Lançamento excluído com sucesso.');
    }
  };

  // --- INVOICES TABLE RENDERING ---
  function renderInvoicesTable() {
    const tbody = document.getElementById('tableInvoicesBody');
    if (!tbody) return;

    const services = getFilteredServicesList().filter(s => s.numeroNF || s.status === 'Aguardando Faturamento' || s.status === 'Aguardando Pagamento' || s.status === 'Recebido');
    tbody.innerHTML = '';

    if (services.length === 0) {
      tbody.innerHTML = '<tr><td colspan="12" style="text-align: center; color: var(--text-muted)">Nenhuma nota fiscal ou faturamento registrado.</td></tr>';
      return;
    }

    services.forEach(s => {
      const descVal = parseFloat(s.valorDesconto) || 0;
      const realVal = s.valorCobrado - descVal;

      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td><strong class="text-emerald">${s.numeroNF || 'Pendente'}</strong></td>
        <td><span class="badge badge-primary">${s.id}</span></td>
        <td><span class="tag tag-emerald">${s.filial}</span></td>
        <td><strong>${escapeHtml(s.clienteFaturamento || s.clienteFinal)}</strong></td>
        <td>${escapeHtml(s.cnpjFat || '-')}</td>
        <td>${escapeHtml(s.numeroOC || '-')}</td>
        <td>${formatDate(s.dataFat)}</td>
        <td>${formatDate(s.dataRecPrev)}</td>
        <td>${formatDate(s.dataRecReal)}</td>
        <td><strong>${formatCurrency(s.valorCobrado)}</strong></td>
        <td class="text-crimson">${descVal > 0 ? formatCurrency(descVal) : '-'}</td>
        <td><strong class="text-emerald">${formatCurrency(realVal)}</strong></td>
      `;
      tbody.appendChild(tr);
    });
  }

  // --- SS FORM MODAL (CREATE / EDIT) ---
  function openSSFormModal(ssId) {
    const form = document.getElementById('formSS');
    form.reset();

    if (ssId) {
      const ss = appState.services.find(s => s.id === ssId);
      if (ss) {
        document.getElementById('modalSSTitle').textContent = `Editar Ordem de Serviço (${ss.id})`;
        document.getElementById('ssEditId').value = ss.id;
        document.getElementById('ssClienteFinal').value = ss.clienteFinal || '';
        document.getElementById('ssClienteFaturamento').value = ss.clienteFaturamento || '';
        document.getElementById('ssCidadeEstado').value = ss.cidadeEstado || '';
        document.getElementById('ssFilial').value = ss.filial || appState.currentFilial;
        document.getElementById('ssDescricao').value = ss.descricao || '';
        document.getElementById('ssTipo').value = ss.tipo || 'Preventiva';
        document.getElementById('ssTecnico').value = ss.tecnico || '';
        document.getElementById('ssValorCobrado').value = ss.valorCobrado || 0;
        document.getElementById('ssPrevMaoObra').value = ss.prevMaoObra || 0;
        document.getElementById('ssPrevMaterial').value = ss.prevMaterial || 0;
        document.getElementById('ssStatus').value = ss.status || 'Em Andamento';
      }
    } else {
      document.getElementById('modalSSTitle').textContent = 'Cadastrar Nova Ordem de Serviço (SS)';
      document.getElementById('ssEditId').value = '';
      document.getElementById('ssFilial').value = appState.currentFilial;
    }

    openModal(document.getElementById('modalSSForm'));
  }

  function handleSSFormSubmit(e) {
    e.preventDefault();
    const editId = document.getElementById('ssEditId').value;
    const clienteFinal = document.getElementById('ssClienteFinal').value;
    const clienteFaturamento = document.getElementById('ssClienteFaturamento').value;
    const cidadeEstado = document.getElementById('ssCidadeEstado').value;
    const filial = document.getElementById('ssFilial').value;
    const descricao = document.getElementById('ssDescricao').value;
    const tipo = document.getElementById('ssTipo').value;
    const tecnico = document.getElementById('ssTecnico').value;
    const valorCobrado = parseFloat(document.getElementById('ssValorCobrado').value) || 0;
    const prevMaoObra = parseFloat(document.getElementById('ssPrevMaoObra').value) || 0;
    const prevMaterial = parseFloat(document.getElementById('ssPrevMaterial').value) || 0;
    const status = document.getElementById('ssStatus').value;

    if (editId) {
      const ss = appState.services.find(s => s.id === editId);
      if (ss) {
        ss.clienteFinal = clienteFinal;
        ss.clienteFaturamento = clienteFaturamento;
        ss.cidadeEstado = cidadeEstado;
        ss.filial = filial;
        ss.descricao = descricao;
        ss.tipo = tipo;
        ss.tecnico = tecnico;
        ss.valorCobrado = valorCobrado;
        ss.prevMaoObra = prevMaoObra;
        ss.prevMaterial = prevMaterial;
        ss.status = status;
        showToast(`Ordem de Serviço ${ss.id} atualizada!`);
      }
    } else {
      const newId = `SS-${1000 + appState.services.length + 1}`;
      const newSS = {
        id: newId,
        clienteFinal,
        clienteFaturamento,
        cidadeEstado,
        filial,
        descricao,
        tipo,
        tecnico,
        valorCobrado,
        prevMaoObra,
        prevMaterial,
        status,
        dataCriacao: new Date().toISOString().split('T')[0],
        createdBy: appState.loggedUser ? appState.loggedUser.username : 'Sistema',

        cnpjFat: '',
        numeroOC: '',
        numeroNF: '',
        dataFat: '',
        dataRecPrev: '',
        dataRecReal: '',
        possuiDesconto: false,
        descDesconto: '',
        valorDesconto: 0.00
      };
      appState.services.unshift(newSS);
      showToast(`Nova Ordem de Serviço ${newId} criada!`);
    }

    saveDataToStorage();
    closeModal(document.getElementById('modalSSForm'));
    renderAllViews();
  }

  // --- FIN & DP FORM MODAL (CREATE / EDIT) ---
  function openFINFormModal(defaultTipoDestino, preselectSSId, editFinId) {
    const form = document.getElementById('formFIN');
    form.reset();
    populateSSDropdowns();

    const radioSS = document.getElementById('radioDestinoSS');
    const radioDP = document.getElementById('radioDestinoDP');

    if (editFinId) {
      const f = appState.financialEntries.find(entry => entry.id === editFinId);
      if (f) {
        document.getElementById('modalFINTitle').textContent = `Editar Lançamento (${f.id})`;
        document.getElementById('finEditId').value = f.id;

        if (f.tipoDestino === 'DP') {
          radioDP.checked = true;
          document.getElementById('groupSelectSS').classList.add('hidden');
        } else {
          radioSS.checked = true;
          document.getElementById('groupSelectSS').classList.remove('hidden');
          document.getElementById('finVinculoSS').value = f.vinculoSS || '';
        }

        document.getElementById('finFilial').value = f.filial || appState.currentFilial;
        document.getElementById('finCentroCusto').value = f.centroCusto || 'Peças / Insumos OS';
        document.getElementById('finDescricao').value = f.descricao || '';
        document.getElementById('finTipoCompra').value = f.tipoCompra || '';
        document.getElementById('finParcelas').value = f.parcelas || 1;
        document.getElementById('finValor').value = f.valor || 0;
        document.getElementById('finChavePix').value = f.chavePix || '';
        document.getElementById('finDataPrevisao').value = f.dataPrevisao || '';
        document.getElementById('finDataPagamentoReal').value = f.dataPagamentoReal || '';
        document.getElementById('finStatusPagamento').value = f.statusPagamento || 'Pendente';
      }
    } else {
      document.getElementById('finEditId').value = '';
      document.getElementById('finFilial').value = appState.currentFilial;

      if (defaultTipoDestino === 'DP') {
        radioDP.checked = true;
        document.getElementById('modalFINTitle').textContent = 'Cadastrar Despesa da Empresa (DP)';
        document.getElementById('groupSelectSS').classList.add('hidden');
      } else {
        radioSS.checked = true;
        document.getElementById('modalFINTitle').textContent = 'Lançamento Financeiro de Saída (FIN)';
        document.getElementById('groupSelectSS').classList.remove('hidden');
        if (preselectSSId) document.getElementById('finVinculoSS').value = preselectSSId;
      }
    }

    openModal(document.getElementById('modalFINForm'));
  }

  function handleFINFormSubmit(e) {
    e.preventDefault();
    const editId = document.getElementById('finEditId').value;
    const tipoDestino = document.querySelector('input[name="finTipoDestino"]:checked').value;
    const vinculoSS = tipoDestino === 'SS' ? document.getElementById('finVinculoSS').value : '';
    const filial = document.getElementById('finFilial').value;
    const centroCusto = document.getElementById('finCentroCusto').value;
    const descricao = document.getElementById('finDescricao').value;
    const tipoCompra = document.getElementById('finTipoCompra').value;
    const parcelas = parseInt(document.getElementById('finParcelas').value) || 1;
    const valor = parseFloat(document.getElementById('finValor').value) || 0;
    const chavePix = document.getElementById('finChavePix').value;
    const dataPrevisao = document.getElementById('finDataPrevisao').value;
    const dataPagamentoReal = document.getElementById('finDataPagamentoReal').value;
    const statusPagamento = document.getElementById('finStatusPagamento').value;

    if (editId) {
      const f = appState.financialEntries.find(entry => entry.id === editId);
      if (f) {
        f.tipoDestino = tipoDestino;
        f.vinculoSS = vinculoSS;
        f.filial = filial;
        f.centroCusto = centroCusto;
        f.descricao = descricao;
        f.tipoCompra = tipoCompra;
        f.parcelas = parcelas;
        f.valor = valor;
        f.chavePix = chavePix;
        f.dataPrevisao = dataPrevisao;
        f.dataPagamentoReal = dataPagamentoReal;
        f.statusPagamento = statusPagamento;
        showToast(`Lançamento ${f.id} atualizado com sucesso!`);
      }
    } else {
      const prefix = tipoDestino === 'DP' ? 'DP' : 'FIN';
      const newId = `${prefix}-${5000 + appState.financialEntries.length + 1}`;
      const newEntry = {
        id: newId,
        tipoDestino,
        vinculoSS,
        filial,
        centroCusto,
        descricao,
        tipoCompra,
        parcelas,
        valor,
        chavePix,
        dataPrevisao,
        dataPagamentoReal,
        statusPagamento,
        createdBy: appState.loggedUser ? appState.loggedUser.username : 'Sistema'
      };
      appState.financialEntries.unshift(newEntry);
      showToast(`Novo lançamento ${newId} (${formatCurrency(valor)}) registrado!`);
    }

    saveDataToStorage();
    closeModal(document.getElementById('modalFINForm'));
    renderAllViews();
  }

  // --- CARD DETAILS MODAL & BDI / MENTIONS ---
  let currentDetailSSId = null;

  function openSSDetailsModal(ssId) {
    currentDetailSSId = ssId;
    const ss = appState.services.find(s => s.id === ssId);
    if (!ss) return;

    document.getElementById('detailSSCode').textContent = ss.id;
    document.getElementById('detailSSClienteFinal').textContent = ss.clienteFinal || ss.cliente;
    document.getElementById('detailSSFilialLocal').textContent = `Filial: ${ss.filial || 'Matriz'} | Local: ${ss.cidadeEstado || 'N/A'}`;
    
    // Status on top right
    document.getElementById('detailSSStatusSelect').value = ss.status;

    // Editable Header Inputs
    document.getElementById('inputEditValorCobrado').value = ss.valorCobrado || 0;
    const prevTotal = (parseFloat(ss.prevMaoObra) || 0) + (parseFloat(ss.prevMaterial) || 0);
    document.getElementById('inputEditPrevGasto').value = prevTotal;

    // Block 2: Faturamento & NF
    document.getElementById('detailSSClienteFatInput').value = ss.clienteFaturamento || ss.clienteFinal || '';
    document.getElementById('detailSSCNPJFat').value = ss.cnpjFat || '';
    document.getElementById('detailSSNumeroOC').value = ss.numeroOC || '';
    document.getElementById('detailSSNumeroNF').value = ss.numeroNF || '';
    document.getElementById('detailSSDataFat').value = ss.dataFat || '';
    document.getElementById('detailSSDataRecPrev').value = ss.dataRecPrev || '';
    document.getElementById('detailSSDataRecReal').value = ss.dataRecReal || '';

    const chkDesc = document.getElementById('chkPossuiDesconto');
    chkDesc.checked = !!ss.possuiDesconto;
    if (ss.possuiDesconto) {
      document.getElementById('discountFieldsGroup').classList.remove('hidden');
    } else {
      document.getElementById('discountFieldsGroup').classList.add('hidden');
    }

    document.getElementById('detailSSDescDesconto').value = ss.descDesconto || '';
    document.getElementById('detailSSValorDesconto').value = ss.valorDesconto || 0;

    // Status Change listener
    document.getElementById('detailSSStatusSelect').onchange = function (e) {
      ss.status = e.target.value;
      saveDataToStorage();
      renderAllViews();
      showToast(`Status da OS ${ss.id} alterado para: ${ss.status}`);
    };

    recalculateSSDetailsValues();
    renderSSModalFINTable(ss.id);
    renderSSCommentsList(ss.id);
    renderSSModalAttachments(ss.id);

    document.getElementById('btnAddFINDirectToSS').onclick = function () {
      closeModal(document.getElementById('modalSSDetails'));
      openFINFormModal('SS', ss.id);
    };

    openModal(document.getElementById('modalSSDetails'));
  }

  function recalculateSSDetailsValues() {
    if (!currentDetailSSId) return;
    const ss = appState.services.find(s => s.id === currentDetailSSId);
    if (!ss) return;

    const valorCobrado = parseFloat(document.getElementById('inputEditValorCobrado').value) || 0;
    const custosPrevisto = parseFloat(document.getElementById('inputEditPrevGasto').value) || 0;

    const custosAcumulados = appState.financialEntries
      .filter(f => f.vinculoSS === ss.id)
      .reduce((a, f) => a + parseFloat(f.valor), 0);

    const diffCustos = custosPrevisto - custosAcumulados;
    const bdiPct = custosAcumulados > 0 ? (((valorCobrado - custosAcumulados) / custosAcumulados) * 100).toFixed(0) : '0';

    const lucroBruto = valorCobrado - custosAcumulados;
    const lucroBrutoPct = valorCobrado > 0 ? ((lucroBruto / valorCobrado) * 100).toFixed(1) : '0';

    document.getElementById('detailSSCustosFIN').textContent = formatCurrency(custosAcumulados);
    
    const elemDiff = document.getElementById('detailSSDiffCustos');
    elemDiff.textContent = formatCurrency(diffCustos);
    elemDiff.className = diffCustos >= 0 ? 'ribbon-val text-emerald' : 'ribbon-val text-crimson';

    document.getElementById('detailSSBDI').textContent = `${bdiPct}%`;
    document.getElementById('detailSSLucroBruto').textContent = formatCurrency(lucroBruto);
    document.getElementById('detailSSLucroBrutoPct').textContent = `${lucroBrutoPct}%`;

    // Calculate Real Received Value with Discount Flag
    const hasDiscount = document.getElementById('chkPossuiDesconto').checked;
    const descVal = hasDiscount ? (parseFloat(document.getElementById('detailSSValorDesconto').value) || 0) : 0;
    const realReceived = valorCobrado - descVal;

    document.getElementById('detailSSValorRealRecebido').textContent = formatCurrency(realReceived);
  }

  function handleSaveCardHeaderEdits() {
    if (!currentDetailSSId) return;
    const ss = appState.services.find(s => s.id === currentDetailSSId);
    if (!ss) return;

    ss.valorCobrado = parseFloat(document.getElementById('inputEditValorCobrado').value) || 0;
    const totalPrev = parseFloat(document.getElementById('inputEditPrevGasto').value) || 0;
    ss.prevMaoObra = (totalPrev / 2);
    ss.prevMaterial = (totalPrev / 2);

    saveDataToStorage();
    renderAllViews();
    showToast('Valores da OS atualizados!');
  }

  function handleSaveCardFatEdits() {
    if (!currentDetailSSId) return;
    const ss = appState.services.find(s => s.id === currentDetailSSId);
    if (!ss) return;

    ss.clienteFaturamento = document.getElementById('detailSSClienteFatInput').value;
    ss.cnpjFat = document.getElementById('detailSSCNPJFat').value;
    ss.numeroOC = document.getElementById('detailSSNumeroOC').value;
    ss.numeroNF = document.getElementById('detailSSNumeroNF').value;
    ss.dataFat = document.getElementById('detailSSDataFat').value;
    ss.dataRecPrev = document.getElementById('detailSSDataRecPrev').value;
    ss.dataRecReal = document.getElementById('detailSSDataRecReal').value;
    ss.possuiDesconto = document.getElementById('chkPossuiDesconto').checked;
    ss.descDesconto = document.getElementById('detailSSDescDesconto').value;
    ss.valorDesconto = parseFloat(document.getElementById('detailSSValorDesconto').value) || 0;

    saveDataToStorage();
    renderAllViews();
    showToast('Dados de faturamento e NF salvos!');
  }

  function renderSSModalFINTable(ssId) {
    const tbody = document.getElementById('detailSSTableFINBody');
    const entries = appState.financialEntries.filter(f => f.vinculoSS === ssId);

    tbody.innerHTML = '';
    if (entries.length === 0) {
      tbody.innerHTML = '<tr><td colspan="6" style="text-align:center; color: var(--text-muted)">Nenhum custo financeiro lançado nesta OS.</td></tr>';
      return;
    }

    entries.forEach(f => {
      const tr = document.createElement('tr');
      tr.style.cursor = 'pointer';
      tr.onclick = function() {
        closeModal(document.getElementById('modalSSDetails'));
        openFINFormModal('SS', null, f.id);
      };

      tr.innerHTML = `
        <td><strong class="text-primary">${f.id}</strong></td>
        <td>${formatDate(f.dataPagamentoReal || f.dataPrevisao)}</td>
        <td>${escapeHtml(f.descricao)}</td>
        <td><span class="tag tag-crimson">${escapeHtml(f.centroCusto)}</span></td>
        <td class="text-crimson"><strong>${formatCurrency(f.valor)}</strong></td>
        <td><span class="badge ${f.statusPagamento === 'Pago' ? 'badge-emerald' : 'badge-amber'}">${f.statusPagamento}</span></td>
      `;
      tbody.appendChild(tr);
    });
  }

  // --- COMMENTS & CLICKABLE MENTIONS (SS-XXXX / FIN-XXXX) ---
  function renderSSCommentsList(ssId) {
    const container = document.getElementById('detailSSCommentsList');
    const list = appState.comments[ssId] || [];

    container.innerHTML = '';
    if (list.length === 0) {
      container.innerHTML = '<p style="font-size:0.8rem; color:var(--text-muted)">Nenhum comentário registrado ainda.</p>';
      return;
    }

    list.forEach(c => {
      const item = document.createElement('div');
      item.className = 'comment-item';

      const formattedText = parseMentionsToLinks(escapeHtml(c.text));

      item.innerHTML = `
        <div class="comment-meta">
          <strong><i class="fa-solid fa-user"></i> ${escapeHtml(c.author)}</strong>
          <span>${c.date}</span>
        </div>
        <div class="comment-text">${formattedText}</div>
      `;

      // Attach click handlers to mentions inside comment
      item.querySelectorAll('.mention-link').forEach(link => {
        link.addEventListener('click', (e) => {
          e.preventDefault();
          const targetCode = link.getAttribute('data-code');
          navigateToMentionCard(targetCode);
        });
      });

      container.appendChild(item);
    });
  }

  function parseMentionsToLinks(str) {
    return str.replace(/\b(SS-\d+|FIN-\d+|DP-\d+)\b/g, function (match) {
      return `<a class="mention-link" data-code="${match}">${match}</a>`;
    });
  }

  function navigateToMentionCard(code) {
    closeModal(document.getElementById('modalSSDetails'));
    if (code.startsWith('SS-')) {
      openSSDetailsModal(code);
    } else if (code.startsWith('FIN-') || code.startsWith('DP-')) {
      const entry = appState.financialEntries.find(f => f.id === code);
      if (entry) {
        openFINFormModal(entry.tipoDestino, null, entry.id);
      } else {
        showToast(`Lançamento ${code} não encontrado.`, 'error');
      }
    }
  }

  function handleAddComment() {
    const input = document.getElementById('inputNewSSComment');
    const text = input.value.trim();
    if (!text || !currentDetailSSId) return;

    if (!appState.comments[currentDetailSSId]) {
      appState.comments[currentDetailSSId] = [];
    }

    appState.comments[currentDetailSSId].push({
      author: appState.loggedUser ? appState.loggedUser.name : 'Usuário',
      date: new Date().toLocaleString('pt-BR'),
      text: text
    });

    input.value = '';
    saveDataToStorage();
    renderSSCommentsList(currentDetailSSId);
    showToast('Comentário publicado!');
  }

  // --- ATTACHMENTS & DOCUMENT VIEWER ---
  function renderSSModalAttachments(ssId) {
    const grid = document.getElementById('detailSSAttachmentsGrid');
    const list = appState.attachments[ssId] || [];

    grid.innerHTML = '';
    if (list.length === 0) {
      grid.innerHTML = '<p style="font-size:0.8rem; color:var(--text-muted)">Nenhum anexo ou nota fiscal inserida.</p>';
      return;
    }

    list.forEach((att, idx) => {
      const item = document.createElement('div');
      item.className = 'attachment-card-item';
      item.style.cssText = 'background: var(--bg-card); border: 1px solid var(--border-color); padding: 0.5rem 0.75rem; border-radius: 6px; display: flex; align-items: center; justify-content: space-between; font-size: 0.8rem; cursor: pointer;';

      const icon = att.type.includes('pdf') ? 'fa-file-pdf text-crimson' : 'fa-file-image text-blue';
      
      item.innerHTML = `
        <div style="display:flex; align-items:center; gap:0.5rem" onclick="window.viewAttachmentFile('${ssId}', ${idx})">
          <i class="fa-solid ${icon}"></i>
          <span>${escapeHtml(att.name)} (${att.date})</span>
        </div>
        <button class="btn btn-outline-secondary btn-xs" onclick="event.stopPropagation(); window.removeAttachment('${ssId}', ${idx})">
          <i class="fa-solid fa-xmark"></i>
        </button>
      `;
      grid.appendChild(item);
    });
  }

  window.viewAttachmentFile = function (ssId, idx) {
    const att = appState.attachments[ssId][idx];
    if (!att) return;

    document.getElementById('viewerFileName').textContent = att.name;
    const area = document.getElementById('viewerContentArea');

    if (att.dataUrl && att.type.includes('image')) {
      area.innerHTML = `<img src="${att.dataUrl}" style="max-width:100%; max-height:70vh; border-radius:8px;">`;
    } else {
      area.innerHTML = `
        <div style="padding: 2rem; background: var(--bg-dark); border-radius: 8px;">
          <i class="fa-solid fa-file-pdf text-crimson" style="font-size: 4rem; margin-bottom: 1rem;"></i>
          <h4>${escapeHtml(att.name)}</h4>
          <p style="color: var(--text-muted); font-size: 0.85rem;">Documento PDF / Arquivo Anexo gravado no FixFlow.</p>
        </div>
      `;
    }

    openModal(document.getElementById('modalFileViewer'));
  };

  window.removeAttachment = function (ssId, idx) {
    if (appState.attachments[ssId]) {
      appState.attachments[ssId].splice(idx, 1);
      saveDataToStorage();
      renderSSModalAttachments(ssId);
      showToast('Anexo removido com sucesso.');
    }
  };

  function handleSSAttachmentUpload(e) {
    const file = e.target.files[0];
    if (!file || !currentDetailSSId) return;

    const reader = new FileReader();
    reader.onload = function (evt) {
      if (!appState.attachments[currentDetailSSId]) {
        appState.attachments[currentDetailSSId] = [];
      }

      appState.attachments[currentDetailSSId].push({
        name: file.name,
        type: file.type || 'application/octet-stream',
        date: new Date().toLocaleDateString('pt-BR'),
        dataUrl: evt.target.result
      });

      saveDataToStorage();
      renderSSModalAttachments(currentDetailSSId);
      showToast(`Arquivo "${file.name}" anexado!`);
    };
    reader.readAsDataURL(file);
  }

  // --- IMPORT & EXPORT MODALS ---
  let tempImportData = [];

  function openImportModal() {
    openModal(document.getElementById('modalImportFlex'));
  }

  function openExportModal() {
    openModal(document.getElementById('modalExportFlex'));
  }

  function handleCSVFileSelect(e) {
    if (e.target.files.length > 0) {
      parseCSVFile(e.target.files[0]);
    }
  }

  function parseCSVFile(file) {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: function (results) {
        if (results.data && results.data.length > 0) {
          tempImportData = results.data;
          renderImportPreview(results.data);
          document.getElementById('btnConfirmImport').classList.remove('hidden');
          showToast(`${results.data.length} registros identificados no arquivo!`);
        }
      }
    });
  }

  function renderImportPreview(data) {
    document.getElementById('importPreviewContainer').classList.remove('hidden');
    document.getElementById('previewCount').textContent = data.length;

    const headers = Object.keys(data[0]);
    let headHtml = '<tr>';
    headers.forEach(h => headHtml += `<th>${escapeHtml(h)}</th>`);
    headHtml += '</tr>';
    document.getElementById('importPreviewHead').innerHTML = headHtml;

    let bodyHtml = '';
    data.slice(0, 10).forEach(row => {
      bodyHtml += '<tr>';
      headers.forEach(h => bodyHtml += `<td>${escapeHtml(row[h] || '')}</td>`);
      bodyHtml += '</tr>';
    });
    document.getElementById('importPreviewBody').innerHTML = bodyHtml;
  }

  function processImportedRecords() {
    if (!tempImportData || tempImportData.length === 0) return;

    const target = document.querySelector('input[name="importTypeTarget"]:checked').value;
    let countAdded = 0;

    tempImportData.forEach((row, idx) => {
      if (target === 'SS') {
        const code = row['Código'] || row['Chave'] || `SS-${2000 + idx}`;
        appState.services.push({
          id: code,
          clienteFinal: row['Cliente Final'] || row['Cliente'] || 'Cliente Migrado',
          clienteFaturamento: row['Cliente Faturamento'] || row['Cliente'] || 'Cliente Migrado',
          cidadeEstado: row['Cidade/UF'] || 'São Paulo / SP',
          filial: row['Filial'] || appState.currentFilial,
          descricao: row['Descrição'] || row['Resumo'] || 'Manutenção geral',
          tipo: row['Tipo'] || 'Preventiva',
          tecnico: row['Técnico'] || 'Técnico Geral',
          valorCobrado: parseFloat(row['Valor Cobrado'] || row['Valor'] || 5000),
          prevMaoObra: 1000,
          prevMaterial: 1500,
          status: row['Status'] || 'Em Andamento',
          dataCriacao: new Date().toISOString().split('T')[0],
          createdBy: appState.loggedUser ? appState.loggedUser.username : 'Sistema'
        });
      } else {
        const code = row['Código'] || `FIN-${6000 + idx}`;
        appState.financialEntries.push({
          id: code,
          tipoDestino: 'SS',
          vinculoSS: row['Vínculo OS'] || 'SS-1001',
          filial: row['Filial'] || appState.currentFilial,
          centroCusto: row['Centro Custo'] || 'Peças / Insumos OS',
          descricao: row['Descrição'] || 'Custo Importado',
          tipoCompra: 'Peças',
          parcelas: 1,
          valor: parseFloat(row['Valor'] || 1000),
          chavePix: '',
          dataPrevisao: '2026-08-15',
          dataPagamentoReal: '2026-08-10',
          statusPagamento: row['Status'] || 'Pago',
          createdBy: appState.loggedUser ? appState.loggedUser.username : 'Sistema'
        });
      }
      countAdded++;
    });

    saveDataToStorage();
    renderAllViews();
    closeModal(document.getElementById('modalImportFlex'));
    showToast(`Sucesso! ${countAdded} registros de ${target} foram importados!`);
  }

  function downloadCSVTemplate() {
    const target = document.querySelector('input[name="importTypeTarget"]:checked').value;
    let csvContent = "";

    if (target === 'SS') {
      csvContent = "Código,Cliente Final,Cliente Faturamento,Cidade/UF,Filial,Descrição,Tipo,Técnico,Valor Cobrado,Status\n" +
        "SS-3001,Hospital Santa Casa,Santa Casa Mogi,Mogi das Cruzes / SP,Edifica Soluções,Manutenção em Gerador,Corretiva,Roberto Silva,15000,Em Andamento\n";
    } else {
      csvContent = "Código,Vínculo OS,Filial,Centro Custo,Descrição,Valor,Status\n" +
        "FIN-8001,SS-1001,Edifica Soluções,Peças / Insumos OS,Filtro Secador Danfoss,850,Pago\n";
    }

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `template_importacao_${target.toLowerCase()}_fixflow.csv`;
    link.click();
  }

  function handleExecuteExport() {
    const target = document.querySelector('input[name="exportTypeTarget"]:checked').value;
    let csv = "";

    if (target === 'SS') {
      csv = "Codigo_OS,Filial,Cliente_Final,Cliente_Faturamento,Cidade_UF,Tipo,Status,Tecnico,Valor_Cobrado,Custo_Acumulado,BDI_Pct,Lucro_Bruto\n";
      const list = getFilteredServicesList();
      list.forEach(s => {
        const costs = appState.financialEntries.filter(f => f.vinculoSS === s.id).reduce((a, f) => a + parseFloat(f.valor), 0);
        const bdi = costs > 0 ? (((s.valorCobrado - costs) / costs) * 100).toFixed(0) : '0';
        const profit = s.valorCobrado - costs;
        csv += `"${s.id}","${s.filial}","${s.clienteFinal}","${s.clienteFaturamento}","${s.cidadeEstado}","${s.tipo}","${s.status}","${s.tecnico}",${s.valorCobrado},${costs},${bdi},${profit}\n`;
      });
    } else {
      csv = "Codigo,Tipo_Destino,Vinculo_OS,Filial,Centro_Custo,Descricao,Valor,Status_Pagamento,Data_Pagamento_Real,Criado_Por\n";
      const list = appState.financialEntries.filter(f => f.tipoDestino === target && f.filial === appState.currentFilial);
      list.forEach(f => {
        csv += `"${f.id}","${f.tipoDestino}","${f.vinculoSS || ''}","${f.filial}","${f.centroCusto}","${f.descricao}",${f.valor},"${f.statusPagamento}","${f.dataPagamentoReal || ''}","${f.createdBy || ''}"\n`;
      });
    }

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `fixflow_export_${target.toLowerCase()}_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();

    closeModal(document.getElementById('modalExportFlex'));
    showToast(`Base de ${target} exportada com sucesso!`);
  }

  // --- HELPER UTILS ---
  function openModal(modal) { modal.classList.remove('hidden'); }
  function closeModal(modal) { modal.classList.add('hidden'); }
  function formatCurrency(val) { return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val || 0); }
  
  function formatDate(dateStr) {
    if (!dateStr) return '-';
    const parts = dateStr.split('-');
    if (parts.length === 3) return `${parts[2]}/${parts[1]}/${parts[0]}`;
    return dateStr;
  }

  function escapeHtml(str) {
    if (!str) return '';
    return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  function getStatusBadgeClass(status) {
    switch (status) {
      case 'Aguardando Início': return 'badge-amber';
      case 'Em Andamento': return 'badge-blue';
      case 'Aguardando OC': return 'badge-purple';
      case 'Aguardando Faturamento': return 'badge-primary';
      case 'Aguardando Pagamento': return 'badge-orange';
      case 'Pagamento Atrasado': return 'badge-crimson';
      case 'Recebido': return 'badge-emerald';
      case 'Cancelado': return 'badge-crimson';
      default: return 'badge-primary';
    }
  }

  function showToast(message, type = 'info') {
    const container = document.getElementById('toastContainer');
    if (!container) return;
    const toast = document.createElement('div');
    toast.className = 'toast';
    if (type === 'error') toast.style.borderLeftColor = 'var(--crimson)';
    toast.innerHTML = `<i class="fa-solid fa-circle-check text-emerald"></i> ${message}`;
    container.appendChild(toast);
    setTimeout(() => toast.remove(), 4000);
  }

})();
