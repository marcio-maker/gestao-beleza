// Dados iniciais do sistema
let systemData = {
    user: {
        name: "Carlos Silva",
        phone: "+5511999999999",
        services: "Corte, Coloração, Luzes, Escova"
    },
    appointments: [
        { id: 1, clientId: 1, date: "2023-06-15", time: "09:00", service: "Corte", status: "booked" },
        { id: 2, clientId: 2, date: "2023-06-15", time: "10:30", service: "Coloração", status: "booked" },
        { id: 3, clientId: 3, date: "2023-06-16", time: "14:00", service: "Luzes", status: "booked" },
        { id: 4, date: "2023-06-16", time: "16:00", service: "Bloqueado", status: "blocked" }
    ],
    clients: [
        { id: 1, name: "Ana Souza", phone: "+5511988888888", email: "ana@example.com", lastVisit: "2023-05-20" },
        { id: 2, name: "João Santos", phone: "+5511977777777", email: "joao@example.com", lastVisit: "2023-04-15" },
        { id: 3, name: "Maria Oliveira", phone: "+5511966666666", email: "maria@example.com", lastVisit: "2023-06-01" }
    ],
    clientDetails: {
        1: {
            hairType: "Cacheado",
            allergies: "Nenhuma",
            productsUsed: ["Shampoo Hidratação", "Máscara Reconstrução"],
            history: [
                { date: "2023-05-20", service: "Corte", notes: "Corte camadas" },
                { date: "2023-03-10", service: "Coloração", notes: "Reflexo loiro" }
            ]
        },
        2: {
            hairType: "Liso",
            allergies: "Amônia",
            productsUsed: ["Tonalizante vegano"],
            history: [
                { date: "2023-04-15", service: "Coloração", notes: "Castanho médio" },
                { date: "2023-02-05", service: "Corte", notes: "Social" }
            ]
        },
        3: {
            hairType: "Ondulado",
            allergies: "Nenhuma",
            productsUsed: ["Shampoo clareador", "Máscara dourada"],
            history: [
                { date: "2023-06-01", service: "Luzes", notes: "Mechas finas" },
                { date: "2023-04-20", service: "Hidratação", notes: "Profunda" }
            ]
        }
    },
    products: [
        { id: 1, name: "Shampoo Hidratação", quantity: 3, minQuantity: 5 },
        { id: 2, name: "Tonalizante Vegano", quantity: 2, minQuantity: 3 },
        { id: 3, name: "Máscara Reconstrução", quantity: 5, minQuantity: 4 },
        { id: 4, name: "Descolorante", quantity: 6, minQuantity: 2 }
    ],
    salonSync: {
        salonName: "Belle Salon",
        software: "socabeleireiro",
        frequency: "daily"
    }
};

// Variáveis globais
let currentWeek = 0; // Semana atual (0 = esta semana, 1 = próxima semana, -1 = semana passada)
let currentClientView = null;
let currentAppointmentView = null;

// Inicialização do sistema
document.addEventListener('DOMContentLoaded', function() {
    // Carrega dados do localStorage se existirem
    loadFromLocalStorage();
    
    // Configura elementos da interface
    setupUI();
    
    // Exibe a semana atual
    displayWeek(currentWeek);
    
    // Carrega lista de clientes
    displayClientList();
    
    // Carrega lista de produtos
    displayProductList();
    
    // Carrega alertas de estoque
    displayStockAlerts();
    
    // Configura gráfico de relatórios
    setupReportsChart();
    
    // Exibe informações do usuário
    displayUserInfo();
});

// Configura elementos da interface
function setupUI() {
    // Navegação entre seções
    const menuItems = document.querySelectorAll('.sidebar nav li');
    menuItems.forEach(item => {
        item.addEventListener('click', function() {
            // Remove a classe active de todos os itens
            menuItems.forEach(i => i.classList.remove('active'));
            
            // Adiciona a classe active ao item clicado
            this.classList.add('active');
            
            // Oculta todas as seções de conteúdo
            document.querySelectorAll('.content-section').forEach(section => {
                section.classList.remove('active');
            });
            
            // Exibe a seção correspondente
            const sectionId = this.getAttribute('data-section') + '-section';
            document.getElementById(sectionId).classList.add('active');
        });
    });
    
    // Navegação entre abas nas configurações
    const tabButtons = document.querySelectorAll('.tab-btn');
    tabButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Remove a classe active de todos os botões
            tabButtons.forEach(btn => btn.classList.remove('active'));
            
            // Adiciona a classe active ao botão clicado
            this.classList.add('active');
            
            // Oculta todas as abas de conteúdo
            document.querySelectorAll('.tab-content').forEach(tab => {
                tab.classList.remove('active');
            });
            
            // Exibe a aba correspondente
            const tabId = this.getAttribute('data-tab') + '-tab';
            document.getElementById(tabId).classList.add('active');
        });
    });
    
    // Navegação entre semanas na agenda
    document.getElementById('prev-week').addEventListener('click', function() {
        currentWeek--;
        displayWeek(currentWeek);
    });
    
    document.getElementById('next-week').addEventListener('click', function() {
        currentWeek++;
        displayWeek(currentWeek);
    });
    
    // Botão de logout
    document.getElementById('logout-btn').addEventListener('click', function() {
        if (confirm('Deseja realmente sair do sistema?')) {
            // Aqui normalmente teria uma lógica de logout
            alert('Você foi desconectado do sistema');
        }
    });
    
    // Botão para gerar link do WhatsApp
    document.getElementById('whatsapp-btn').addEventListener('click', generateWhatsAppLink);
    document.getElementById('copy-link').addEventListener('click', copyWhatsAppLink);
    
    // Botão para adicionar bloqueio de horário
    document.getElementById('add-block').addEventListener('click', showAddBlockModal);
    
    // Botão para sincronizar agenda com salão
    document.getElementById('sync-agenda').addEventListener('click', syncWithSalon);
    
    // Botão para adicionar cliente
    document.getElementById('add-client').addEventListener('click', showAddClientModal);
    
    // Busca de clientes
    document.getElementById('client-search').addEventListener('input', searchClients);
    
    // Botão para adicionar produto
    document.getElementById('add-product').addEventListener('click', showAddProductModal);
    
    // Botão para registrar venda
    document.getElementById('record-sale').addEventListener('click', showRecordSaleModal);
    
    // Botão para gerar relatório
    document.getElementById('generate-report').addEventListener('click', generateReport);
    
    // Configuração do modal genérico
    setupGenericModal();
    
    // Configuração dos formulários
    setupForms();
}

