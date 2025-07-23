document.getElementById('form-agendamento').addEventListener('submit', function(e) {
  e.preventDefault();

  const nome = document.getElementById('nome').value;
  const horario = document.getElementById('horario').value;

  const tabela = document.getElementById('lista-agendamentos');
  const novaLinha = document.createElement('tr');
  novaLinha.innerHTML = `
    <td>${nome}</td>
    <td>${new Date(horario).toLocaleString('pt-BR')}</td>
  `;

  tabela.appendChild(novaLinha);

  // Limpar campos
  this.reset();
});

const form = document.getElementById('form-agendamento');
const tabela = document.getElementById('lista-agendamentos');

function salvarAgendamento(nome, horario) {
  const agendamentos = JSON.parse(localStorage.getItem('agendamentos')) || [];
  agendamentos.push({ nome, horario });
  localStorage.setItem('agendamentos', JSON.stringify(agendamentos));
}

function carregarAgendamentos() {
  const agendamentos = JSON.parse(localStorage.getItem('agendamentos')) || [];
  agendamentos.forEach(({ nome, horario }) => {
    adicionarNaTabela(nome, horario);
  });
}

function adicionarNaTabela(nome, horario) {
  const novaLinha = document.createElement('tr');
  novaLinha.innerHTML = `
    <td>${nome}</td>
    <td>${new Date(horario).toLocaleString('pt-BR')}</td>
  `;
  tabela.appendChild(novaLinha);
}

form.addEventListener('submit', function(e) {
  e.preventDefault();

  const nome = document.getElementById('nome').value;
  const horario = document.getElementById('horario').value;

  salvarAgendamento(nome, horario);
  adicionarNaTabela(nome, horario);

  form.reset();
});

// Carrega ao abrir o sistema
carregarAgendamentos();
