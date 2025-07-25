/**
 * StudioERP - Sistema de gestão para cabeleireiros autônomos
 * 
 * Funcionalidades:
 * - Dashboard com gráficos
 * - Gestão de clientes
 * - Controle de estoque
 * - Persistência com localStorage
 * - Totalmente responsivo
 */

// =============================================
// 1. Sistema de Dados e Persistência
// =============================================

const DB = {
    /**
     * Obtém dados do localStorage
     * @param {string} key - Chave de identificação
     * @returns {any} Dados armazenados ou null
     */
    get(key) {
        const data = localStorage.getItem(`studioERP_${key}`);
        return data ? JSON.parse(data) : null;
    },

    /**
     * Armazena dados no localStorage
     * @param {string} key - Chave de identificação
     * @param {any} data - Dados a serem armazenados
     */
    set(key, data) {
        localStorage.setItem(`studioERP_${key}`, JSON.stringify(data));
    },

    /**
     * Inicializa dados padrão se não existirem
     */
    init() {
        if (!this.get('services')) {
            this.set('services', [
                { id: 1, name: 'Corte', count: 45, color: '#16a34a', price: 60 },
                { id: 2, name: 'Coloração', count: 28, color: '#ea580c', price: 120 },
                { id: 3, name: 'Hidratação', count: 32, color: '#2563eb', price: 80 }
            ]);
        }

        if (!this.get('clients')) {
            this.set('clients', [
                {
                    id: 1,
                    name: 'Ana Silva',
                    phone: '(11) 98765-4321',
                    email: 'ana@exemplo.com',
                    hairType: 'Cacheado',
                    allergies: ['Amônia'],
                    lastVisit: '2023-07-15',
                    totalVisits: 5
                },
                {
                    id: 2,
                    name: 'Carlos Oliveira',
                    phone: '(11) 91234-5678',
                    email: 'carlos@exemplo.com',
                    hairType: 'Liso',
                    allergies: [],
                    lastVisit: '2023-07-10',
                    totalVisits: 3
                }
            ]);
        }

        if (!this.get('inventory')) {
            this.set('inventory', [
                { id: 1, name: 'Shampoo Hidratante', quantity: 3, min: 5, price: 25.90 },
                { id: 2, name: 'Tonalizante Violeta', quantity: 7, min: 3, price: 42.50 },
                { id: 3, name: 'Máscara de Reconstrução', quantity: 2, min: 4, price: 68.00 }
            ]);
        }
    }
};

// Inicializar banco de dados
DB.init();

// =============================================
// 2. Sistema de Navegação
// =============================================

/**
 * Carrega a navegação principal
 */
function loadNavigation() {
    const navLinks = [
        { title: 'Dashboard', icon: '📊', id: 'dashboard' },
        { title: 'Clientes', icon: '👥', id: 'clients' },
        { title: 'Estoque', icon: '📦', id: 'inventory' },
        { title: 'Relatórios', icon: '📈', id: 'reports' },
        { title: 'Configurações', icon: '⚙️', id: 'settings' }
    ];

    const navContainer = document.getElementById('navLinks');
    navContainer.innerHTML = navLinks.map(link => `
    <a href="#" data-page="${link.id}" class="flex items-center p-3 rounded-lg hover:bg-gray-100 transition-colors">
      <span class="mr-3">${link.icon}</span>
      ${link.title}
    </a>
  `).join('');

    // Event listeners para navegação
    document.querySelectorAll('#navLinks a').forEach(link => {
        link.addEventListener('click', function (e) {
            e.preventDefault();
            const page = this.getAttribute('data-page');
            loadPage(page);

            // Atualizar classe ativa
            document.querySelectorAll('#navLinks a').forEach(a => a.classList.remove('active'));
            this.classList.add('active');
        });
    });

    // Ativar dashboard por padrão
    document.querySelector('#navLinks a[data-page="dashboard"]').classList.add('active');
}

/**
 * Carrega uma página específica
 * @param {string} page - Nome da página a ser carregada
 */
function loadPage(page) {
    document.getElementById('pageTitle').textContent =
        page.charAt(0).toUpperCase() + page.slice(1);

    switch (page) {
        case 'dashboard':
            loadDashboard();
            break;
        case 'clients':
            loadClients();
            break;
        case 'inventory':
            loadInventory();
            break;
        case 'reports':
            loadReports();
            break;
        case 'settings':
            loadSettings();
            break;
        default:
            document.getElementById('mainContent').innerHTML = `
        <div class="bg-white p-6 rounded-lg shadow animate-fadeIn">
          <h3 class="text-lg font-semibold">${page.charAt(0).toUpperCase() + page.slice(1)}</h3>
          <p class="mt-2 text-gray-600">Conteúdo em desenvolvimento</p>
        </div>
      `;
    }
}

// =============================================
// 3. Páginas Principais
// =============================================

/**
 * Carrega o dashboard principal
 */
