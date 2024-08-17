const categories = ['Salary', 'Investments', 'Food', 'Utilities', 'Transportation', 'Entertainment', 'Healthcare', 'Education', 'Other'];
let transactions = [], budgets = {};

function initializeApp() {
    populateCategories();
    loadFromLocalStorage();
    setupEventListeners();
    updateUI();
}

function populateCategories() {
    const html = categories.map(category => `<option value="${category}">${category}</option>`).join('');
    document.querySelectorAll('#category, #filter-category, #budget-category').forEach(select => select.innerHTML += html);
}

function setupEventListeners() {
    document.getElementById('transaction-form').addEventListener('submit', handleFormSubmit);
    document.getElementById('budget-form').addEventListener('submit', handleFormSubmit);
    document.getElementById('transactions').addEventListener('input', updateUI);
    document.getElementById('report-type').addEventListener('change', updateUI);
}

function handleFormSubmit(e) {
    e.preventDefault();
    const formId = e.target.id;
    const data = formId === 'transaction-form' 
        ? { id: Date.now(), description: document.getElementById('description').value, amount: parseFloat(document.getElementById('amount').value), type: document.getElementById('type').value, category: document.getElementById('category').value, date: new Date() }
        : { category: document.getElementById('budget-category').value, amount: parseFloat(document.getElementById('budget-amount').value) };
    updateData(formId, data);
    saveToLocalStorage();
    updateUI();
    e.target.reset();
}

function updateData(type, data) {
    type === 'transaction-form' ? transactions.push(data) : budgets[data.category] = data.amount;
}

function saveToLocalStorage() {
    localStorage.setItem('transactions', JSON.stringify(transactions));
    localStorage.setItem('budgets', JSON.stringify(budgets));
}

function loadFromLocalStorage() {
    transactions = JSON.parse(localStorage.getItem('transactions')) || [];
    budgets = JSON.parse(localStorage.getItem('budgets')) || {};
}

function updateUI() {
    document.getElementById('balance-amount').textContent = transactions.reduce((sum, t) => sum + (t.type === 'income' ? t.amount : -t.amount), 0).toFixed(2);
    updateTransactionsList();
    updateBudgetList();
    updateExpenseChart();
    updateReport();
}

function updateTransactionsList() {
    const list = document.getElementById('transactions-list');
    const searchTerm = document.getElementById('search').value.toLowerCase();
    const typeFilter = document.getElementById('filter-type').value;
    const categoryFilter = document.getElementById('filter-category').value;

    list.innerHTML = transactions
        .filter(t => t.description.toLowerCase().includes(searchTerm) && (typeFilter === 'all' || t.type === typeFilter) && (categoryFilter === 'all' || t.category === categoryFilter))
        .map(t => `<li>${t.description}: $${t.amount.toFixed(2)} (${t.type} - ${t.category})</li>`)
        .join('');
}

function updateBudgetList() {
    document.getElementById('budget-list').innerHTML = Object.entries(budgets)
        .map(([category, amount]) => `<li>${category}: $${amount.toFixed(2)}</li>`)
        .join('');
}

function updateExpenseChart() {
    const expensesByCategory = transactions
        .filter(t => t.type === 'expense')
        .reduce((acc, t) => { acc[t.category] = (acc[t.category] || 0) + t.amount; return acc; }, {});

    new Chart(document.getElementById('expense-chart').getContext('2d'), {
        type: 'pie',
        data: {
            labels: Object.keys(expensesByCategory),
            datasets: [{ data: Object.values(expensesByCategory), backgroundColor: ['#e74c3c', '#3498db', '#2ecc71', '#f1c40f', '#9b59b6', '#e67e22', '#1abc9c', '#34495e'] }]
        },
        options: { responsive: true, title: { display: true, text: 'Expenses by Category' } }
    });
}

function updateReport() {
    document.getElementById('report-content').innerHTML = generateReport(document.getElementById('report-type').value);
}

function generateReport(type) {
    const currentDate = new Date();
    const reportData = transactions.reduce((acc, t) => {
        if (type === 'monthly' && (new Date(t.date).getMonth() !== currentDate.getMonth() || new Date(t.date).getFullYear() !== currentDate.getFullYear())) return acc;
        acc[t.category] = acc[t.category] || { income: 0, expense: 0 };
        acc[t.category][t.type] += t.amount;
        acc.total[t.type] += t.amount;
        return acc;
    }, { total: { income: 0, expense: 0 } });

    let report = `<h3>${type.charAt(0).toUpperCase() + type.slice(1)} Report</h3>`;
    if (type === 'monthly') {
        report += `<p>Total Income: $${reportData.total.income.toFixed(2)}</p>
                   <p>Total Expenses: $${reportData.total.expense.toFixed(2)}</p>
                   <p>Net: $${(reportData.total.income - reportData.total.expense).toFixed(2)}</p>`;
    } else {
        for (const [category, totals] of Object.entries(reportData)) {
            if (category !== 'total') {
                report += `<h4>${category}</h4>
                           <p>Income: $${totals.income.toFixed(2)}</p>
                           <p>Expenses: $${totals.expense.toFixed(2)}</p>
                           <p>Net: $${(totals.income - totals.expense).toFixed(2)}</p>`;
            }
        }
    }
    return report;
}

document.addEventListener('DOMContentLoaded', initializeApp);