// Exibe a semana na agenda
function displayWeek(weekOffset) {
    const today = new Date();
    const currentDay = today.getDay(); // 0 = Domingo, 1 = Segunda, etc.
    
    // Ajusta a data para o início da semana (Segunda-feira)
    const startDate = new Date(today);
    startDate.setDate(today.getDate() - currentDay + 1 + (weekOffset * 7));
    
    // Atualiza o título da semana
    const endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + 6);
    
    const options = { day: 'numeric', month: 'long' };
    const startStr = startDate.toLocaleDateString('pt-BR', options);
    const endStr = endDate.toLocaleDateString('pt-BR', options);
    
    document.getElementById('current-week').textContent = `${startStr} - ${endStr}`;
    
    // Limpa o calendário
    const calendar = document.querySelector('.calendar');
    calendar.innerHTML = '';
    
    // Adiciona cabeçalhos dos dias
    const daysOfWeek = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado', 'Domingo'];
    daysOfWeek.forEach(day => {
        const dayHeader = document.createElement('div');
        dayHeader.className = 'day-header';
        dayHeader.textContent = day;
        calendar.appendChild(dayHeader);
    });
    
    // Adiciona os slots de tempo para cada dia
    for (let i = 0; i < 7; i++) {
        const currentDate = new Date(startDate);
        currentDate.setDate(startDate.getDate() + i);
        
        const dateStr = formatDate(currentDate);
        const daySlots = document.createElement('div');
        daySlots.className = 'time-slots';
        daySlots.setAttribute('data-date', dateStr);
        
        // Horários de trabalho: 9h às 18h, com intervalos de 30 minutos
        for (let hour = 9; hour < 18; hour++) {
            for (let minute = 0; minute < 60; minute += 30) {
                const timeStr = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
                const slotId = `${dateStr}-${timeStr}`;
                
                const slot = document.createElement('div');
                slot.className = 'time-slot available';
                slot.textContent = timeStr;
                slot.setAttribute('data-time', timeStr);
                slot.setAttribute('data-slot-id', slotId);
                
                // Verifica se há um agendamento neste horário
                const appointment = systemData.appointments.find(a => 
                    a.date === dateStr && a.time === timeStr
                );
                
                if (appointment) {
                    slot.classList.remove('available');
                    slot.classList.add(appointment.status === 'booked' ? 'booked' : 'blocked');
                    
                    if (appointment.status === 'booked') {
                        const client = systemData.clients.find(c => c.id === appointment.clientId);
                        slot.textContent = `${timeStr} - ${client.name} (${appointment.service})`;
                    } else {
                        slot.textContent = `${timeStr} - ${appointment.service}`;
                    }
                    
                    slot.addEventListener('click', () => showAppointmentDetails(appointment.id));
                } else {
                    slot.addEventListener('click', () => showBookAppointmentModal(dateStr, timeStr));
                }
                
                daySlots.appendChild(slot);
            }
        }
        
        calendar.appendChild(daySlots);
    }
}

// Formata data como YYYY-MM-DD
function formatDate(date) {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
}

// Exibe detalhes de um agendamento
function showAppointmentDetails(appointmentId) {
    const appointment = systemData.appointments.find(a => a.id === appointmentId);
    if (!appointment) return;
    
    const client = systemData.clients.find(c => c.id === appointment.clientId);
    const detailsDiv = document.getElementById('appointment-details');
    
    let html = `
        <h3>Detalhes do Agendamento</h3>
        <p><strong>Data:</strong> ${formatDisplayDate(appointment.date)}</p>
        <p><strong>Horário:</strong> ${appointment.time}</p>
    `;
    
    if (appointment.status === 'booked') {
        html += `
            <p><strong>Cliente:</strong> ${client.name}</p>
            <p><strong>Serviço:</strong> ${appointment.service}</p>
            <div class="appointment-actions">
                <button id="cancel-appointment" data-id="${appointment.id}">Cancelar</button>
                <button id="reschedule-appointment" data-id="${appointment.id}">Remarcar</button>
            </div>
        `;
    } else {
        html += `
            <p><strong>Motivo:</strong> ${appointment.service}</p>
            <div class="appointment-actions">
                <button id="remove-block" data-id="${appointment.id}">Remover Bloqueio</button>
            </div>
        `;
    }
    
    detailsDiv.innerHTML = html;
    detailsDiv.classList.remove('hidden');
    
    // Configura eventos dos botões
    if (appointment.status === 'booked') {
        document.getElementById('cancel-appointment').addEventListener('click', function() {
            cancelAppointment(this.getAttribute('data-id'));
        });
        
        document.getElementById('reschedule-appointment').addEventListener('click', function() {
            showRescheduleModal(this.getAttribute('data-id'));
        });
    } else {
        document.getElementById('remove-block').addEventListener('click', function() {
            removeBlock(this.getAttribute('data-id'));
        });
    }
    
    currentAppointmentView = appointmentId;
}