function loadDashboard() {
    const services = DB.get('services');
    const clients = DB.get('clients');
    const inventory = DB.get('inventory');

    const content = `
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6 animate-fadeIn">
      <!-- Card: Total de Clientes -->
      <div class="bg-white p-6 rounded-lg shadow card">
        <div class="flex items-center">
          <div class="p-3 rounded-full bg-purple-100 text-purple-600 mr-4">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          </div>
          <div>
            <h3 class="font-semibold text-gray-500">Total de Clientes</h3>
            <p class="text-3xl font-bold text-gray-800">${clients.length}</p>
          </div>
        </div>
      </div>
      
      <!-- Card: Serviços (30 dias) -->
      <div class="bg-white p-6 rounded-lg shadow card">
        <div class="flex items-center">
          <div class="p-3 rounded-full bg-green-100 text-green-600 mr-4">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
          </div>
          <div>
            <h3 class="font-semibold text-gray-500">Serviços (30 dias)</h3>
            <p class="text-3xl font-bold text-gray-800">${services.reduce((a, b) => a + b.count, 0)}</p>
          </div>
        </div>
      </div>
      
      <!-- Card: Estoque Baixo -->
      <div class="bg-white p-6 rounded-lg shadow card">
        <div class="flex items-center">
          <div class="p-3 rounded-full bg-red-100 text-red-600 mr-4">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <div>
            <h3 class="font-semibold text-gray-500">Estoque Baixo</h3>
            <p class="text-3xl font-bold text-gray-800">${inventory.filter(i => i.quantity < i.min).length}</p>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Gráficos -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-slideUp">
      <!-- Gráfico de Serviços -->
      <div class="bg-white p-6 rounded-lg shadow">
        <h3 class="font-semibold mb-4">Serviços Mais Realizados</h3>
        <div class="chart-container">
          <canvas id="servicesChart"></canvas>
        </div>
      </div>
      
      <!-- Gráfico de Faturamento -->
      <div class="bg-white p-6 rounded-lg shadow">
        <h3 class="font-semibold mb-4">Faturamento Mensal</h3>
        <div class="chart-container">
          <canvas id="revenueChart"></canvas>
        </div>
      </div>
    </div>
    
    <!-- Clientes Recentes -->
    <div class="bg-white p-6 rounded-lg shadow mt-6 animate-slideUp">
      <div class="flex justify-between items-center mb-4">
        <h3 class="font-semibold text-lg">Clientes Recentes</h3>
        <button onclick="loadClients()" class="text-purple-600 hover:text-purple-800 text-sm font-medium">
          Ver todos →
        </button>
      </div>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        ${clients.slice(0, 3).map(client => `
          <div class="border rounded-lg p-4 hover:shadow-md transition-shadow">
            <div class="flex items-center">
              <div class="bg-purple-100 text-purple-800 rounded-full w-10 h-10 flex items-center justify-center mr-3">
                ${client.name.charAt(0)}
              </div>
              <div>
                <p class="font-medium">${client.name}</p>
                <p class="text-sm text-gray-500">Última visita: ${formatDate(client.lastVisit)}</p>
              </div>
            </div>
            <div class="mt-3 pt-3 border-t flex justify-between items-center">
              <span class="text-xs bg-gray-100 px-2 py-1 rounded">${client.hairType || 'Não informado'}</span>
              <button onclick="renderClientForm(${client.id})" class="text-xs text-purple-600 hover:text-purple-800">
                Editar
              </button>
            </div>
          </div>
        `).join('')}
      </div>
    </div>
  `;

    document.getElementById('mainContent').innerHTML = content;
    renderCharts();
}

/**
 * Carrega a página de clientes
 */
function loadClients() {
    const clients = DB.get('clients');

    const content = `
    <div class="bg-white rounded-lg shadow overflow-hidden animate-fadeIn">
      <div class="p-4 border-b flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h3 class="font-semibold text-lg">Lista de Clientes</h3>
        <div class="flex space-x-2 w-full md:w-auto">
          <input type="text" id="clientSearch" placeholder="Buscar cliente..." 
                 class="form-input flex-1 md:w-64 px-4 py-2 border rounded-lg focus:ring-purple-500 focus:border-purple-500">
          <button onclick="renderClientForm()" 
                  class="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 whitespace-nowrap">
            + Novo Cliente
          </button>
        </div>
      </div>
      
      <div class="overflow-x-auto table-responsive">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nome</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Contato</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Última Visita</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Visitas</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ações</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200" id="clientsTableBody">
            ${clients.map(client => `
              <tr>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="flex items-center">
                    <div class="flex-shrink-0 h-10 w-10 bg-purple-100 rounded-full flex items-center justify-center mr-3">
                      ${client.name.charAt(0)}
                    </div>
                    <div>
                      <div class="font-medium">${client.name}</div>
                      <div class="text-sm text-gray-500">${client.hairType || 'Não informado'}</div>
                    </div>
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm">${client.phone || '—'}</div>
                  <div class="text-sm text-gray-500">${client.email || '—'}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">${formatDate(client.lastVisit)}</td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span class="px-2 py-1 text-xs rounded-full bg-gray-100">${client.totalVisits}</span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button onclick="renderClientForm(${client.id})" class="text-purple-600 hover:text-purple-900 mr-3">Editar</button>
                  <button onclick="deleteClient(${client.id})" class="text-red-600 hover:text-red-900">Excluir</button>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;

    document.getElementById('mainContent').innerHTML = content;

    // Adicionar busca em tempo real
    document.getElementById('clientSearch').addEventListener('input', function (e) {
        const searchTerm = e.target.value.toLowerCase();
        const rows = document.querySelectorAll('#clientsTableBody tr');

        rows.forEach(row => {
            const name = row.querySelector('td:first-child div.font-medium').textContent.toLowerCase();
            row.style.display = name.includes(searchTerm) ? '' : 'none';
        });
    });
}

