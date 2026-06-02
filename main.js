let transactions = [];
let editId = null;

function generateId() {
    return +new Date();
}

const STORAGE_KEY = "transactions";
const RENDER_EVENT = "transaction:updated";

const incomeList = document.getElementById("incomeList");
const expenseList = document.getElementById("expenseList");
const form = document.getElementById("transactionForm");
const titleInput = document.getElementById("transactionFormTitleInput");
const amountInput = document.getElementById("transactionFormAmountInput");
const dateInput = document.getElementById("transactionFormDateInput");
const typeInput = document.getElementById("transactionFormTypeSelect");
const submitButton = document.querySelector('[data-testid="transactionFormSubmitButton"]');

function renderTransactions(data = transactions){
    incomeList.innerHTML = "";
    expenseList.innerHTML = "";

    for (const transaction of data) {
        const card = document.createElement("div");
        card.setAttribute("data-testid", "transactionItem");

        const title = document.createElement("h3");
        title.setAttribute("data-testid", "transactionItemTitle");
        title.innerText = transaction.title;

        const amount = document.createElement("p");
        amount.setAttribute("data-testid", "transactionItemAmount");
        amount.innerText = "Nominal: Rp" + transaction.amount;

        const date = document.createElement("p");
        date.setAttribute("data-testid", "transactionItemDate");
        date.innerText = "Tanggal: " + transaction.date;

        const type = document.createElement("p");
        type.setAttribute("data-testid", "transactionItemType");

        if (transaction.type === "income") {
            type.innerText = "Tipe: Pemasukan";
        } else {
            type.innerText = "Tipe: Pengeluaran";
        }

        card.appendChild(title);
        card.appendChild(amount);
        card.appendChild(date);
        card.appendChild(type);

        const buttonContainer = document.createElement("div");

        const editButton = document.createElement("button");
        editButton.setAttribute("data-testid", "transactionItemEditButton");
        editButton.innerText = "Edit";
        editButton.addEventListener("click", function () {
            editTransaction(transaction.id);
        });

        const changeTypeButton = document.createElement("button");
        changeTypeButton.setAttribute("data-testid", "transactionItemEditTypeButton");
        changeTypeButton.innerText = "Ubah Tipe";
        changeTypeButton.addEventListener("click", function () {
                changeTransactionType(transaction.id);
            }
        );

        const deleteButton = document.createElement("button");
        deleteButton.setAttribute("data-testid", "transactionItemDeleteButton");
        deleteButton.innerText = "Hapus";
        deleteButton.addEventListener("click",function () {
                deleteTransaction(transaction.id);
            }
        );

        buttonContainer.appendChild(editButton);
        buttonContainer.appendChild(changeTypeButton);
        buttonContainer.appendChild(deleteButton);

        card.appendChild(buttonContainer);

        if (transaction.type == "income"){
            incomeList.appendChild(card);
        } else {
            expenseList.appendChild(card);
        }
    }
}

form.addEventListener("submit", function (e){
    e.preventDefault();

    const title = titleInput.value;
    const amount = Number(amountInput.value);
    const date = dateInput.value;
    const type = typeInput.value;

    if (title.trim() == "") {
        alert("Judul transaksi tidak boleh kosong"); 
        return;
    }

    if (amount < 1) {
        alert("Nominal minimal Rp1");
        return;
    }
    
    if (editId == null) {
        const transaction = {
            id: generateId(),
            title: title,
            amount: amount,
            date: date,
            type: type
        };

        transactions.push(transaction);
    } else {
        for (const transaction of transactions) {
            if (transaction.id == editId) {
                transaction.title = title;
                transaction.amount = amount;
                transaction.date = date;
                transaction.type = type;
                break;
            }
        }

        editId = null;
        submitButton.innerText = "Simpan";
    }

    saveData();
    document.dispatchEvent(new Event(RENDER_EVENT));
    form.reset();
});

function updateSummary() {
    let totalIncome = 0;
    let totalExpense = 0;

    for (const transaction of transactions) {
        if (transaction.type === "income") {
            totalIncome += transaction.amount;
        } else {
            totalExpense += transaction.amount;
        }
    }

    const balance = totalIncome - totalExpense;

    document.querySelector(".tracker-summary__balance-amount").innerText = "Rp " + balance;
    document.querySelector(".tracker-summary__stat-amount--income").innerText = "Rp " + totalIncome;
    document.querySelector(".tracker-summary__stat-amount--expense").innerText = "Rp " + totalExpense;
}

function saveData() {
    const parsed = JSON.stringify(transactions);
    localStorage.setItem(STORAGE_KEY, parsed);
}

function loadData() {
    const data = localStorage.getItem(STORAGE_KEY);

    if (data !== null) {
        transactions = JSON.parse(data);
    }

    document.dispatchEvent(new Event(RENDER_EVENT));
}

function deleteTransaction(id) {
    const newTransactions = [];

    for (const transaction of transactions) {
        if (transaction.id != id) {
            newTransactions.push(transaction);
        }
    }

    transactions = newTransactions;
    saveData();
    document.dispatchEvent(new Event(RENDER_EVENT));
}

function editTransaction(id) {
    for (const transaction of transactions) {
        if (transaction.id == id) {
            titleInput.value = transaction.title;
            amountInput.value = transaction.amount;
            dateInput.value = transaction.date;
            typeInput.value = transaction.type;
            
            editId = id;
            submitButton.innerText = "Update";
            break;
        }
    }
}

document.addEventListener(RENDER_EVENT, function () {
    renderTransactions();
    updateSummary();
});

function changeTransactionType(id) {
    for (const transaction of transactions) {
        if (transaction.id == id) {
            if (transaction.type == "income") {
                transaction.type = "expense";
            } else {
                transaction.type = "income";
            }
            
            break;
        }
    }

    saveData();
    document.dispatchEvent(new Event(RENDER_EVENT));
}

const searchInput = document.getElementById("searchTransactionFormTitleInput");
searchInput.addEventListener("input", function() {
    const keyword = this.value.toLowerCase();

    if (keyword == "") {
        renderTransactions();
        return;
    }

    const filtered = [];

    for (const transaction of transactions) {
        if (transaction.title.toLowerCase().includes(keyword)) {
            filtered.push(transaction);
        }
    }
    renderTransactions(filtered);
});

document.getElementById("searchTransactionForm").addEventListener("submit", function (e) {
    e.preventDefault();
});

loadData();