// Formata data para exibição (DD/MM/YYYY)
function formatDisplayDate(dateStr) {
    const [year, month, day] = dateStr.split('-');
    return `${day}/${month}/${year}`;
}

// Cancela um agendamento
function cancelAppointment(appointmentId) {
    if (confirm('Deseja realmente cancelar este agendamento?')) {
        systemData.appointments = systemData.appointments.filter(a => a.id !== parseInt(appointmentId));
        saveToLocalStorage();
        displayWeek(currentWeek);
        document.getElementById('appointment-details').classList.add('hidden');
        alert('Agendamento cancelado com sucesso!');
    }
}

// Remove um bloqueio de horário
function removeBlock(blockId) {
    if (confirm('Deseja realmente remover este bloqueio de horário?')) {
        systemData.appointments = systemData.appointments.filter(a => a.id !== parseInt(blockId));
        saveToLocalStorage();
        displayWeek(currentWeek);
        document.getElementById('appointment-details').classList.add('hidden');
        alert('Bloqueio removido com sucesso!');
    }
}

// Exibe modal para adicionar bloqueio de horário
function showAddBlockModal() {
    const modalTitle = 'Adicionar Bloqueio de Horário';
    const modalBody = `
        <div class="form-group">
            <label for="block-date">Data:</label>
            <input type="date" id="block-date" required>
        </div>
        <div class="form-group">
            <label for="block-time">Horário:</label>
            <input type="time" id="block-time" step="1800" required>
        </div>
        <div class="form-group">
            <label for="block-reason">Motivo:</label>
            <input type="text" id="block-reason" placeholder="Ex.: Folga, Compromisso pessoal" required>
        </div>
    `;
    
    showModal(modalTitle, modalBody, 'Adicionar', () => {
        const date = document.getElementById('block-date').value;
        const time = document.getElementById('block-time').value;
        const reason = document.getElementById('block-reason').value;
        
        if (!date || !time || !reason) {
            alert('Preencha todos os campos!');
            return false;
        }
        
        // Verifica se já existe um agendamento neste horário
        const existingAppointment = systemData.appointments.find(a => 
            a.date === date && a.time === time
        );
        
        if (existingAppointment) {
            alert('Já existe um agendamento ou bloqueio neste horário!');
            return false;
        }
        
        // Cria novo bloqueio
        const newBlock = {
            id: generateId(),
            date,
            time,
            service: reason,
            status: 'blocked'
        };
        
        systemData.appointments.push(newBlock);
        saveToLocalStorage();
        displayWeek(currentWeek);
        
        return true;
    });
}

// Exibe modal para agendar serviço
function showBookAppointmentModal(date, time) {
    const modalTitle = `Agendar Serviço - ${formatDisplayDate(date)} ${time}`;
    const modalBody = `
        <div class="form-group">
            <label for="appointment-client">Cliente:</label>
            <select id="appointment-client" required>
                <option value="">Selecione um cliente...</option>
                ${systemData.clients.map(client => `
                    <option value="${client.id}">${client.name}</option>
                `).join('')}
                <option value="new">+ Cadastrar novo cliente</option>
            </select>
        </div>
        <div class="form-group">
            <label for="appointment-service">Serviço:</label>
            <input type="text" id="appointment-service" list="services-list" required>
            <datalist id="services-list">
                <option value="Corte">
                <option value="Coloração">
                <option value="Luzes">
                <option value="Escova">
                <option value="Hidratação">
                <option value="Progressiva">
            </datalist>
        </div>
    `;
    
    showModal(modalTitle, modalBody, 'Agendar', () => {
        const clientId = document.getElementById('appointment-client').value;
        const service = document.getElementById('appointment-service').value;
        
        if (clientId === 'new') {
            alert('Por favor, cadastre o cliente primeiro na seção de Clientes');
            return false;
        }
        
        if (!clientId || !service) {
            alert('Preencha todos os campos!');
            return false;
        }
        
        // Cria novo agendamento
        const newAppointment = {
            id: generateId(),
            clientId: parseInt(clientId),
            date,
            time,
            service,
            status: 'booked'
        };
        
        systemData.appointments.push(newAppointment);
        saveToLocalStorage();
        displayWeek(currentWeek);
        
        // Envia confirmação (simulado)
        const client = systemData.clients.find(c => c.id === parseInt(clientId));
        alert(`Agendamento confirmado para ${client.name} às ${time} do dia ${formatDisplayDate(date)}`);
        
        return true;
    });
}