/**
 * Carrega a página de estoque
 */
function loadInventory() {
    const inventory = DB.get('inventory');
    const lowStock = inventory.filter(i => i.quantity < i.min);

    const content = `
    ${lowStock.length > 0 ? `
      <div class="bg-red-50 border-l-4 border-red-500 p-4 mb-6 animate-fadeIn">
        <div class="flex items-center">
          <div class="flex-shrink-0">
            <svg class="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
            </svg>
          </div>
          <div class="ml-3">
            <p class="text-sm text-red-700">
              Você tem ${lowStock.length} produto(s) com estoque abaixo do mínimo recomendado.
            </p>
          </div>
        </div>
      </div>
    ` : ''}
    
    <div class="bg-white rounded-lg shadow overflow-hidden animate-slideUp">
      <div class="p-4 border-b flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h3 class="font-semibold text-lg">Gestão de Estoque</h3>
        <div class="flex space-x-2 w-full md:w-auto">
          <input type="text" id="inventorySearch" placeholder="Buscar produto..." 
                 class="form-input flex-1 md:w-64 px-4 py-2 border rounded-lg focus:ring-purple-500 focus:border-purple-500">
          <button onclick="renderProductForm()" 
                  class="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 whitespace-nowrap">
            + Adicionar Produto
          </button>
        </div>
      </div>
      
      <div class="overflow-x-auto table-responsive">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Produto</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Quantidade</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Mínimo</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Preço</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ações</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200" id="inventoryTableBody">
            ${inventory.map(item => `
              <tr class="${item.quantity < item.min ? 'bg-red-50' : ''}">
                <td class="px-6 py-4 whitespace-nowrap font-medium">${item.name}</td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <input type="number" value="${item.quantity}" min="0"
                         onchange="updateInventoryQuantity(${item.id}, this.value)"
                         class="w-20 px-2 py-1 border rounded focus:ring-purple-500 focus:border-purple-500">
                </td>
                <td class="px-6 py-4 whitespace-nowrap">${item.min}</td>
                <td class="px-6 py-4 whitespace-nowrap">R$ ${item.price.toFixed(2)}</td>
                <td class="px-6 py-4 whitespace-nowrap">
                  ${item.quantity < item.min
            ? '<span class="px-2 py-1 text-xs rounded-full bg-red-100 text-red-800">Baixo</span>'
            : '<span class="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">OK</span>'}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button onclick="renderProductForm(${item.id})" class="text-purple-600 hover:text-purple-900 mr-3">Editar</button>
                  <button onclick="deleteProduct(${item.id})" class="text-red-600 hover:text-red-900">Excluir</button>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;

    document.getElementById('mainContent').innerHTML = content;

    // Adicionar busca em tempo real
    document.getElementById('inventorySearch').addEventListener('input', function (e) {
        const searchTerm = e.target.value.toLowerCase();
        const rows = document.querySelectorAll('#inventoryTableBody tr');

        rows.forEach(row => {
            const name = row.querySelector('td:first-child').textContent.toLowerCase();
            row.style.display = name.includes(searchTerm) ? '' : 'none';
        });
    });
}

/**
 * Carrega a página de relatórios
 */
function loadReports() {
    const content = `
    <div class="grid grid-cols-1 gap-6">
      <!-- Gráfico de Faturamento Anual -->
      <div class="bg-white p-6 rounded-lg shadow animate-fadeIn">
        <h3 class="font-semibold mb-4">Faturamento Anual</h3>
        <div class="chart-container">
          <canvas id="annualRevenueChart"></canvas>
        </div>
      </div>
      
      <!-- Gráfico de Tipos de Cliente -->
      <div class="bg-white p-6 rounded-lg shadow animate-slideUp">
        <h3 class="font-semibold mb-4">Perfil de Clientes</h3>
        <div class="chart-container">
          <canvas id="clientTypeChart"></canvas>
        </div>
      </div>
      
      <!-- Relatório de Serviços -->
      <div class="bg-white p-6 rounded-lg shadow animate-slideUp">
        <div class="flex justify-between items-center mb-4">
          <h3 class="font-semibold">Relatório de Serviços</h3>
          <button onclick="exportToExcel()" class="text-sm bg-green-100 text-green-800 px-3 py-1 rounded hover:bg-green-200">
            Exportar para Excel
          </button>
        </div>
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Serviço</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Quantidade</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Faturamento</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">% do Total</th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              ${generateServicesReport()}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `;

    document.getElementById('mainContent').innerHTML = content;
    renderReportsCharts();
}

