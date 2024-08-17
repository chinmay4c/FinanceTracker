// Initialize transactions array
let transactions = [];

// DOM elements
const transactionForm = document.getElementById('transaction-form');
const transactionsList = document.getElementById('transactions-list');
const budgetProgress = document.getElementById('budget-progress');
const monthlyReport = document.getElementById('monthly-report');

// Add transaction
transactionForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const description = document.getElementById('description').value;
    const amount = parseFloat(document.getElementById('amount').value);
    const type = document.getElementById('type').value;
    const category = document.getElementById('category').value;

    const transaction = {
        id: Date.now(),
        description,
        amount,
        type,
        category,
        date: new Date()
    };

    transactions.push(transaction);
    updateTransactionsList();
    updateBudgetProgress();
    updateMonthlyReport();

    transactionForm.reset();
});

// Update transactions list
function updateTransactionsList() {
    transactionsList.innerHTML = '';
    transactions.forEach(transaction => {
        const li = document.createElement('li');
        li.textContent = `${transaction.description}: $${transaction.amount} (${transaction.type} - ${transaction.category})`;
        transactionsList.appendChild(li);
    });
}

// Update budget progress
function updateBudgetProgress() {
    const totalIncome = transactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0);
    
    const totalExpenses = transactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0);

    const remainingBudget = totalIncome - totalExpenses;

    budgetProgress.textContent = `Remaining Budget: $${remainingBudget.toFixed(2)}`;
}

// Update monthly report
function updateMonthlyReport() {
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();

    const monthTransactions = transactions.filter(t => {
        const transactionMonth = t.date.getMonth();
        const transactionYear = t.date.getFullYear();
        return transactionMonth === currentMonth && transactionYear === currentYear;
    });

    const incomeByCategory = {};
    const expensesByCategory = {};

    monthTransactions.forEach(t => {
        if (t.type === 'income') {
            incomeByCategory[t.category] = (incomeByCategory[t.category] || 0) + t.amount;
        } else {
            expensesByCategory[t.category] = (expensesByCategory[t.category] || 0) + t.amount;
        }
    });

    let reportHTML = '<h3>Income</h3>';
    for (const category in incomeByCategory) {
        reportHTML += `<p>${category}: $${incomeByCategory[category].toFixed(2)}</p>`;
    }

    reportHTML += '<h3>Expenses</h3>';
    for (const category in expensesByCategory) {
        reportHTML += `<p>${category}: $${expensesByCategory[category].toFixed(2)}</p>`;
    }

    monthlyReport.innerHTML = reportHTML;
}