// Exibe modal para remarcar agendamento
function showRescheduleModal(appointmentId) {
    const appointment = systemData.appointments.find(a => a.id === parseInt(appointmentId));
    if (!appointment) return;
    
    const client = systemData.clients.find(c => c.id === appointment.clientId);
    const modalTitle = `Remarcar Agendamento - ${client.name}`;
    
    const modalBody = `
        <p>Agendamento atual: ${formatDisplayDate(appointment.date)} ${appointment.time} - ${appointment.service}</p>
        <div class="form-group">
            <label for="new-date">Nova Data:</label>
            <input type="date" id="new-date" required>
        </div>
        <div class="form-group">
            <label for="new-time">Novo Horário:</label>
            <input type="time" id="new-time" step="1800" required>
        </div>
    `;
    
    showModal(modalTitle, modalBody, 'Remarcar', () => {
        const newDate = document.getElementById('new-date').value;
        const newTime = document.getElementById('new-time').value;
        
        if (!newDate || !newTime) {
            alert('Preencha todos os campos!');
            return false;
        }
        
        // Verifica se já existe um agendamento neste novo horário
        const existingAppointment = systemData.appointments.find(a => 
            a.date === newDate && a.time === newTime && a.id !== appointment.id
        );
        
        if (existingAppointment) {
            alert('Já existe um agendamento ou bloqueio neste horário!');
            return false;
        }
        
        // Atualiza o agendamento
        appointment.date = newDate;
        appointment.time = newTime;
        saveToLocalStorage();
        displayWeek(currentWeek);
        document.getElementById('appointment-details').classList.add('hidden');
        
        // Envia confirmação (simulado)
        alert(`Agendamento remarcado para ${newTime} do dia ${formatDisplayDate(newDate)}`);
        
        return true;
    });
}

// Gera ID único
function generateId() {
    return Math.max(0, ...systemData.appointments.map(a => a.id)) + 1;
}

// Configura o modal genérico
function setupGenericModal() {
    const modal = document.getElementById('generic-modal');
    const closeBtn = document.querySelector('.close-modal');
    
    // Fecha o modal ao clicar no X
    closeBtn.addEventListener('click', () => {
        modal.classList.add('hidden');
    });
    
    // Fecha o modal ao clicar fora
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.classList.add('hidden');
        }
    });
    
    // Configura botão de cancelar
    document.getElementById('modal-cancel').addEventListener('click', () => {
        modal.classList.add('hidden');
    });
}

// Exibe o modal genérico
function showModal(title, body, confirmText, confirmCallback) {
    document.getElementById('modal-title').textContent = title;
    document.getElementById('modal-body').innerHTML = body;
    document.getElementById('modal-confirm').textContent = confirmText;
    
    const modal = document.getElementById('generic-modal');
    modal.classList.remove('hidden');
    
    // Configura ação do botão de confirmar
    document.getElementById('modal-confirm').onclick = function() {
        if (confirmCallback()) {
            modal.classList.add('hidden');
        }
    };
}

// Exibe lista de clientes
function displayClientList() {
    const clientList = document.querySelector('.client-list');
    clientList.innerHTML = '';
    
    systemData.clients.forEach(client => {
        const clientCard = document.createElement('div');
        clientCard.className = 'client-card';
        clientCard.setAttribute('data-id', client.id);
        clientCard.innerHTML = `
            <h3>${client.name}</h3>
            <p><i class="fas fa-phone"></i> ${client.phone}</p>
            <p><i class="fas fa-calendar-alt"></i> Última visita: ${formatDisplayDate(client.lastVisit)}</p>
        `;
        
        clientCard.addEventListener('click', () => showClientDetails(client.id));
        clientList.appendChild(clientCard);
    });
}