// =============================================
// 4. Formulários e CRUD
// =============================================

/**
 * Renderiza o formulário de cliente
 * @param {number|null} clientId - ID do cliente para edição ou null para novo
 */
function renderClientForm(clientId = null) {
    const clients = DB.get('clients');
    const client = clientId ? clients.find(c => c.id == clientId) : null;
    const isEdit = client !== null;

    const formHTML = `
    <div class="bg-white rounded-lg shadow p-6 max-w-3xl mx-auto animate-fadeIn">
      <div class="flex justify-between items-center mb-6">
        <h3 class="text-lg font-semibold">${isEdit ? 'Editar' : 'Novo'} Cliente</h3>
        <button onclick="loadClients()" class="text-gray-500 hover:text-gray-700">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      
      <form id="clientForm" class="space-y-6">
        <input type="hidden" name="id" value="${isEdit ? client.id : ''}">
        
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <!-- Nome -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Nome *</label>
            <input type="text" name="name" value="${isEdit ? escapeHtml(client.name) : ''}" required
                   class="form-input w-full px-4 py-2 border rounded-lg focus:ring-purple-500 focus:border-purple-500">
          </div>
          
          <!-- Telefone -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Telefone</label>
            <input type="tel" name="phone" value="${isEdit ? escapeHtml(client.phone || '') : ''}"
                   class="form-input w-full px-4 py-2 border rounded-lg focus:ring-purple-500 focus:border-purple-500">
          </div>
        </div>
        
        <!-- Email -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">E-mail</label>
          <input type="email" name="email" value="${isEdit ? escapeHtml(client.email || '') : ''}"
                 class="form-input w-full px-4 py-2 border rounded-lg focus:ring-purple-500 focus:border-purple-500">
        </div>
        
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <!-- Tipo de Cabelo -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Tipo de Cabelo</label>
            <select name="hairType" class="form-input w-full px-4 py-2 border rounded-lg focus:ring-purple-500 focus:border-purple-500">
              <option value="">Selecione...</option>
              <option value="Liso" ${isEdit && client.hairType === 'Liso' ? 'selected' : ''}>Liso</option>
              <option value="Ondulado" ${isEdit && client.hairType === 'Ondulado' ? 'selected' : ''}>Ondulado</option>
              <option value="Cacheado" ${isEdit && client.hairType === 'Cacheado' ? 'selected' : ''}>Cacheado</option>
              <option value="Crespo" ${isEdit && client.hairType === 'Crespo' ? 'selected' : ''}>Crespo</option>
            </select>
          </div>
          
          <!-- Última Visita -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Última Visita</label>
            <input type="date" name="lastVisit" value="${isEdit ? client.lastVisit : new Date().toISOString().split('T')[0]}"
                   class="form-input w-full px-4 py-2 border rounded-lg focus:ring-purple-500 focus:border-purple-500">
          </div>
        </div>
        
        <!-- Alergias -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Alergias</label>
          <input type="text" name="allergies" 
                 value="${isEdit && client.allergies ? escapeHtml(client.allergies.join(', ')) : ''}"
                 placeholder="Separe por vírgulas (ex: Amônia, Parabenos)"
                 class="form-input w-full px-4 py-2 border rounded-lg focus:ring-purple-500 focus:border-purple-500">
        </div>
        
        <!-- Observações -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Observações</label>
          <textarea name="notes" rows="3"
                    class="form-input w-full px-4 py-2 border rounded-lg focus:ring-purple-500 focus:border-purple-500">${isEdit ? escapeHtml(client.notes || '') : ''}</textarea>
        </div>
        
        <div class="flex justify-end space-x-3 pt-4 border-t">
          <button type="button" onclick="loadClients()" class="bg-gray-200 text-gray-800 px-6 py-2 rounded-lg hover:bg-gray-300 transition-colors">
            Cancelar
          </button>
          <button type="submit" class="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition-colors">
            ${isEdit ? 'Atualizar' : 'Salvar'} Cliente
          </button>
        </div>
      </form>
    </div>
  `;

    document.getElementById('mainContent').innerHTML = formHTML;

    // Configurar envio do formulário
    document.getElementById('clientForm').addEventListener('submit', function (e) {
        e.preventDefault();
        saveClient(this);
    });
}

/**
 * Salva os dados do cliente (cria ou atualiza)
 * @param {HTMLFormElement} form - Formulário com os dados do cliente
 */
function saveClient(form) {
    const formData = new FormData(form);
    const clients = DB.get('clients');

    const clientData = {
        id: formData.get('id') ? parseInt(formData.get('id')) : Date.now(),
        name: formData.get('name'),
        phone: formData.get('phone'),
        email: formData.get('email'),
        hairType: formData.get('hairType'),
        allergies: formData.get('allergies') ?
            formData.get('allergies').split(',').map(a => a.trim()) : [],
        lastVisit: formData.get('lastVisit'),
        notes: formData.get('notes'),
        totalVisits: formData.get('id') ?
            clients.find(c => c.id == formData.get('id')).totalVisits : 1
    };

    if (formData.get('id')) {
        // Atualizar cliente existente
        const index = clients.findIndex(c => c.id == formData.get('id'));
        if (index !== -1) {
            clients[index] = clientData;
        }
    } else {
        // Adicionar novo cliente
        clients.push(clientData);
    }

    DB.set('clients', clients);
    showAlert('success', `Cliente ${formData.get('id') ? 'atualizado' : 'cadastrado'} com sucesso!`);
    loadClients();
}