// Exibe detalhes de um cliente
function showClientDetails(clientId) {
    const client = systemData.clients.find(c => c.id === parseInt(clientId));
    if (!client) return;
    
    const details = systemData.clientDetails[clientId] || {
        hairType: 'Não informado',
        allergies: 'Nenhuma',
        productsUsed: [],
        history: []
    };
    
    const detailsDiv = document.getElementById('client-details');
    
    let html = `
        <div class="client-header">
            <h3>${client.name}</h3>
            <button id="edit-client" data-id="${client.id}"><i class="fas fa-edit"></i> Editar</button>
        </div>
        
        <div class="client-info">
            <p><strong>Telefone:</strong> ${client.phone}</p>
            ${client.email ? `<p><strong>E-mail:</strong> ${client.email}</p>` : ''}
            <p><strong>Última visita:</strong> ${formatDisplayDate(client.lastVisit)}</p>
        </div>
        
        <div class="client-hair-info">
            <h4><i class="fas fa-cut"></i> Informações Capilares</h4>
            <p><strong>Tipo de cabelo:</strong> ${details.hairType}</p>
            <p><strong>Alergias:</strong> ${details.allergies}</p>
            <p><strong>Produtos usados:</strong> ${details.productsUsed.join(', ') || 'Nenhum registrado'}</p>
        </div>
        
        <div class="client-history">
            <h4><i class="fas fa-history"></i> Histórico de Serviços</h4>
            ${details.history.length > 0 ? `
                <table>
                    <thead>
                        <tr>
                            <th>Data</th>
                            <th>Serviço</th>
                            <th>Observações</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${details.history.map(service => `
                            <tr>
                                <td>${formatDisplayDate(service.date)}</td>
                                <td>${service.service}</td>
                                <td>${service.notes}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            ` : '<p>Nenhum serviço registrado</p>'}
        </div>
        
        <div class="client-actions">
            <button id="new-service" data-id="${client.id}"><i class="fas fa-plus"></i> Novo Serviço</button>
            <button id="send-promo" data-id="${client.id}"><i class="fas fa-gift"></i> Enviar Promoção</button>
        </div>
    `;
    
    detailsDiv.innerHTML = html;
    detailsDiv.classList.remove('hidden');
    
    // Configura eventos dos botões
    document.getElementById('edit-client').addEventListener('click', function() {
        showEditClientModal(this.getAttribute('data-id'));
    });
    
    document.getElementById('new-service').addEventListener('click', function() {
        showNewServiceModal(this.getAttribute('data-id'));
    });
    
    document.getElementById('send-promo').addEventListener('click', function() {
        sendPromotionToClient(this.getAttribute('data-id'));
    });
    
    currentClientView = clientId;
}

// Exibe modal para editar cliente
function showEditClientModal(clientId) {
    const client = systemData.clients.find(c => c.id === parseInt(clientId));
    if (!client) return;
    
    const details = systemData.clientDetails[clientId] || {
        hairType: '',
        allergies: '',
        productsUsed: [],
        history: []
    };
    
    const modalTitle = `Editar Cliente - ${client.name}`;
    const modalBody = `
        <div class="form-group">
            <label for="edit-name">Nome:</label>
            <input type="text" id="edit-name" value="${client.name}" required>
        </div>
        <div class="form-group">
            <label for="edit-phone">Telefone:</label>
            <input type="tel" id="edit-phone" value="${client.phone}" required>
        </div>
        <div class="form-group">
            <label for="edit-email">E-mail:</label>
            <input type="email" id="edit-email" value="${client.email || ''}">
        </div>
        <div class="form-group">
            <label for="edit-hair-type">Tipo de Cabelo:</label>
            <input type="text" id="edit-hair-type" value="${details.hairType}">
        </div>
        <div class="form-group">
            <label for="edit-allergies">Alergias:</label>
            <input type="text" id="edit-allergies" value="${details.allergies}">
        </div>
        <div class="form-group">
            <label for="edit-products">Produtos Usados (separados por vírgula):</label>
            <textarea id="edit-products">${details.productsUsed.join(', ')}</textarea>
        </div>
    `;
    
    showModal(modalTitle, modalBody, 'Salvar', () => {
        const name = document.getElementById('edit-name').value;
        const phone = document.getElementById('edit-phone').value;
        const email = document.getElementById('edit-email').value;
        const hairType = document.getElementById('edit-hair-type').value;
        const allergies = document.getElementById('edit-allergies').value;
        const products = document.getElementById('edit-products').value.split(',').map(p => p.trim());
        
        if (!name || !phone) {
            alert('Nome e telefone são obrigatórios!');
            return false;
        }
        
        // Atualiza dados do cliente
        client.name = name;
        client.phone = phone;
        client.email = email;
        
        // Atualiza detalhes do cliente
        systemData.clientDetails[clientId] = {
            hairType,
            allergies,
            productsUsed: products,
            history: details.history
        };
        
        saveToLocalStorage();
        displayClientList();
        
        if (currentClientView == clientId) {
            showClientDetails(clientId);
        }
        
        return true;
    });
}

// Exibe modal para adicionar cliente
function showAddClientModal() {
    const modalTitle = 'Adicionar Novo Cliente';
    const modalBody = `
        <div class="form-group">
            <label for="new-name">Nome:</label>
            <input type="text" id="new-name" required>
        </div>
        <div class="form-group">
            <label for="new-phone">Telefone:</label>
            <input type="tel" id="new-phone" required>
        </div>
        <div class="form-group">
            <label for="new-email">E-mail:</label>
            <input type="email" id="new-email">
        </div>
        <div class="form-group">
            <label for="new-hair-type">Tipo de Cabelo:</label>
            <input type="text" id="new-hair-type">
        </div>
        <div class="form-group">
            <label for="new-allergies">Alergias:</label>
            <input type="text" id="new-allergies" value="Nenhuma">
        </div>
    `;
    
    showModal(modalTitle, modalBody, 'Adicionar', () => {
        const name = document.getElementById('new-name').value;
        const phone = document.getElementById('new-phone').value;
        const email = document.getElementById('new-email').value;
        const hairType = document.getElementById('new-hair-type').value;
        const allergies = document.getElementById('new-allergies').value;
        
        if (!name || !phone) {
            alert('Nome e telefone são obrigatórios!');
            return false;
        }
        
        // Cria novo cliente
        const newClient = {
            id: systemData.clients.length > 0 ? 
                Math.max(...systemData.clients.map(c => c.id)) + 1 : 1,
            name,
            phone,
            email,
            lastVisit: formatDate(new Date())
        };
        
        systemData.clients.push(newClient);
        
        // Adiciona detalhes do cliente
        systemData.clientDetails[newClient.id] = {
            hairType,
            allergies,
            productsUsed: [],
            history: []
        };
        
        saveToLocalStorage();
        displayClientList();
        
        return true;
    });
}

// Exibe modal para registrar novo serviço
function showNewServiceModal(clientId) {
    const client = systemData.clients.find(c => c.id === parseInt(clientId));
    if (!client) return;
    
    const modalTitle = `Registrar Serviço - ${client.name}`;
    const modalBody = `
        <div class="form-group">
            <label for="service-date">Data:</label>
            <input type="date" id="service-date" value="${formatDate(new Date())}" required>
        </div>
        <div class="form-group">
            <label for="service-type">Serviço:</label>
            <input type="text" id="service-type" list="services-list" required>
        </div>
        <div class="form-group">
            <label for="service-notes">Observações:</label>
            <textarea id="service-notes" rows="3"></textarea>
        </div>
        <div class="form-group">
            <label for="service-products">Produtos Utilizados (separados por vírgula):</label>
            <textarea id="service-products" rows="2"></textarea>
        </div>
    `;
    
    showModal(modalTitle, modalBody, 'Registrar', () => {
        const date = document.getElementById('service-date').value;
        const service = document.getElementById('service-type').value;
        const notes = document.getElementById('service-notes').value;
        const products = document.getElementById('service-products').value.split(',').map(p => p.trim());
        
        if (!date || !service) {
            alert('Data e serviço são obrigatórios!');
            return false;
        }
        
        // Adiciona ao histórico
        const details = systemData.clientDetails[clientId] || {
            hairType: '',
            allergies: '',
            productsUsed: [],
            history: []
        };
        
        details.history.unshift({
            date,
            service,
            notes
        });
        
        // Adiciona produtos usados (sem duplicatas)
        products.forEach(product => {
            if (product && !details.productsUsed.includes(product)) {
                details.productsUsed.push(product);
            }
        });
        
        // Atualiza última visita
        client.lastVisit = date;
        
        systemData.clientDetails[clientId] = details;
        saveToLocalStorage();
        
        if (currentClientView == clientId) {
            showClientDetails(clientId);
        }
        
        return true;
    });
}

// Envia promoção para cliente
function sendPromotionToClient(clientId) {
    const client = systemData.clients.find(c => c.id === parseInt(clientId));
    if (!client) return;
    
    alert(`Promoção enviada para ${client.name} (${client.phone}) via WhatsApp`);
    // Na implementação real, aqui seria feita a integração com a API do WhatsApp
}

// Busca clientes
function searchClients() {
    const searchTerm = this.value.toLowerCase();
    const clientCards = document.querySelectorAll('.client-card');
    
    clientCards.forEach(card => {
        const clientName = card.querySelector('h3').textContent.toLowerCase();
        const clientPhone = card.querySelector('p:nth-of-type(1)').textContent.toLowerCase();
        
        if (clientName.includes(searchTerm) || clientPhone.includes(searchTerm)) {
            card.style.display = 'block';
        } else {
            card.style.display = 'none';
        }
    });
}

// Exibe lista de produtos
function displayProductList() {
    const productList = document.querySelector('.product-list');
    productList.innerHTML = '';
    
    systemData.products.forEach(product => {
        const productCard = document.createElement('div');
        productCard.className = 'product-card';
        
        const isLowStock = product.quantity <= product.minQuantity;
        const stockClass = isLowStock ? 'stock-low' : 'stock-ok';
        const stockText = isLowStock ? 
            `⚠️ ${product.quantity} (mínimo: ${product.minQuantity})` : 
            `${product.quantity} em estoque`;
        
        productCard.innerHTML = `
            <div class="product-info">
                <h3>${product.name}</h3>
                <p>Código: ${product.id.toString().padStart(3, '0')}</p>
            </div>
            <div class="product-stock">
                <p class="${stockClass}">${stockText}</p>
                <button class="edit-product" data-id="${product.id}"><i class="fas fa-edit"></i></button>
            </div>
        `;
        
        productCard.querySelector('.edit-product').addEventListener('click', (e) => {
            e.stopPropagation();
            showEditProductModal(product.id);
        });
        
        productList.appendChild(productCard);
    });
}

// Exibe alertas de estoque
function displayStockAlerts() {
    const alertsContainer = document.getElementById('alerts-container');
    alertsContainer.innerHTML = '';
    
    const lowStockProducts = systemData.products.filter(p => p.quantity <= p.minQuantity);
    
    if (lowStockProducts.length === 0) {
        alertsContainer.innerHTML = '<p class="no-alerts">Nenhum alerta de estoque baixo</p>';
        return;
    }
    
    lowStockProducts.forEach(product => {
        const alertItem = document.createElement('div');
        alertItem.className = 'alert-item';
        alertItem.innerHTML = `
            <span>${product.name} - ${product.quantity} restantes (mínimo: ${product.minQuantity})</span>
            <button class="restock-btn" data-id="${product.id}">Repor</button>
        `;
        
        alertItem.querySelector('.restock-btn').addEventListener('click', (e) => {
            e.stopPropagation();
            showRestockModal(product.id);
        });
        
        alertsContainer.appendChild(alertItem);
    });
}

// Exibe modal para editar produto
function showEditProductModal(productId) {
    const product = systemData.products.find(p => p.id === parseInt(productId));
    if (!product) return;
    
    const modalTitle = `Editar Produto - ${product.name}`;
    const modalBody = `
        <div class="form-group">
            <label for="edit-product-name">Nome:</label>
            <input type="text" id="edit-product-name" value="${product.name}" required>
        </div>
        <div class="form-group">
            <label for="edit-product-quantity">Quantidade:</label>
            <input type="number" id="edit-product-quantity" min="0" value="${product.quantity}" required>
        </div>
        <div class="form-group">
            <label for="edit-product-min">Quantidade Mínima:</label>
            <input type="number" id="edit-product-min" min="1" value="${product.minQuantity}" required>
        </div>
    `;
    
    showModal(modalTitle, modalBody, 'Salvar', () => {
        const name = document.getElementById('edit-product-name').value;
        const quantity = parseInt(document.getElementById('edit-product-quantity').value);
        const minQuantity = parseInt(document.getElementById('edit-product-min').value);
        
        if (!name || isNaN(quantity) || isNaN(minQuantity)) {
            alert('Preencha todos os campos corretamente!');
            return false;
        }
        
        product.name = name;
        product.quantity = quantity;
        product.minQuantity = minQuantity;
        
        saveToLocalStorage();
        displayProductList();
        displayStockAlerts();
        
        return true;
    });
}

// Exibe modal para repor estoque
function showRestockModal(productId) {
    const product = systemData.products.find(p => p.id === parseInt(productId));
    if (!product) return;
    
    const modalTitle = `Repor Estoque - ${product.name}`;
    const modalBody = `
        <p>Quantidade atual: ${product.quantity} (mínimo recomendado: ${product.minQuantity})</p>
        <div class="form-group">
            <label for="restock-quantity">Quantidade a adicionar:</label>
            <input type="number" id="restock-quantity" min="1" value="${product.minQuantity - product.quantity + 1}" required>
        </div>
    `;
    
    showModal(modalTitle, modalBody, 'Repor', () => {
        const quantityToAdd = parseInt(document.getElementById('restock-quantity').value);
        
        if (isNaN(quantityToAdd) || quantityToAdd < 1) {
            alert('Informe uma quantidade válida!');
            return false;
        }
        
        product.quantity += quantityToAdd;
        saveToLocalStorage();
        displayProductList();
        displayStockAlerts();
        
        alert(`Estoque de ${product.name} atualizado para ${product.quantity} unidades`);
        
        return true;
    });
}

// Exibe modal para adicionar produto
function showAddProductModal() {
    const modalTitle = 'Adicionar Novo Produto';
    const modalBody = `
        <div class="form-group">
            <label for="new-product-name">Nome:</label>
            <input type="text" id="new-product-name" required>
        </div>
        <div class="form-group">
            <label for="new-product-quantity">Quantidade Inicial:</label>
            <input type="number" id="new-product-quantity" min="0" value="0" required>
        </div>
        <div class="form-group">
            <label for="new-product-min">Quantidade Mínima:</label>
            <input type="number" id="new-product-min" min="1" value="3" required>
        </div>
    `;
    
    showModal(modalTitle, modalBody, 'Adicionar', () => {
        const name = document.getElementById('new-product-name').value;
        const quantity = parseInt(document.getElementById('new-product-quantity').value);
        const minQuantity = parseInt(document.getElementById('new-product-min').value);
        
        if (!name || isNaN(quantity) || isNaN(minQuantity)) {
            alert('Preencha todos os campos corretamente!');
            return false;
        }
        
        const newProduct = {
            id: systemData.products.length > 0 ? 
                Math.max(...systemData.products.map(p => p.id)) + 1 : 1,
            name,
            quantity,
            minQuantity
        };
        
        systemData.products.push(newProduct);
        saveToLocalStorage();
        displayProductList();
        displayStockAlerts();
        
        return true;
    });
}

// Exibe modal para registrar venda
function showRecordSaleModal() {
    const modalTitle = 'Registrar Venda de Produto';
    const modalBody = `
        <div class="form-group">
            <label for="sale-product">Produto:</label>
            <select id="sale-product" required>
                <option value="">Selecione um produto...</option>
                ${systemData.products.map(product => `
                    <option value="${product.id}">${product.name} (${product.quantity} em estoque)</option>
                `).join('')}
            </select>
        </div>
        <div class="form-group">
            <label for="sale-quantity">Quantidade:</label>
            <input type="number" id="sale-quantity" min="1" value="1" required>
        </div>
        <div class="form-group">
            <label for="sale-client">Cliente (opcional):</label>
            <select id="sale-client">
                <option value="">Nenhum cliente específico</option>
                ${systemData.clients.map(client => `
                    <option value="${client.id}">${client.name}</option>
                `).join('')}
            </select>
        </div>
    `;
    
    showModal(modalTitle, modalBody, 'Registrar', () => {
        const productId = document.getElementById('sale-product').value;
        const quantity = parseInt(document.getElementById('sale-quantity').value);
        const clientId = document.getElementById('sale-client').value;
        
        if (!productId || isNaN(quantity) || quantity < 1) {
            alert('Selecione um produto e informe uma quantidade válida!');
            return false;
        }
        
        const product = systemData.products.find(p => p.id === parseInt(productId));
        
        if (quantity > product.quantity) {
            alert(`Quantidade indisponível! Apenas ${product.quantity} unidades em estoque.`);
            return false;
        }
        
        // Atualiza estoque
        product.quantity -= quantity;
        
        // Se foi vendido para um cliente, registra no histórico
        if (clientId) {
            const clientDetails = systemData.clientDetails[clientId] || {
                hairType: '',
                allergies: '',
                productsUsed: [],
                history: []
            };
            
            const productName = product.name;
            if (!clientDetails.productsUsed.includes(productName)) {
                clientDetails.productsUsed.push(productName);
            }
            
            systemData.clientDetails[clientId] = clientDetails;
        }
        
        saveToLocalStorage();
        displayProductList();
        displayStockAlerts();
        
        alert(`Venda de ${quantity} ${product.name} registrada com sucesso!`);
        
        return true;
    });
}

// Configura gráfico de relatórios
function setupReportsChart() {
    const ctx = document.getElementById('performance-chart').getContext('2d');
    
    // Dados de exemplo
    const labels = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun'];
    const data = {
        labels: labels,
        datasets: [{
            label: 'Faturamento Mensal',
            data: [1200, 1900, 1500, 2000, 1800, 2200],
            backgroundColor: 'rgba(142, 68, 173, 0.2)',
            borderColor: 'rgba(142, 68, 173, 1)',
            borderWidth: 2,
            tension: 0.4
        }]
    };
    
    const config = {
        type: 'line',
        data: data,
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'top',
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return 'R$ ' + context.raw.toFixed(2).replace('.', ',');
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: function(value) {
                            return 'R$ ' + value;
                        }
                    }
                }
            }
        }
    };
    
    new Chart(ctx, config);
}

// Gera relatório
function generateReport() {
    const reportType = document.getElementById('report-type').value;
    const reportPeriod = document.getElementById('report-period').value;
    
    // Simulação de geração de relatório
    let reportTitle = '';
    let reportData = '';
    
    switch(reportType) {
        case 'monthly':
            reportTitle = 'Relatório Mensal';
            reportData = `
                <div class="data-card">
                    <h3>Faturamento Total</h3>
                    <p>R$ 2.200,00</p>
                </div>
                <div class="data-card">
                    <h3>Serviços Realizados</h3>
                    <p>24</p>
                </div>
                <div class="data-card">
                    <h3>Novos Clientes</h3>
                    <p>5</p>
                </div>
                <div class="data-card">
                    <h3>Produtos Vendidos</h3>
                    <p>8</p>
                </div>
            `;
            break;
            
        case 'weekly':
            reportTitle = 'Relatório Semanal';
            reportData = `
                <div class="data-card">
                    <h3>Faturamento Total</h3>
                    <p>R$ 850,00</p>
                </div>
                <div class="data-card">
                    <h3>Serviços Realizados</h3>
                    <p>9</p>
                </div>
                <div class="data-card">
                    <h3>Horário Mais Movimentado</h3>
                    <p>Sábado - 10:00</p>
                </div>
            `;
            break;
            
        case 'services':
            reportTitle = 'Relatório por Serviço';
            reportData = `
                <div class="data-card">
                    <h3>Corte</h3>
                    <p>12 serviços</p>
                </div>
                <div class="data-card">
                    <h3>Coloração</h3>
                    <p>8 serviços</p>
                </div>
                <div class="data-card">
                    <h3>Luzes</h3>
                    <p>5 serviços</p>
                </div>
                <div class="data-card">
                    <h3>Outros</h3>
                    <p>3 serviços</p>
                </div>
            `;
            break;
            
        case 'clients':
            reportTitle = 'Relatório por Cliente';
            reportData = `
                <div class="data-card">
                    <h3>Maria Oliveira</h3>
                    <p>4 visitas</p>
                </div>
                <div class="data-card">
                    <h3>Ana Souza</h3>
                    <p>3 visitas</p>
                </div>
                <div class="data-card">
                    <h3>João Santos</h3>
                    <p>2 visitas</p>
                </div>
            `;
            break;
    }
    
    const reportResults = document.querySelector('.report-results');
    reportResults.querySelector('h3').textContent = reportTitle;
    reportResults.querySelector('.report-data').innerHTML = reportData;
}

// Gera link de agendamento via WhatsApp
function generateWhatsAppLink() {
    const phone = systemData.user.phone.replace(/\D/g, '');
    const message = encodeURIComponent(`Olá! Gostaria de agendar um horário com você.`);
    
    const link = `https://wa.me/${phone}?text=${message}`;
    
    document.getElementById('whatsapp-link-text').value = link;
    document.getElementById('whatsapp-link').classList.remove('hidden');
}

// Copia link do WhatsApp
function copyWhatsAppLink() {
    const linkInput = document.getElementById('whatsapp-link-text');
    linkInput.select();
    document.execCommand('copy');
    
    alert('Link copiado para a área de transferência!');
}

// Sincroniza agenda com o salão
function syncWithSalon() {
    // Simulação de sincronização
    alert(`Sincronizando agenda com ${systemData.salonSync.salonName}...`);
    
    // Aqui normalmente teria a integração com a API do software do salão
    setTimeout(() => {
        alert('Agenda sincronizada com sucesso!');
        displayWeek(currentWeek);
    }, 1500);
}

// Configura formulários
function setupForms() {
    // Formulário de perfil
    document.getElementById('profile-form').addEventListener('submit', function(e) {
        e.preventDefault();
        
        const name = document.getElementById('profile-name').value;
        const phone = document.getElementById('profile-phone').value;
        const services = document.getElementById('profile-services').value;
        
        systemData.user.name = name;
        systemData.user.phone = phone;
        systemData.user.services = services;
        
        saveToLocalStorage();
        displayUserInfo();
        
        alert('Perfil atualizado com sucesso!');
    });
    
    // Formulário de notificações
    document.getElementById('notifications-form').addEventListener('submit', function(e) {
        e.preventDefault();
        alert('Configurações de notificação salvas!');
    });
    
    // Formulário de sincronização com salão
    document.getElementById('salon-sync-form').addEventListener('submit', function(e) {
        e.preventDefault();
        
        systemData.salonSync = {
            salonName: document.getElementById('salon-name').value,
            software: document.getElementById('salon-software').value,
            frequency: document.getElementById('sync-frequency').value
        };
        
        saveToLocalStorage();
        alert('Configurações de sincronização salvas!');
    });
}

// Exibe informações do usuário
function displayUserInfo() {
    document.getElementById('username').textContent = systemData.user.name;
    document.getElementById('profile-name').value = systemData.user.name;
    document.getElementById('profile-phone').value = systemData.user.phone;
    document.getElementById('profile-services').value = systemData.user.services;
    
    // Preenche formulário de sincronização se existirem dados
    if (systemData.salonSync) {
        document.getElementById('salon-name').value = systemData.salonSync.salonName || '';
        document.getElementById('salon-software').value = systemData.salonSync.software || '';
        document.getElementById('sync-frequency').value = systemData.salonSync.frequency || 'daily';
    }
}

// Salva dados no localStorage
function saveToLocalStorage() {
    localStorage.setItem('salonSystemData', JSON.stringify(systemData));
}

// Carrega dados do localStorage
function loadFromLocalStorage() {
    const savedData = localStorage.getItem('salonSystemData');
    if (savedData) {
        systemData = JSON.parse(savedData);
    }
}