/**
 * Exclui um cliente
 * @param {number} clientId - ID do cliente a ser excluído
 */
function deleteClient(clientId) {
    if (confirm('Tem certeza que deseja excluir este cliente?')) {
        const clients = DB.get('clients').filter(c => c.id != clientId);
        DB.set('clients', clients);
        showAlert('success', 'Cliente excluído com sucesso!');
        loadClients();
    }
}

/**
 * Renderiza o formulário de produto
 * @param {number|null} productId - ID do produto para edição ou null para novo
 */
function renderProductForm(productId = null) {
    const inventory = DB.get('inventory');
    const product = productId ? inventory.find(p => p.id == productId) : null;
    const isEdit = product !== null;

    const formHTML = `
    <div class="bg-white rounded-lg shadow p-6 max-w-3xl mx-auto animate-fadeIn">
      <div class="flex justify-between items-center mb-6">
        <h3 class="text-lg font-semibold">${isEdit ? 'Editar' : 'Novo'} Produto</h3>
        <button onclick="loadInventory()" class="text-gray-500 hover:text-gray-700">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      
      <form id="productForm" class="space-y-6">
        <input type="hidden" name="id" value="${isEdit ? product.id : ''}">
        
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <!-- Nome -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Nome *</label>
            <input type="text" name="name" value="${isEdit ? escapeHtml(product.name) : ''}" required
                   class="form-input w-full px-4 py-2 border rounded-lg focus:ring-purple-500 focus:border-purple-500">
          </div>
          
          <!-- Quantidade -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Quantidade *</label>
            <input type="number" name="quantity" min="0" value="${isEdit ? product.quantity : '0'}" required
                   class="form-input w-full px-4 py-2 border rounded-lg focus:ring-purple-500 focus:border-purple-500">
          </div>
        </div>
        
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <!-- Quantidade Mínima -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Quantidade Mínima *</label>
            <input type="number" name="minQuantity" min="1" value="${isEdit ? product.min : '1'}" required
                   class="form-input w-full px-4 py-2 border rounded-lg focus:ring-purple-500 focus:border-purple-500">
          </div>
          
          <!-- Preço -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Preço (R$) *</label>
            <input type="number" name="price" min="0" step="0.01" value="${isEdit ? product.price.toFixed(2) : '0.00'}" required
                   class="form-input w-full px-4 py-2 border rounded-lg focus:ring-purple-500 focus:border-purple-500">
          </div>
        </div>
        
        <!-- Categoria -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Categoria</label>
          <select name="category" class="form-input w-full px-4 py-2 border rounded-lg focus:ring-purple-500 focus:border-purple-500">
            <option value="">Selecione...</option>
            <option value="Shampoo" ${isEdit && product.category === 'Shampoo' ? 'selected' : ''}>Shampoo</option>
            <option value="Condicionador" ${isEdit && product.category === 'Condicionador' ? 'selected' : ''}>Condicionador</option>
            <option value="Tonalizante" ${isEdit && product.category === 'Tonalizante' ? 'selected' : ''}>Tonalizante</option>
            <option value="Máscara" ${isEdit && product.category === 'Máscara' ? 'selected' : ''}>Máscara</option>
            <option value="Outros" ${isEdit && product.category === 'Outros' ? 'selected' : ''}>Outros</option>
          </select>
        </div>
        
        <!-- Descrição -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
          <textarea name="description" rows="3"
                    class="form-input w-full px-4 py-2 border rounded-lg focus:ring-purple-500 focus:border-purple-500">${isEdit ? escapeHtml(product.description || '') : ''}</textarea>
        </div>
        
        <div class="flex justify-end space-x-3 pt-4 border-t">
          <button type="button" onclick="loadInventory()" class="bg-gray-200 text-gray-800 px-6 py-2 rounded-lg hover:bg-gray-300 transition-colors">
            Cancelar
          </button>
          <button type="submit" class="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition-colors">
            ${isEdit ? 'Atualizar' : 'Salvar'} Produto
          </button>
        </div>
      </form>
    </div>
  `;

    document.getElementById('mainContent').innerHTML = formHTML;

    // Configurar envio do formulário
    document.getElementById('productForm').addEventListener('submit', function (e) {
        e.preventDefault();
        saveProduct(this);
    });
}

/**
 * Salva os dados do produto (cria ou atualiza)
 * @param {HTMLFormElement} form - Formulário com os dados do produto
 */
function saveProduct(form) {
    const formData = new FormData(form);
    const inventory = DB.get('inventory');

    const productData = {
        id: formData.get('id') ? parseInt(formData.get('id')) : Date.now(),
        name: formData.get('name'),
        quantity: parseInt(formData.get('quantity')),
        min: parseInt(formData.get('minQuantity')),
        price: parseFloat(formData.get('price')),
        category: formData.get('category'),
        description: formData.get('description')
    };

    if (formData.get('id')) {
        // Atualizar produto existente
        const index = inventory.findIndex(p => p.id == formData.get('id'));
        if (index !== -1) {
            inventory[index] = productData;
        }
    } else {
        // Adicionar novo produto
        inventory.push(productData);
    }

    DB.set('inventory', inventory);
    showAlert('success', `Produto ${formData.get('id') ? 'atualizado' : 'cadastrado'} com sucesso!`);
    loadInventory();
}

/**
 * Atualiza a quantidade de um produto no estoque
 * @param {number} productId - ID do produto
 * @param {number} quantity - Nova quantidade
 */
function updateInventoryQuantity(productId, quantity) {
    const inventory = DB.get('inventory');
    const product = inventory.find(p => p.id == productId);

    if (product) {
        product.quantity = parseInt(quantity);
        DB.set('inventory', inventory);

        // Atualizar visualização se necessário
        const row = document.querySelector(`#inventoryTableBody tr[data-id="${productId}"]`);
        if (row) {
            row.classList.toggle('bg-red-50', product.quantity < product.min);
            const statusCell = row.querySelector('td:nth-child(5)');
            if (statusCell) {
                statusCell.innerHTML = product.quantity < product.min
                    ? '<span class="px-2 py-1 text-xs rounded-full bg-red-100 text-red-800">Baixo</span>'
                    : '<span class="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">OK</span>';
            }
        }
    }
}

/**
 * Exclui um produto
 * @param {number} productId - ID do produto a ser excluído
 */
function deleteProduct(productId) {
    if (confirm('Tem certeza que deseja excluir este produto?')) {
        const inventory = DB.get('inventory').filter(p => p.id != productId);
        DB.set('inventory', inventory);
        showAlert('success', 'Produto excluído com sucesso!');
        loadInventory();
    }
}

// =============================================
// 5. Gráficos e Relatórios
// =============================================

/**
 * Renderiza os gráficos do dashboard
 */
function renderCharts() {
    const services = DB.get('services');

    // Gráfico de Serviços
    const servicesCtx = document.getElementById('servicesChart').getContext('2d');
    new Chart(servicesCtx, {
        type: 'bar',
        data: {
            labels: services.map(s => s.name),
            datasets: [{
                label: 'Serviços Realizados (últimos 30 dias)',
                data: services.map(s => s.count),
                backgroundColor: services.map(s => s.color),
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                }
            }
        }
    });

    // Gráfico de Faturamento
    const revenueCtx = document.getElementById('revenueChart').getContext('2d');

    // Dados de exemplo - substitua pelos seus dados reais
    const monthlyData = [5200, 4800, 6100, 5300, 5900, 6300]; // Faturamento mensal
    const weeklyData = [1300, 1200, 1525, 1325, 1475, 1575];  // Semanal (mensal/4)
    const dailyData = [186, 171, 218, 189, 211, 225];         // Diário (mensal/28)

    new Chart(revenueCtx, {
        type: 'line',
        data: {
            labels: ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun'],
            datasets: [
                // 1. Faturamento Mensal (Roxo)
                {
                    label: 'Mensal (R$)',
                    data: monthlyData,
                    borderColor: '#7e22ce',
                    backgroundColor: 'rgba(126, 34, 206, 0.1)',
                    fill: true,
                    tension: 0.3,
                    borderWidth: 3
                },
                // 2. Faturamento Semanal (Azul)
                {
                    label: 'Semanal (R$)',
                    data: weeklyData,
                    borderColor: '#3b82f6',
                    backgroundColor: 'rgba(59, 130, 246, 0.1)',
                    tension: 0.3,
                    borderWidth: 2,
                    borderDash: [5, 3]
                },
                // 3. Faturamento Diário (Verde)
                {
                    label: 'Diário (R$)',
                    data: dailyData,
                    borderColor: '#10b981',
                    backgroundColor: 'rgba(16, 185, 129, 0.1)',
                    tension: 0.3,
                    borderWidth: 2,
                    pointRadius: 4,
                    pointHoverRadius: 6
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'top',
                    labels: {
                        usePointStyle: true,
                        padding: 20
                    }
                },
                tooltip: {
                    callbacks: {
                        label: function (context) {
                            return `${context.dataset.label}: ${context.raw.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}`;
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: function (value) {
                            return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
                        }
                    }
                }
            }
        }
    });
}

/**
 * Renderiza os gráficos de relatórios
 */
function renderReportsCharts() {
    // Gráfico de Faturamento Anual
    const annualCtx = document.getElementById('annualRevenueChart').getContext('2d');
    new Chart(annualCtx, {
        type: 'bar',
        data: {
            labels: ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'],
            datasets: [
                {
                    label: 'Faturamento',
                    data: [3200, 4200, 3800, 4500, 5200, 4800, 5100, 4900, 5300, 5500, 5800, 6200],
                    backgroundColor: '#7e22ce'
                },
                {
                    label: 'Comissões',
                    data: [960, 1260, 1140, 1350, 1560, 1440, 1530, 1470, 1590, 1650, 1740, 1860],
                    backgroundColor: '#22d3ee'
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                title: {
                    display: true,
                    text: 'Faturamento Anual vs Comissões'
                }
            },
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });

    // Gráfico de Tipos de Cliente
    const clientTypeCtx = document.getElementById('clientTypeChart').getContext('2d');
    new Chart(clientTypeCtx, {
        type: 'doughnut',
        data: {
            labels: ['Novos', 'Recorrentes', 'Ocasionais'],
            datasets: [{
                data: [15, 25, 10],
                backgroundColor: [
                    '#16a34a',
                    '#2563eb',
                    '#d97706'
                ],
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom'
                }
            }
        }
    });
}

/**
 * Gera o relatório de serviços
 * @returns {string} HTML com as linhas da tabela
 */
function generateServicesReport() {
    const services = DB.get('services');
    const total = services.reduce((sum, service) => sum + (service.count * service.price), 0);

    return services.map(service => {
        const revenue = service.count * service.price;
        const percentage = total > 0 ? (revenue / total * 100).toFixed(1) : 0;

        return `
      <tr>
        <td class="px-6 py-4 whitespace-nowrap">${service.name}</td>
        <td class="px-6 py-4 whitespace-nowrap">${service.count}</td>
        <td class="px-6 py-4 whitespace-nowrap">R$ ${revenue.toFixed(2)}</td>
        <td class="px-6 py-4 whitespace-nowrap">
          <div class="flex items-center">
            <div class="w-full bg-gray-200 rounded-full h-2.5 mr-2">
              <div class="bg-purple-600 h-2.5 rounded-full" style="width: ${percentage}%"></div>
            </div>
            <span>${percentage}%</span>
          </div>
        </td>
      </tr>
    `;
    }).join('');
}

/**
 * Exporta dados para Excel (simulado)
 */
function exportToExcel() {
    showAlert('info', 'Funcionalidade de exportação será implementada!');
    // Na implementação real, usar biblioteca como SheetJS
}

// =============================================
// 6. Utilitários e Inicialização
// =============================================

/**
 * Mostra um alerta na tela
 * @param {string} type - Tipo de alerta (success, error, info, warning)
 * @param {string} message - Mensagem a ser exibida
 */
function showAlert(type, message) {
    const colors = {
        success: { bg: 'bg-green-100', text: 'text-green-800', border: 'border-green-200' },
        error: { bg: 'bg-red-100', text: 'text-red-800', border: 'border-red-200' },
        info: { bg: 'bg-blue-100', text: 'text-blue-800', border: 'border-blue-200' },
        warning: { bg: 'bg-yellow-100', text: 'text-yellow-800', border: 'border-yellow-200' }
    };

    const alert = document.createElement('div');
    alert.className = `fixed top-4 right-4 p-4 rounded-lg border ${colors[type].bg} ${colors[type].text} ${colors[type].border} shadow-lg animate-slideDown z-50`;
    alert.innerHTML = `
    <div class="flex items-center">
      <svg class="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
      </svg>
      <span>${message}</span>
    </div>
  `;

    document.body.appendChild(alert);

    setTimeout(() => {
        alert.classList.add('animate-fadeOut');
        setTimeout(() => alert.remove(), 300);
    }, 3000);
}

/**
 * Formata uma data no formato DD/MM/AAAA
 * @param {string} dateString - Data no formato ISO (YYYY-MM-DD)
 * @returns {string} Data formatada
 */
function formatDate(dateString) {
    if (!dateString) return 'Nunca';
    const [year, month, day] = dateString.split('-');
    return `${day}/${month}/${year}`;
}

/**
 * Escapa HTML para prevenir XSS
 * @param {string} text - Texto a ser escapado
 * @returns {string} Texto seguro
 */
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

/**
 * Inicializa o menu mobile
 */
function initMobileMenu() {
    document.getElementById('mobileMenuBtn').addEventListener('click', function () {
        document.getElementById('mobileMenu').classList.remove('hidden');
        const navLinks = document.getElementById('navLinks').innerHTML;
        document.getElementById('mobileNavLinks').innerHTML = navLinks;

        // Adicionar eventos aos links mobile
        document.querySelectorAll('#mobileNavLinks a').forEach(link => {
            link.addEventListener('click', function () {
                document.getElementById('mobileMenu').classList.add('hidden');
                const page = this.getAttribute('data-page');
                loadPage(page);
            });
        });
    });

    document.getElementById('closeMobileMenu').addEventListener('click', function () {
        document.getElementById('mobileMenu').classList.add('hidden');
    });
}

// Inicialização do sistema quando o DOM estiver pronto
// Inicialização do sistema quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', function() {
    loadNavigation();
    loadDashboard();
    initMobileMenu();
    initProfileModal(); // Adicione esta linha
});

// Estilos para animações (adicionados dinamicamente)
const style = document.createElement('style');
style.textContent = `
  @keyframes slideDown {
    from { transform: translateY(-20px); opacity: 0; }
    to { transform: translateY(0); opacity: 1; }
  }
  @keyframes fadeOut {
    from { opacity: 1; }
    to { opacity: 0; }
  }
  .animate-slideDown {
    animation: slideDown 0.3s ease-out;
  }
  .animate-fadeOut {
    animation: fadeOut 0.3s ease-out;
  }
`;
document.head.appendChild(style);

// =============================================
// 7. Configurações e Perfil
// =============================================

/**
 * Carrega a página de configurações
 */
function loadSettings() {
    const content = `
    <div class="bg-white rounded-lg shadow p-6 animate-fadeIn">
      <h3 class="text-lg font-semibold mb-6">Configurações</h3>
      
      <div class="space-y-6">
        <!-- Seção de Perfil -->
        <div class="border-b pb-6">
          <h4 class="font-medium text-gray-800 mb-4">Perfil Profissional</h4>
          <div class="flex flex-col md:flex-row gap-6">
            <div class="flex-shrink-0">
              <div class="relative">
                <img id="settingsProfileImage" src="https://via.placeholder.com/150" class="w-20 h-20 rounded-full object-cover border-2 border-purple-200">
                <label for="settingsImageUpload" class="absolute bottom-0 right-0 bg-purple-600 text-white p-1 rounded-full cursor-pointer hover:bg-purple-700">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </label>
                <input type="file" id="settingsImageUpload" accept="image/*" class="hidden">
              </div>
            </div>
            <div class="flex-1 space-y-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Nome Completo</label>
                <input type="text" id="settingsName" class="form-input w-full px-4 py-2 border rounded-lg focus:ring-purple-500 focus:border-purple-500" value="Márcio Silva">
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Telefone</label>
                <input type="tel" id="settingsPhone" class="form-input w-full px-4 py-2 border rounded-lg focus:ring-purple-500 focus:border-purple-500" value="(11) 98765-4321">
              </div>
            </div>
          </div>
        </div>
        
        <!-- Seção de Dados Profissionais -->
        <div class="border-b pb-6">
          <h4 class="font-medium text-gray-800 mb-4">Dados Profissionais</h4>
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Especialidades</label>
              <input type="text" id="settingsSpecialties" class="form-input w-full px-4 py-2 border rounded-lg focus:ring-purple-500 focus:border-purple-500" value="Coloração, Cortes Modernos, Luzes">
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Descrição Profissional</label>
              <textarea id="settingsBio" rows="3" class="form-input w-full px-4 py-2 border rounded-lg focus:ring-purple-500 focus:border-purple-500">Especialista em coloração e cortes modernos com 10 anos de experiência.</textarea>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Anos de Experiência</label>
              <input type="number" id="settingsExperience" min="0" class="form-input w-full px-4 py-2 border rounded-lg focus:ring-purple-500 focus:border-purple-500" value="10">
            </div>
          </div>
        </div>
        
        <!-- Seção de Preferências -->
        <div>
          <h4 class="font-medium text-gray-800 mb-4">Preferências do Sistema</h4>
          <div class="space-y-4">
            <div class="flex items-center">
              <input type="checkbox" id="settingsDarkMode" class="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded">
              <label for="settingsDarkMode" class="ml-2 block text-sm text-gray-700">Modo Escuro</label>
            </div>
            <div class="flex items-center">
              <input type="checkbox" id="settingsNotifications" checked class="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded">
              <label for="settingsNotifications" class="ml-2 block text-sm text-gray-700">Receber notificações</label>
            </div>
          </div>
        </div>
        
        <div class="pt-4 border-t flex justify-end">
          <button onclick="saveSettings()" class="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition-colors">
            Salvar Configurações
          </button>
        </div>
      </div>
    </div>
  `;

    document.getElementById('mainContent').innerHTML = content;

    // Configurar upload de imagem
    document.getElementById('settingsImageUpload').addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(event) {
                document.getElementById('settingsProfileImage').src = event.target.result;
                // Aqui você pode salvar no localStorage se quiser
            };
            reader.readAsDataURL(file);
        }
    });
}

/**
 * Salva as configurações do perfil
 */
function saveSettings() {
    // Aqui você pode implementar a lógica para salvar no localStorage
    showAlert('success', 'Configurações salvas com sucesso!');
}

/**
 * Inicializa o modal de perfil
 */
function initProfileModal() {
    document.getElementById('profileBtn').addEventListener('click', function() {
        document.getElementById('profileModal').classList.remove('hidden');
    });

    // Configurar upload de imagem
    document.getElementById('imageUpload').addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(event) {
                document.getElementById('profileImage').src = event.target.result;
                // Aqui você pode salvar no localStorage se quiser
            };
            reader.readAsDataURL(file);
        }
    });
}

/**
 * Salva as alterações do perfil
 */
function saveProfile() {
    // Aqui você pode implementar a lógica para salvar no localStorage
    showAlert('success', 'Perfil atualizado com sucesso!');
    document.getElementById('profileModal').classList.add('hidden');
}